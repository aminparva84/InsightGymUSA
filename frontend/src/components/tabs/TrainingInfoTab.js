import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrainingLevelsInfoTab from './TrainingLevelsInfoTab';
import ExerciseLibraryTab from './ExerciseLibraryTab';
import TrainingMovementInfoTab from './TrainingMovementInfoTab';
import WarmingCooldownTab from './WarmingCooldownTab';
import DashboardIcon from '../DashboardIcon';
import { getApiBase } from '../../services/apiBase';
import './TrainingInfoTab.css';

const SUBTABS_ALL = [
  { id: 'training-levels', label: 'Training Levels Info', icon: 'bar_chart' },
  { id: 'exercise-library', label: 'Exercise Library', icon: 'menu_book' },
  { id: 'training-movement-info', label: 'Training Movement Info', icon: 'videocam' },
  { id: 'warming-cooldown', label: 'Warming & Cooldown', icon: 'ac_unit' }
];

const SUBTABS_COACH = [
  { id: 'training-levels', label: 'Training Levels Info', icon: 'bar_chart' }
];

const TrainingInfoTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('training-levels');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get(`${getApiBase()}/api/admin/check-admin`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUserRole(res.data.role || 'member'))
      .catch(() => setUserRole('member'));
  }, []);

  const subtabs = userRole === 'coach' ? SUBTABS_COACH : SUBTABS_ALL;

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'training-levels':
        return <TrainingLevelsInfoTab />;
      case 'exercise-library':
        return <ExerciseLibraryTab />;
      case 'training-movement-info':
        return <TrainingMovementInfoTab />;
      case 'warming-cooldown':
        return <WarmingCooldownTab />;
      default:
        return <TrainingLevelsInfoTab />;
    }
  };

  return (
    <div className="training-info-tab" dir="ltr">
      <div className="training-info-subtabs">
        {subtabs.map((sub) => (
          <button
            key={sub.id}
            type="button"
            className={`training-info-subtab-btn ${activeSubTab === sub.id ? 'active' : ''}`}
            onClick={() => setActiveSubTab(sub.id)}
          >
            <span className="training-info-subtab-icon"><DashboardIcon name={sub.icon} /></span>
            {sub.label}
          </button>
        ))}
      </div>
      <div className="training-info-content">
        {renderSubTabContent()}
      </div>
    </div>
  );
};

export default TrainingInfoTab;
