/**
 * Workout Logger Component - Log completed workouts with feedback
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { workoutLogService, WorkoutLogEntry, AlternativeExercise } from '../services/workoutLogService';
import './WorkoutLogger.css';

interface WorkoutLoggerProps {
  exerciseId: number;
  exerciseNameFa: string;
  exerciseNameEn: string;
  onLogged?: () => void;
}

const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  exerciseId,
  exerciseNameFa,
  exerciseNameEn,
  onLogged
}) => {
  const { t } = useTranslation();
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState<number | undefined>();
  const [difficulty, setDifficulty] = useState<'too_easy' | 'just_right' | 'too_difficult' | ''>('');
  const [painReported, setPainReported] = useState(false);
  const [painLocation, setPainLocation] = useState('');
  const [formRating, setFormRating] = useState<number | undefined>();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [alternative, setAlternative] = useState<AlternativeExercise | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAlternative(null);

    try {
      const entry: WorkoutLogEntry = {
        exercise_id: exerciseId,
        sets_completed: sets,
        reps_completed: reps,
        weight_kg: weight,
        difficulty_rating: difficulty || undefined,
        pain_reported: painReported,
        pain_location: painLocation || undefined,
        form_rating: formRating,
        notes: notes || undefined,
        language: 'en'
      };

      const result = await workoutLogService.logWorkout(entry);

      if (result.alternative_suggested && result.alternative_exercise) {
        setAlternative(result.alternative_exercise);
      }

      // Reset form
      setSets(3);
      setReps(10);
      setWeight(undefined);
      setDifficulty('');
      setPainReported(false);
      setPainLocation('');
      setFormRating(undefined);
      setNotes('');

      if (onLogged) {
        onLogged();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workout-logger">
      <h3>Log Workout</h3>
      
      <div className="exercise-info">
        <strong>{exerciseNameEn || exerciseNameFa}</strong>
      </div>

      <form onSubmit={handleSubmit} className="workout-log-form">
        <div className="form-row">
          <div className="form-group">
            <label>Sets</label>
            <input
              type="number"
              value={sets}
              onChange={(e) => setSets(parseInt(e.target.value) || 0)}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Reps</label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(parseInt(e.target.value) || 0)}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Weight (kg)</label>
            <input
              type="number"
              value={weight || ''}
              onChange={(e) => setWeight(parseFloat(e.target.value) || undefined)}
              min="0"
              step="0.5"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Difficulty Level</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
          >
            <option value="">Select</option>
            <option value="too_easy">Too Easy</option>
            <option value="just_right">Just Right</option>
            <option value="too_difficult">Too Difficult</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={painReported}
              onChange={(e) => setPainReported(e.target.checked)}
            />
            Pain Reported
          </label>
          {painReported && (
            <input
              type="text"
              placeholder="Pain location (e.g., knee, shoulder)"
              value={painLocation}
              onChange={(e) => setPainLocation(e.target.value)}
            />
          )}
        </div>

        <div className="form-group">
          <label>Form Level (1-5)</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                type="button"
                className={`rating-btn ${formRating === rating ? 'active' : ''}`}
                onClick={() => setFormRating(rating)}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Logging...' : 'Log Workout'}
        </button>
      </form>

      {alternative && (
        <div className="alternative-suggestion">
          <h4>💡 Alternative Suggestion</h4>
          <div className="alternative-card">
            <h5>{alternative.name_en || alternative.name_fa}</h5>
            <p className="alternative-reason">
              {alternative.reason_en || alternative.reason_fa}
            </p>
            <div className="alternative-details">
              <span>Target: {alternative.target_muscle_en || alternative.target_muscle_fa}</span>
              <span>Level: {alternative.level}</span>
              <span>Intensity: {alternative.intensity}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutLogger;



