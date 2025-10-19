import React, { useState } from 'react';
import { LearningSettings, LearningMode, DifficultyLevel, AccentType } from '../types/learning';
import { useAudio } from '../hooks/useAudio';

interface SettingsPanelProps {
  settings: LearningSettings;
  onSettingsChange: (settings: Partial<LearningSettings>) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onClose
}) => {
  const [localSettings, setLocalSettings] = useState<LearningSettings>(settings);
  const { testAudio } = useAudio(localSettings.soundEnabled, localSettings.accent);

  const handleSettingChange = <K extends keyof LearningSettings>(
    key: K,
    value: LearningSettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange({ [key]: value });
  };

  const handleAudioTest = async () => {
    const isWorking = await testAudio();
    if (isWorking) {
      alert('Audio is working correctly!');
    } else {
      alert('Audio is not available or not working. Please check your browser settings.');
    }
  };

  const resetToDefaults = () => {
    const defaults: LearningSettings = {
      mode: 'freeplay',
      difficulty: 'beginner',
      accent: 'us',
      soundEnabled: true,
      speechEnabled: true,
      showDigital: true,
      snapToMinute: false,
      showHints: true,
      autoAdvance: false
    };
    setLocalSettings(defaults);
    onSettingsChange(defaults);
  };

  const learningModes: { value: LearningMode; label: string; description: string }[] = [
    { value: 'freeplay', label: 'Free Play', description: 'Explore time at your own pace' },
    { value: 'practice', label: 'Practice', description: 'Guided exercises to improve skills' },
    { value: 'quiz', label: 'Quiz', description: 'Test your knowledge' },
    { value: 'learning', label: 'Learning', description: 'Step-by-step tutorials' }
  ];

  const difficulties: { value: DifficultyLevel; label: string; color: string }[] = [
    { value: 'beginner', label: 'Beginner', color: '#27ae60' },
    { value: 'intermediate', label: 'Intermediate', color: '#f39c12' },
    { value: 'advanced', label: 'Advanced', color: '#e74c3c' }
  ];

  const accents: { value: AccentType; label: string; flag: string }[] = [
    { value: 'us', label: 'American English', flag: '🇺🇸' },
    { value: 'uk', label: 'British English', flag: '🇬🇧' }
  ];

  return (
    <div className="settings-panel-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-content">
          {/* Learning Mode */}
          <div className="setting-group">
            <h3>🎯 Learning Mode</h3>
            <div className="setting-options">
              {learningModes.map((mode) => (
                <label key={mode.value} className="setting-option">
                  <input
                    type="radio"
                    name="mode"
                    value={mode.value}
                    checked={localSettings.mode === mode.value}
                    onChange={(e) => handleSettingChange('mode', e.target.value as LearningMode)}
                  />
                  <div className="option-content">
                    <span className="option-label">{mode.label}</span>
                    <span className="option-description">{mode.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="setting-group">
            <h3>📈 Difficulty Level</h3>
            <div className="difficulty-selector">
              {difficulties.map((diff) => (
                <button
                  key={diff.value}
                  className={`difficulty-option ${localSettings.difficulty === diff.value ? 'active' : ''}`}
                  style={{
                    borderColor: localSettings.difficulty === diff.value ? diff.color : 'transparent',
                    backgroundColor: localSettings.difficulty === diff.value ? diff.color : 'transparent'
                  }}
                  onClick={() => handleSettingChange('difficulty', diff.value)}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Settings */}
          <div className="setting-group">
            <h3>🔊 Audio Settings</h3>
            <div className="setting-controls">
              <div className="toggle-setting">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={localSettings.soundEnabled}
                    onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-text">Sound Effects</span>
                </label>
              </div>

              <div className="toggle-setting">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={localSettings.speechEnabled}
                    onChange={(e) => handleSettingChange('speechEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-text">Voice Narration</span>
                </label>
              </div>

              <div className="accent-selector">
                <label>Accent:</label>
                <div className="accent-options">
                  {accents.map((accent) => (
                    <button
                      key={accent.value}
                      className={`accent-option ${localSettings.accent === accent.value ? 'active' : ''}`}
                      onClick={() => handleSettingChange('accent', accent.value)}
                    >
                      <span className="flag">{accent.flag}</span>
                      <span className="accent-label">{accent.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button className="test-audio-button" onClick={handleAudioTest}>
                🔊 Test Audio
              </button>
            </div>
          </div>

          {/* Display Settings */}
          <div className="setting-group">
            <h3>🖥️ Display Settings</h3>
            <div className="setting-controls">
              <div className="toggle-setting">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={localSettings.showDigital}
                    onChange={(e) => handleSettingChange('showDigital', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-text">Show Digital Time</span>
                </label>
              </div>

              <div className="toggle-setting">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={localSettings.snapToMinute}
                    onChange={(e) => handleSettingChange('snapToMinute', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-text">Snap to Minute</span>
                </label>
              </div>

              <div className="toggle-setting">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={localSettings.showHints}
                    onChange={(e) => handleSettingChange('showHints', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-text">Show Hints</span>
                </label>
              </div>

              <div className="toggle-setting">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={localSettings.autoAdvance}
                    onChange={(e) => handleSettingChange('autoAdvance', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-text">Auto-advance Questions</span>
                </label>
              </div>
            </div>
          </div>

          {/* Quiz Timer */}
          {localSettings.mode === 'quiz' && (
            <div className="setting-group">
              <h3>⏱️ Quiz Timer</h3>
              <div className="time-selector">
                <label>Time per question (seconds):</label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={localSettings.timeLimit || 60}
                  onChange={(e) => handleSettingChange('timeLimit', parseInt(e.target.value) || undefined)}
                  className="time-input"
                />
                <button
                  className="clear-button"
                  onClick={() => handleSettingChange('timeLimit', undefined)}
                >
                  No Limit
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button className="reset-button" onClick={resetToDefaults}>
            🔄 Reset to Defaults
          </button>
          <button className="save-button" onClick={onClose}>
            ✅ Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;