import { useCallback, useEffect, useState } from 'react';
import { audioController } from '../utils/speechSynthesis';
import { AccentType } from '../types/learning';

export const useAudio = (enabled: boolean = true, accent: AccentType = 'us') => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setIsSupported(audioController.isEnabled());
    audioController.setEnabled(enabled);
    audioController.setAccent(accent);
  }, [enabled, accent]);

  const speak = useCallback(async (text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
  }) => {
    if (!isSupported) return;

    try {
      setIsSpeaking(true);
      await audioController.speak(text, { ...options, accent });
    } catch (error) {
      console.error('Speech failed:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [isSupported, accent]);

  const stop = useCallback(() => {
    audioController.stop();
    setIsSpeaking(false);
  }, []);

  const playSound = useCallback((type: 'click' | 'success' | 'error' | 'complete') => {
    audioController.playSound(type);
  }, []);

  const testAudio = useCallback(async () => {
    return await audioController.testAudio();
  }, []);

  return {
    isSupported,
    isSpeaking,
    speak,
    stop,
    playSound,
    testAudio
  };
};