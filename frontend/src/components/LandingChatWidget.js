import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { getApiBase } from '../services/apiBase';
import { useAuth } from '../context/AuthContext';
import './LandingChatWidget.css';

const API_BASE = getApiBase();

const LandingChatWidget = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversationsList, setConversationsList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const getAxiosConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token || !token.trim()) return {};
    let clean = token.trim();
    if (clean.startsWith('Bearer ')) clean = clean.replace(/^Bearer\s+/i, '').trim();
    if (!clean.startsWith('eyJ')) return {};
    return { headers: { Authorization: `Bearer ${clean}` } };
  }, []);

  const mapHistoryToMessages = useCallback((raw) => {
    if (!Array.isArray(raw)) return [];
    const mapped = [];
    for (const item of raw) {
      if (item.message != null) mapped.push({ role: 'user', content: item.message });
      if (item.response != null) mapped.push({ role: 'assistant', content: item.response });
    }
    return mapped;
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/chat/conversations`, getAxiosConfig());
      setConversationsList(Array.isArray(res.data) ? res.data : []);
    } catch {
      setConversationsList([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [user, getAxiosConfig]);

  const selectConversation = useCallback(async (sessionId) => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/chat/history?session_id=${encodeURIComponent(sessionId)}`, getAxiosConfig());
      setMessages(mapHistoryToMessages(res.data || []));
      setCurrentSessionId(sessionId);
      setShowHistory(false);
    } catch {
      setMessages([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [user, getAxiosConfig, mapHistoryToMessages]);

  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setInputMessage('');
    setCurrentSessionId(null);
    setShowHistory(false);
  };

  const openHistory = () => {
    if (!user) {
      onOpenAuth?.();
      return;
    }
    setShowHistory(true);
    fetchConversations();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;
    if (!user) {
      onOpenAuth?.();
      return;
    }

    const userMsg = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/api/chat`,
        { message: inputMessage, session_id: currentSessionId || undefined },
        getAxiosConfig()
      );
      const sid = res.data?.session_id;
      if (sid) setCurrentSessionId(sid);
      const assistantMsg = {
        role: 'assistant',
        content: res.data?.response || res.data?.message || res.data?.assistant_response || 'No response',
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error sending message. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCollapsedClick = () => {
    setIsExpanded(true);
  };

  return (
    <div className="lp-chat-widget">
      <div
        className={`lp-chat-container ${isExpanded ? 'lp-chat-expanded' : 'lp-chat-collapsed'}`}
      >
        {/* Collapsed: "ask me anything" only */}
        {!isExpanded && (
          <button
            type="button"
            className="lp-chat-collapsed-trigger"
            onClick={handleCollapsedClick}
            aria-label="Ask me anything"
          >
            <span className="lp-chat-ask-text">ask me anything</span>
            <span className="lp-chat-ask-cursor">|</span>
          </button>
        )}

        {/* Expanded: full chat UI */}
        {isExpanded && (
          <>
            <div className="lp-chat-panel-header">
              <h3>AI Fitness Coach</h3>
              <button type="button" className="lp-chat-close" onClick={() => setIsExpanded(false)} aria-label="Close">
                ×
              </button>
            </div>

            <div className="lp-chat-actions">
              <button type="button" className="lp-chat-action-btn" onClick={startNewChat}>
                New chat
              </button>
              <button type="button" className="lp-chat-action-btn" onClick={openHistory}>
                History
              </button>
            </div>

            {showHistory ? (
              <div className="lp-chat-history-panel">
                <button type="button" className="lp-chat-history-back" onClick={() => setShowHistory(false)}>
                  ← Back
                </button>
                {historyLoading ? (
                  <p className="lp-chat-history-empty">Loading...</p>
                ) : conversationsList.length === 0 ? (
                  <p className="lp-chat-history-empty">No conversations yet.</p>
                ) : (
                  <div className="lp-chat-history-list">
                    {conversationsList.map((c) => (
                      <button
                        key={c.session_id}
                        type="button"
                        className="lp-chat-history-item"
                        onClick={() => selectConversation(c.session_id)}
                      >
                        <span className="lp-chat-history-preview">{c.title || c.preview || 'Conversation'}</span>
                        <span className="lp-chat-history-date">{formatDate(c.last_at)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : user ? (
              <>
                <div ref={messagesContainerRef} className="lp-chat-messages">
                  {messages.length === 0 && (
                    <div className="lp-chat-welcome">
                      <p>Hi! I&apos;m your AI fitness coach. Ask me about workouts, nutrition, or your goals.</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`lp-chat-msg ${msg.role}`}>
                      <span>{msg.content}</span>
                    </div>
                  ))}
                  {loading && (
                    <div className="lp-chat-msg assistant">
                      <span className="lp-chat-typing">
                        <span /><span /><span />
                      </span>
                    </div>
                  )}
                </div>
                <form className="lp-chat-form" onSubmit={sendMessage}>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={loading}
                  />
                  <button type="submit" disabled={loading || !inputMessage.trim()}>Send</button>
                </form>
              </>
            ) : (
              <div className="lp-chat-guest">
                <p>Chat with our AI fitness coach for personalized workout and nutrition advice.</p>
                <button type="button" className="lp-chat-cta" onClick={() => { setIsExpanded(false); onOpenAuth?.(); }}>
                  Sign Up to Chat — Free Trial
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LandingChatWidget;
