import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegistrationForm from './RegistrationForm';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [signupType, setSignupType] = useState('member');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (!result.success) setError(result.error);
    else {
      onClose();
      setUsername('');
      setPassword('');
      setError('');
      if (result.user?.role === 'admin') navigate('/dashboard');
    }
  };

  const handleRegistrationComplete = () => {
    onClose();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    if (tab === 'login') setUsername('');
    setPassword('');
  };

  const handleClose = () => {
    onClose();
    setError('');
    setUsername('');
    setPassword('');
    setActiveTab('login');
  };

  return (
    <div className="am-overlay" onClick={handleClose}>
      <div className="am-modal" onClick={(e) => e.stopPropagation()}>
        <button className="am-close" onClick={handleClose} aria-label="Close">×</button>
        <h2 className="am-title">Welcome to Insight GYM USA</h2>

        <div className="am-tabs">
          <button className={`am-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => handleTabChange('login')}>
            Login
          </button>
          <button className={`am-tab ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => handleTabChange('signup')}>
            Sign Up
          </button>
        </div>

        <div className="am-body">
          {activeTab === 'login' ? (
            <form className="am-form" onSubmit={handleLoginSubmit}>
              {error && <div className="am-error">{error}</div>}
              <div className="am-field">
                <label>Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
              </div>
              <div className="am-field">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="am-submit" disabled={loading}>
                {loading ? 'Loading...' : 'Login'}
              </button>
            </form>
          ) : (
            <div className="am-signup">
              <div className="am-signup-type">
                <button type="button" className={`am-type-btn ${signupType === 'member' ? 'active' : ''}`} onClick={() => setSignupType('member')}>
                  Join as Member
                </button>
                <button type="button" className={`am-type-btn ${signupType === 'coach' ? 'active' : ''}`} onClick={() => setSignupType('coach')}>
                  Apply as Coach
                </button>
              </div>
              <RegistrationForm onComplete={handleRegistrationComplete} accountType={signupType} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
