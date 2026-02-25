import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiBase } from '../../services/apiBase';
import './BreakRequestsTab.css';

const API_BASE = getApiBase();

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } } : {};
};

const BreakRequestsTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'all' | 'pending' | 'accepted' | 'denied' | 'seen'
  const [actingId, setActingId] = useState(null);
  const [respondMessage, setRespondMessage] = useState('');
  const [respondTargetId, setRespondTargetId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await axios.get(`${API_BASE}/api/admin/break-requests${params}`, getAuthConfig());
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error loading break requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const respond = async (id, action, message = '') => {
    setActingId(id);
    try {
      await axios.patch(
        `${API_BASE}/api/admin/break-requests/${id}/respond`,
        { action, message: message || undefined },
        getAuthConfig()
      );
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: action === 'accept' ? 'accepted' : 'denied',
                responded_at: new Date().toISOString(),
                response_message: message || null,
              }
            : r
        )
      );
      setRespondTargetId(null);
      setRespondMessage('');
    } catch (err) {
      console.error('Error responding to break request:', err);
    } finally {
      setActingId(null);
    }
  };

  const openRespond = (id) => {
    setRespondTargetId(id);
    setRespondMessage('');
  };

  const closeRespond = () => {
    setRespondTargetId(null);
    setRespondMessage('');
  };

  return (
    <div className="break-requests-tab" dir="ltr">
      <div className="break-requests-header">
        <h2>Member Break Requests</h2>
        <p className="break-requests-desc">
          Members you work with can send break requests. Accept or deny each request.
        </p>
        <div className="break-requests-filters">
          <button type="button" className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>
            Pending
          </button>
          <button type="button" className={filter === 'accepted' ? 'active' : ''} onClick={() => setFilter('accepted')}>
            Accepted
          </button>
          <button type="button" className={filter === 'denied' ? 'active' : ''} onClick={() => setFilter('denied')}>
            Denied
          </button>
          <button type="button" className={filter === 'seen' ? 'active' : ''} onClick={() => setFilter('seen')}>
            Seen
          </button>
          <button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="break-requests-loading">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="break-requests-empty">
          <p>No break requests.</p>
        </div>
      ) : (
        <ul className="break-requests-list">
          {requests.map((r) => (
            <li key={r.id} className={`break-request-item ${r.status}`}>
              <div className="break-request-meta">
                <strong>{r.username || `User #${r.user_id}`}</strong>
                <span className="break-request-date">{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</span>
                <span className={`break-request-status-badge status-${r.status}`}>
                  {r.status === 'pending' && 'Pending'}
                  {r.status === 'accepted' && 'Accepted'}
                  {r.status === 'denied' && 'Denied'}
                  {r.status === 'seen' && 'Seen'}
                </span>
                {r.status === 'pending' && (
                  <div className="break-request-actions">
                    <button
                      type="button"
                      className="break-request-accept"
                      onClick={() => respond(r.id, 'accept')}
                      disabled={actingId === r.id}
                    >
                      {actingId === r.id ? '…' : 'Accept'}
                    </button>
                    <button
                      type="button"
                      className="break-request-deny"
                      onClick={() => openRespond(r.id)}
                      disabled={actingId === r.id}
                    >
                      Deny
                    </button>
                  </div>
                )}
              </div>
              <p className="break-request-message">{r.message}</p>
              {respondTargetId === r.id && (
                <div className="break-request-respond-form">
                  <label htmlFor="respond-msg">Message (optional)</label>
                  <textarea
                    id="respond-msg"
                    value={respondMessage}
                    onChange={(e) => setRespondMessage(e.target.value)}
                    placeholder="Reason for denial or note..."
                    rows={2}
                  />
                  <div className="break-request-respond-buttons">
                    <button type="button" onClick={closeRespond}>Cancel</button>
                    <button
                      type="button"
                      className="break-request-deny-confirm"
                      onClick={() => respond(r.id, 'deny', respondMessage)}
                      disabled={actingId === r.id}
                    >
                      {actingId === r.id ? '…' : 'Deny request'}
                    </button>
                  </div>
                </div>
              )}
              {(r.responded_at || r.response_message) && (
                <div className="break-request-response">
                  {r.responded_at && (
                    <span className="break-request-responded-at">
                      Responded at {new Date(r.responded_at).toLocaleString()}
                    </span>
                  )}
                  {r.response_message && <p className="break-request-response-message">{r.response_message}</p>}
                </div>
              )}
              {r.seen_at && !r.responded_at && (
                <span className="break-request-seen-at">
                  Seen at {new Date(r.seen_at).toLocaleString()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BreakRequestsTab;
