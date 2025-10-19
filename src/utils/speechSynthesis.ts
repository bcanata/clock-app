import { AccentType } from '../types/learning';

export class AudioController {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private enabled: boolean = true;
  private accent: AccentType = 'us';

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();

    // Reload voices when they change
    this.synth.addEventListener('voiceschanged', () => {
      this.voices = this.synth.getVoices();
    });
  }

  private getVoiceForAccent(accent: AccentType): SpeechSynthesisVoice | null {
    const accentMap = {
      'us': ['en-US', 'English (United States)', 'American English'],
      'uk': ['en-GB', 'English (United Kingdom)', 'British English']
    };

    const preferredAccents = accentMap[accent];

    // Try to find exact match first
    for (const preferred of preferredAccents) {
      const voice = this.voices.find(v =>
        v.lang === preferred ||
        v.name.includes(preferred) ||
        v.name.includes('English')
      );
      if (voice) return voice;
    }

    // Fallback to any English voice
    return this.voices.find(v => v.lang.startsWith('en')) || null;
  }

  speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    accent?: AccentType;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.enabled || !this.synth) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.getVoiceForAccent(options?.accent || this.accent);

      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = options?.rate || 0.9;
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 0.8;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);

      this.synth.speak(utterance);
    });
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  isEnabled(): boolean {
    return this.enabled && 'speechSynthesis' in window;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  setAccent(accent: AccentType) {
    this.accent = accent;
  }

  // Play a sound effect for interactions
  playSound(type: 'click' | 'success' | 'error' | 'complete'): void {
    if (!this.enabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'click':
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
        break;

      case 'success':
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.15;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;

      case 'error':
        oscillator.frequency.value = 300;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
        break;

      case 'complete':
        oscillator.frequency.value = 1000;
        gainNode.gain.value = 0.2;
        oscillator.start();
        oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.2);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
    }
  }

  // Test audio functionality
  async testAudio(): Promise<boolean> {
    try {
      await this.speak('Test audio', { accent: this.accent });
      return true;
    } catch (error) {
      console.error('Audio test failed:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const audioController = new AudioController();