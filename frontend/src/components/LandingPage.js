import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import AppHeader from './AppHeader';
import TypingTextWithGlow from './TypingTextWithGlow';
import TrainingProgramsModal from './TrainingProgramsModal';
import axios from 'axios';
import { getApiBase } from '../services/apiBase';
import './TypingTextWithGlow.css';
import './LandingPage.css';

function parseJson(str) {
  if (!str || typeof str !== 'string') return null;
  try {
    const v = JSON.parse(str);
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

function getDefaultTestimonials() {
  return [
    { quote: 'Lost 25 lbs in 4 months with the AI plans and coach support. Best decision I ever made.', name: 'Sarah M.', result: '25 lbs lost' },
    { quote: 'The personalized approach and expert coaches made all the difference. I finally stuck with a program.', name: 'Mike T.', result: 'Gained 15 lbs muscle' },
    { quote: 'Free trial got me hooked. Now I train 4x a week and feel amazing.', name: 'Jessica L.', result: 'Consistent 4 months' },
  ];
}

function getDefaultFaq() {
  return [
    { q: 'Do you offer a free trial?', a: 'Yes! New members get a 7-day free trial. No credit card required to start.' },
    { q: 'What classes are included?', a: 'All group classes (HIIT, Yoga, Spin, Bootcamp, etc.) are included with Premium and Elite memberships.' },
    { q: 'Can I cancel anytime?', a: 'Yes. Cancel anytime with no cancellation fees. We want you to stay because you love it.' },
    { q: 'Do you have parking?', a: 'Yes, free parking is available for all members.' },
  ];
}

function getDefaultHours() {
  return [
    { day: 'Mon–Fri', hours: '5:00 AM – 10:00 PM' },
    { day: 'Saturday', hours: '7:00 AM – 8:00 PM' },
    { day: 'Sunday', hours: '8:00 AM – 6:00 PM' },
  ];
}

const LandingPage = () => {
  const API_BASE = getApiBase();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openAuth } = useAuthModal();
  const [showTrainingProgramsModal, setShowTrainingProgramsModal] = useState(false);
  const [hasTrainingProgram, setHasTrainingProgram] = useState(false);
  const [checkingProgram, setCheckingProgram] = useState(false);
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/site-settings`);
        setSiteSettings(res.data || {});
      } catch {
        setSiteSettings({});
      }
    };
    fetchSiteSettings();
  }, [API_BASE]);

  useEffect(() => {
    const check = async () => {
      if (!user) { setHasTrainingProgram(false); return; }
      setCheckingProgram(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) { setHasTrainingProgram(false); return; }
        const res = await axios.get(`${API_BASE}/api/training-programs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasTrainingProgram(Array.isArray(res.data) && res.data.length > 0);
      } catch {
        setHasTrainingProgram(false);
      } finally {
        setCheckingProgram(false);
      }
    };
    check();
  }, [API_BASE, user]);

  const handleAuth = () => {
    if (user) navigate('/dashboard');
    else openAuth();
  };

  return (
    <div className="lp">
      <AppHeader />

      <main className="lp-main">
        <section className="lp-hero">
          <div className="lp-hero-bg">
            <span className="lp-hero-orb lp-hero-orb-1" aria-hidden="true" />
            <span className="lp-hero-orb lp-hero-orb-2" aria-hidden="true" />
            <span className="lp-hero-orb lp-hero-orb-3" aria-hidden="true" />
          </div>
          <div className="lp-hero-content">
            <span className="lp-hero-badge">AI-Powered Fitness</span>
            <h2 className="lp-hero-title">
              <TypingTextWithGlow
                text={'Transform Your Body.\nElevate Your Life.'}
                className="lp-hero-title-wrap"
                glowClassName="lp-hero-title-glow"
                textClassName="lp-hero-title-text"
                as="span"
              />
            </h2>
            <p className="lp-hero-subtitle">
              Expert coaches meet smart technology. Get personalized workout plans, track progress, and achieve your goals.
            </p>
            <button className="lp-hero-cta lp-hero-cta-prominent" onClick={handleAuth}>
              {user ? 'Go to Dashboard' : 'Start Free Trial — No Credit Card Required'}
            </button>
          </div>
        </section>

        <section className="lp-features">
          <h3 className="lp-section-title">Why Insight GYM USA</h3>
          <div className="lp-features-grid">
            <div className="lp-feature-card">
              <div className="lp-feature-icon">💪</div>
              <h4>Expert Coaches</h4>
              <p>Certified trainers with proven results. Coaches can join and bring their expertise.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon">🤖</div>
              <h4>AI-Powered Plans</h4>
              <p>Smart workout and nutrition plans that adapt to your progress and goals.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon">📊</div>
              <h4>Progress Tracking</h4>
              <p>Track workouts, measurements, and achievements. Stay motivated with real data.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon">🎯</div>
              <h4>Flexible Membership</h4>
              <p>Choose the plan that fits. Free trial for new members.</p>
            </div>
          </div>
        </section>

        <section className="lp-testimonials">
          <h3 className="lp-section-title">Success Stories</h3>
          <div className="lp-testimonials-grid">
            {(parseJson(siteSettings?.testimonials_json) || getDefaultTestimonials()).map((testimonial, i) => (
              <div key={i} className="lp-testimonial-card">
                <p className="lp-testimonial-quote">"{testimonial.quote}"</p>
                <p className="lp-testimonial-name">— {testimonial.name}</p>
                {testimonial.result && <p className="lp-testimonial-result">{testimonial.result}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="lp-faq">
          <h3 className="lp-section-title">Frequently Asked Questions</h3>
          <div className="lp-faq-list">
            {(parseJson(siteSettings?.faq_json) || getDefaultFaq()).map((faq, i) => (
              <div key={i} className="lp-faq-item">
                <h4 className="lp-faq-q">{faq.q}</h4>
                <p className="lp-faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lp-location">
          <h3 className="lp-section-title">Location & Hours</h3>
          <div className="lp-location-content">
            <div className="lp-location-address">
              <h4>Address</h4>
              <p>{siteSettings?.address_en || '123 Fitness Ave, Your City, USA'}</p>
              <p><a href={`mailto:${siteSettings?.contact_email || 'info@insightgymusa.com'}`}>{siteSettings?.contact_email || 'info@insightgymusa.com'}</a></p>
              <p><a href={`tel:${(siteSettings?.contact_phone || '').replace(/\s/g, '')}`}>{siteSettings?.contact_phone || '+1 (234) 567-890'}</a></p>
            </div>
            <div className="lp-location-hours">
              <h4>Operating Hours</h4>
              {(parseJson(siteSettings?.operating_hours_json) || getDefaultHours()).map((h, i) => (
                <p key={i}><strong>{h.day}</strong>: {h.hours}</p>
              ))}
            </div>
            {siteSettings?.map_url && (
              <div className="lp-location-map">
                <iframe title="Gym location" src={siteSettings.map_url} width="100%" height="250" style={{ border: 0, borderRadius: 'var(--radius-md)' }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </div>
        </section>

        <section className="lp-cta">
          {user ? (
            <button
              className="lp-cta-btn"
              onClick={() => hasTrainingProgram ? navigate('/dashboard?tab=training-program') : navigate('/pricing')}
              disabled={checkingProgram}
            >
              {checkingProgram ? 'Checking...' : hasTrainingProgram ? 'View Training Program' : 'Get Membership'}
            </button>
          ) : (
            <button className="lp-cta-btn lp-cta-btn-prominent" onClick={openAuth}>
              Start Free Trial — 7 Days Free
            </button>
          )}
        </section>
      </main>

      <footer className="lp-footer" id="contact">
        <div className="lp-footer-inner">
          <div className="lp-footer-grid">
            <div>
              <h4>Insight GYM USA</h4>
              <p>{siteSettings?.app_description_en || 'Comprehensive fitness platform powered by AI and expert coaches.'}</p>
            </div>
            <div>
              <h4>Contact</h4>
              <p><a href={`mailto:${siteSettings?.contact_email || 'info@insightgymusa.com'}`}>{siteSettings?.contact_email || 'info@insightgymusa.com'}</a></p>
              <p><a href={`tel:${(siteSettings?.contact_phone || '').replace(/\s/g, '')}`}>{siteSettings?.contact_phone || '+1 (234) 567-890'}</a></p>
            </div>
          </div>
          <p className="lp-footer-copy">© {new Date().getFullYear()} Insight GYM USA. All rights reserved.</p>
        </div>
      </footer>

      <TrainingProgramsModal isOpen={showTrainingProgramsModal} onClose={() => setShowTrainingProgramsModal(false)} />
    </div>
  );
};

export default LandingPage;
