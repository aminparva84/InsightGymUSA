import React, { useState, useEffect } from 'react';
import AppHeader from './AppHeader';
import axios from 'axios';
import { getApiBase } from '../services/apiBase';
import './TrainersPage.css';

const TrainersPage = () => {
  const API_BASE = getApiBase();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/coaches/public`);
        setCoaches(Array.isArray(res.data) ? res.data : []);
      } catch {
        setCoaches([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [API_BASE]);

  return (
    <div className="trainers-page">
      <AppHeader />

      <main className="tp-main">
        <h2 className="tp-title">Our Trainers</h2>
        <p className="tp-subtitle">Certified professionals dedicated to your fitness journey.</p>

        {loading ? (
          <div className="tp-loading">Loading trainers...</div>
        ) : coaches.length === 0 ? (
          <div className="tp-empty">
            <p>Our trainer team is growing. Check back soon!</p>
          </div>
        ) : (
          <div className="tp-grid">
            {coaches.map((c) => (
              <div key={c.id} className="tp-card">
                <div className="tp-card-avatar">
                  {c.username.charAt(0).toUpperCase()}
                </div>
                <h3 className="tp-card-name">{c.username}</h3>
                {c.specialization && (
                  <p className="tp-card-spec">{c.specialization}</p>
                )}
                {c.certifications && (
                  <p className="tp-card-certs">
                    <strong>Certifications:</strong> {c.certifications}
                  </p>
                )}
                {c.licenses && c.licenses.length > 0 && (
                  <p className="tp-card-licenses">
                    <strong>Licenses:</strong> {c.licenses.join(', ')}
                  </p>
                )}
                {c.years_of_experience > 0 && (
                  <p className="tp-card-exp">{c.years_of_experience} years experience</p>
                )}
                {c.bio && <p className="tp-card-bio">{c.bio}</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TrainersPage;
