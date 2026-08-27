/**
 * Voice Note Audio & Speech Playback Service (Universal Interface)
 * Platform-specific implementations are located in:
 * - voicePlaybackService.web.ts (Web browsers / Safari / Chrome)
 * - voicePlaybackService.native.ts (iOS & Android native)
 */

import { Platform } from 'react-native';

export class VoicePlaybackService {
  private static getDelegate(): any {
    if (Platform.OS === 'web') {
      const { VoicePlaybackService: WebService } = require('./voicePlaybackService.web');
      return WebService;
    } else {
      const { VoicePlaybackService: NativeService } = require('./voicePlaybackService.native');
      return NativeService;
    }
  }

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
    return await this.getDelegate().playVoice(text, options);
  }

  static async stopVoice(): Promise<void> {
    return await this.getDelegate().stopVoice();
  }

  static async isSpeaking(): Promise<boolean> {
    return await this.getDelegate().isSpeaking();
  }

  static async getAvailableVoices(): Promise<any[]> {
    return await this.getDelegate().getAvailableVoices();
  }
}
