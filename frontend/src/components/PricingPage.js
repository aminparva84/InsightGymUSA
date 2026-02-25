import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from './AppHeader';
import axios from 'axios';
import { getApiBase } from '../services/apiBase';
import './PricingPage.css';

const PricingPage = () => {
  const API_BASE = getApiBase();
  const navigate = useNavigate();
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/site-settings`);
        const raw = res.data?.pricing_tiers_json || '';
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setTiers(Array.isArray(parsed) ? parsed : getDefaultTiers());
          } catch {
            setTiers(getDefaultTiers());
          }
        } else {
          setTiers(getDefaultTiers());
        }
      } catch {
        setTiers(getDefaultTiers());
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [API_BASE]);

  function getDefaultTiers() {
    return [
      { name: 'Basic', price: 29, period: 'month', features: ['Gym access', 'Locker room', 'Free fitness assessment'], popular: false },
      { name: 'Premium', price: 49, period: 'month', features: ['Everything in Basic', 'Group classes', 'AI workout plans', '1-on-1 session/month'], popular: true },
      { name: 'Elite', price: 79, period: 'month', features: ['Everything in Premium', 'Unlimited 1-on-1', 'Nutrition guidance', 'Priority booking'], popular: false },
    ];
  }

  const handleSelectPlan = (tier) => {
    navigate('/purchase', { state: { tier } });
  };

  return (
    <div className="pricing-page">
      <AppHeader />

      <main className="pp-main">
        <h2 className="pp-title">Membership Plans</h2>
        <p className="pp-subtitle">Choose the plan that fits your goals. Start with a 7-day free trial.</p>

        {loading ? (
          <div className="pp-loading">Loading plans...</div>
        ) : (
          <div className="pp-grid">
            {tiers.map((tier, i) => (
              <div key={i} className={`pp-card ${tier.popular ? 'popular' : ''}`}>
                {tier.popular && <span className="pp-badge">Most Popular</span>}
                <h3 className="pp-card-name">{tier.name}</h3>
                <div className="pp-card-price">
                  <span className="pp-amount">${tier.price}</span>
                  <span className="pp-period">/{tier.period || 'month'}</span>
                </div>
                <ul className="pp-features">
                  {(tier.features || []).map((f, j) => (
                    <li key={j}>{f}</li>
                  ))}
                </ul>
                <button className="pp-cta" onClick={() => handleSelectPlan(tier)}>
                  Get This Plan
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PricingPage;
