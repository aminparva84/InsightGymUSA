import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiBase } from '../services/apiBase';
import './ClassSchedulePage.css';

const ClassSchedulePage = () => {
  const API_BASE = getApiBase();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/site-settings`);
        const raw = res.data?.class_schedule_json || '';
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setSchedule(Array.isArray(parsed) ? parsed : []);
          } catch {
            setSchedule([]);
          }
        } else {
          setSchedule(getDefaultSchedule());
        }
      } catch {
        setSchedule(getDefaultSchedule());
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [API_BASE]);

  function getDefaultSchedule() {
    return [
      { day: 'Monday', classes: [
        { name: 'HIIT', time: '6:00 AM', duration: '45 min', instructor: 'Coach Mike' },
        { name: 'Yoga', time: '9:00 AM', duration: '60 min', instructor: 'Coach Sarah' },
        { name: 'Strength Training', time: '5:30 PM', duration: '60 min', instructor: 'Coach Mike' },
      ]},
      { day: 'Tuesday', classes: [
        { name: 'Spin', time: '6:00 AM', duration: '45 min', instructor: 'Coach Sarah' },
        { name: 'Bootcamp', time: '12:00 PM', duration: '45 min', instructor: 'Coach Mike' },
        { name: 'Pilates', time: '6:00 PM', duration: '60 min', instructor: 'Coach Sarah' },
      ]},
      { day: 'Wednesday', classes: [
        { name: 'HIIT', time: '6:00 AM', duration: '45 min', instructor: 'Coach Mike' },
        { name: 'Strength Training', time: '5:30 PM', duration: '60 min', instructor: 'Coach Mike' },
      ]},
      { day: 'Thursday', classes: [
        { name: 'Spin', time: '6:00 AM', duration: '45 min', instructor: 'Coach Sarah' },
        { name: 'Yoga', time: '6:00 PM', duration: '60 min', instructor: 'Coach Sarah' },
      ]},
      { day: 'Friday', classes: [
        { name: 'HIIT', time: '6:00 AM', duration: '45 min', instructor: 'Coach Mike' },
        { name: 'Bootcamp', time: '12:00 PM', duration: '45 min', instructor: 'Coach Mike' },
      ]},
      { day: 'Saturday', classes: [
        { name: 'Yoga', time: '9:00 AM', duration: '60 min', instructor: 'Coach Sarah' },
        { name: 'Family Fitness', time: '10:00 AM', duration: '45 min', instructor: 'Coach Mike' },
      ]},
      { day: 'Sunday', classes: [
        { name: 'Recovery Yoga', time: '10:00 AM', duration: '60 min', instructor: 'Coach Sarah' },
      ]},
    ];
  }

  return (
    <div className="class-schedule-page">
      <header className="csp-header">
        <h1 className="csp-logo" onClick={() => navigate('/')}>Insight GYM USA</h1>
        <nav className="csp-nav">
          <button className="csp-nav-btn" onClick={() => navigate('/')}>Home</button>
          <button className="csp-nav-btn" onClick={() => navigate('/trainers')}>Our Team</button>
          <button className="csp-nav-btn" onClick={() => navigate('/pricing')}>Pricing</button>
        </nav>
      </header>

      <main className="csp-main">
        <h2 className="csp-title">Class Schedule</h2>
        <p className="csp-subtitle">Join our group classes. All classes included with membership.</p>

        {loading ? (
          <div className="csp-loading">Loading schedule...</div>
        ) : (
          <div className="csp-schedule">
            {schedule.map((dayBlock, i) => (
              <div key={i} className="csp-day">
                <h3 className="csp-day-name">{dayBlock.day}</h3>
                <div className="csp-classes">
                  {(dayBlock.classes || []).map((cls, j) => (
                    <div key={j} className="csp-class">
                      <span className="csp-class-name">{cls.name}</span>
                      <span className="csp-class-time">{cls.time}</span>
                      <span className="csp-class-duration">{cls.duration || ''}</span>
                      <span className="csp-class-instructor">{cls.instructor || ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClassSchedulePage;
