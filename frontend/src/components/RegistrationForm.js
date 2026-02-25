/**
 * Comprehensive Registration Form with Profile Data Collection
 * Collects all required information for personalized AI plans
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getApiBase } from '../services/apiBase';
import './RegistrationForm.css';

// Injury types (all 6 body locations)
const INJURY_KEYS = ['knee', 'shoulder', 'lower_back', 'neck', 'wrist', 'ankle'];
const INJURY_LABELS = {
  knee: 'Knee',
  shoulder: 'Shoulder',
  lower_back: 'Lower Back',
  neck: 'Neck',
  wrist: 'Wrist',
  ankle: 'Ankle'
};

// Follow-up questions per injury (English only for display; API receives key-value structure)
const INJURY_QUESTIONS = {
  knee: {
    label: 'Knee',
    questions: [
      { key: 'when_started', en: 'When did it start?', type: 'radio', options: [
        { value: 'last_month', en: 'Last month' },
        { value: '3_6_months', en: '3–6 months ago' },
        { value: '6_12_months', en: '6–12 months ago' },
        { value: 'over_year', en: 'Over 1 year ago' }
      ]},
      { key: 'severity', en: 'Severity of pain or limitation?', type: 'radio', options: [
        { value: 'mild', en: 'Mild' },
        { value: 'moderate', en: 'Moderate' },
        { value: 'severe', en: 'Severe' }
      ]},
      { key: 'location', en: 'Where is the knee pain?', type: 'radio', options: [
        { value: 'front', en: 'Front' },
        { value: 'back', en: 'Back' },
        { value: 'inside', en: 'Inside' },
        { value: 'outside', en: 'Outside' }
      ]},
      { key: 'pain_squat', en: 'Do you have pain during squat?', type: 'yesno' },
      { key: 'pain_stairs', en: 'Do you have pain when climbing stairs?', type: 'yesno' },
      { key: 'surgery', en: 'Have you had surgery?', type: 'yesno' },
      { key: 'clicking', en: 'Do you have clicking or locking of the knee?', type: 'yesno' }
    ]
  },
  shoulder: {
    label: 'Shoulder',
    questions: [
      { key: 'when_started', en: 'When did it start?', type: 'radio', options: [
        { value: 'last_month', en: 'Last month' },
        { value: '3_6_months', en: '3–6 months ago' },
        { value: '6_12_months', en: '6–12 months ago' },
        { value: 'over_year', en: 'Over 1 year ago' }
      ]},
      { key: 'severity', en: 'Severity?', type: 'radio', options: [
        { value: 'mild', en: 'Mild' },
        { value: 'moderate', en: 'Moderate' },
        { value: 'severe', en: 'Severe' }
      ]},
      { key: 'pain_raise_arm', en: 'Pain when raising your arm?', type: 'yesno' },
      { key: 'pain_bench', en: 'Pain during bench press or overhead press?', type: 'yesno' },
      { key: 'dislocation', en: 'History of dislocation?', type: 'yesno' }
    ]
  },
  lower_back: {
    label: 'Lower Back',
    questions: [
      { key: 'when_started', en: 'When did it start?', type: 'radio', options: [
        { value: 'last_month', en: 'Last month' },
        { value: '3_6_months', en: '3–6 months ago' },
        { value: '6_12_months', en: '6–12 months ago' },
        { value: 'over_year', en: 'Over 1 year ago' }
      ]},
      { key: 'severity', en: 'Severity?', type: 'radio', options: [
        { value: 'mild', en: 'Mild' },
        { value: 'moderate', en: 'Moderate' },
        { value: 'severe', en: 'Severe' }
      ]},
      { key: 'disc', en: 'Do you have disc issue?', type: 'yesno' },
      { key: 'lordosis', en: 'Excessive lower back curve (lordosis)?', type: 'yesno' },
      { key: 'pain_bending', en: 'Pain when bending?', type: 'yesno' },
      { key: 'radiating', en: 'Radiating pain to the leg?', type: 'yesno' }
    ]
  },
  neck: {
    label: 'Neck',
    questions: [
      { key: 'when_started', en: 'When did it start?', type: 'radio', options: [
        { value: 'last_month', en: 'Last month' },
        { value: '3_6_months', en: '3–6 months ago' },
        { value: '6_12_months', en: '6–12 months ago' },
        { value: 'over_year', en: 'Over 1 year ago' }
      ]},
      { key: 'severity', en: 'Severity?', type: 'radio', options: [
        { value: 'mild', en: 'Mild' },
        { value: 'moderate', en: 'Moderate' },
        { value: 'severe', en: 'Severe' }
      ]},
      { key: 'pain_sitting', en: 'Pain during prolonged sitting?', type: 'yesno' },
      { key: 'numbness_hand', en: 'Numbness in hand?', type: 'yesno' },
      { key: 'disc', en: 'Neck disc issue?', type: 'yesno' }
    ]
  },
  wrist: {
    label: 'Wrist',
    questions: [
      { key: 'when_started', en: 'When did it start?', type: 'radio', options: [
        { value: 'last_month', en: 'Last month' },
        { value: '3_6_months', en: '3–6 months ago' },
        { value: '6_12_months', en: '6–12 months ago' },
        { value: 'over_year', en: 'Over 1 year ago' }
      ]},
      { key: 'severity', en: 'Severity?', type: 'radio', options: [
        { value: 'mild', en: 'Mild' },
        { value: 'moderate', en: 'Moderate' },
        { value: 'severe', en: 'Severe' }
      ]},
      { key: 'pain_pushup', en: 'Pain during push-ups?', type: 'yesno' },
      { key: 'weak_grip', en: 'Weakness when gripping weights?', type: 'yesno' }
    ]
  },
  ankle: {
    label: 'Ankle',
    questions: [
      { key: 'when_started', en: 'When did it start?', type: 'radio', options: [
        { value: 'last_month', en: 'Last month' },
        { value: '3_6_months', en: '3–6 months ago' },
        { value: '6_12_months', en: '6–12 months ago' },
        { value: 'over_year', en: 'Over 1 year ago' }
      ]},
      { key: 'severity', en: 'Severity?', type: 'radio', options: [
        { value: 'mild', en: 'Mild' },
        { value: 'moderate', en: 'Moderate' },
        { value: 'severe', en: 'Severe' }
      ]},
      { key: 'sprain_history', en: 'Previous sprain?', type: 'yesno' },
      { key: 'pain_running', en: 'Pain when running?', type: 'yesno' },
      { key: 'instability', en: 'Instability?', type: 'yesno' }
    ]
  }
};

const RegistrationForm = ({ onComplete, accountType: accountTypeProp = 'member' }) => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const stepContainerRef = useRef(null);

  const accountType = accountTypeProp;
  const isCoachRegistration = accountType === 'coach';

  // Step 1: Basic Account Info
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Basic Information
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [trainingLevel, setTrainingLevel] = useState('');
  const [exerciseHistoryYears, setExerciseHistoryYears] = useState('');
  const [exerciseHistoryDescription, setExerciseHistoryDescription] = useState('');

  // Step 3: Training Goals
  const [fitnessGoals, setFitnessGoals] = useState([]);

  // Step 4: Body Measurements
  const [chestCircumference, setChestCircumference] = useState('');
  const [waistCircumference, setWaistCircumference] = useState('');
  const [abdomenCircumference, setAbdomenCircumference] = useState('');
  const [armCircumference, setArmCircumference] = useState('');
  const [hipCircumference, setHipCircumference] = useState('');
  const [thighCircumference, setThighCircumference] = useState('');

  // Step 5: Limitations & Injuries
  const [injuries, setInjuries] = useState([]);
  const [injuryDetails, setInjuryDetails] = useState('');
  const [injuryQuestionAnswers, setInjuryQuestionAnswers] = useState(() => {
    const o = {};
    INJURY_KEYS.forEach(k => { o[k] = {}; });
    return o;
  });
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [medicalConditionDetails, setMedicalConditionDetails] = useState('');

  const setInjuryAnswer = (injuryKey, questionKey, value) => {
    setInjuryQuestionAnswers(prev => ({
      ...prev,
      [injuryKey]: { ...(prev[injuryKey] || {}), [questionKey]: value }
    }));
  };

  // Step 6: Training Conditions
  const [gymAccess, setGymAccess] = useState(false);
  const [equipmentAccess, setEquipmentAccess] = useState([]);
  const [homeEquipment, setHomeEquipment] = useState([]);
  const [workoutDaysPerWeek, setWorkoutDaysPerWeek] = useState(3);
  const [preferredWorkoutTime, setPreferredWorkoutTime] = useState('');

  // Coach selection (members only)
  const [coaches, setCoaches] = useState([]);
  const [selectedCoachId, setSelectedCoachId] = useState('');

  const toggleArrayItem = (array, setArray, item) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  // Fetch approved coaches for member registration
  useEffect(() => {
    if (!isCoachRegistration) {
      const apiBase = getApiBase();
      fetch(`${apiBase}/api/coaches/public`)
        .then(res => res.json())
        .then(data => setCoaches(Array.isArray(data) ? data : []))
        .catch(() => setCoaches([]));
    }
  }, [isCoachRegistration]);

  // Scroll to top when step changes
  useEffect(() => {
    if (stepContainerRef.current) {
      stepContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Also scroll the modal content to top
    const modalContent = document.querySelector('.auth-modal-content');
    if (modalContent) {
      modalContent.scrollTop = 0;
    }
  }, [step]);

  const handleStepChange = (newStep) => {
    setStep(newStep);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const totalSteps = isCoachRegistration ? 2 : 7;
    if (step < totalSteps) {
      handleStepChange(step + 1);
      return;
    }

    // Final step - submit registration
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    // Build injury_details: free text + summary of injury follow-up answers (English only)
    let injuryDetailsFinal = injuryDetails.trim();
    if (injuries.length > 0) {
      const parts = [];
      injuries.forEach(injuryKey => {
        const config = INJURY_QUESTIONS[injuryKey];
        const answers = injuryQuestionAnswers[injuryKey] || {};
        if (!config || Object.keys(answers).length === 0) return;
        const label = config.label;
        const lines = [];
        config.questions.forEach(q => {
          const v = answers[q.key];
          if (v === undefined || v === '') return;
          const qText = q.en;
          let aText = v;
          if (q.type === 'yesno') aText = v === 'yes' ? 'Yes' : 'No';
          else if (q.options) aText = (q.options.find(o => o.value === v) || {}).en || v;
          lines.push(`${qText}: ${aText}`);
        });
        if (lines.length) parts.push(`[${label}]\n${lines.join('\n')}`);
      });
      if (parts.length) {
        injuryDetailsFinal = (injuryDetailsFinal ? injuryDetailsFinal + '\n\n' : '') + parts.join('\n\n');
      }
    }

    const profileData = {
      account_type: accountType,
      ...(!isCoachRegistration && selectedCoachId ? { coach_id: parseInt(selectedCoachId, 10) } : {}),
      age: age ? parseInt(age) : null,
      gender: gender,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      training_level: trainingLevel,
      exercise_history_years: exerciseHistoryYears ? parseInt(exerciseHistoryYears) : null,
      exercise_history_description: exerciseHistoryDescription,
      fitness_goals: fitnessGoals,
      chest_circumference: chestCircumference ? parseFloat(chestCircumference) : null,
      waist_circumference: waistCircumference ? parseFloat(waistCircumference) : null,
      abdomen_circumference: abdomenCircumference ? parseFloat(abdomenCircumference) : null,
      arm_circumference: armCircumference ? parseFloat(armCircumference) : null,
      hip_circumference: hipCircumference ? parseFloat(hipCircumference) : null,
      thigh_circumference: thighCircumference ? parseFloat(thighCircumference) : null,
      injuries: injuries,
      injury_details: injuryDetailsFinal,
      injury_question_answers: injuryQuestionAnswers,
      medical_conditions: medicalConditions,
      medical_condition_details: medicalConditionDetails,
      gym_access: gymAccess,
      equipment_access: equipmentAccess,
      home_equipment: homeEquipment,
      workout_days_per_week: workoutDaysPerWeek,
      preferred_workout_time: preferredWorkoutTime
    };

    const result = await register(username, email, password, 'en', profileData);
    
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    } else if (onComplete) {
      onComplete();
    }
  };


  const renderStep1 = () => (
    <div className="registration-step">
      <h3>Account Information</h3>
      <div className="form-group">
        <label>{t('username')}</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>{t('email')}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>{t('password')}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <div className="form-group">
        <label>Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
    </div>
  );

  const renderStep2Coach = () => (
    <div className="registration-step">
      <h3>Choose Your Coach</h3>
      <p className="step-description">
        Select your coach. Your training plan will be personalized based on your coach's methodology.
      </p>
      <div className="form-group">
        <label>Coach</label>
        <select
          value={selectedCoachId}
          onChange={(e) => setSelectedCoachId(e.target.value)}
        >
          <option value="">Select a coach</option>
          {coaches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.username}
              {c.specialization ? ` - ${c.specialization}` : ''}
              {c.years_of_experience ? ` (${c.years_of_experience} yrs)` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="registration-step">
      <h3>Basic Information</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="10"
            max="100"
          />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            min="100"
            max="250"
          />
        </div>
        <div className="form-group">
          <label>Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            min="30"
            max="300"
            step="0.1"
          />
        </div>
      </div>
      <div className="form-group">
        <label>Fitness Level</label>
        <select value={trainingLevel} onChange={(e) => setTrainingLevel(e.target.value)}>
          <option value="">Select</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <div className="form-group">
        <label>Exercise History (Years)</label>
        <input
          type="number"
          value={exerciseHistoryYears}
          onChange={(e) => setExerciseHistoryYears(e.target.value)}
          min="0"
          max="50"
        />
      </div>
      <div className="form-group">
        <label>Exercise History Description</label>
        <textarea
          value={exerciseHistoryDescription}
          onChange={(e) => setExerciseHistoryDescription(e.target.value)}
          rows={3}
          placeholder="Describe your previous exercise experience..."
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="registration-step">
      <h3>Training Goals</h3>
      <p className="step-description">
        Please select your goals (you can select multiple)
      </p>
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={fitnessGoals.includes('lose_weight')}
            onChange={() => toggleArrayItem(fitnessGoals, setFitnessGoals, 'lose_weight')}
          />
          <span>Lose Weight</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={fitnessGoals.includes('gain_weight')}
            onChange={() => toggleArrayItem(fitnessGoals, setFitnessGoals, 'gain_weight')}
          />
          <span>Gain Weight</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={fitnessGoals.includes('gain_muscle')}
            onChange={() => toggleArrayItem(fitnessGoals, setFitnessGoals, 'gain_muscle')}
          />
          <span>Gain Muscle</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={fitnessGoals.includes('shape_fitting')}
            onChange={() => toggleArrayItem(fitnessGoals, setFitnessGoals, 'shape_fitting')}
          />
          <span>Shape Fitting</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={fitnessGoals.includes('healthy_diet')}
            onChange={() => toggleArrayItem(fitnessGoals, setFitnessGoals, 'healthy_diet')}
          />
          <span>Healthy Diet</span>
        </label>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="registration-step">
      <h3>Body Measurements</h3>
      <p className="step-description">
        Please enter your body measurements (in centimeters)
      </p>
      
      <div className="form-group">
        <label>Chest Circumference (cm)</label>
        <p className="measurement-description">
          Circumference of the most prominent part of the chest
        </p>
        <input
          type="number"
          value={chestCircumference}
          onChange={(e) => setChestCircumference(e.target.value)}
          min="0"
          step="0.1"
          placeholder="e.g., 95.5"
        />
      </div>

      <div className="form-group">
        <label>Waist Circumference (cm)</label>
        <p className="measurement-description">
          Circumference of the narrowest part of the waist
        </p>
        <input
          type="number"
          value={waistCircumference}
          onChange={(e) => setWaistCircumference(e.target.value)}
          min="0"
          step="0.1"
          placeholder="e.g., 80.0"
        />
      </div>

      <div className="form-group">
        <label>Abdomen Circumference (cm)</label>
        <p className="measurement-description">
          Circumference of the most prominent part of the abdomen
        </p>
        <input
          type="number"
          value={abdomenCircumference}
          onChange={(e) => setAbdomenCircumference(e.target.value)}
          min="0"
          step="0.1"
          placeholder="e.g., 90.0"
        />
      </div>

      <div className="form-group">
        <label>Arm Circumference (cm)</label>
        <p className="measurement-description">
          Circumference of the most prominent part of the arm
        </p>
        <input
          type="number"
          value={armCircumference}
          onChange={(e) => setArmCircumference(e.target.value)}
          min="0"
          step="0.1"
          placeholder="e.g., 35.5"
        />
      </div>

      <div className="form-group">
        <label>Hip Circumference (cm)</label>
        <p className="measurement-description">
          Circumference of the most prominent part of the hip
        </p>
        <input
          type="number"
          value={hipCircumference}
          onChange={(e) => setHipCircumference(e.target.value)}
          min="0"
          step="0.1"
          placeholder="e.g., 100.0"
        />
      </div>

      <div className="form-group">
        <label>Thigh Circumference (cm)</label>
        <p className="measurement-description">
          Circumference of the most prominent part of the thigh
        </p>
        <input
          type="number"
          value={thighCircumference}
          onChange={(e) => setThighCircumference(e.target.value)}
          min="0"
          step="0.1"
          placeholder="e.g., 60.0"
        />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="registration-step">
      <h3>Limitations & Injuries</h3>
      <p className="step-description">
        Please specify your injuries and limitations so we can create safe programs for you
      </p>
      
      <div className="form-group">
        <label>Injuries</label>
        <div className="checkbox-group">
          {INJURY_KEYS.map(key => (
            <label key={key} className="checkbox-label">
              <input
                type="checkbox"
                checked={injuries.includes(key)}
                onChange={() => toggleArrayItem(injuries, setInjuries, key)}
              />
              <span>{INJURY_LABELS[key] || key}</span>
            </label>
          ))}
        </div>
      </div>

      {injuries.length > 0 && (
        <div className="injury-questions-section">
          <p className="step-description">Please answer the following questions for each selected injury.</p>
          {injuries.map(injuryKey => {
            const config = INJURY_QUESTIONS[injuryKey];
            if (!config) return null;
            const label = config.label;
            const answers = injuryQuestionAnswers[injuryKey] || {};
            return (
              <div key={injuryKey} className="injury-question-block">
                <h4 className="injury-question-title">{label}</h4>
                {config.questions.map(q => {
                  const qText = q.en;
                  const value = answers[q.key];
                  return (
                    <div key={q.key} className="form-group injury-question">
                      <label>{qText}</label>
                      {q.type === 'radio' && q.options && (
                        <div className="checkbox-group injury-options">
                          {q.options.map(opt => (
                            <label key={opt.value} className="checkbox-label">
                              <input
                                type="radio"
                                name={`${injuryKey}-${q.key}`}
                                checked={value === opt.value}
                                onChange={() => setInjuryAnswer(injuryKey, q.key, opt.value)}
                              />
                              <span>{opt.en}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === 'yesno' && (
                        <div className="checkbox-group injury-options">
                          <label className="checkbox-label">
                            <input
                              type="radio"
                              name={`${injuryKey}-${q.key}`}
                              checked={value === 'yes'}
                              onChange={() => setInjuryAnswer(injuryKey, q.key, 'yes')}
                            />
                            <span>Yes</span>
                          </label>
                          <label className="checkbox-label">
                            <input
                              type="radio"
                              name={`${injuryKey}-${q.key}`}
                              checked={value === 'no'}
                              onChange={() => setInjuryAnswer(injuryKey, q.key, 'no')}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      <div className="form-group">
        <label>Injury Details</label>
        <textarea
          value={injuryDetails}
          onChange={(e) => setInjuryDetails(e.target.value)}
          rows={3}
          placeholder="Describe your injuries in detail..."
        />
      </div>

      <div className="form-group">
        <label>Medical Conditions</label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={medicalConditions.includes('heart_disease')}
              onChange={() => toggleArrayItem(medicalConditions, setMedicalConditions, 'heart_disease')}
            />
            <span>Heart Disease</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={medicalConditions.includes('high_blood_pressure')}
              onChange={() => toggleArrayItem(medicalConditions, setMedicalConditions, 'high_blood_pressure')}
            />
            <span>High Blood Pressure</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={medicalConditions.includes('pregnancy')}
              onChange={() => toggleArrayItem(medicalConditions, setMedicalConditions, 'pregnancy')}
            />
            <span>Pregnancy</span>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Medical Condition Details</label>
        <textarea
          value={medicalConditionDetails}
          onChange={(e) => setMedicalConditionDetails(e.target.value)}
          rows={3}
          placeholder="Describe your medical conditions in detail..."
        />
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="registration-step">
      <h3>Training Conditions</h3>
      
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={gymAccess}
            onChange={(e) => setGymAccess(e.target.checked)}
          />
          <span>Gym Access</span>
        </label>
      </div>

      {gymAccess && (
        <div className="form-group">
          <label>Gym Equipment</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={equipmentAccess.includes('machine')}
                onChange={() => toggleArrayItem(equipmentAccess, setEquipmentAccess, 'machine')}
              />
              <span>Machines</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={equipmentAccess.includes('dumbbells')}
                onChange={() => toggleArrayItem(equipmentAccess, setEquipmentAccess, 'dumbbells')}
              />
              <span>Dumbbells</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={equipmentAccess.includes('barbell')}
                onChange={() => toggleArrayItem(equipmentAccess, setEquipmentAccess, 'barbell')}
              />
              <span>Barbell</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={equipmentAccess.includes('cable')}
                onChange={() => toggleArrayItem(equipmentAccess, setEquipmentAccess, 'cable')}
              />
              <span>Cable Machine</span>
            </label>
          </div>
        </div>
      )}

      {!gymAccess && (
        <div className="form-group">
          <label>Home Equipment</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={homeEquipment.includes('dumbbells')}
                onChange={() => toggleArrayItem(homeEquipment, setHomeEquipment, 'dumbbells')}
              />
              <span>Dumbbells</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={homeEquipment.includes('resistance_bands')}
                onChange={() => toggleArrayItem(homeEquipment, setHomeEquipment, 'resistance_bands')}
              />
              <span>Resistance Bands</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={homeEquipment.includes('yoga_mat')}
                onChange={() => toggleArrayItem(homeEquipment, setHomeEquipment, 'yoga_mat')}
              />
              <span>Yoga Mat</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={homeEquipment.includes('body_weight_only')}
                onChange={() => toggleArrayItem(homeEquipment, setHomeEquipment, 'body_weight_only')}
              />
              <span>Body Weight Only</span>
            </label>
          </div>
        </div>
      )}

      <div className="form-group">
        <label>Workout Days Per Week</label>
        <select value={workoutDaysPerWeek} onChange={(e) => setWorkoutDaysPerWeek(parseInt(e.target.value))}>
          {[1, 2, 3, 4, 5, 6, 7].map(days => (
            <option key={days} value={days}>{days}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Preferred Workout Time</label>
        <select value={preferredWorkoutTime} onChange={(e) => setPreferredWorkoutTime(e.target.value)}>
          <option value="">Select</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="registration-form-container">
      <div className="registration-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / (isCoachRegistration ? 2 : 7)) * 100}%` }}></div>
        </div>
        <div className="progress-steps">
          {[1, 2, 3, 4, 5, 6, 7].filter(s => isCoachRegistration ? s <= 2 : true).map(s => (
            <div
              key={s}
              className={`progress-step ${s <= step ? 'active' : ''} ${s < step ? 'clickable' : ''}`}
              onClick={() => {
                // Only allow clicking on steps that have been reached (previous steps)
                if (s < step) {
                  handleStepChange(s);
                }
              }}
              style={{
                cursor: s < step ? 'pointer' : 'default',
                opacity: s > step ? 0.5 : 1
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="registration-form">
        {error && <div className="error-message">{error}</div>}

        <div ref={stepContainerRef}>
          {step === 1 && renderStep1()}
          {step === 2 && (isCoachRegistration ? renderStep2() : renderStep2Coach())}
          {step === 3 && !isCoachRegistration && renderStep2()}
          {step === 4 && !isCoachRegistration && renderStep3()}
          {step === 5 && !isCoachRegistration && renderStep4()}
          {step === 6 && !isCoachRegistration && renderStep5()}
          {step === 7 && !isCoachRegistration && renderStep6()}
        </div>

        <div className="form-actions">
          {step > 1 && (
            <button type="button" className="btn-secondary" onClick={() => handleStepChange(step - 1)}>
              Previous
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? t('loading')
              : step === (isCoachRegistration ? 2 : 7)
              ? 'Register & Complete'
              : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;



