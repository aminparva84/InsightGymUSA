import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiBase } from '../../services/apiBase';
import './StepsTab.css';

const API_BASE = getApiBase();

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const StepsTab = () => {
  const [todaySteps, setTodaySteps] = useState(null);
  const [manualSteps, setManualSteps] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const loadSteps = useCallback(async () => {
    try {
      const from = new Date();
      from.setDate(from.getDate() - 30);
      const to = new Date();
      const res = await axios.get(
        `${API_BASE}/api/member/steps?from_date=${from.toISOString().slice(0, 10)}&to_date=${to.toISOString().slice(0, 10)}`,
        getAuthConfig()
      );
      const list = Array.isArray(res.data) ? res.data : [];
      setHistory(list);
      const todayEntry = list.find((e) => e.date === today);
      setTodaySteps(todayEntry ? todayEntry.steps : null);
      setManualSteps(todayEntry ? String(todayEntry.steps) : '');
    } catch (err) {
      console.error('Error loading steps:', err);
      setHistory([]);
      setTodaySteps(null);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadSteps();
  }, [loadSteps]);

  // Device step count (e.g. Pedometer API) can be wired here when available on target platforms

  const saveSteps = async (stepsValue, source = 'manual') => {
    const steps = parseInt(stepsValue, 10);
    if (isNaN(steps) || steps < 0) return;
    setSaving(true);
    try {
      await axios.post(
        `${API_BASE}/api/member/steps`,
        { date: today, steps, source },
        { ...getAuthConfig(), headers: { ...getAuthConfig().headers, 'Content-Type': 'application/json' } }
      );
      setTodaySteps(steps);
      setManualSteps(String(steps));
      loadSteps();
    } catch (err) {
      console.error('Error saving steps:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    saveSteps(manualSteps, 'manual');
  };

  return (
    <div className="steps-tab" dir="ltr">
      <div className="steps-header">
        <h2>Step Counter</h2>
        <p className="steps-subtitle">
          Enter your steps for today or use your device (mobile).
        </p>
      </div>

      {loading ? (
        <div className="steps-loading">Loading...</div>
      ) : (
        <>
          <div className="steps-today-card">
            <h3>Today</h3>
            <div className="steps-today-value">
              {(todaySteps !== null && todaySteps !== undefined) ? todaySteps : '—'}
            </div>
            <p className="steps-source">
              {todaySteps != null && 'Recorded'}
            </p>
            <form onSubmit={handleManualSubmit} className="steps-manual-form">
              <label htmlFor="steps-input">Number of steps</label>
              <input
                id="steps-input"
                type="number"
                min="0"
                step="1"
                value={manualSteps}
                onChange={(e) => setManualSteps(e.target.value)}
                placeholder="e.g. 5000"
              />
              <button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>

          <div className="steps-history">
            <h3>History (last 30 days)</h3>
            {history.length === 0 ? (
              <p className="steps-no-history">No steps recorded yet.</p>
            ) : (
              <ul className="steps-history-list">
                {history.slice(0, 14).map((entry) => (
                  <li key={entry.date} className="steps-history-item">
                    <span className="steps-history-date">{entry.date}</span>
                    <span className="steps-history-steps">{entry.steps}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StepsTab;
