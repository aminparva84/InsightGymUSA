import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiBase } from '../../services/apiBase';
import './AdminTab.css';

const AdminTab = () => {
  const API_BASE = getApiBase();
  
  // Members state
  const [assistants, setAssistants] = useState([]);
  const [showAssistantForm, setShowAssistantForm] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [editingAssistant, setEditingAssistant] = useState(null);
  const [assistantEditFormData, setAssistantEditFormData] = useState(null);
  const [assistantFormData, setAssistantFormData] = useState({
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

  const fetchAssistants = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/coaches`, getAxiosConfig());
      setAssistants(response.data);
    } catch (error) {
      console.error('Error fetching assistants:', error);
      alert('Error fetching assistants');
    }
  }, [API_BASE, getAxiosConfig]);

  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  const fetchAssistantDetails = async (assistantId) => {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/coaches/${assistantId}`, getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Error fetching assistant details:', error);
      return null;
    }
  };

  const handleEditAssistant = async (assistant) => {
    setEditingAssistant(assistant);
    const full = await fetchAssistantDetails(assistant.id);
    if (full) {
      const profile = full.profile || {};
      setAssistantEditFormData({
        username: full.username || '',
        email: full.email || '',
        password: '',
        language: full.language || 'en',
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
        certifications: profile.certifications || '',
        qualifications: profile.qualifications || '',
        years_of_experience: profile.years_of_experience ?? '',
        specialization: profile.specialization || '',
        education: profile.education || '',
        bio: profile.bio || ''
      });
    } else {
      setEditingAssistant(null);
    }
  };

  const handleSaveAssistantEdit = async () => {
    if (!editingAssistant) return;
    try {
      const payload = {
        username: assistantEditFormData.username,
        email: assistantEditFormData.email,
        language: assistantEditFormData.language
      };
      if (assistantEditFormData.password && assistantEditFormData.password.trim()) {
        payload.password = assistantEditFormData.password.trim();
      }
      payload.profile = {
        age: assistantEditFormData.age ? parseInt(assistantEditFormData.age) : null,
        weight: assistantEditFormData.weight ? parseFloat(assistantEditFormData.weight) : null,
        height: assistantEditFormData.height ? parseFloat(assistantEditFormData.height) : null,
        gender: assistantEditFormData.gender || '',
        training_level: assistantEditFormData.training_level || '',
        chest_circumference: assistantEditFormData.chest_circumference ? parseFloat(assistantEditFormData.chest_circumference) : null,
        waist_circumference: assistantEditFormData.waist_circumference ? parseFloat(assistantEditFormData.waist_circumference) : null,
        abdomen_circumference: assistantEditFormData.abdomen_circumference ? parseFloat(assistantEditFormData.abdomen_circumference) : null,
        arm_circumference: assistantEditFormData.arm_circumference ? parseFloat(assistantEditFormData.arm_circumference) : null,
        hip_circumference: assistantEditFormData.hip_circumference ? parseFloat(assistantEditFormData.hip_circumference) : null,
        thigh_circumference: assistantEditFormData.thigh_circumference ? parseFloat(assistantEditFormData.thigh_circumference) : null,
        certifications: assistantEditFormData.certifications || '',
        qualifications: assistantEditFormData.qualifications || '',
        years_of_experience: assistantEditFormData.years_of_experience ? parseInt(assistantEditFormData.years_of_experience) : null,
        specialization: assistantEditFormData.specialization || '',
        education: assistantEditFormData.education || '',
        bio: assistantEditFormData.bio || ''
      };
      await axios.put(`${API_BASE}/api/admin/coaches/${editingAssistant.id}`, payload, getAxiosConfig());
      alert('Assistant updated');
      setEditingAssistant(null);
      setAssistantEditFormData(null);
      fetchAssistants();
    } catch (error) {
      console.error('Error updating assistant:', error);
      alert(`Error updating: ${error.response?.data?.error || error.message}`);
    }
  };


  const handleCreateAssistant = async (e) => {
    e.preventDefault();
    try {
      const data = {
        username: assistantFormData.username,
        email: assistantFormData.email,
        password: assistantFormData.password,
        language: assistantFormData.language
      };
      
      if (assistantFormData.fillProfileNow) {
        data.profile = {
          age: assistantFormData.age ? parseInt(assistantFormData.age) : null,
          weight: assistantFormData.weight ? parseFloat(assistantFormData.weight) : null,
          height: assistantFormData.height ? parseFloat(assistantFormData.height) : null,
          gender: assistantFormData.gender || '',
          training_level: assistantFormData.training_level || '',
          chest_circumference: assistantFormData.chest_circumference ? parseFloat(assistantFormData.chest_circumference) : null,
          waist_circumference: assistantFormData.waist_circumference ? parseFloat(assistantFormData.waist_circumference) : null,
          abdomen_circumference: assistantFormData.abdomen_circumference ? parseFloat(assistantFormData.abdomen_circumference) : null,
          arm_circumference: assistantFormData.arm_circumference ? parseFloat(assistantFormData.arm_circumference) : null,
          hip_circumference: assistantFormData.hip_circumference ? parseFloat(assistantFormData.hip_circumference) : null,
          thigh_circumference: assistantFormData.thigh_circumference ? parseFloat(assistantFormData.thigh_circumference) : null,
          // Trainer Professional Details
          certifications: assistantFormData.certifications || '',
          qualifications: assistantFormData.qualifications || '',
          years_of_experience: assistantFormData.years_of_experience ? parseInt(assistantFormData.years_of_experience) : null,
          specialization: assistantFormData.specialization || '',
          education: assistantFormData.education || '',
          bio: assistantFormData.bio || ''
        };
      }
      
      await axios.post(`${API_BASE}/api/admin/coaches`, data, getAxiosConfig());
      
      // Show credentials modal
      setCreatedCredentials({
        username: assistantFormData.username,
        password: assistantFormData.password,
        email: assistantFormData.email
      });
      setShowAssistantForm(false);
      resetAssistantForm();
      fetchAssistants();
      setShowCredentialsModal(true);
    } catch (error) {
      console.error('Error creating assistant:', error);
      alert(`Error creating assistant: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDeleteAssistant = async (assistantId) => {
    try {
      await axios.delete(`${API_BASE}/api/admin/coaches/${assistantId}`, getAxiosConfig());
      alert('Assistant deleted successfully');
      fetchAssistants();
    } catch (error) {
      console.error('Error deleting assistant:', error);
      alert(`Error deleting assistant: ${error.response?.data?.error || error.message}`);
    }
  };


  const resetAssistantForm = () => {
    setAssistantFormData({
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
      thigh_circumference: '',
      certifications: '',
      qualifications: '',
      years_of_experience: '',
      specialization: '',
      education: '',
      bio: ''
    });
  };

  return (
    <div className="admin-tab" dir="ltr">
      <div className="admin-tab-header">
        <h2>Assistants Management</h2>
      </div>

      <div className="admin-tab-content">
        <div className="admin-section-content">
          <div className="section-header">
            <button className="btn-primary" onClick={() => setShowAssistantForm(true)}>
              + Add Assistant
            </button>
          </div>

            {showAssistantForm && (
              <div className="admin-form-overlay">
                <div className="admin-form-container">
                  <div className="form-header-with-close">
                    <h3>Create New Assistant</h3>
                    <button 
                      type="button" 
                      className="close-form-btn"
                      onClick={() => {
                        setShowAssistantForm(false);
                        resetAssistantForm();
                      }}
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={handleCreateAssistant}>
                    <div className="form-group">
                      <label>Username *</label>
                      <input
                        type="text"
                        value={assistantFormData.username}
                        onChange={(e) => setAssistantFormData({...assistantFormData, username: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={assistantFormData.email}
                        onChange={(e) => setAssistantFormData({...assistantFormData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Password *</label>
                      <input
                        type="password"
                        value={assistantFormData.password}
                        onChange={(e) => setAssistantFormData({...assistantFormData, password: e.target.value})}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={assistantFormData.fillProfileNow}
                          onChange={(e) => setAssistantFormData({...assistantFormData, fillProfileNow: e.target.checked})}
                        />
                        <span>Fill profile now (otherwise assistant must complete after first login)</span>
                      </label>
                    </div>

                    {assistantFormData.fillProfileNow && (
                      <>
                        <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                          Personal Information
                        </h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Age</label>
                            <input
                              type="number"
                              value={assistantFormData.age}
                              onChange={(e) => setAssistantFormData({...assistantFormData, age: e.target.value})}
                              min="1"
                              max="120"
                            />
                          </div>
                          <div className="form-group">
                            <label>Gender</label>
                            <select
                              value={assistantFormData.gender}
                              onChange={(e) => setAssistantFormData({...assistantFormData, gender: e.target.value})}
                            >
                              <option value="">Select</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        
                        <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                          Trainer Professional Details
                        </h4>
                        <div className="form-group">
                          <label>Certifications</label>
                          <textarea
                            value={assistantFormData.certifications}
                            onChange={(e) => setAssistantFormData({...assistantFormData, certifications: e.target.value})}
                            placeholder="Example: NASM-CPT, ACE-CPT, ISSA..."
                            rows="2"
                          />
                        </div>
                        <div className="form-group">
                          <label>Qualifications</label>
                          <textarea
                            value={assistantFormData.qualifications}
                            onChange={(e) => setAssistantFormData({...assistantFormData, qualifications: e.target.value})}
                            placeholder="Example: BS in Physical Education, MS in Exercise Physiology..."
                            rows="2"
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Years of Experience</label>
                            <input
                              type="number"
                              value={assistantFormData.years_of_experience}
                              onChange={(e) => setAssistantFormData({...assistantFormData, years_of_experience: e.target.value})}
                              min="0"
                              max="50"
                            />
                          </div>
                          <div className="form-group">
                            <label>Specialization</label>
                            <input
                              type="text"
                              value={assistantFormData.specialization}
                              onChange={(e) => setAssistantFormData({...assistantFormData, specialization: e.target.value})}
                              placeholder="Example: Bodybuilding, Weight Loss, Strength..."
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Education</label>
                          <input
                            type="text"
                            value={assistantFormData.education}
                            onChange={(e) => setAssistantFormData({...assistantFormData, education: e.target.value})}
                            placeholder="Example: MS in Exercise Physiology from University of Tehran"
                          />
                        </div>
                        <div className="form-group">
                          <label>Bio</label>
                          <textarea
                            value={assistantFormData.bio}
                            onChange={(e) => setAssistantFormData({...assistantFormData, bio: e.target.value})}
                            placeholder="Description about the trainer..."
                            rows="4"
                          />
                        </div>
                        
                        <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                          Body Measurements (cm)
                        </h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Chest</label>
                            <input
                              type="number"
                              value={assistantFormData.chest_circumference}
                              onChange={(e) => setAssistantFormData({...assistantFormData, chest_circumference: e.target.value})}
                              step="0.1"
                            />
                          </div>
                          <div className="form-group">
                            <label>Waist</label>
                            <input
                              type="number"
                              value={assistantFormData.waist_circumference}
                              onChange={(e) => setAssistantFormData({...assistantFormData, waist_circumference: e.target.value})}
                              step="0.1"
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Abdomen</label>
                            <input
                              type="number"
                              value={assistantFormData.abdomen_circumference}
                              onChange={(e) => setAssistantFormData({...assistantFormData, abdomen_circumference: e.target.value})}
                              step="0.1"
                            />
                          </div>
                          <div className="form-group">
                            <label>Arm</label>
                            <input
                              type="number"
                              value={assistantFormData.arm_circumference}
                              onChange={(e) => setAssistantFormData({...assistantFormData, arm_circumference: e.target.value})}
                              step="0.1"
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Hip</label>
                            <input
                              type="number"
                              value={assistantFormData.hip_circumference}
                              onChange={(e) => setAssistantFormData({...assistantFormData, hip_circumference: e.target.value})}
                              step="0.1"
                            />
                          </div>
                          <div className="form-group">
                            <label>Thigh</label>
                            <input
                              type="number"
                              value={assistantFormData.thigh_circumference}
                              onChange={(e) => setAssistantFormData({...assistantFormData, thigh_circumference: e.target.value})}
                              step="0.1"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="form-actions">
                      <button type="submit" className="btn-primary">
                        Create Assistant
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => {
                        setShowAssistantForm(false);
                        resetAssistantForm();
                      }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="assistants-list">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Assigned Members</th>
                    <th>Profile Status</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {assistants.map(assistant => (
                    <tr key={assistant.id}>
                      <td>{assistant.username}</td>
                      <td>{assistant.email}</td>
                      <td>{assistant.assigned_members_count || 0}</td>
                      <td>{assistant.profile_complete 
                        ? 'Complete'
                        : 'Incomplete'}
                      </td>
                      <td>
                        <button 
                          type="button"
                          className="btn-edit"
                          onClick={() => handleEditAssistant(assistant)}
                        >
                          Edit
                        </button>
                      </td>
                      <td>
                        <button 
                          className="btn-delete"
                          onClick={() => {
                            if (window.confirm(
                              `Are you sure you want to delete assistant "${assistant.username}"? This action cannot be undone.`
                            )) {
                              handleDeleteAssistant(assistant.id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Credentials Modal */}
            {showCredentialsModal && createdCredentials && (
              <div className="admin-form-overlay">
                <div className="admin-form-container" style={{ maxWidth: '500px' }}>
                  <h3>Assistant Login Credentials</h3>
                  <div className="credentials-display">
                    <div className="credential-item">
                      <label>Username:</label>
                      <div className="credential-value">
                        <code>{createdCredentials.username}</code>
                        <button 
                          className="copy-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(createdCredentials.username);
                            alert('Copied!');
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="credential-item">
                      <label>Password:</label>
                      <div className="credential-value">
                        <code>{createdCredentials.password}</code>
                        <button 
                          className="copy-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(createdCredentials.password);
                            alert('Copied!');
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="credential-warning">
                      <p>⚠️ Please save these credentials. They will only be shown once.</p>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-primary" 
                      onClick={() => {
                        setShowCredentialsModal(false);
                        setCreatedCredentials(null);
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Assistant Modal */}
            {editingAssistant && assistantEditFormData && (
              <div className="admin-form-overlay">
                <div className="admin-form-container" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                  <div className="form-header-with-close">
                    <h3>Edit Assistant: {editingAssistant.username}</h3>
                    <button
                      type="button"
                      className="close-form-btn"
                      onClick={() => { setEditingAssistant(null); setAssistantEditFormData(null); }}
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      type="text"
                      value={assistantEditFormData.username}
                      onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={assistantEditFormData.email}
                      onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New password (leave blank to keep)</label>
                    <input
                      type="password"
                      value={assistantEditFormData.password}
                      onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, password: e.target.value })}
                      minLength={6}
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <div className="form-group">
                    <label>Language</label>
                    <select
                      value={assistantEditFormData.language}
                      onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, language: e.target.value })}
                    >
                      <option value="en">English</option>
                    </select>
                  </div>
                  <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                    Personal Information
                  </h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        value={assistantEditFormData.age}
                        onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, age: e.target.value })}
                        min="1"
                        max="120"
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        value={assistantEditFormData.gender}
                        onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, gender: e.target.value })}
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                    Trainer Professional Details
                  </h4>
                  <div className="form-group">
                    <label>Certifications</label>
                    <textarea
                      value={assistantEditFormData.certifications}
                      onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, certifications: e.target.value })}
                      rows="2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Qualifications</label>
                    <textarea
                      value={assistantEditFormData.qualifications}
                      onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, qualifications: e.target.value })}
                      rows="2"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Years of Experience</label>
                      <input
                        type="number"
                        value={assistantEditFormData.years_of_experience}
                        onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, years_of_experience: e.target.value })}
                        min="0"
                        max="50"
                      />
                    </div>
                    <div className="form-group">
                      <label>Specialization</label>
                      <input
                        type="text"
                        value={assistantEditFormData.specialization}
                        onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, specialization: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Education</label>
                    <input
                      type="text"
                      value={assistantEditFormData.education}
                      onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, education: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      value={assistantEditFormData.bio}
                      onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, bio: e.target.value })}
                      rows="4"
                    />
                  </div>
                  <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                    Body Measurements (cm)
                  </h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Weight</label>
                      <input
                        type="number"
                        value={assistantEditFormData.weight}
                        onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, weight: e.target.value })}
                        step="0.1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Height</label>
                      <input
                        type="number"
                        value={assistantEditFormData.height}
                        onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, height: e.target.value })}
                        step="0.1"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Chest</label>
                      <input
                        type="number"
                        value={assistantEditFormData.chest_circumference}
                        onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, chest_circumference: e.target.value })}
                        step="0.1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Waist</label>
                      <input
                        type="number"
                        value={assistantEditFormData.waist_circumference}
                        onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, waist_circumference: e.target.value })}
                        step="0.1"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Abdomen</label>
                      <input
                        type="number"
                        value={assistantEditFormData.abdomen_circumference}
                        onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, abdomen_circumference: e.target.value })}
                        step="0.1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Arm</label>
                      <input
                        type="number"
                        value={assistantEditFormData.arm_circumference}
                        onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, arm_circumference: e.target.value })}
                        step="0.1"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Hip</label>
                      <input
                        type="number"
                        value={assistantEditFormData.hip_circumference}
                        onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, hip_circumference: e.target.value })}
                        step="0.1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Thigh</label>
                      <input
                        type="number"
                        value={assistantEditFormData.thigh_circumference}
                        onChange={(e) => setAssistantEditFormData({ ...assistantEditFormData, thigh_circumference: e.target.value })}
                        step="0.1"
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn-primary" onClick={handleSaveAssistantEdit}>
                      Save
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => { setEditingAssistant(null); setAssistantEditFormData(null); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminTab;

