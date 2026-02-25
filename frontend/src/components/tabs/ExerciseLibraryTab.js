/* eslint-disable no-undef */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiBase } from '../../services/apiBase';
import type1Groups from '../../data/exerciseLibraryType1.json';
import type2Groups from '../../data/exerciseLibraryType2.json';
import type3Groups from '../../data/exerciseLibraryType3.json';
import './ExerciseLibraryTab.css';

const API_BASE = getApiBase();

const CATEGORIES = [
  { value: 'bodybuilding_machine', label: 'Gym equipment exercises' },
  { value: 'functional_home', label: 'Functional exercises without equipment' },
  { value: 'hybrid_hiit_machine', label: 'Combined (equipment and functional)' }
];
const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];
const INTENSITIES = [
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' }
];
const GENDER_SUITABILITY = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'both', label: 'Both' }
];
const INJURY_OPTIONS = ['knee', 'shoulder', 'lower_back', 'neck', 'wrist', 'ankle'];

const EXERCISES_INFO = {
  title: 'Exercises',
  intro: 'This section defines how exercises are added to the library so the AI and training plans can use them safely and consistently.',
  sections: [
    {
      title: 'Required fields',
      items: [
        'Name, Target muscle',
        'Category, Level, Intensity, Gender suitability',
        'Execution tips & Breathing guide (recommended)',
      ],
    },
    {
      title: 'Quality checklist',
      items: [
        'Write short, clear cues for form and breathing',
        'Match intensity to level; avoid advanced cues for beginners',
        'List injuries that should avoid this movement',
      ],
    },
    {
      title: 'Media & notes',
      items: [
        'Optional video/image URLs help members perform correctly',
        'Trainer notes can be reused across programs',
      ],
    },
  ],
};

const defaultExerciseForm = () => ({
  category: 'bodybuilding_machine',
  name_en: '',
  target_muscle_en: '',
  level: 'beginner',
  intensity: 'medium',
  gender_suitability: 'both',
  execution_tips_en: '',
  breathing_guide_en: '',
  injury_contraindications: [],
  equipment_needed_en: '',
  video_url: '',
  image_url: ''
});

const ExerciseLibraryTab = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [formData, setFormData] = useState(defaultExerciseForm());

  const getAuthToken = useCallback(() => {
    const t = localStorage.getItem('token');
    return t && t.trim() ? t.trim() : null;
  }, []);
  const getAxiosConfig = useCallback(() => ({
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  }), [getAuthToken]);

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), per_page: '20' });
      if (categoryFilter) params.set('category', categoryFilter);
      if (levelFilter) params.set('level', levelFilter);
      const response = await axios.get(
        `${API_BASE}/api/admin/exercises?${params}`,
        getAxiosConfig()
      );
      setExercises(response.data.exercises || []);
      setTotalPages(response.data.pages || 1);
      setTotal(response.data.total ?? 0);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      alert('Error fetching exercises');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, getAxiosConfig, levelFilter, page]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleArrayChange = (field, value, checked) => {
    const arr = Array.isArray(formData[field]) ? [...formData[field]] : [];
    const next = checked ? (arr.includes(value) ? arr : [...arr, value]) : arr.filter((x) => x !== value);
    setFormData({ ...formData, [field]: next });
  };

  const openCreate = () => {
    setEditingExercise(null);
    setFormData(defaultExerciseForm());
    setShowForm(true);
  };

  const openEdit = async (exercise) => {
    let ex = exercise;
    try {
      const response = await axios.get(
        `${API_BASE}/api/admin/exercises/${exercise.id}`,
        getAxiosConfig()
      );
      ex = response.data || exercise;
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) {
        alert('Exercise not found. Refreshing list.');
        fetchExercises();
        return;
      }
      console.error('Error fetching exercise:', error);
      alert('Error fetching exercise');
      return;
    }
    setFormData({
      category: ex.category || 'bodybuilding_machine',
      name_en: ex.name_en || ex.name_fa || '',
      target_muscle_en: ex.target_muscle_en || ex.target_muscle_fa || '',
      level: ex.level || 'beginner',
      intensity: ex.intensity || 'medium',
      gender_suitability: ex.gender_suitability || 'both',
      execution_tips_en: ex.execution_tips_en || ex.execution_tips_fa || '',
      breathing_guide_en: ex.breathing_guide_en || ex.breathing_guide_fa || '',
      injury_contraindications: Array.isArray(ex.injury_contraindications) ? ex.injury_contraindications : [],
      equipment_needed_en: ex.equipment_needed_en || ex.equipment_needed_fa || '',
      video_url: ex.video_url || '',
      image_url: ex.image_url || ''
    });
    setEditingExercise(exercise);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      category: formData.category,
      name_fa: '',
      name_en: formData.name_en.trim(),
      target_muscle_fa: '',
      target_muscle_en: formData.target_muscle_en.trim(),
      level: formData.level,
      intensity: formData.intensity,
      gender_suitability: formData.gender_suitability,
      execution_tips_fa: null,
      execution_tips_en: formData.execution_tips_en || null,
      breathing_guide_fa: null,
      breathing_guide_en: formData.breathing_guide_en || null,
      injury_contraindications: formData.injury_contraindications,
      equipment_needed_fa: null,
      equipment_needed_en: formData.equipment_needed_en || null,
      video_url: formData.video_url || null,
      image_url: formData.image_url || null
    };
    try {
      if (editingExercise) {
        await axios.put(
          `${API_BASE}/api/admin/exercises/${editingExercise.id}`,
          payload,
          getAxiosConfig()
        );
        alert('Exercise updated');
      } else {
        await axios.post(`${API_BASE}/api/admin/exercises`, payload, getAxiosConfig());
        alert('Exercise created');
      }
      setShowForm(false);
      setEditingExercise(null);
      fetchExercises();
    } catch (error) {
      console.error('Error saving exercise:', error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDelete = async (exercise) => {
    if (!window.confirm(`Delete "${exercise.name_en || exercise.name_fa || ''}"?`)) return;
    const token = getAuthToken();
    if (!token) {
      alert('Please log in first');
      return;
    }
    try {
      const res = await axios.delete(
        `${API_BASE}/api/admin/exercises/${exercise.id}`,
        getAxiosConfig()
      );
      if (res.status === 200) {
        setExercises((prev) => prev.filter((ex) => ex.id !== exercise.id));
        alert('Exercise deleted');
        fetchExercises();
        return;
      }
      alert('Delete did not complete');
    } catch (error) {
      console.error('Error deleting exercise:', error);
      const msg = error.response?.data?.error || error.message || 'Error';
      alert(`Error deleting exercise: ${msg}`);
    }
  };

  const nameLabel = (ex) => ex.name_en || ex.name_fa || '-';

  return (
    <div className="exercise-library-tab" dir="ltr">
      <div className="exercise-library-header">
        <h2>Exercise Library</h2>
        <button type="button" className="btn-primary" onClick={openCreate}>
          + Add Exercise
        </button>
      </div>

      <div className="exercise-library-info">
        <h3>{EXERCISES_INFO.title}</h3>
        <p>{EXERCISES_INFO.intro}</p>
        <div className="exercise-library-info-grid">
          {EXERCISES_INFO.sections.map((sec, idx) => (
            <div key={idx} className="exercise-library-info-card">
              <h4>{sec.title}</h4>
              <ul>
                {sec.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="exercise-library-machine">
        <h3>Type 1 – Machine</h3>
        <p className="exercise-library-machine-desc">
          Standard machine exercise list by muscle group (review/edit).
        </p>
        <div className="exercise-library-machine-groups">
          {type1Groups.map((group, idx) => (
            <div key={idx} className="exercise-library-machine-group">
              <h4>{group.title}</h4>
              <div className="exercise-library-machine-table-wrap">
                <table className="exercise-library-machine-table">
                  <thead>
                    <tr>
                      <th>Exercise name</th>
                      <th>Target muscle</th>
                      <th>Level</th>
                      <th>Tips</th>
                      <th>Breathing</th>
                      <th>Gender</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => (
                      <tr key={`${item.name_en}-${item.index}`}>
                        <td>{item.name_en || item.name_fa}</td>
                        <td>{item.target_group_en || item.target_group_fa}</td>
                        <td>{item.level_en || '-'}</td>
                        <td>{item.tips_en || '-'}</td>
                        <td>{item.breathing_en || '-'}</td>
                        <td>{item.gender_en || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="exercise-library-machine">
        <h3>Type 2 – Functional (No Equipment)</h3>
        <p className="exercise-library-machine-desc">
          Standard functional (no equipment) exercise list by muscle group (review/edit).
        </p>
        <div className="exercise-library-machine-groups">
          {type2Groups.map((group, idx) => (
            <div key={idx} className="exercise-library-machine-group">
              <h4>{group.title}</h4>
              <div className="exercise-library-machine-table-wrap">
                <table className="exercise-library-machine-table">
                  <thead>
                    <tr>
                      <th>Exercise name</th>
                      <th>Target muscle</th>
                      <th>Level</th>
                      <th>Tips</th>
                      <th>Breathing</th>
                      <th>Gender</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => (
                      <tr key={`${item.name_en}-${item.index}`}>
                        <td>{item.name_en || item.name_fa}</td>
                        <td>{item.target_group_en || item.target_group_fa}</td>
                        <td>{item.level_en || '-'}</td>
                        <td>{item.tips_en || '-'}</td>
                        <td>{item.breathing_en || '-'}</td>
                        <td>{item.gender_en || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="exercise-library-machine">
        <h3>Type 3 – Hybrid (Machine + Functional)</h3>
        <p className="exercise-library-machine-desc">
          Standard hybrid (machine + functional) exercise list by muscle group (review/edit).
        </p>
        <div className="exercise-library-machine-groups">
          {type3Groups.map((group, idx) => (
            <div key={idx} className="exercise-library-machine-group">
              <h4>{group.title}</h4>
              <div className="exercise-library-machine-table-wrap">
                <table className="exercise-library-machine-table">
                  <thead>
                    <tr>
                      <th>Exercise name</th>
                      <th>Target muscle</th>
                      <th>Level</th>
                      <th>Tips</th>
                      <th>Breathing</th>
                      <th>Gender</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => (
                      <tr key={`${item.name_en}-${item.index}`}>
                        <td>{item.name_en || item.name_fa}</td>
                        <td>{item.target_group_en || item.target_group_fa}</td>
                        <td>{item.level_en || '-'}</td>
                        <td>{item.tips_en || '-'}</td>
                        <td>{item.breathing_en || '-'}</td>
                        <td>{item.gender_en || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="exercise-library-filters">
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select value={levelFilter} onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}>
          <option value="">All levels</option>
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="exercise-library-table-wrapper">
            <table className="exercise-library-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Target Muscle</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exercises.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="no-data">
                      No exercises found
                    </td>
                  </tr>
                ) : (
                  exercises.map((ex) => (
                    <tr key={ex.id}>
                      <td>{nameLabel(ex)}</td>
                      <td>{CATEGORIES.find((c) => c.value === ex.category)?.label || ex.category}</td>
                      <td>{LEVELS.find((l) => l.value === ex.level)?.label || ex.level}</td>
                      <td>{ex.target_muscle_en || ex.target_muscle_fa || '-'}</td>
                      <td>
                        <button type="button" className="btn-edit" onClick={() => openEdit(ex)}>
                          Edit
                        </button>
                        <button type="button" className="btn-delete" onClick={() => handleDelete(ex)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="exercise-library-pagination">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span>Page {page} of {totalPages} ({total} total)</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="admin-form-overlay exercise-form-overlay">
          <div className="admin-form-container exercise-form-container">
            <div className="form-header-with-close">
              <h3>
                {editingExercise ? `Edit Exercise: ${formData.name_en || ''}` : 'Add New Exercise'}
              </h3>
              <button type="button" className="close-form-btn" onClick={() => { setShowForm(false); setEditingExercise(null); }} aria-label="Close">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Level *</label>
                  <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} required>
                    {LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Intensity *</label>
                  <select value={formData.intensity} onChange={(e) => setFormData({ ...formData, intensity: e.target.value })} required>
                    {INTENSITIES.map((i) => (
                      <option key={i.value} value={i.value}>{i.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Gender Suitability *</label>
                  <select value={formData.gender_suitability} onChange={(e) => setFormData({ ...formData, gender_suitability: e.target.value })} required>
                    {GENDER_SUITABILITY.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Target Muscle *</label>
                  <input type="text" value={formData.target_muscle_en} onChange={(e) => setFormData({ ...formData, target_muscle_en: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Equipment</label>
                  <input type="text" value={formData.equipment_needed_en} onChange={(e) => setFormData({ ...formData, equipment_needed_en: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Injury Contraindications</label>
                <div className="checkbox-group">
                  {INJURY_OPTIONS.map((opt) => (
                    <label key={opt} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={(formData.injury_contraindications || []).includes(opt)}
                        onChange={(e) => handleArrayChange('injury_contraindications', opt, e.target.checked)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Execution Tips</label>
                <textarea value={formData.execution_tips_en} onChange={(e) => setFormData({ ...formData, execution_tips_en: e.target.value })} rows="2" />
              </div>
              <div className="form-group">
                <label>Breathing Guide</label>
                <textarea value={formData.breathing_guide_en} onChange={(e) => setFormData({ ...formData, breathing_guide_en: e.target.value })} rows="2" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Video URL</label>
                  <input type="url" value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input type="url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">{editingExercise ? 'Save' : 'Create'}</button>
                <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditingExercise(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibraryTab;
