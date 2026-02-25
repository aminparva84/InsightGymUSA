import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getApiBase } from '../services/apiBase';
import ProfileTab from './tabs/ProfileTab';
import AssistantDashboard from './tabs/AssistantDashboard';
import MembersListTab from './tabs/MembersListTab';
import InPersonSessionsTab from './tabs/InPersonSessionsTab';
import MembersProgramsTab from './tabs/MembersProgramsTab';
import TrainingInfoTab from './tabs/TrainingInfoTab';
import TrainingPlansProductsTab from './tabs/TrainingPlansProductsTab';
import SiteSettingsTab from './tabs/SiteSettingsTab';
import AISettingsTab from './tabs/AISettingsTab';
import HistoryTab from './tabs/HistoryTab';
import NutritionTab from './tabs/NutritionTab';
import TrainingProgramTab from './tabs/TrainingProgramTab';
import StepsTab from './tabs/StepsTab';
import OnlineLab from './tabs/OnlineLab';
import PsychologyTest from './tabs/PsychologyTest';
import MembersAndAssistantsManagementTab from './tabs/MembersAndAssistantsManagementTab';
import DashboardChatWidget from './DashboardChatWidget';
import TrainingWithAgent from './TrainingWithAgent';
import DashboardIcon from './DashboardIcon';
import AskProgressCheck from './AskProgressCheck';
import AppHeader from './AppHeader';
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useTranslation();
  const API_BASE = getApiBase();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [userRole, setUserRole] = useState(null);
  const [profileComplete, setProfileComplete] = useState(true);
  const [progressCheckOpen, setProgressCheckOpen] = useState(false);
  const [trialStatus, setTrialStatus] = useState(null);

  const getAuthToken = useCallback(() => localStorage.getItem('token') || '', []);
  const getAxiosConfig = useCallback(() => {
    const token = getAuthToken();
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }, [getAuthToken]);

  useEffect(() => {
    if (!user || userRole !== 'member') return;
    const loadTrialStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/member/trial-status`, getAxiosConfig());
        setTrialStatus(res.data || null);
      } catch (err) {
        setTrialStatus(null);
      }
    };
    loadTrialStatus();
  }, [API_BASE, getAxiosConfig, user, userRole]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

  useEffect(() => {
    // Check user role and profile completion
    const checkRole = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/admin/check-admin`);
        const role = response.data.role || 'member';
        setUserRole(role);
        
        // If coach, check if profile is complete
        if (role === 'coach') {
          try {
            const profileResponse = await axios.get(`${API_BASE}/api/admin/check-profile-complete`);
            const isComplete = profileResponse.data.profile_complete;
            setProfileComplete(isComplete);
            
            // If profile not complete, show profile tab
            if (!isComplete) {
              setActiveTab('profile');
            }
          } catch (error) {
            console.error('Error checking profile completion:', error);
          }
        }
      } catch (error) {
        setUserRole('member');
      }
    };
    if (user) {
      checkRole();
    }
  }, [API_BASE, user]);

  // Determine tabs based on user role
  const getTabs = () => {
    if (userRole === 'admin') {
      // Admin tabs - gym flow: Members & Coaches, Pricing, Programs, Settings
      return [
        { id: 'members-coachs-management', label: 'Members & Coaches', icon: 'people' },
        { id: 'training-plans-products', label: 'Pricing & Plans', icon: 'assignment' },
        { id: 'members-programs', label: 'Programs', icon: 'assignment' },
        { id: 'ai-settings', label: 'AI Settings', icon: 'smart_toy' },
        { id: 'site-settings', label: 'Site Settings', icon: 'settings' }
      ];
    } else if (userRole === 'coach') {
      // Coach sees profile tab if incomplete, otherwise coach tabs (Training Info, Members, no Break Requests)
      if (!profileComplete) {
        return [
          { id: 'profile', label: 'Profile', icon: 'person' }
        ];
      } else {
        return [
          { id: 'members-list', label: 'My Members', icon: 'people' },
          { id: 'training-info', label: 'Training Info', icon: 'menu_book' },
          { id: 'in-person-sessions', label: 'In-Person Sessions', icon: 'event' },
          { id: 'members-programs', label: 'Members Programs', icon: 'assignment' }
        ];
      }
    } else {
      // Regular members see profile tab, Training with Agent tab, and base tabs
      const baseTabs = [
        { id: 'training-with-agent', label: 'Training with Agent', icon: 'smart_toy' },
        { id: 'history', label: t('history'), icon: 'bar_chart' },
        { id: 'steps', label: 'Steps', icon: 'directions_walk' },
        { id: 'nutrition', label: t('nutrition'), icon: 'restaurant' },
        { id: 'training-program', label: 'Training Program', icon: 'fitness_center' },
        { id: 'online-lab', label: 'Online Laboratory', icon: 'science' },
        { id: 'psychology-test', label: 'Psychology Test', icon: 'psychology' }
      ];
      return [
        { id: 'profile', label: 'Profile', icon: 'person' },
        ...baseTabs
      ];
    }
  };

  const tabs = getTabs();
  
  // Set default active tab based on role
  useEffect(() => {
    if (userRole === 'admin' && activeTab === 'profile') {
      setActiveTab('members-coachs-management');
    } else if (userRole === 'coach' && activeTab === 'profile' && profileComplete) {
      setActiveTab('members-list');
    } else if (userRole === 'coach' && activeTab === 'coach-dashboard') {
      setActiveTab('members-list');
    }
  }, [userRole, profileComplete, activeTab]);

  return (
    <div className="dashboard">
      <AppHeader showNotifications userRole={userRole} />

      <div className="dashboard-content">
        {userRole === 'member' && trialStatus && (
          <div className={`trial-banner ${trialStatus.trial_ended ? 'trial-ended' : 'trial-active'}`}>
            {trialStatus.is_trial_active ? (
              <span>
                Free trial: {trialStatus.days_left === 0 ? 'Last day today' : `${trialStatus.days_left} days left`}
              </span>
            ) : trialStatus.trial_ended ? (
              <span>Your 7-day free trial has ended. Subscribe to continue using all features.</span>
            ) : null}
          </div>
        )}
        <div className="dashboard-layout">
          {userRole === 'member' && (
            <div className="dashboard-member-actions">
              <button
                type="button"
                className="member-action-btn"
                onClick={() => setProgressCheckOpen(true)}
              >
                <span className="member-action-icon"><DashboardIcon name="bar_chart" /></span>
                Ask for progress check
              </button>
            </div>
          )}
          {/* 1. Tabs - full width */}
          <div className="tabs-container">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab(tab.id);
                }}
              >
                <span className="tab-icon"><DashboardIcon name={tab.icon} /></span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* 2. Tab content - full width */}
          <div className="tab-content">
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'training-with-agent' && <TrainingWithAgent />}
            {activeTab === 'members-coachs-management' && <MembersAndAssistantsManagementTab />}
            {activeTab === 'coach-dashboard' && <AssistantDashboard />}
            {activeTab === 'members-list' && <MembersListTab />}
            {activeTab === 'in-person-sessions' && <InPersonSessionsTab />}
            {activeTab === 'members-programs' && <MembersProgramsTab />}
            {activeTab === 'training-info' && <TrainingInfoTab />}
            {activeTab === 'training-plans-products' && <TrainingPlansProductsTab />}
            {activeTab === 'ai-settings' && <AISettingsTab />}
            {activeTab === 'site-settings' && <SiteSettingsTab />}
            {activeTab === 'history' && <HistoryTab />}
            {activeTab === 'nutrition' && <NutritionTab />}
            {activeTab === 'training-program' && <TrainingProgramTab />}
            {activeTab === 'steps' && <StepsTab />}
            {activeTab === 'online-lab' && <OnlineLab />}
            {activeTab === 'psychology-test' && <PsychologyTest />}
          </div>
        </div>

        <DashboardChatWidget />

        {progressCheckOpen && (
          <div className="progress-check-modal-overlay" onClick={() => setProgressCheckOpen(false)} role="dialog" aria-modal="true">
            <div className="progress-check-modal" onClick={(e) => e.stopPropagation()} dir="ltr">
              <div className="progress-check-modal-header">
                <span>Ask for progress check</span>
                <button type="button" onClick={() => setProgressCheckOpen(false)} aria-label="Close">×</button>
              </div>
              <AskProgressCheck />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

