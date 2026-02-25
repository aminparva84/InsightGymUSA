import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiBase } from '../../services/apiBase';
import './TrainingLevelsInfoTab.css';

const PURPOSE_KEYS = ['lose_weight', 'gain_weight', 'gain_muscle', 'shape_fitting'];
const PURPOSE_LABELS = {
  lose_weight: 'Lose weight',
  gain_weight: 'Gain weight',
  gain_muscle: 'Gain muscle',
  shape_fitting: 'Shape fitting'
};

const defaultPurposes = () => ({
  lose_weight: { sessions_per_week: '', sets_per_action: '', reps_per_action: '', training_focus_en: '', break_between_sets: '' },
  gain_weight: { sessions_per_week: '', sets_per_action: '', reps_per_action: '', training_focus_en: '', break_between_sets: '' },
  gain_muscle: { sessions_per_week: '', sets_per_action: '', reps_per_action: '', training_focus_en: '', break_between_sets: '' },
  shape_fitting: { sessions_per_week: '', sets_per_action: '', reps_per_action: '', training_focus_en: '', break_between_sets: '' }
});

const defaultLevel = () => ({
  description_en: '',
  goals: [],
  purposes: defaultPurposes()
});

const normalizeLevel = (stored) => {
  if (!stored) return defaultLevel();
  return {
    description_en: stored.description_en || '',
    goals: Array.isArray(stored.goals) ? stored.goals : [],
    purposes: (() => {
      const p = defaultPurposes();
      const sp = stored.purposes || {};
      PURPOSE_KEYS.forEach(key => {
        if (sp[key] && typeof sp[key] === 'object') {
          p[key] = { ...p[key], ...sp[key] };
        }
      });
      return p;
    })()
  };
};

const INJURY_KEYS = ['knee', 'shoulder', 'lower_back', 'neck', 'wrist', 'ankle'];
const INJURY_LABELS = {
  knee: 'Knee',
  shoulder: 'Shoulder',
  lower_back: 'Lower back',
  neck: 'Neck',
  wrist: 'Wrist',
  ankle: 'Ankle'
};

const defaultInjury = () => ({
  purposes_en: '',
  allowed_movements: [],
  forbidden_movements: [],
  important_notes_en: ''
});

const normalizeInjury = (stored) => {
  if (!stored) return defaultInjury();
  return {
    purposes_en: stored.purposes_en || (stored.description_en ?? ''),
    allowed_movements: Array.isArray(stored.allowed_movements) ? stored.allowed_movements : [],
    forbidden_movements: Array.isArray(stored.forbidden_movements) ? stored.forbidden_movements : [],
    important_notes_en: stored.important_notes_en ?? ''
  };
};

const TrainingLevelsInfoTab = () => {
  const [trainingLevels, setTrainingLevels] = useState({
    beginner: defaultLevel(),
    intermediate: defaultLevel(),
    advanced: defaultLevel()
  });
  const [injuries, setInjuries] = useState(() => {
    const o = {};
    INJURY_KEYS.forEach(k => { o[k] = defaultInjury(); });
    o.common_injury_note_en = '';
    return o;
  });
  const [loading, setLoading] = useState(false);

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

  const fetchConfiguration = useCallback(async () => {
    try {
      setLoading(true);
      // Training Info is coach-only now; use coach config endpoint
      const response = await axios.get(`${getApiBase()}/api/admin/coach/config`, getAxiosConfig());
      if (response.data.training_levels) {
        const raw = response.data.training_levels;
        setTrainingLevels({
          beginner: normalizeLevel(raw.beginner),
          intermediate: normalizeLevel(raw.intermediate),
          advanced: normalizeLevel(raw.advanced)
        });
      }
      if (response.data.injuries) {
        const raw = response.data.injuries;
        const normalized = {};
        INJURY_KEYS.forEach(k => { normalized[k] = normalizeInjury(raw[k]); });
        normalized.common_injury_note_en = raw.common_injury_note_en ?? '';
        setInjuries(normalized);
      }
    } catch (error) {
      console.error('Error fetching configuration:', error);
    } finally {
      setLoading(false);
    }
  }, [getAxiosConfig]);

  useEffect(() => {
    fetchConfiguration();
  }, [fetchConfiguration]);

  const addGoal = (level) => {
    const goals = Array.isArray(trainingLevels[level].goals) ? [...trainingLevels[level].goals] : [];
    goals.push({ en: '' });
    setTrainingLevels({
      ...trainingLevels,
      [level]: { ...trainingLevels[level], goals }
    });
  };

  const removeGoal = (level, index) => {
    const goals = trainingLevels[level].goals.filter((_, i) => i !== index);
    setTrainingLevels({
      ...trainingLevels,
      [level]: { ...trainingLevels[level], goals }
    });
  };

  const updateGoal = (level, index, value) => {
    const goals = [...(trainingLevels[level].goals || [])];
    if (!goals[index]) goals[index] = { en: '' };
    goals[index] = { ...goals[index], en: value };
    setTrainingLevels({
      ...trainingLevels,
      [level]: { ...trainingLevels[level], goals }
    });
  };

  const updatePurpose = (level, purposeKey, field, value) => {
    const purposes = { ...(trainingLevels[level].purposes || defaultPurposes()) };
    purposes[purposeKey] = { ...purposes[purposeKey], [field]: value };
    setTrainingLevels({
      ...trainingLevels,
      [level]: { ...trainingLevels[level], purposes }
    });
  };

  const addInjuryMovement = (injuryKey, listKey) => {
    const list = Array.isArray(injuries[injuryKey]?.[listKey]) ? [...injuries[injuryKey][listKey]] : [];
    list.push({ en: '' });
    setInjuries({
      ...injuries,
      [injuryKey]: { ...injuries[injuryKey], [listKey]: list }
    });
  };

  const removeInjuryMovement = (injuryKey, listKey, index) => {
    const list = injuries[injuryKey][listKey].filter((_, i) => i !== index);
    setInjuries({
      ...injuries,
      [injuryKey]: { ...injuries[injuryKey], [listKey]: list }
    });
  };

  const updateInjuryMovement = (injuryKey, listKey, index, value) => {
    const list = [...(injuries[injuryKey][listKey] || [])];
    if (!list[index]) list[index] = { en: '' };
    list[index] = { ...list[index], en: value };
    setInjuries({
      ...injuries,
      [injuryKey]: { ...injuries[injuryKey], [listKey]: list }
    });
  };

  const updateInjuryImportantNotes = (injuryKey, value) => {
    setInjuries({
      ...injuries,
      [injuryKey]: { ...injuries[injuryKey], important_notes_en: value }
    });
  };

  const updateCommonInjuryNote = (value) => {
    setInjuries({ ...injuries, common_injury_note_en: value });
  };

  const handleSaveConfiguration = async () => {
    try {
      await axios.post(`${getApiBase()}/api/admin/coach/config`, {
        training_levels: trainingLevels,
        injuries: injuries
      }, getAxiosConfig());
      alert('Configuration saved');
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Error saving configuration');
    }
  };

  return (
    <div className="training-levels-info-tab" dir="ltr">
      <div className="levels-header">
        <h2>Training Level Information</h2>
        <button className="btn-primary" onClick={handleSaveConfiguration}>
          Save Configuration
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="levels-content">
          <div className="config-section training-levels-section">
            <h3>Training Levels</h3>
            {Object.keys(trainingLevels).map(level => {
              const levelLabel = level.charAt(0).toUpperCase() + level.slice(1);
              const levelData = trainingLevels[level] || defaultLevel();
              const goals = Array.isArray(levelData.goals) ? levelData.goals : [];
              const purposes = levelData.purposes || defaultPurposes();
              return (
                <div key={level} className={`level-block level-block--${level}`}>
                  <h4 className="level-block-title">{levelLabel}</h4>

                  <div className="level-description">
                    <span className="level-subtitle">Description</span>
                    <div className="form-group">
                      <textarea
                        value={levelData.description_en || ''}
                        onChange={(e) => setTrainingLevels({
                          ...trainingLevels,
                          [level]: { ...levelData, description_en: e.target.value }
                        })}
                        rows="3"
                        placeholder="Description in English"
                      />
                    </div>
                  </div>

                  <div className="level-goals">
                    <span className="level-subtitle">Goals</span>
                    <p className="level-hint">Add each goal item separately.</p>
                    {goals.map((goal, idx) => (
                      <div key={idx} className="goal-row">
                        <div className="form-row goal-inputs">
                          <div className="form-group">
                            <input
                              type="text"
                              value={(goal && goal.en) || ''}
                              onChange={(e) => updateGoal(level, idx, e.target.value)}
                              placeholder="Goal"
                            />
                          </div>
                        </div>
                        <button type="button" className="btn-remove-goal" onClick={() => removeGoal(level, idx)} aria-label="Remove goal">
                          ×
                        </button>
                      </div>
                    ))}
                    <button type="button" className="btn-add-goal" onClick={() => addGoal(level)}>
                      + Add goal
                    </button>
                  </div>

                  <div className="level-purposes">
                    <span className="level-subtitle">Features for each training purpose</span>
                    <div className="purposes-grid">
                      {PURPOSE_KEYS.map(purposeKey => {
                        const p = purposes[purposeKey] || {};
                        const label = PURPOSE_LABELS[purposeKey] || purposeKey;
                        return (
                          <div key={purposeKey} className="purpose-card">
                            <h5 className="purpose-card-title">{label}</h5>
                            <div className="form-group">
                              <label>Sessions per week</label>
                              <input
                                type="text"
                                value={p.sessions_per_week || ''}
                                onChange={(e) => updatePurpose(level, purposeKey, 'sessions_per_week', e.target.value)}
                                placeholder="e.g. 3-4"
                              />
                            </div>
                            <div className="form-group">
                              <label>Sets per action</label>
                              <input
                                type="text"
                                value={p.sets_per_action || ''}
                                onChange={(e) => updatePurpose(level, purposeKey, 'sets_per_action', e.target.value)}
                                placeholder="e.g. 3"
                              />
                            </div>
                            <div className="form-group">
                              <label>Reps per action</label>
                              <input
                                type="text"
                                value={p.reps_per_action || ''}
                                onChange={(e) => updatePurpose(level, purposeKey, 'reps_per_action', e.target.value)}
                                placeholder="e.g. 10-12"
                              />
                            </div>
                            <div className="form-group">
                              <label>Training focus (where & tools)</label>
                              <input
                                type="text"
                                value={p.training_focus_en || ''}
                                onChange={(e) => updatePurpose(level, purposeKey, 'training_focus_en', e.target.value)}
                                placeholder="e.g. at home, gym, with/without tools"
                              />
                            </div>
                            <div className="form-group">
                              <label>Break between sets</label>
                              <input
                                type="text"
                                value={p.break_between_sets || ''}
                                onChange={(e) => updatePurpose(level, purposeKey, 'break_between_sets', e.target.value)}
                                placeholder="e.g. 60 seconds"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="config-section injuries-section">
            <h3>Corrective movements for each injury</h3>
            {INJURY_KEYS.map(injuryKey => {
              const data = injuries[injuryKey] || defaultInjury();
              const label = INJURY_LABELS[injuryKey] || injuryKey;
              const allowed = Array.isArray(data.allowed_movements) ? data.allowed_movements : [];
              const forbidden = Array.isArray(data.forbidden_movements) ? data.forbidden_movements : [];
              return (
                <div key={injuryKey} className="injury-card-block">
                  <h4 className="injury-card-title">{label}</h4>

                  <div className="injury-purposes">
                    <span className="level-subtitle">Purposes</span>
                    <div className="form-group">
                      <textarea
                        value={data.purposes_en || ''}
                        onChange={(e) => setInjuries({
                          ...injuries,
                          [injuryKey]: { ...data, purposes_en: e.target.value }
                        })}
                        rows="3"
                        placeholder="Description in English"
                      />
                    </div>
                  </div>

                  <div className="injury-allowed">
                    <span className="level-subtitle">Allowed movements</span>
                    {allowed.map((item, idx) => (
                      <div key={idx} className="goal-row">
                        <div className="form-row goal-inputs">
                          <div className="form-group">
                            <input
                              type="text"
                              value={(item && item.en) || ''}
                              onChange={(e) => updateInjuryMovement(injuryKey, 'allowed_movements', idx, e.target.value)}
                              placeholder="Allowed movement"
                            />
                          </div>
                        </div>
                        <button type="button" className="btn-remove-goal" onClick={() => removeInjuryMovement(injuryKey, 'allowed_movements', idx)} aria-label="Remove">×</button>
                      </div>
                    ))}
                    <button type="button" className="btn-add-goal" onClick={() => addInjuryMovement(injuryKey, 'allowed_movements')}>
                      + Add allowed movement
                    </button>
                  </div>

                  <div className="injury-forbidden">
                    <span className="level-subtitle">Forbidden movements</span>
                    {forbidden.map((item, idx) => (
                      <div key={idx} className="goal-row">
                        <div className="form-row goal-inputs">
                          <div className="form-group">
                            <input
                              type="text"
                              value={(item && item.en) || ''}
                              onChange={(e) => updateInjuryMovement(injuryKey, 'forbidden_movements', idx, e.target.value)}
                              placeholder="Forbidden movement"
                            />
                          </div>
                        </div>
                        <button type="button" className="btn-remove-goal" onClick={() => removeInjuryMovement(injuryKey, 'forbidden_movements', idx)} aria-label="Remove">×</button>
                      </div>
                    ))}
                    <button type="button" className="btn-add-goal" onClick={() => addInjuryMovement(injuryKey, 'forbidden_movements')}>
                      + Add forbidden movement
                    </button>
                  </div>

                  <div className="injury-important-notes">
                    <span className="level-subtitle">Important notes</span>
                    <div className="form-group">
                      <textarea
                        value={data.important_notes_en || ''}
                        onChange={(e) => updateInjuryImportantNotes(injuryKey, e.target.value)}
                        rows="3"
                        placeholder="Important notes in English"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="injury-common-note">
              <h4 className="injury-common-note-title">Common note for all injuries</h4>
              <div className="form-group">
                <textarea
                  value={injuries.common_injury_note_en || ''}
                  onChange={(e) => updateCommonInjuryNote(e.target.value)}
                  rows="4"
                  placeholder="e.g. Always correct form + controlled breathing; if severe pain, stop and substitute"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingLevelsInfoTab;
