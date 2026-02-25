import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { getApiBase } from '../services/apiBase';
import { useAuth } from '../context/AuthContext';
import './ChatPanel.css';

const ChatPanel = ({ onClose }) => {
  const { t } = useTranslation();
  const API_BASE = getApiBase();
  const { user, logout, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get token from localStorage or axios defaults
  const getAuthToken = () => {
    // First try localStorage (most reliable)
    const localToken = localStorage.getItem('token');
    if (localToken && localToken.trim() !== '') {
      return localToken.trim();
    }
    // Fallback to axios defaults
    const authHeader = axios.defaults.headers.common['Authorization'];
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.replace('Bearer ', '').trim();
    }
    return null;
  };

  // Create axios config with auth header
  const getAxiosConfig = () => {
    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token found');
      return {};
    }
    
    // Remove any accidental "Bearer " prefix
    let cleanToken = token.trim();
    if (cleanToken.startsWith('Bearer ')) {
      cleanToken = cleanToken.replace(/^Bearer\s+/i, '').trim();
    }
    
    // Validate token format
    if (!cleanToken.startsWith('eyJ')) {
      console.error('Invalid token format in ChatPanel!');
      return {};
    }
    
    // Update axios defaults
    axios.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
    
    return {
      headers: {
        'Authorization': `Bearer ${cleanToken}`
      }
    };
  };

  useEffect(() => {
    // Wait for auth to finish loading, then load chat history if user is logged in
    if (!authLoading && user) {
      const token = getAuthToken();
      if (token) {
        loadChatHistory();
      } else {
        console.warn('No token found, skipping chat history load');
      }
    }
  }, [authLoading, user]);

  const sendInitialGreeting = async () => {
    const token = getAuthToken();
    if (!token) {
      console.warn('No token available for sending initial greeting');
      return;
    }

    const localTime = new Date().toISOString();
    const greeting = 'Hello';
    
    try {
      const response = await axios.post(`${API_BASE}/api/chat`, {
        message: greeting,
        local_time: localTime
      }, getAxiosConfig());

      const assistantMessage = {
        type: 'assistant',
        text: response.data.response,
        timestamp: response.data.timestamp
      };
      setMessages([assistantMessage]);
    } catch (error) {
      console.error('Error sending initial greeting:', error);
      // Don't show error message on initial greeting - let user interact first
      if (error.response?.status === 401 || error.response?.status === 422) {
        console.warn('Authentication error in initial greeting');
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputMessage && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    const token = getAuthToken();
    if (!token) {
      console.warn('No token available for loading chat history');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/api/chat/history`, getAxiosConfig());
      const historyMessages = response.data.map(chat => ({
        type: 'user',
        text: chat.message,
        timestamp: chat.timestamp
      })).concat(response.data.map(chat => ({
        type: 'assistant',
        text: chat.response,
        timestamp: chat.timestamp
      }))).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      setMessages(historyMessages);
      
      // If no history, send initial greeting
      if (historyMessages.length === 0) {
        setTimeout(() => {
          sendInitialGreeting();
        }, 500);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      if (error.response?.status === 401 || error.response?.status === 422) {
        // Don't show error message immediately - let user try to send a message first
        // The error will be shown when they try to send a message
        console.warn('Authentication error loading chat history');
      } else {
        // If error loading history, still try to send greeting if token exists
        const token = getAuthToken();
        if (token) {
          setTimeout(() => {
            sendInitialGreeting();
          }, 500);
        }
      }
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setLoading(true);

    // Get local time from browser
    const localTime = new Date().toISOString();

    // Add user message to UI immediately
    const newUserMessage = {
      type: 'user',
      text: userMessage,
      timestamp: localTime
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await axios.post(`${API_BASE}/api/chat`, {
        message: userMessage,
        local_time: localTime
      }, getAxiosConfig());

      // Check if response has an error field (backend might return error in response field)
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const assistantMessage = {
        type: 'assistant',
        text: response.data.response || 'No response received. Please try again.',
        timestamp: response.data.timestamp || new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
        // Handle 401/422 Unauthorized - token expired or missing
      if (error.response?.status === 401 || error.response?.status === 422) {
        // Check if token exists
        const token = getAuthToken();
        if (!token) {
          const authErrorMsg = {
            type: 'assistant',
            text: 'Please log in first.',
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, authErrorMsg]);
          return;
        } else {
          // Token exists but is invalid/expired
          const authErrorMsg = {
            type: 'assistant',
            text: 'Your session has expired. Please refresh the page or log in again.',
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, authErrorMsg]);
          // Don't auto-logout, let user refresh
          return;
        }
      }
      
      // Try to extract error message from response
      let errorText = 'Sorry, an error occurred. Please try again.';
      
      if (error.response?.data?.error) {
        errorText = error.response.data.error;
      } else if (error.response?.data?.response) {
        // Backend might return error message in response field
        errorText = error.response.data.response;
      } else if (error.message) {
        errorText = error.message;
      }
      
      const errorMessage = {
        type: 'assistant',
        text: errorText,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>{t('chat')} - {t('appName')} AI</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="action-suggestions" dir="ltr">
              <h4>I can help you with:</h4>
              <div className="action-buttons">
                <button 
                  className="action-btn"
                  onClick={() => setInputMessage('Create a workout plan for me')}
                >
                  <span className="action-icon">💪</span>
                  <div className="action-text">
                    <div className="action-title">Workout Plan</div>
                    <div className="action-subtitle">Get personalized workout plan</div>
                  </div>
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setInputMessage('Suggest a nutrition plan for me')}
                >
                  <span className="action-icon">🥗</span>
                  <div className="action-text">
                    <div className="action-title">Nutrition Plan</div>
                    <div className="action-subtitle">2 or 4 week meal plan</div>
                  </div>
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setInputMessage('Suggest exercises suitable for me')}
                >
                  <span className="action-icon">🏋️</span>
                  <div className="action-text">
                    <div className="action-title">Exercise Suggestions</div>
                    <div className="action-subtitle">Exercises tailored to your needs</div>
                  </div>
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setInputMessage('Guide me about healthy nutrition')}
                >
                  <span className="action-icon">🍎</span>
                  <div className="action-text">
                    <div className="action-title">Nutrition Guidance</div>
                    <div className="action-subtitle">Nutrition tips and diet advice</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <div className="message-content">
              {msg.text}
            </div>
            <div className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-content loading">
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-form" onSubmit={sendMessage}>
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={t('typeMessage')}
          className="chat-input"
          disabled={loading}
        />
        <button type="submit" className="send-btn" disabled={loading || !inputMessage.trim()}>
          {t('sendMessage')}
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;

