import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiBase } from '../../services/apiBase';
import './AssistantDashboard.css';

const AssistantDashboard = () => {
  const API_BASE = getApiBase();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);

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

  const fetchAssignedMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/admin/members`, getAxiosConfig());
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching assigned members:', error);
      alert('Error fetching members');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, getAxiosConfig]);

  useEffect(() => {
    fetchAssignedMembers();
  }, [fetchAssignedMembers]);

  const fetchMemberDetails = async (memberId) => {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/members/${memberId}`, getAxiosConfig());
      setMemberDetails(response.data);
      setSelectedMember(memberId);
    } catch (error) {
      console.error('Error fetching member details:', error);
      alert('Error fetching member details');
    }
  };

  return (
    <div className="assistant-dashboard" dir="ltr">
      <div className="assistant-dashboard-header">
        <h2>Assistant Dashboard</h2>
        <p>Members Assigned to You</p>
      </div>

      <div className="assistant-dashboard-content">
        <div className="members-list-panel">
          <h3>Members List</h3>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : members.length === 0 ? (
            <div className="no-members">
              No members assigned to you
            </div>
          ) : (
            <div className="members-list">
              {members.map(member => (
                <div
                  key={member.id}
                  className={`member-card ${selectedMember === member.id ? 'selected' : ''}`}
                  onClick={() => fetchMemberDetails(member.id)}
                >
                  <div className="member-card-header">
                    <h4>{member.username}</h4>
                    <span className="member-email">{member.email}</span>
                  </div>
                  <div className="member-card-info">
                    <div className="info-item">
                      <span className="info-label">Training Level:</span>
                      <span className="info-value">{member.profile?.training_level || '-'}</span>
                    </div>
                    {member.profile?.age && (
                      <div className="info-item">
                        <span className="info-label">Age:</span>
                        <span className="info-value">{member.profile.age}</span>
                      </div>
                    )}
                    {member.profile?.weight && member.profile?.height && (
                      <div className="info-item">
                        <span className="info-label">BMI:</span>
                        <span className="info-value">
                          {(() => {
                            const heightInMeters = member.profile.height / 100;
                            const bmi = (member.profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
                            return bmi;
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedMember && memberDetails && (
          <div className="member-details-panel">
            <div className="member-details-header">
              <h3>Member Details</h3>
              <button className="close-btn" onClick={() => {
                setSelectedMember(null);
                setMemberDetails(null);
              }}>
                Close
              </button>
            </div>

            <div className="member-details-content">
              <div className="details-section">
                <h4>Basic Information</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Username:</label>
                    <span>{memberDetails.username}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{memberDetails.email}</span>
                  </div>
                  {memberDetails.profile?.age && (
                    <div className="detail-item">
                      <label>Age:</label>
                      <span>{memberDetails.profile.age}</span>
                    </div>
                  )}
                  {memberDetails.profile?.gender && (
                    <div className="detail-item">
                      <label>Gender:</label>
                      <span>
                        {memberDetails.profile.gender === 'male' 
                          ? 'Male'
                          : memberDetails.profile.gender === 'female'
                          ? 'Female'
                          : 'Other'}
                      </span>
                    </div>
                  )}
                  {memberDetails.profile?.weight && (
                    <div className="detail-item">
                      <label>Weight (kg):</label>
                      <span>{memberDetails.profile.weight}</span>
                    </div>
                  )}
                  {memberDetails.profile?.height && (
                    <div className="detail-item">
                      <label>Height (cm):</label>
                      <span>{memberDetails.profile.height}</span>
                    </div>
                  )}
                  {memberDetails.profile?.training_level && (
                    <div className="detail-item">
                      <label>Training Level:</label>
                      <span>
                        {memberDetails.profile.training_level === 'beginner'
                          ? 'Beginner'
                          : memberDetails.profile.training_level === 'intermediate'
                          ? 'Intermediate'
                          : 'Advanced'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {memberDetails.profile && (
                <>
                  {(memberDetails.profile.chest_circumference || 
                    memberDetails.profile.waist_circumference || 
                    memberDetails.profile.abdomen_circumference ||
                    memberDetails.profile.arm_circumference ||
                    memberDetails.profile.hip_circumference ||
                    memberDetails.profile.thigh_circumference) && (
                    <div className="details-section">
                      <h4>Body Measurements (cm)</h4>
                      <div className="details-grid">
                        {memberDetails.profile.chest_circumference && (
                          <div className="detail-item">
                            <label>Chest:</label>
                            <span>{memberDetails.profile.chest_circumference}</span>
                          </div>
                        )}
                        {memberDetails.profile.waist_circumference && (
                          <div className="detail-item">
                            <label>Waist:</label>
                            <span>{memberDetails.profile.waist_circumference}</span>
                          </div>
                        )}
                        {memberDetails.profile.abdomen_circumference && (
                          <div className="detail-item">
                            <label>Abdomen:</label>
                            <span>{memberDetails.profile.abdomen_circumference}</span>
                          </div>
                        )}
                        {memberDetails.profile.arm_circumference && (
                          <div className="detail-item">
                            <label>Arm:</label>
                            <span>{memberDetails.profile.arm_circumference}</span>
                          </div>
                        )}
                        {memberDetails.profile.hip_circumference && (
                          <div className="detail-item">
                            <label>Hip:</label>
                            <span>{memberDetails.profile.hip_circumference}</span>
                          </div>
                        )}
                        {memberDetails.profile.thigh_circumference && (
                          <div className="detail-item">
                            <label>Thigh:</label>
                            <span>{memberDetails.profile.thigh_circumference}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {memberDetails.profile.injuries && memberDetails.profile.injuries.length > 0 && (
                    <div className="details-section">
                      <h4>Injuries</h4>
                      <div className="injuries-list">
                        {memberDetails.profile.injuries.map((injury, index) => (
                          <div key={index} className="injury-item">
                            <span className="injury-name">{injury}</span>
                          </div>
                        ))}
                      </div>
                      {memberDetails.profile.injury_details && (
                        <div className="injury-details">
                          <p>{memberDetails.profile.injury_details}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {memberDetails.profile.fitness_goals && memberDetails.profile.fitness_goals.length > 0 && (
                    <div className="details-section">
                      <h4>Fitness Goals</h4>
                      <div className="goals-list">
                        {memberDetails.profile.fitness_goals.map((goal, index) => (
                          <div key={index} className="goal-item">
                            <span>{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {memberDetails.profile.medical_conditions && memberDetails.profile.medical_conditions.length > 0 && (
                    <div className="details-section">
                      <h4>Medical Conditions</h4>
                      <div className="conditions-list">
                        {memberDetails.profile.medical_conditions.map((condition, index) => (
                          <div key={index} className="condition-item">
                            <span>{condition}</span>
                          </div>
                        ))}
                      </div>
                      {memberDetails.profile.medical_condition_details && (
                        <div className="condition-details">
                          <p>{memberDetails.profile.medical_condition_details}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantDashboard;



