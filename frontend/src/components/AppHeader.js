import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import axios from 'axios';
import { getApiBase } from '../services/apiBase';
import './AppHeader.css';

const AppHeader = ({ showNotifications = true, userRole: propUserRole } = {}) => {
  const { user, logout } = useAuth();
  const userRole = user?.role ?? propUserRole ?? null;
  const showBell = showNotifications && (userRole === 'member' || userRole === 'admin' || userRole === 'coach');
  const navigate = useNavigate();
  const API_BASE = getApiBase();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);

  const getAxiosConfig = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setNotificationsLoading(true);
      setNotificationsError(null);
      const res = await axios.get(`${API_BASE}/api/member/notifications?language=en`, getAxiosConfig());
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setNotifications([]);
      setNotificationsError(err.response?.data?.error || err.message || 'Failed to load');
    } finally {
      setNotificationsLoading(false);
    }
  }, [API_BASE, user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user && showBell) loadNotifications();
  }, [user, showBell, loadNotifications]);

  useEffect(() => {
    if (notificationsOpen && user && showBell) loadNotifications();
  }, [notificationsOpen, user, showBell, loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const markNotificationRead = async (id) => {
    try {
      await axios.patch(`${API_BASE}/api/member/notifications/${id}/read`, {}, getAxiosConfig());
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await axios.patch(`${API_BASE}/api/member/notifications/read-all`, {}, getAxiosConfig());
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.read_at) markNotificationRead(n.id);
    if (n.link) {
      const tab = (n.link.replace('?tab=', '') || 'training-program').trim();
      navigate(`/dashboard?tab=${tab}`);
    }
    setNotificationsOpen(false);
  };

  useEffect(() => {
    if (!notificationsOpen) return;
    const onOutside = (e) => {
      if (e.target.closest('.app-header-notifications-wrap')) return;
      setNotificationsOpen(false);
    };
    const t = setTimeout(() => document.addEventListener('click', onOutside), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', onOutside);
    };
  }, [notificationsOpen]);

  const handleAuth = () => {
    setMobileMenuOpen(false);
    if (user) navTo('/dashboard');
    else setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const goToContact = () => {
    setMobileMenuOpen(false);
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  /* Push layout: add body class when menu opens */
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('app-menu-open');
    } else {
      document.body.classList.remove('app-menu-open');
    }
    return () => document.body.classList.remove('app-menu-open');
  }, [mobileMenuOpen]);

  return (
    <div className="app-header-root">
      {mobileMenuOpen && (
        <div
          className="app-header-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
          onKeyDown={(e) => e.key === 'Enter' && setMobileMenuOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}
      <header className={`app-header ${isScrolled ? 'scrolled' : ''} ${mobileMenuOpen ? 'menu-open' : ''}`}>
        <div className="app-header-inner">
          <h1 className="app-header-logo" onClick={() => navTo('/')}>
            Insight GYM USA
          </h1>
          <div className="app-header-right">
            {showBell && (
              <div className="app-header-notifications-wrap">
                <button
                  type="button"
                  className={`app-header-notifications-btn ${notificationsOpen ? 'is-open' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setNotificationsOpen((o) => !o); }}
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <svg className="app-header-notification-icon" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="app-header-notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="app-header-notifications-dropdown">
                    <div className="app-header-notifications-dropdown-header">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <button type="button" className="app-header-notifications-mark-all" onClick={markAllNotificationsRead}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="app-header-notifications-list">
                      {notificationsLoading ? (
                        <div className="app-header-notifications-loading">Loading...</div>
                      ) : notificationsError ? (
                        <div className="app-header-notifications-error">
                          Error loading notifications
                          <button type="button" className="app-header-notifications-retry" onClick={() => loadNotifications()}>
                            Retry
                          </button>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="app-header-notifications-empty">No notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            className={`app-header-notification-item ${!n.read_at ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(n)}
                          >
                            {n.type && (
                              <span className="app-header-notification-type-badge" data-type={n.type}>
                                {n.type === 'trainer_note' ? 'Trainer note' :
                                 n.type === 'message' ? 'Message' :
                                 n.type === 'reminder' ? 'Reminder' : n.type}
                              </span>
                            )}
                            <strong>{n.title}</strong>
                            {n.body && <span className="app-header-notification-body">{n.body}</span>}
                            {n.created_at && (
                              <span className="app-header-notification-time">
                                {new Date(n.created_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {user && (
              <button
                type="button"
                className="app-header-username"
                onClick={() => navTo('/dashboard')}
              >
                {user.username}
              </button>
            )}
            {user ? (
              <button className="app-header-nav-btn app-header-nav-btn-primary" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <button className="app-header-nav-btn app-header-nav-btn-primary" onClick={handleAuth}>
                Login
              </button>
            )}
            <button
              type="button"
              className="app-header-hamburger"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <span className="app-header-hamburger-line" />
              <span className="app-header-hamburger-line" />
              <span className="app-header-hamburger-line" />
            </button>
          </div>
        </div>
      </header>

      {/* Hamburger menu - Schedule, Our Team, Pricing, Contact Us */}
      <nav className={`app-header-menu ${mobileMenuOpen ? 'open' : ''}`} aria-label="Main navigation">
        <button className="app-header-menu-btn" onClick={() => navTo('/schedule')}>
          Schedule
        </button>
        <button className="app-header-menu-btn" onClick={() => navTo('/trainers')}>
          Our Team
        </button>
        <button className="app-header-menu-btn" onClick={() => navTo('/pricing')}>
          Pricing
        </button>
        <button className="app-header-menu-btn" onClick={goToContact}>
          Contact Us
        </button>
      </nav>

      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default AppHeader;
