import React, { useState, useEffect } from 'react';
import AnalogClock from './components/AnalogClock';
import TimeDisplay from './components/TimeDisplay';
import LearningModeContainer from './components/LearningMode';
import QuizMode from './components/QuizMode';
import PracticeMode from './components/PracticeMode';
import SettingsPanel from './components/SettingsPanel';
import { timeToEnglish } from './utils/timeToEnglish';
import { EnhancedTimeExpressions } from './utils/enhancedTimeExpressions';
import { useLearningMode } from './hooks/useLearningMode';
import { useAudio } from './hooks/useAudio';
import { LearningMode as LearningModeType, DifficultyLevel, LearningSettings } from './types/learning';
import './App.css';

function App() {
  const [currentTime, setCurrentTime] = useState({ hours: 3, minutes: 0 });
  const [timeDescription, setTimeDescription] = useState(timeToEnglish(3, 0));
  const [showSettings, setShowSettings] = useState(false);

  // Learning mode state
  const {
    mode,
    difficulty,
    currentSession,
    quizSession,
    currentExercise,
    getCurrentQuizQuestion,
    getQuizResults,
    startSession,
    setDifficulty,
    generatePracticeExercise,
    answerQuizQuestion,
    completeExercise
  } = useLearningMode();

  // Settings state
  const [settings, setSettings] = useState<LearningSettings>({
    mode: 'freeplay',
    difficulty: 'beginner',
    accent: 'us',
    soundEnabled: true,
    speechEnabled: true,
    showDigital: true,
    snapToMinute: false,
    showHints: true,
    autoAdvance: false
  });

  // Audio hook
  const { speak, playSound, isSupported } = useAudio(settings.soundEnabled, settings.accent);

  useEffect(() => {
    if (settings.speechEnabled && isSupported) {
      speak(timeDescription);
    }
  }, [timeDescription, settings.speechEnabled, isSupported, speak]);

  const handleTimeChange = (hours: number, minutes: number) => {
    setCurrentTime({ hours, minutes });

    // Update time description based on difficulty
    const expression = EnhancedTimeExpressions.getBestExpression(hours, minutes, difficulty);
    setTimeDescription(expression.text);

    // Play sound effect if enabled
    if (settings.soundEnabled) {
      playSound('click');
    }
  };

  const formatDigitalTime = (hours: number, minutes: number): string => {
    const displayHours = hours % 12 || 12;
    const period = hours >= 12 ? 'PM' : 'AM';
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleModeChange = (newMode: LearningModeType) => {
    setSettings({ ...settings, mode: newMode });
    startSession(newMode, difficulty);
  };

  const handleDifficultyChange = (newDifficulty: DifficultyLevel) => {
    setSettings({ ...settings, difficulty: newDifficulty });
    setDifficulty(newDifficulty);
  };

  const handleSettingsChange = (newSettings: Partial<LearningSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // Update learning mode if changed
    if (newSettings.mode && newSettings.mode !== mode) {
      startSession(newSettings.mode, updatedSettings.difficulty);
    }
  };

  const handleQuizAnswer = (answer: string) => {
    const isCorrect = answerQuizQuestion(answer);
    if (isCorrect) {
      playSound('success');
    } else {
      playSound('error');
    }
  };

  const handlePracticeComplete = (exerciseId: string, success: boolean, timeTaken: number) => {
    completeExercise(exerciseId, success, timeTaken);
    if (success) {
      playSound('complete');
    }
  };

  const renderLearningContent = () => {
    switch (mode) {
      case 'quiz':
        return (
          <QuizMode
            question={getCurrentQuizQuestion()}
            onAnswer={handleQuizAnswer}
            onSkip={() => {/* Handle quiz skip */}}
            isComplete={quizSession ? quizSession.currentQuestionIndex >= quizSession.questions.length : false}
            results={getQuizResults() || undefined}
            onRestart={() => startSession('quiz', difficulty)}
          />
        );

      case 'practice':
        return (
          <PracticeMode
            exercise={currentExercise}
            onExerciseComplete={handlePracticeComplete}
            onGenerateNewExercise={generatePracticeExercise}
            currentTime={currentTime}
          />
        );

      case 'learning':
        return (
          <div className="learning-content">
            <h3>📚 Learning Mode</h3>
            <p>Step-by-step tutorials coming soon!</p>
            <div className="tutorial-placeholder">
              <AnalogClock onTimeChange={handleTimeChange} />
              <TimeDisplay
                timeDescription={timeDescription}
                digitalTime={formatDigitalTime(currentTime.hours, currentTime.minutes)}
              />
            </div>
          </div>
        );

      default: // freeplay
        return (
          <>
            <AnalogClock onTimeChange={handleTimeChange} />
            <TimeDisplay
              timeDescription={timeDescription}
              digitalTime={settings.showDigital ? formatDigitalTime(currentTime.hours, currentTime.minutes) : undefined}
            />
          </>
        );
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="app-title">Learn to Tell Time</h1>
            <p className="app-subtitle">Interactive Clock Learning App</p>
          </div>
          <div className="header-controls">
            <button
              className="settings-button"
              onClick={() => setShowSettings(true)}
              aria-label="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      <main className="clock-app">
        <LearningModeContainer
          mode={mode}
          difficulty={difficulty}
          onModeChange={handleModeChange}
          onDifficultyChange={handleDifficultyChange}
        >
          <div className="learning-area">
            {renderLearningContent()}
          </div>
        </LearningModeContainer>
      </main>

      <footer className="app-footer">
        {mode === 'freeplay' ? (
          <p className="instructions">
            <strong>How to use:</strong> Click and drag the clock hands to change the time.
            The blue hand shows hours and the red hand shows minutes.
            {isSupported && settings.speechEnabled && " Listen to the time narration!"}
          </p>
        ) : (
          <p className="learning-progress">
            {currentSession && (
              <span>
                Session started: {currentSession.startTime.toLocaleTimeString()}
                {currentSession.exercises.length > 0 && ` | Exercises completed: ${currentSession.exercises.filter(e => e.completed).length}`}
              </span>
            )}
          </p>
        )}
      </footer>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
