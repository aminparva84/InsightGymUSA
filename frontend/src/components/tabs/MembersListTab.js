import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { getApiBase } from '../../services/apiBase';
import './MembersListTab.css';

const fitnessGoalsOptions = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'strength', label: 'Strength' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'flexibility', label: 'Flexibility' }
];
const injuryOptions = [
  { value: 'knee', label: 'Knee' },
  { value: 'shoulder', label: 'Shoulder' },
  { value: 'lower_back', label: 'Lower Back' },
  { value: 'neck', label: 'Neck' },
  { value: 'wrist', label: 'Wrist' },
  { value: 'ankle', label: 'Ankle' }
];
const medicalConditionOptions = [
  { value: 'heart_disease', label: 'Heart Disease' },
  { value: 'high_blood_pressure', label: 'High Blood Pressure' },
  { value: 'pregnancy', label: 'Pregnancy' }
];
const equipmentAccessOptions = [
  { value: 'machine', label: 'Machine' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'cable', label: 'Cable' }
];
const homeEquipmentOptions = [
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'resistance_bands', label: 'Resistance Bands' },
  { value: 'yoga_mat', label: 'Yoga Mat' },
  { value: 'body_weight_only', label: 'Body Weight Only' }
];

const MembersListTab = () => {
  const API_BASE = getApiBase();
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [, setAssistants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberFormData, setMemberFormData] = useState({});
  const [userRole, setUserRole] = useState(null);

  const getAuthToken = useCallback(() => {
    const localToken = localStorage.getItem('token');
    if (localToken && localToken.trim() !== '') {
      return localToken.trim();
    }
    return null;
  }, []);

  const getAxiosConfig = useCallback(() => {
    const token = getAuthToken();
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }, [getAuthToken]);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/admin/members`, getAxiosConfig());
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      alert('Error fetching members');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, getAxiosConfig]);

  const fetchAssistants = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/coaches`, getAxiosConfig());
      setAssistants(response.data);
    } catch (error) {
      console.error('Error fetching assistants:', error);
    }
  }, [API_BASE, getAxiosConfig]);

  // Admin no longer assigns members - members choose coach at registration
  const checkUserRole = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/check-admin`, getAxiosConfig());
      setUserRole(response.data.role || 'member');
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole('member');
    }
  }, [API_BASE, getAxiosConfig]);

  useEffect(() => {
    checkUserRole();
    fetchMembers();
    fetchAssistants();
  }, [checkUserRole, fetchMembers, fetchAssistants]);

  const fetchMemberDetails = async (memberId) => {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/members/${memberId}`, getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Error fetching member details:', error);
      return null;
    }
  };

  const handleArrayChange = (field, value, checked) => {
    const arr = Array.isArray(memberFormData[field]) ? [...memberFormData[field]] : [];
    const next = checked ? (arr.includes(value) ? arr : [...arr, value]) : arr.filter(x => x !== value);
    setMemberFormData({ ...memberFormData, [field]: next });
  };

  const handleEditMember = async (member) => {
    setEditingMember(member);
    const full = await fetchMemberDetails(member.id);
    if (full) {
      const profile = full.profile || {};
      setMemberFormData({
        username: full.username || '',
        email: full.email || '',
        age: profile.age ?? '',
        weight: profile.weight ?? '',
        height: profile.height ?? '',
        gender: profile.gender || '',
        training_level: profile.training_level || '',
        chest_circumference: profile.chest_circumference ?? '',
        waist_circumference: profile.waist_circumference ?? '',
        abdomen_circumference: profile.abdomen_circumference ?? '',
        arm_circumference: profile.arm_circumference ?? '',
        hip_circumference: profile.hip_circumference ?? '',
        thigh_circumference: profile.thigh_circumference ?? '',
        fitness_goals: Array.isArray(profile.fitness_goals) ? profile.fitness_goals : [],
        injuries: Array.isArray(profile.injuries) ? profile.injuries : [],
        injury_details: profile.injury_details || '',
        medical_conditions: Array.isArray(profile.medical_conditions) ? profile.medical_conditions : [],
        medical_condition_details: profile.medical_condition_details || '',
        exercise_history_years: profile.exercise_history_years ?? '',
        exercise_history_description: profile.exercise_history_description || '',
        equipment_access: Array.isArray(profile.equipment_access) ? profile.equipment_access : [],
        gym_access: profile.gym_access || false,
        home_equipment: Array.isArray(profile.home_equipment) ? profile.home_equipment : [],
        preferred_workout_time: profile.preferred_workout_time || '',
        workout_days_per_week: profile.workout_days_per_week ?? '',
        preferred_intensity: profile.preferred_intensity || ''
      });
    } else {
      setMemberFormData({ ...member.profile, username: member.username, email: member.email });
    }
  };

  const handleSaveMemberProfile = async () => {
    try {
      const { username, email, ...profilePayload } = memberFormData;
      if (username !== editingMember.username || email !== editingMember.email) {
        await axios.put(`${API_BASE}/api/admin/members/${editingMember.id}`, { username, email }, getAxiosConfig());
      }
      await axios.put(`${API_BASE}/api/admin/members/${editingMember.id}/profile`, profilePayload, getAxiosConfig());
      alert('Member profile updated');
      setEditingMember(null);
      fetchMembers();
    } catch (error) {
      console.error('Error updating member profile:', error);
      alert('Error updating profile');
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      await axios.delete(`${API_BASE}/api/admin/members/${memberId}`, getAxiosConfig());
      alert('Member deleted successfully');
      fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      alert(`Error deleting member: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="members-list-tab" dir="ltr">
      <div className="members-list-header">
        <h2>Members List</h2>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="members-list-container">
          <div className="members-table-wrapper">
            <table className="members-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Assigned To</th>
                  <th>Training Level</th>
                  {userRole === 'admin' && (
                    <>
                      <th>Actions</th>
                      <th>Delete</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={userRole === 'admin' ? 6 : 4} className="no-data">
                      No members found
                    </td>
                  </tr>
                ) : (
                  members.map(member => (
                    <tr key={member.id}>
                      <td>{member.username}</td>
                      <td>{member.email}</td>
                      <td>
                        <span>
                          {member.assigned_to
                            ? `${member.assigned_to.username}`
                            : 'Unassigned'
                          }
                        </span>
                      </td>
                      <td>{member.profile?.training_level || '-'}</td>
                      <td>
                        {userRole === 'admin' && (
                          <button 
                            className="btn-edit"
                            onClick={() => handleEditMember(member)}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                      <td>
                        {userRole === 'admin' && (
                          <button 
                            className="btn-delete"
                            onClick={() => {
                              if (window.confirm(
                                `Are you sure you want to delete member "${member.username}"?`
                              )) {
                                handleDeleteMember(member.id);
                              }
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {editingMember && (
            <div className="admin-form-overlay">
              <div className="admin-form-container" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <h3>Edit Profile: {editingMember.username}</h3>
                
                <h4>Account</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={memberFormData.username || ''}
                      onChange={(e) => setMemberFormData({...memberFormData, username: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={memberFormData.email || ''}
                      onChange={(e) => setMemberFormData({...memberFormData, email: e.target.value})}
                    />
                  </div>
                </div>

                <h4>Basic Info</h4>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={memberFormData.age || ''}
                    onChange={(e) => setMemberFormData({...memberFormData, age: e.target.value ? parseInt(e.target.value) : null})}
                    min="1"
                    max="120"
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={memberFormData.gender || ''}
                    onChange={(e) => setMemberFormData({...memberFormData, gender: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Weight (kg)</label>
                    <input
                      type="number"
                      value={memberFormData.weight || ''}
                      onChange={(e) => setMemberFormData({...memberFormData, weight: e.target.value ? parseFloat(e.target.value) : null})}
                      step="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Height (cm)</label>
                    <input
                      type="number"
                      value={memberFormData.height || ''}
                      onChange={(e) => setMemberFormData({...memberFormData, height: e.target.value ? parseFloat(e.target.value) : null})}
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Training Level</label>
                  <select
                    value={memberFormData.training_level || ''}
                    onChange={(e) => setMemberFormData({...memberFormData, training_level: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <h4>Body Measurements (cm)</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Chest</label>
                    <input
                      type="number"
                      value={memberFormData.chest_circumference || ''}
                      onChange={(e) => setMemberFormData({...memberFormData, chest_circumference: e.target.value ? parseFloat(e.target.value) : null})}
                      step="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Waist</label>
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
                    <label>Abdomen</label>
                    <input
                      type="number"
                      value={memberFormData.abdomen_circumference || ''}
                      onChange={(e) => setMemberFormData({...memberFormData, abdomen_circumference: e.target.value ? parseFloat(e.target.value) : null})}
                      step="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Arm</label>
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
                    <label>Hip</label>
                    <input
                      type="number"
                      value={memberFormData.hip_circumference || ''}
                      onChange={(e) => setMemberFormData({...memberFormData, hip_circumference: e.target.value ? parseFloat(e.target.value) : null})}
                      step="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Thigh</label>
                    <input
                      type="number"
                      value={memberFormData.thigh_circumference || ''}
                      onChange={(e) => setMemberFormData({...memberFormData, thigh_circumference: e.target.value ? parseFloat(e.target.value) : null})}
                      step="0.1"
                    />
                  </div>
                </div>

                <h4>Fitness Goals</h4>
                <div className="form-group checkbox-group">
                  {fitnessGoalsOptions.map(opt => (
                    <label key={opt.value} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={(memberFormData.fitness_goals || []).includes(opt.value)}
                        onChange={(e) => handleArrayChange('fitness_goals', opt.value, e.target.checked)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>

                <h4>Injuries & Medical</h4>
                <div className="form-group">
                  <label>Injuries</label>
                  <div className="checkbox-group">
                    {injuryOptions.map(opt => (
                      <label key={opt.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={(memberFormData.injuries || []).includes(opt.value)}
                          onChange={(e) => handleArrayChange('injuries', opt.value, e.target.checked)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Injury Details</label>
                  <textarea
                    value={memberFormData.injury_details || ''}
                    onChange={(e) => setMemberFormData({...memberFormData, injury_details: e.target.value})}
                    rows="2"
                  />
                </div>
                <div className="form-group">
                  <label>Medical Conditions</label>
                  <div className="checkbox-group">
                    {medicalConditionOptions.map(opt => (
                      <label key={opt.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={(memberFormData.medical_conditions || []).includes(opt.value)}
                          onChange={(e) => handleArrayChange('medical_conditions', opt.value, e.target.checked)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Medical Condition Details</label>
                  <textarea
                    value={memberFormData.medical_condition_details || ''}
                    onChange={(e) => setMemberFormData({...memberFormData, medical_condition_details: e.target.value})}
                    rows="2"
                  />
                </div>

                <h4>Exercise History</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Years of Experience</label>
                    <input
                      type="number"
                      value={memberFormData.exercise_history_years ?? ''}
                      onChange={(e) => setMemberFormData({...memberFormData, exercise_history_years: e.target.value ? parseInt(e.target.value) : null})}
                      min="0"
                      max="80"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={memberFormData.exercise_history_description || ''}
                      onChange={(e) => setMemberFormData({...memberFormData, exercise_history_description: e.target.value})}
                    />
                  </div>
                </div>

                <h4>Equipment Access</h4>
                <div className="form-group">
                  <label>Equipment Access</label>
                  <div className="checkbox-group">
                    {equipmentAccessOptions.map(opt => (
                      <label key={opt.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={(memberFormData.equipment_access || []).includes(opt.value)}
                          onChange={(e) => handleArrayChange('equipment_access', opt.value, e.target.checked)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={!!memberFormData.gym_access}
                      onChange={(e) => setMemberFormData({...memberFormData, gym_access: e.target.checked})}
                    />
                    <span>Gym Access</span>
                  </label>
                </div>
                <div className="form-group">
                  <label>Home Equipment</label>
                  <div className="checkbox-group">
                    {homeEquipmentOptions.map(opt => (
                      <label key={opt.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={(memberFormData.home_equipment || []).includes(opt.value)}
                          onChange={(e) => handleArrayChange('home_equipment', opt.value, e.target.checked)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <h4>Workout Preferences</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Preferred Time</label>
                    <select
                      value={memberFormData.preferred_workout_time || ''}
                      onChange={(e) => setMemberFormData({...memberFormData, preferred_workout_time: e.target.value})}
                    >
                      <option value="">Select</option>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Days per Week</label>
                    <input
                      type="number"
                      value={memberFormData.workout_days_per_week ?? ''}
                      onChange={(e) => setMemberFormData({...memberFormData, workout_days_per_week: e.target.value ? parseInt(e.target.value) : null})}
                      min="1"
                      max="7"
                    />
                  </div>
                  <div className="form-group">
                    <label>Preferred Intensity</label>
                    <select
                      value={memberFormData.preferred_intensity || ''}
                      onChange={(e) => setMemberFormData({...memberFormData, preferred_intensity: e.target.value})}
                    >
                      <option value="">Select</option>
                      <option value="light">Light</option>
                      <option value="medium">Medium</option>
                      <option value="heavy">Heavy</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-primary" onClick={handleSaveMemberProfile}>
                    Save
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setEditingMember(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MembersListTab;
