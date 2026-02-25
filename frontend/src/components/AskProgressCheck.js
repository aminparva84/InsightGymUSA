import React, { useState } from 'react';
import axios from 'axios';
import { getApiBase } from '../services/apiBase';
import './AskProgressCheck.css';

const API_BASE = getApiBase();

const AskProgressCheck = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const getAuthToken = () => localStorage.getItem('token') || '';
  const getAxiosConfig = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}`, 'Content-Type': 'application/json' }
  });

  const handleRequest = async () => {
    setError(null);
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/member/progress-check-request`, {}, getAxiosConfig());
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error sending');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ask-progress-check" dir="ltr">
      <h3>Ask for progress check</h3>
      <p className="ask-progress-check-desc">
        Click the button below to send a progress check request to your trainer. The trainer can accept or deny the request, and you will be notified.
      </p>
      {sent ? (
        <div className="ask-progress-check-success">
          Your request has been sent. Wait for your trainer to respond.
        </div>
      ) : (
        <>
          <button
            type="button"
            className="ask-progress-check-btn"
            onClick={handleRequest}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Ask for progress check'}
          </button>
          {error && <p className="ask-progress-check-error">{error}</p>}
        </>
      )}
    </div>
  );
};

export default AskProgressCheck;
