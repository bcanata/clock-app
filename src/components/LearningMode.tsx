import React from 'react';
import { LearningMode, DifficultyLevel } from '../types/learning';

interface LearningModeProps {
  mode: LearningMode;
  difficulty: DifficultyLevel;
  onModeChange: (mode: LearningMode) => void;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  children: React.ReactNode;
}

export const LearningModeContainer: React.FC<LearningModeProps> = ({
  mode,
  difficulty,
  onModeChange,
  onDifficultyChange,
  children
}) => {
  const getModeIcon = (mode: LearningMode) => {
    switch (mode) {
      case 'freeplay': return '🕐';
      case 'practice': return '🎯';
      case 'quiz': return '📝';
      case 'learning': return '📚';
      default: return '🕐';
    }
  };

  const getModeDescription = (mode: LearningMode) => {
    switch (mode) {
      case 'freeplay':
        return 'Move the clock hands freely to explore different times';
      case 'practice':
        return 'Follow instructions to set specific times';
      case 'quiz':
        return 'Test your knowledge with time-telling questions';
      case 'learning':
        return 'Step-by-step guidance for reading clocks';
      default:
        return '';
    }
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'beginner': return '#27ae60';
      case 'intermediate': return '#f39c12';
      case 'advanced': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="learning-mode-container">
      {/* Mode Selection */}
      <div className="mode-selector">
        <div className="mode-tabs">
          {(['freeplay', 'practice', 'quiz', 'learning'] as LearningMode[]).map((modeOption) => (
            <button
              key={modeOption}
              className={`mode-tab ${mode === modeOption ? 'active' : ''}`}
              onClick={() => onModeChange(modeOption)}
            >
              <span className="mode-icon">{getModeIcon(modeOption)}</span>
              <span className="mode-label">
                {modeOption.charAt(0).toUpperCase() + modeOption.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Description */}
      <div className="mode-description">
        <p>{getModeDescription(mode)}</p>
      </div>

      {/* Difficulty Selector */}
      {(mode === 'practice' || mode === 'quiz') && (
        <div className="difficulty-selector">
          <label className="difficulty-label">
            Difficulty Level:
            <div className="difficulty-buttons">
              {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((level) => (
                <button
                  key={level}
                  className={`difficulty-button ${difficulty === level ? 'active' : ''}`}
                  style={{
                    borderColor: difficulty === level ? getDifficultyColor(level) : 'transparent',
                    backgroundColor: difficulty === level ? getDifficultyColor(level) : 'transparent'
                  }}
                  onClick={() => onDifficultyChange(level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </label>
        </div>
      )}

      {/* Main Content Area */}
      <div className="learning-content">
        {children}
      </div>

      {/* Progress Indicator */}
      {(mode === 'practice' || mode === 'quiz') && (
        <div className="progress-indicator">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: '0%', // This will be updated based on actual progress
                backgroundColor: getDifficultyColor(difficulty)
              }}
            />
          </div>
          <span className="progress-text">Progress: 0%</span>
        </div>
      )}
    </div>
  );
};

export default LearningModeContainer;