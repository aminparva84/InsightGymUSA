import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getApiBase } from '../services/apiBase';
import DashboardIcon from './DashboardIcon';
import TrainingPlansProductsTab from './tabs/TrainingPlansProductsTab';
import SiteSettingsTab from './tabs/SiteSettingsTab';
import AISettingsTab from './tabs/AISettingsTab';
import './AdminPage.css';

const AdminPage = () => {
  const API_BASE = getApiBase();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('members');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Coachs state
  const [coachs, setCoachs] = useState([]);
  const [pendingCoachs, setPendingCoachs] = useState([]);
  const [showCoachForm, setShowCoachForm] = useState(false);
  const [coachFormData, setCoachFormData] = useState({
    username: '',
    email: '',
    password: '',
    language: 'en',
    fillProfileNow: false,
    // Profile fields (optional)
    age: '',
    weight: '',
    height: '',
    gender: '',
    training_level: '',
    chest_circumference: '',
    waist_circumference: '',
    abdomen_circumference: '',
    arm_circumference: '',
    hip_circumference: '',
    thigh_circumference: ''
  });
  
  // Members state
  const [members, setMembers] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [memberFormData, setMemberFormData] = useState({});
  
  const checkAdmin = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/check-admin`);
      setIsAdmin(response.data.is_admin);
      if (!response.data.is_admin) {
        alert('You are not authorized to access this page');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, navigate]);

  const fetchCoachs = useCallback(async () => {
    try {
      const [coachsRes, pendingRes] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/coachs`),
        axios.get(`${API_BASE}/api/admin/coachs/pending`).catch(() => ({ data: [] })),
      ]);
      setCoachs(coachsRes.data);
      setPendingCoachs(Array.isArray(pendingRes.data) ? pendingRes.data : []);
    } catch (error) {
      console.error('Error fetching coachs:', error);
      alert('Error fetching coachs');
    }
  }, [API_BASE]);

  const handleApproveCoach = async (coachId) => {
    try {
      await axios.patch(`${API_BASE}/api/admin/coachs/${coachId}/approve`);
      alert('Coach approved');
      fetchCoachs();
    } catch (e) {
      alert(e.response?.data?.error || 'Error approving coach');
    }
  };

  const handleRejectCoach = async (coachId) => {
    try {
      await axios.patch(`${API_BASE}/api/admin/coachs/${coachId}/reject`);
      alert('Coach rejected');
      fetchCoachs();
    } catch (e) {
      alert(e.response?.data?.error || 'Error rejecting coach');
    }
  };

  const fetchMembers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/members`);
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      alert('Error fetching members');
    }
  }, [API_BASE]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'coachs') fetchCoachs();
      else if (activeTab === 'members') {
        fetchCoachs();
        fetchMembers();
      }
    }
  }, [isAdmin, activeTab, fetchCoachs, fetchMembers]);

  const handleCreateCoach = async (e) => {
    e.preventDefault();
    try {
      const data = {
        username: coachFormData.username,
        email: coachFormData.email,
        password: coachFormData.password,
        language: coachFormData.language
      };
      
      if (coachFormData.fillProfileNow) {
        data.profile = {
          age: coachFormData.age ? parseInt(coachFormData.age) : null,
          weight: coachFormData.weight ? parseFloat(coachFormData.weight) : null,
          height: coachFormData.height ? parseFloat(coachFormData.height) : null,
          gender: coachFormData.gender || '',
          training_level: coachFormData.training_level || '',
          chest_circumference: coachFormData.chest_circumference ? parseFloat(coachFormData.chest_circumference) : null,
          waist_circumference: coachFormData.waist_circumference ? parseFloat(coachFormData.waist_circumference) : null,
          abdomen_circumference: coachFormData.abdomen_circumference ? parseFloat(coachFormData.abdomen_circumference) : null,
          arm_circumference: coachFormData.arm_circumference ? parseFloat(coachFormData.arm_circumference) : null,
          hip_circumference: coachFormData.hip_circumference ? parseFloat(coachFormData.hip_circumference) : null,
          thigh_circumference: coachFormData.thigh_circumference ? parseFloat(coachFormData.thigh_circumference) : null
        };
      }
      
      await axios.post(`${API_BASE}/api/admin/coachs`, data);
      alert('Coach created successfully');
      setShowCoachForm(false);
      resetCoachForm();
      fetchCoachs();
    } catch (error) {
      console.error('Error creating coach:', error);
      alert(`Error creating coach: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    // Load member profile data
    setMemberFormData(member.profile || {});
  };

  const handleSaveMemberProfile = async () => {
    try {
      await axios.put(`${API_BASE}/api/admin/members/${editingMember.id}/profile`, memberFormData);
      alert('Member profile updated');
      setEditingMember(null);
      fetchMembers();
    } catch (error) {
      console.error('Error updating member profile:', error);
      alert('Error updating profile');
    }
  };

  const resetCoachForm = () => {
    setCoachFormData({
      username: '',
      email: '',
      password: '',
      language: 'en',
      fillProfileNow: false,
      age: '',
      weight: '',
      height: '',
      gender: '',
      training_level: '',
      chest_circumference: '',
      waist_circumference: '',
      abdomen_circumference: '',
      arm_circumference: '',
      hip_circumference: '',
      thigh_circumference: ''
    });
  };

  if (loading) {
    return <div className="admin-page-loading">{'Loading...'}</div>;
  }

  if (!isAdmin) {
    return <div className="admin-page-loading">{'Checking authorization...'}</div>;
  }

  const tabs = [
    { id: 'members', label: 'Members', icon: 'people' },
    { id: 'coachs', label: 'Coaches', icon: 'person' },
    { id: 'training-plans', label: 'Pricing & Plans', icon: 'assignment' },
    { id: 'site-settings', label: 'Site Settings', icon: 'settings' },
    { id: 'ai-settings', label: 'AI Settings', icon: 'smart_toy' }
  ];

  return (
    <div className="admin-page" dir="ltr">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand" onClick={() => navigate('/')}>Insight GYM</div>
        <nav className="admin-sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`admin-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="admin-sidebar-icon"><DashboardIcon name={tab.icon} /></span>
              {tab.label}
            </button>
          ))}
        </nav>
        <button type="button" className="admin-back-btn" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-main-header">
          <h1>Admin Dashboard</h1>
        </header>

        <div className="admin-content">
        {/* Coachs Tab */}
        {activeTab === 'coachs' && (
          <div className="admin-section">
            {pendingCoachs.length > 0 && (
              <div className="admin-pending-coachs">
                <h3>{'Pending Coach Approval'}</h3>
                <table>
                  <thead>
                    <tr>
                      <th>{'Username'}</th>
                      <th>{'Email'}</th>
                      <th>{'Certifications'}</th>
                      <th>{'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCoachs.map((c) => (
                      <tr key={c.id}>
                        <td>{c.username}</td>
                        <td>{c.email}</td>
                        <td>{c.certifications || '-'}</td>
                        <td>
                          <button className="btn-primary btn-sm" onClick={() => handleApproveCoach(c.id)}>
                            {'Approve'}
                          </button>
                          <button className="btn-secondary btn-sm" onClick={() => handleRejectCoach(c.id)}>
                            {'Reject'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="section-header">
              <h2>{'Coaches Management'}</h2>
              <button className="btn-primary" onClick={() => setShowCoachForm(true)}>
                {'+ Add Coach'}
              </button>
            </div>

            {showCoachForm && (
              <div className="admin-form-overlay">
                <div className="admin-form-container">
                  <h3>{'Create New Coach'}</h3>
                  <form onSubmit={handleCreateCoach}>
                    <div className="form-group">
                      <label>{'Username *'}</label>
                      <input
                        type="text"
                        value={coachFormData.username}
                        onChange={(e) => setCoachFormData({...coachFormData, username: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>{'Email *'}</label>
                      <input
                        type="email"
                        value={coachFormData.email}
                        onChange={(e) => setCoachFormData({...coachFormData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>{'Password *'}</label>
                      <input
                        type="password"
                        value={coachFormData.password}
                        onChange={(e) => setCoachFormData({...coachFormData, password: e.target.value})}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={coachFormData.fillProfileNow}
                          onChange={(e) => setCoachFormData({...coachFormData, fillProfileNow: e.target.checked})}
                        />
                        Fill profile now (otherwise coach must complete after first login)
                      </label>
                    </div>

                    {coachFormData.fillProfileNow && (
                      <>
                        <div className="form-row">
                          <div className="form-group">
                            <label>{'Age'}</label>
                            <input
                              type="number"
                              value={coachFormData.age}
                              onChange={(e) => setCoachFormData({...coachFormData, age: e.target.value})}
                              min="1"
                              max="120"
                            />
                          </div>
                          <div className="form-group">
                            <label>{'Gender'}</label>
                            <select
                              value={coachFormData.gender}
                              onChange={(e) => setCoachFormData({...coachFormData, gender: e.target.value})}
                            >
                              <option value="">{'Select'}</option>
                              <option value="male">{'Male'}</option>
                              <option value="female">{'Female'}</option>
                              <option value="other">{'Other'}</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>{'Weight (kg)'}</label>
                            <input
                              type="number"
                              value={coachFormData.weight}
                              onChange={(e) => setCoachFormData({...coachFormData, weight: e.target.value})}
                              step="0.1"
                            />
                          </div>
                          <div className="form-group">
                            <label>{'Height (cm)'}</label>
                            <input
                              type="number"
                              value={coachFormData.height}
                              onChange={(e) => setCoachFormData({...coachFormData, height: e.target.value})}
                              step="0.1"
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>{'Training Level'}</label>
                          <select
                            value={coachFormData.training_level}
                            onChange={(e) => setCoachFormData({...coachFormData, training_level: e.target.value})}
                          >
                            <option value="">{'Select'}</option>
                            <option value="beginner">{'Beginner'}</option>
                            <option value="intermediate">{'Intermediate'}</option>
                            <option value="advanced">{'Advanced'}</option>
                          </select>
                        </div>
                        <h4>{'Body Measurements (cm)'}</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label>{'Chest'}</label>
                            <input
                              type="number"
                              value={coachFormData.chest_circumference}
                              onChange={(e) => setCoachFormData({...coachFormData, chest_circumference: e.target.value})}
                              step="0.1"
                            />
                          </div>
                          <div className="form-group">
                            <label>{'Waist'}</label>
                            <input
                              type="number"
                              value={coachFormData.waist_circumference}
                              onChange={(e) => setCoachFormData({...coachFormData, waist_circumference: e.target.value})}
                              step="0.1"
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>{'Abdomen'}</label>
                            <input
                              type="number"
                              value={coachFormData.abdomen_circumference}
                              onChange={(e) => setCoachFormData({...coachFormData, abdomen_circumference: e.target.value})}
                              step="0.1"
                            />
                          </div>
                          <div className="form-group">
                            <label>{'Arm'}</label>
                            <input
                              type="number"
                              value={coachFormData.arm_circumference}
                              onChange={(e) => setCoachFormData({...coachFormData, arm_circumference: e.target.value})}
                              step="0.1"
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>{'Hip'}</label>
                            <input
                              type="number"
                              value={coachFormData.hip_circumference}
                              onChange={(e) => setCoachFormData({...coachFormData, hip_circumference: e.target.value})}
                              step="0.1"
                            />
                          </div>
                          <div className="form-group">
                            <label>{'Thigh'}</label>
                            <input
                              type="number"
                              value={coachFormData.thigh_circumference}
                              onChange={(e) => setCoachFormData({...coachFormData, thigh_circumference: e.target.value})}
                              step="0.1"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="form-actions">
                      <button type="submit" className="btn-primary">
                        {'Create Coach'}
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => {
                        setShowCoachForm(false);
                        resetCoachForm();
                      }}>
                        {'Cancel'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="coachs-list">
              <table>
                <thead>
                  <tr>
                    <th>{'Username'}</th>
                    <th>{'Email'}</th>
                    <th>{'Approval'}</th>
                    <th>{'Assigned Members'}</th>
                    <th>{'Profile Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {coachs.filter(c => c.coach_approval_status !== 'pending').map(coach => (
                    <tr key={coach.id}>
                      <td>{coach.username}</td>
                      <td>{coach.email}</td>
                      <td>
                        <span className={`status-badge status-${coach.coach_approval_status || 'approved'}`}>
                          {coach.coach_approval_status === 'pending' ? 'Pending' : coach.coach_approval_status === 'rejected' ? 'Rejected' : 'Approved'}
                        </span>
                      </td>
                      <td>{coach.assigned_members_count || 0}</td>
                      <td>{coach.profile_complete 
                        ? 'Complete'
                        : 'Incomplete'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>{'Members Management'}</h2>
            </div>

            <div className="members-list">
              <table>
                <thead>
                  <tr>
                    <th>{'Username'}</th>
                    <th>{'Email'}</th>
                    <th>{'Assigned To'}</th>
                    <th>{'Training Level'}</th>
                    <th>{'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member.id}>
                      <td>{member.username}</td>
                      <td>{member.email}</td>
                      <td>
                        {member.assigned_to
                          ? member.assigned_to.username
                          : 'Unassigned'}
                      </td>
                      <td>{member.profile?.training_level || '-'}</td>
                      <td>
                        <button 
                          className="btn-edit"
                          onClick={() => handleEditMember(member)}
                        >
                          {'Edit'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {editingMember && (
              <div className="admin-form-overlay">
                <div className="admin-form-container" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                  <h3>{`Edit Profile: ${editingMember.username}`}</h3>
                  
                  <div className="form-group">
                    <label>{'Age'}</label>
                    <input
                      type="number"
                      value={memberFormData.age || ''}
                      onChange={(e) => setMemberFormData({...memberFormData, age: e.target.value ? parseInt(e.target.value) : null})}
                      min="1"
                      max="120"
                    />
                  </div>

                  <div className="form-group">
                    <label>{'Gender'}</label>
                    <select
                      value={memberFormData.gender || ''}
                      onChange={(e) => setMemberFormData({...memberFormData, gender: e.target.value})}
                    >
                      <option value="">{'Select'}</option>
                      <option value="male">{'Male'}</option>
                      <option value="female">{'Female'}</option>
                      <option value="other">{'Other'}</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{'Weight (kg)'}</label>
                      <input
                        type="number"
                        value={memberFormData.weight || ''}
                        onChange={(e) => setMemberFormData({...memberFormData, weight: e.target.value ? parseFloat(e.target.value) : null})}
                        step="0.1"
                      />
                    </div>
                    <div className="form-group">
                      <label>{'Height (cm)'}</label>
                      <input
                        type="number"
                        value={memberFormData.height || ''}
                        onChange={(e) => setMemberFormData({...memberFormData, height: e.target.value ? parseFloat(e.target.value) : null})}
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{'Training Level'}</label>
                    <select
                      value={memberFormData.training_level || ''}
                      onChange={(e) => setMemberFormData({...memberFormData, training_level: e.target.value})}
                    >
                      <option value="">{'Select'}</option>
                      <option value="beginner">{'Beginner'}</option>
                      <option value="intermediate">{'Intermediate'}</option>
                      <option value="advanced">{'Advanced'}</option>
                    </select>
                  </div>

                  <h4>{'Body Measurements (cm)'}</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{'Chest'}</label>
                      <input
                        type="number"
                        value={memberFormData.chest_circumference || ''}
                        onChange={(e) => setMemberFormData({...memberFormData, chest_circumference: e.target.value ? parseFloat(e.target.value) : null})}
                        step="0.1"
                      />
                    </div>
                    <div className="form-group">
                      <label>{'Waist'}</label>
                      <input
                        type="number"
                        value={memberFormData.waist_circumference || ''}
                        onChange={(e) => setMemberFormData({...memberFormData, waist_circumference: e.target.value ? parseFloat(e.target.value) : null})}
                        step="0.1"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{'Abdomen'}</label>
                      <input
                        type="number"
                        value={memberFormData.abdomen_circumference || ''}
                        onChange={(e) => setMemberFormData({...memberFormData, abdomen_circumference: e.target.value ? parseFloat(e.target.value) : null})}
                        step="0.1"
                      />
                    </div>
                    <div className="form-group">
                      <label>{'Arm'}</label>
                      <input
                        type="number"
                        value={memberFormData.arm_circumference || ''}
                        onChange={(e) => setMemberFormData({...memberFormData, arm_circumference: e.target.value ? parseFloat(e.target.value) : null})}
                        step="0.1"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{'Hip'}</label>
                      <input
                        type="number"
                        value={memberFormData.hip_circumference || ''}
                        onChange={(e) => setMemberFormData({...memberFormData, hip_circumference: e.target.value ? parseFloat(e.target.value) : null})}
                        step="0.1"
                      />
                    </div>
                    <div className="form-group">
                      <label>{'Thigh'}</label>
                      <input
                        type="number"
                        value={memberFormData.thigh_circumference || ''}
                        onChange={(e) => setMemberFormData({...memberFormData, thigh_circumference: e.target.value ? parseFloat(e.target.value) : null})}
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-primary" onClick={handleSaveMemberProfile}>
                      {'Save'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => setEditingMember(null)}>
                      {'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pricing & Plans Tab */}
        {activeTab === 'training-plans' && (
          <div className="admin-section">
            <TrainingPlansProductsTab />
          </div>
        )}

        {/* Site Settings Tab */}
        {activeTab === 'site-settings' && (
          <div className="admin-section">
            <SiteSettingsTab />
          </div>
        )}

        {/* AI Settings Tab */}
        {activeTab === 'ai-settings' && (
          <div className="admin-section">
            <AISettingsTab />
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
