import React, { useState, useEffect, useCallback } from 'react';
import './InPersonSessionsTab.css';

const InPersonSessionsTab = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint when available
      // const response = await axios.get('http://localhost:5001/api/sessions', getAxiosConfig());
      // setSessions(response.data);
      setSessions([]); // Placeholder
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <div className="in-person-sessions-tab" dir="ltr">
      <div className="sessions-header">
        <h2>In-Person Sessions History</h2>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="no-sessions">
          <p>No in-person sessions recorded yet</p>
        </div>
      ) : (
        <div className="sessions-list">
          {sessions.map(session => (
            <div key={session.id} className="session-card">
              <div className="session-date">
                {new Date(session.date).toLocaleDateString('en-US')}
              </div>
              <div className="session-details">
                <h3>{session.member_name}</h3>
                <p>{session.notes || '-'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InPersonSessionsTab;



