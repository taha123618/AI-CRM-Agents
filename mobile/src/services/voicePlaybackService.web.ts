/**
 * Voice Note Audio & Speech Playback Service - Web Implementation
 * 100% Native Web SpeechSynthesis API (Chrome, Safari, Firefox, Edge, Mobile Web)
 */

export class VoicePlaybackService {
  private static isPlaying = false;
  private static activeUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Speak text aloud using HTML5 Web Speech Synthesis API
   */
  static async playVoice(
    text: string,
    options?: {
      onStart?: () => void;
      onDone?: () => void;
      onStopped?: () => void;
      onError?: (error: Error) => void;
      rate?: number;
      pitch?: number;
      language?: string;
      voice?: string;
    }
  ): Promise<void> {
    try {
      await this.stopVoice();

      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        if (options?.onDone) options.onDone();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate ?? 1.0;
      utterance.pitch = options?.pitch ?? 1.0;
      utterance.lang = options?.language || 'en-US';

      utterance.onstart = () => {
        VoicePlaybackService.isPlaying = true;
        if (options?.onStart) options.onStart();
      };

      utterance.onend = () => {
        VoicePlaybackService.isPlaying = false;
        VoicePlaybackService.activeUtterance = null;
        if (options?.onDone) options.onDone();
      };

      utterance.onerror = (e) => {
        VoicePlaybackService.isPlaying = false;
        VoicePlaybackService.activeUtterance = null;
        if (options?.onStopped) options.onStopped();
      };

      this.activeUtterance = utterance;
      this.isPlaying = true;
      window.speechSynthesis.speak(utterance);
    } catch (e: any) {
      this.isPlaying = false;
      if (options?.onStopped) options.onStopped();
    }
  }

  /**
   * Stop web speech audio immediately
   */
  static async stopVoice(): Promise<void> {
    this.isPlaying = false;
    this.activeUtterance = null;
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
  }

  /**
   * Check if web speech is speaking
   */
  static async isSpeaking(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        return window.speechSynthesis.speaking;
      }
    } catch {}
    return this.isPlaying;
  }

  /**
   * Get available web voices
   */
  static async getAvailableVoices(): Promise<any[]> {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        return window.speechSynthesis.getVoices();
      }
    } catch {}
    return [];
  }
}
