import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiBase } from '../../services/apiBase';
import { useAuth } from '../../context/AuthContext';
import './ProgressTrend.css';

const ProgressTrend = () => {
  const API_BASE = getApiBase();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [progressEntries, setProgressEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('bmi');
  
  // Form state
  const [formData, setFormData] = useState({
    weight_kg: '',
    chest_cm: '',
    waist_cm: '',
    hips_cm: '',
    arm_left_cm: '',
    arm_right_cm: '',
    thigh_left_cm: '',
    thigh_right_cm: ''
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token') || axios.defaults.headers.common['Authorization']?.replace('Bearer ', '');
  }, []);

  const getAxiosConfig = useCallback(() => {
    const token = getAuthToken();
    return token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
  }, [getAuthToken]);

  const loadData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [profileRes, progressRes] = await Promise.all([
        axios.get(`${API_BASE}/api/user/profile`, getAxiosConfig()),
        axios.get(`${API_BASE}/api/workout-log/progress`, getAxiosConfig())
      ]);
      
      setUserProfile(profileRes.data);
      // Accept progress entries from 200 response (success key or progress_entries array)
      const entries = progressRes.data?.progress_entries ?? progressRes.data;
      setProgressEntries(Array.isArray(entries) ? entries : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, getAuthToken, getAxiosConfig]);

  useEffect(() => {
    loadData();
  }, [user, loadData]);

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    // BMI = weight (kg) / (height (m))^2
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setUploadFile(file);
    } else {
      alert('Please select an image or PDF file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) {
        alert('Please log in');
        return;
      }

      // Prepare progress data
      const progressData = {
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        chest_cm: formData.chest_cm ? parseFloat(formData.chest_cm) : null,
        waist_cm: formData.waist_cm ? parseFloat(formData.waist_cm) : null,
        hips_cm: formData.hips_cm ? parseFloat(formData.hips_cm) : null,
        arm_left_cm: formData.arm_left_cm ? parseFloat(formData.arm_left_cm) : null,
        arm_right_cm: formData.arm_right_cm ? parseFloat(formData.arm_right_cm) : null,
        thigh_left_cm: formData.thigh_left_cm ? parseFloat(formData.thigh_left_cm) : null,
        thigh_right_cm: formData.thigh_right_cm ? parseFloat(formData.thigh_right_cm) : null
      };

      // Submit progress entry
      const progressRes = await axios.post(
        `${API_BASE}/api/workout-log/progress`,
        progressData,
        getAxiosConfig()
      );

      // If file uploaded, submit it separately for AI analysis
      if (uploadFile) {
        const formDataFile = new FormData();
        formDataFile.append('file', uploadFile);
        formDataFile.append('progress_entry_id', progressRes.data.progress_entry_id);
        
        try {
          await axios.post(
            `${API_BASE}/api/progress/upload-analysis`,
            formDataFile,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );
        } catch (fileError) {
          console.warn('File upload failed (endpoint may not exist yet):', fileError);
        }
      }

      // Reload data
      await loadData();
      
      // Reset form
      setFormData({
        weight_kg: '',
        chest_cm: '',
        waist_cm: '',
        hips_cm: '',
        arm_left_cm: '',
        arm_right_cm: '',
        thigh_left_cm: '',
        thigh_right_cm: ''
      });
      setUploadFile(null);
      
      alert('Data saved successfully');
    } catch (error) {
      console.error('Error submitting progress:', error);
      alert('Error saving data');
    } finally {
      setSubmitting(false);
    }
  };

  // Prepare chart data
  const getBMIData = () => {
    return progressEntries
      .filter(entry => entry.weight_kg && userProfile?.height)
      .map(entry => ({
        date: new Date(entry.recorded_at).toLocaleDateString('en-US'),
        bmi: parseFloat(calculateBMI(entry.weight_kg, userProfile.height)),
        timestamp: new Date(entry.recorded_at).getTime()
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const getWeightData = () => {
    return progressEntries
      .filter(entry => entry.weight_kg)
      .map(entry => ({
        date: new Date(entry.recorded_at).toLocaleDateString('en-US'),
        weight: entry.weight_kg,
        timestamp: new Date(entry.recorded_at).getTime()
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const getBodySizeData = () => {
    const measurements = ['chest_cm', 'waist_cm', 'hips_cm', 'arm_left_cm', 'arm_right_cm', 'thigh_left_cm', 'thigh_right_cm'];
    const data = [];
    
    progressEntries.forEach(entry => {
      const entryData = {
        date: new Date(entry.recorded_at).toLocaleDateString('en-US'),
        timestamp: new Date(entry.recorded_at).getTime()
      };
      
      measurements.forEach(measure => {
        if (entry[measure]) {
          entryData[measure] = entry[measure];
        }
      });
      
      if (Object.keys(entryData).length > 2) {
        data.push(entryData);
      }
    });
    
    return data.sort((a, b) => a.timestamp - b.timestamp);
  };

  const getMuscleData = () => {
    return progressEntries
      .filter(entry => entry.muscle_mass_kg || entry.body_fat_percentage)
      .map(entry => ({
        date: new Date(entry.recorded_at).toLocaleDateString('en-US'),
        muscle_mass: entry.muscle_mass_kg,
        body_fat: entry.body_fat_percentage,
        timestamp: new Date(entry.recorded_at).getTime()
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const renderSimpleChart = (data, valueKey, labelKey = 'date') => {
    if (!data || data.length === 0) {
      return <p className="no-data-message">No data to display</p>;
    }

    // For a single point, duplicate it so the polyline draws a visible horizontal segment
    const chartData = data.length === 1 ? [data[0], { ...data[0], [labelKey]: data[0][labelKey] }] : data;
    const n = chartData.length;
    const step = n > 1 ? (n - 1) : 1;

    const maxValue = Math.max(...chartData.map(d => Number(d[valueKey]) || 0));
    const minValue = Math.min(...chartData.map(d => Number(d[valueKey]) || 0));
    const range = maxValue - minValue || 1;

    const getPoint = (d, i) => {
      const x = (i / step) * 700 + 50;
      const val = Number(d[valueKey]) || minValue;
      const y = 250 - ((val - minValue) / range) * 200;
      return { x, y };
    };

    const pointsStr = chartData.map((d, i) => getPoint(d, i)).map(p => `${p.x},${p.y}`).join(' ');

    return (
      <div className="simple-chart">
        <svg viewBox="0 0 800 300" className="chart-svg" preserveAspectRatio="xMidYMid meet">
          <polyline
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            points={pointsStr}
          />
          {data.map((d, i) => {
            const { x, y } = getPoint(d, i);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="5"
                fill="#06b6d4"
              />
            );
          })}
        </svg>
        <div className="chart-labels">
          {data.map((d, i) => (
            <span key={i} className="chart-label">{d[labelKey]}</span>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="progress-trend-loading">Loading...</div>;
  }

  const currentBMI = userProfile?.weight && userProfile?.height 
    ? calculateBMI(userProfile.weight, userProfile.height) 
    : null;

  return (
    <div className="progress-trend" dir="ltr">
      <div className="progress-trend-header">
        <h2>Progress Trend</h2>
        {currentBMI && (
          <p className="current-bmi">
            Current BMI: {currentBMI}
          </p>
        )}
      </div>

      {/* Input Form */}
      <div className="progress-form-section">
        <h3>Add New Data</h3>
        <form onSubmit={handleSubmit} className="progress-form">
          <div className="form-row">
            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleInputChange}
                step="0.1"
                placeholder="e.g., 75.5"
              />
            </div>
            <div className="form-group">
              <label>Chest (cm)</label>
              <input
                type="number"
                name="chest_cm"
                value={formData.chest_cm}
                onChange={handleInputChange}
                step="0.1"
                placeholder="e.g., 100"
              />
            </div>
            <div className="form-group">
              <label>Waist (cm)</label>
              <input
                type="number"
                name="waist_cm"
                value={formData.waist_cm}
                onChange={handleInputChange}
                step="0.1"
                placeholder="e.g., 85"
              />
            </div>
            <div className="form-group">
              <label>Hips (cm)</label>
              <input
                type="number"
                name="hips_cm"
                value={formData.hips_cm}
                onChange={handleInputChange}
                step="0.1"
                placeholder="e.g., 95"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Left Arm (cm)</label>
              <input
                type="number"
                name="arm_left_cm"
                value={formData.arm_left_cm}
                onChange={handleInputChange}
                step="0.1"
                placeholder="e.g., 35"
              />
            </div>
            <div className="form-group">
              <label>Right Arm (cm)</label>
              <input
                type="number"
                name="arm_right_cm"
                value={formData.arm_right_cm}
                onChange={handleInputChange}
                step="0.1"
                placeholder="e.g., 35"
              />
            </div>
            <div className="form-group">
              <label>Left Thigh (cm)</label>
              <input
                type="number"
                name="thigh_left_cm"
                value={formData.thigh_left_cm}
                onChange={handleInputChange}
                step="0.1"
                placeholder="e.g., 60"
              />
            </div>
            <div className="form-group">
              <label>Right Thigh (cm)</label>
              <input
                type="number"
                name="thigh_right_cm"
                value={formData.thigh_right_cm}
                onChange={handleInputChange}
                step="0.1"
                placeholder="e.g., 60"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group file-upload-group">
              <label>Upload Muscle/Fat Analysis (PDF or Image)</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
              {uploadFile && (
                <p className="file-name">{uploadFile.name}</p>
              )}
            </div>
          </div>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting 
              ? 'Saving...'
              : 'Save Data'
            }
          </button>
        </form>
      </div>

      {/* Trend Sections */}
      <div className="trend-sections">
        <div className="trend-nav">
          <button
            className={`trend-nav-btn ${activeSection === 'bmi' ? 'active' : ''}`}
            onClick={() => setActiveSection('bmi')}
          >
            BMI Trend
          </button>
          <button
            className={`trend-nav-btn ${activeSection === 'weight' ? 'active' : ''}`}
            onClick={() => setActiveSection('weight')}
          >
            Weight Trend
          </button>
          <button
            className={`trend-nav-btn ${activeSection === 'size' ? 'active' : ''}`}
            onClick={() => setActiveSection('size')}
          >
            Body Size Trend
          </button>
          <button
            className={`trend-nav-btn ${activeSection === 'muscle' ? 'active' : ''}`}
            onClick={() => setActiveSection('muscle')}
          >
            Muscle Trend
          </button>
        </div>

        <div className="trend-content">
          {activeSection === 'bmi' && (
            <div className="trend-section">
              <h3>BMI Change Trend</h3>
              {renderSimpleChart(getBMIData(), 'bmi')}
            </div>
          )}

          {activeSection === 'weight' && (
            <div className="trend-section">
              <h3>Weight Change Trend</h3>
              {renderSimpleChart(getWeightData(), 'weight')}
            </div>
          )}

          {activeSection === 'size' && (
            <div className="trend-section">
              <h3>Body Size Change Trend</h3>
              <div className="body-size-chart">
                {getBodySizeData().length === 0 ? (
                  <p className="no-data-message">No data to display</p>
                ) : (
                  <table className="body-size-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Chest</th>
                        <th>Waist</th>
                        <th>Hips</th>
                        <th>L Arm</th>
                        <th>R Arm</th>
                        <th>L Thigh</th>
                        <th>R Thigh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getBodySizeData().map((entry, idx) => (
                        <tr key={idx}>
                          <td>{entry.date}</td>
                          <td>{entry.chest_cm || '-'}</td>
                          <td>{entry.waist_cm || '-'}</td>
                          <td>{entry.hips_cm || '-'}</td>
                          <td>{entry.arm_left_cm || '-'}</td>
                          <td>{entry.arm_right_cm || '-'}</td>
                          <td>{entry.thigh_left_cm || '-'}</td>
                          <td>{entry.thigh_right_cm || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeSection === 'muscle' && (
            <div className="trend-section">
              <h3>Muscle Change Trend</h3>
              <div className="muscle-charts">
                {getMuscleData().length === 0 ? (
                  <p className="no-data-message">No data to display. Please upload muscle/fat analysis file.</p>
                ) : (
                  <>
                    {renderSimpleChart(
                      getMuscleData().filter(d => d.muscle_mass),
                      'muscle_mass'
                    )}
                    {renderSimpleChart(
                      getMuscleData().filter(d => d.body_fat),
                      'body_fat'
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressTrend;

