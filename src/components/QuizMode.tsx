import React, { useState, useEffect } from 'react';
import { QuizQuestion, DifficultyLevel } from '../types/learning';
import { useAudio } from '../hooks/useAudio';

interface QuizModeProps {
  question: QuizQuestion | null;
  onAnswer: (answer: string) => void;
  onSkip: () => void;
  isComplete: boolean;
  results?: {
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
    difficulty: DifficultyLevel;
    timeTaken: number;
  };
  onRestart: () => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({
  question,
  onAnswer,
  onSkip,
  isComplete,
  results,
  onRestart
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const { speak, playSound, isSupported } = useAudio();

  useEffect(() => {
    if (question && isSupported) {
      speak(question.questionText);
    }
  }, [question, isSupported, speak]);

  const handleAnswerSelect = (answer: string) => {
    if (hasAnswered) return;

    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !question || hasAnswered) return;

    setHasAnswered(true);
    const isCorrect = selectedAnswer === question.correctAnswer;

    if (isCorrect) {
      playSound('success');
    } else {
      playSound('error');
    }

    onAnswer(selectedAnswer);
    setShowExplanation(true);

    if (isSupported) {
      speak(isCorrect ? 'Correct!' : 'Incorrect. Try again!');
      if (question.explanation) {
        setTimeout(() => speak(question.explanation!), 1000);
      }
    }
  };

  const handleNext = () => {
    setSelectedAnswer('');
    setShowHint(false);
    setShowExplanation(false);
    setHasAnswered(false);
    onSkip(); // This advances to next question
  };

  const handleShowHint = () => {
    setShowHint(true);
    if (question?.hints && question.hints.length > 0 && isSupported) {
      speak(question.hints[0]);
    }
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return '🏆 Excellent! You\'re a time expert!';
    if (percentage >= 70) return '🌟 Great job! Keep practicing!';
    if (percentage >= 50) return '👍 Good effort! Room for improvement!';
    return '💪 Keep trying! Practice makes perfect!';
  };

  if (isComplete && results) {
    return (
      <div className="quiz-results">
        <div className="results-header">
          <h2>Quiz Complete! 🎉</h2>
          <div className="score-display">
            <div className="percentage-circle">
              <span className="percentage">{results.percentage}%</span>
            </div>
          </div>
          <p className="score-message">{getScoreMessage(results.percentage)}</p>
        </div>

        <div className="results-stats">
          <div className="stat-item">
            <span className="stat-label">Correct Answers:</span>
            <span className="stat-value">{results.correctAnswers} / {results.totalQuestions}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Time Taken:</span>
            <span className="stat-value">{Math.round(results.timeTaken / 60)}m {results.timeTaken % 60}s</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Difficulty:</span>
            <span className="stat-value">{results.difficulty}</span>
          </div>
        </div>

        <div className="results-actions">
          <button className="primary-button" onClick={onRestart}>
            🔄 Try Again
          </button>
          <button className="secondary-button" onClick={() => window.location.reload()}>
            🏠 Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="quiz-loading">
        <p>Loading quiz...</p>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h3>{question.questionText}</h3>
        <div className="quiz-controls">
          <button
            className="hint-button"
            onClick={handleShowHint}
            disabled={showHint}
          >
            💡 {showHint ? 'Hint Used' : 'Get Hint'}
          </button>
        </div>
      </div>

      {showHint && question.hints && (
        <div className="hint-box">
          <p><strong>Hint:</strong> {question.hints[0]}</p>
        </div>
      )}

      <div className="question-area">
        {/* This is where the clock would be displayed */}
        <div className="clock-placeholder">
          <p>🕐 Clock showing time</p>
          {/* The actual clock component would be rendered here */}
        </div>
      </div>

      <div className="answer-options">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === question.correctAnswer;
          const showCorrect = hasAnswered && isCorrect;
          const showIncorrect = hasAnswered && isSelected && !isCorrect;

          return (
            <button
              key={index}
              className={`answer-option ${isSelected ? 'selected' : ''} ${showCorrect ? 'correct' : ''} ${showIncorrect ? 'incorrect' : ''}`}
              onClick={() => handleAnswerSelect(option)}
              disabled={hasAnswered}
            >
              <span className="option-text">{option}</span>
              {showCorrect && <span className="result-icon">✓</span>}
              {showIncorrect && <span className="result-icon">✗</span>}
            </button>
          );
        })}
      </div>

      {showExplanation && question.explanation && (
        <div className="explanation-box">
          <p><strong>Explanation:</strong> {question.explanation}</p>
        </div>
      )}

      <div className="quiz-actions">
        {!hasAnswered ? (
          <>
            <button
              className="primary-button"
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
            >
              Submit Answer
            </button>
            <button className="secondary-button" onClick={onSkip}>
              Skip Question
            </button>
          </>
        ) : (
          <button className="primary-button" onClick={handleNext}>
            Next Question →
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizMode;