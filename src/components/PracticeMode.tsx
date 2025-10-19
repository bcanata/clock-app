import React, { useState, useEffect } from 'react';
import { PracticeExercise, DifficultyLevel } from '../types/learning';
import { useAudio } from '../hooks/useAudio';
import { EnhancedTimeExpressions } from '../utils/enhancedTimeExpressions';

interface PracticeModeProps {
  exercise: PracticeExercise | null;
  onExerciseComplete: (exerciseId: string, success: boolean, timeTaken: number) => void;
  onGenerateNewExercise: () => void;
  currentTime: { hours: number; minutes: number };
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  exercise,
  onExerciseComplete,
  onGenerateNewExercise,
  currentTime
}) => {
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const { speak, playSound, isSupported } = useAudio();

  useEffect(() => {
    if (exercise) {
      setStartTime(new Date());
      setAttempts(0);
      setShowHint(false);
      setShowSuccess(false);

      if (isSupported) {
        speak(exercise.instruction);
      }
    }
  }, [exercise, isSupported, speak]);

  const checkAnswer = () => {
    if (!exercise || showSuccess) return;

    const timeTaken = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const isCorrect =
      currentTime.hours === exercise.targetTime.hours &&
      currentTime.minutes === exercise.targetTime.minutes;

    if (isCorrect) {
      setShowSuccess(true);
      playSound('success');
      onExerciseComplete(exercise.id, true, timeTaken);

      if (isSupported) {
        speak('Excellent! You got it right!');
      }
    } else {
      playSound('error');
      if (isSupported) {
        speak('Not quite right. Try again!');
      }

      // Show hint after 2 failed attempts
      if (newAttempts >= 2 && !showHint) {
        setShowHint(true);
        if (exercise.hint && isSupported) {
          setTimeout(() => speak(exercise.hint!), 1000);
        }
      }
    }
  };

  const handleShowHint = () => {
    setShowHint(true);
    if (exercise?.hint && isSupported) {
      speak(exercise.hint);
    }
  };

  const getNextExercise = () => {
    setShowSuccess(false);
    onGenerateNewExercise();
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'beginner': return '#27ae60';
      case 'intermediate': return '#f39c12';
      case 'advanced': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getTimeDifference = () => {
    if (!exercise) return { hours: 0, minutes: 0 };

    const hourDiff = Math.abs(currentTime.hours - exercise.targetTime.hours);
    const minuteDiff = Math.abs(currentTime.minutes - exercise.targetTime.minutes);

    return { hours: hourDiff, minutes: minuteDiff };
  };

  if (!exercise) {
    return (
      <div className="practice-loading">
        <p>Loading exercise...</p>
      </div>
    );
  }

  const { hours: hourDiff, minutes: minuteDiff } = getTimeDifference();

  return (
    <div className="practice-container">
      <div className="practice-header">
        <div className="exercise-info">
          <span
            className="difficulty-badge"
            style={{ backgroundColor: getDifficultyColor(exercise.type as DifficultyLevel) }}
          >
            {exercise.type}
          </span>
          <span className="attempt-counter">
            Attempts: {attempts}
          </span>
        </div>
      </div>

      <div className="instruction-panel">
        <h3 className="instruction-text">
          🎯 {exercise.instruction}
        </h3>

        {showHint && exercise.hint && (
          <div className="hint-panel">
            <p><strong>💡 Hint:</strong> {exercise.hint}</p>
          </div>
        )}
      </div>

      <div className="target-display">
        <div className="target-time">
          <h4>Target Time:</h4>
          <div className="digital-target">
            {exercise.targetTime.hours % 12 || 12}:{exercise.targetTime.minutes.toString().padStart(2, '0')}
          </div>
          <div className="expressions">
            {EnhancedTimeExpressions.getAllExpressions(
              exercise.targetTime.hours,
              exercise.targetTime.minutes
            ).slice(0, 3).map((expr, index) => (
              <div key={index} className="time-expression">
                "{expr.text}"
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="comparison-panel">
        <div className="current-time-display">
          <h4>Your Time:</h4>
          <div className="digital-current">
            {currentTime.hours % 12 || 12}:{currentTime.minutes.toString().padStart(2, '0')}
          </div>
        </div>

        {!showSuccess && (hourDiff > 0 || minuteDiff > 0) && (
          <div className="difference-display">
            <p>
              {hourDiff > 0 && `${hourDiff} hour${hourDiff > 1 ? 's' : ''} `}
              {minuteDiff > 0 && `${minuteDiff} minute${minuteDiff > 1 ? 's' : ''} `}
              off
            </p>
          </div>
        )}
      </div>

      {showSuccess && (
        <div className="success-message">
          <h3>🎉 Excellent Work!</h3>
          <p>You set the clock correctly!</p>
          <div className="success-stats">
            <span>Time taken: {Math.round((new Date().getTime() - startTime.getTime()) / 1000)}s</span>
            <span>Attempts: {attempts}</span>
          </div>
        </div>
      )}

      <div className="practice-actions">
        {!showSuccess ? (
          <>
            <button
              className="primary-button"
              onClick={checkAnswer}
            >
              ✓ Check Answer
            </button>
            <button
              className="secondary-button"
              onClick={handleShowHint}
              disabled={showHint}
            >
              💡 {showHint ? 'Hint Shown' : 'Get Hint'}
            </button>
            <button
              className="secondary-button"
              onClick={onGenerateNewExercise}
            >
              ↻ Skip Exercise
            </button>
          </>
        ) : (
          <button
            className="primary-button"
            onClick={getNextExercise}
          >
            Next Exercise →
          </button>
        )}
      </div>

      <div className="progress-indicator">
        <div className="exercise-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: '0%' }} // This would be updated based on actual progress
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeMode;