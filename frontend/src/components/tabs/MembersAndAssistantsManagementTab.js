import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MembersListTab from './MembersListTab';
import AdminTab from './AdminTab';
import './MembersAndAssistantsManagementTab.css';

const SUB_TABS = [
  { id: 'member-list', labelKey: 'memberList', icon: '👥' },
  { id: 'coaches', labelKey: 'coaches', icon: '👤' }
];

const MembersAndAssistantsManagementTab = () => {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState('member-list');

  const getSubTabLabel = (labelKey) => t(labelKey);

  return (
    <div className="members-assistants-management">
      <div className="sub-tabs-container">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`sub-tab-btn ${activeSubTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveSubTab(tab.id)}
          >
            <span className="sub-tab-icon">{tab.icon}</span>
            {getSubTabLabel(tab.labelKey)}
          </button>
        ))}
      </div>
      <div className="sub-tab-content">
        {activeSubTab === 'member-list' && <MembersListTab />}
        {activeSubTab === 'coaches' && <AdminTab />}
      </div>
    </div>
  );
};

export default MembersAndAssistantsManagementTab;
