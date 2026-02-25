import React, { useState } from 'react';
import ChatBox from './ChatBox';
import './DashboardChatWidget.css';

const DashboardChatWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCollapsedClick = () => {
    setIsExpanded(true);
  };

  return (
    <div className="dashboard-chat-widget">
      <div
        className={`dashboard-chat-container ${isExpanded ? 'dashboard-chat-expanded' : 'dashboard-chat-collapsed'}`}
      >
        {/* Collapsed: "ask me anything" only */}
        {!isExpanded && (
          <button
            type="button"
            className="dashboard-chat-collapsed-trigger"
            onClick={handleCollapsedClick}
            aria-label="Ask me anything"
          >
            <span className="dashboard-chat-ask-text">ask me anything</span>
            <span className="dashboard-chat-ask-cursor">|</span>
          </button>
        )}

        {/* Expanded: full chat UI */}
        {isExpanded && (
          <>
            <div className="dashboard-chat-panel-header">
              <h3>AI Fitness Coach</h3>
              <button
                type="button"
                className="dashboard-chat-close"
                onClick={() => setIsExpanded(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="dashboard-chat-content">
              <ChatBox embedded />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardChatWidget;
