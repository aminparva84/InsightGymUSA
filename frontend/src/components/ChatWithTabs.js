import React from 'react';
import DashboardIcon from './DashboardIcon';
import ChatBox from './ChatBox';
import './ChatWithTabs.css';

const ChatWithTabs = () => {
  return (
    <div className="chat-with-tabs" dir="ltr">
      <div className="chat-with-tabs-header">
        <div className="chat-with-tabs-title">
          <span className="chat-tab-icon"><DashboardIcon name="smart_toy" /></span>
          <span>AI Chat</span>
        </div>
      </div>
      <div className="chat-with-tabs-content">
        <ChatBox />
      </div>
    </div>
  );
};

export default ChatWithTabs;
