import React, { useState } from 'react';
import ChatBox from './ChatBox';
import DashboardIcon from './DashboardIcon';
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
        {/* Collapsed: AI icon in circle - click opens chat in same place */}
        {!isExpanded && (
          <button
            type="button"
            className="dashboard-chat-collapsed-trigger"
            onClick={handleCollapsedClick}
            aria-label="Chat with AI"
          >
            <span className="dashboard-chat-ai-circle">
              <DashboardIcon name="smart_toy" />
            </span>
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
