/**
 * Voice Notes & Activity Logging Store
 */

import { create } from 'zustand';
import { VoiceNote } from '@/types';
import { api } from '@/services/api';

interface VoiceNotesState {
  notes: VoiceNote[];
  isLoading: boolean;
  isRecording: boolean;
  recordingSeconds: number;
  fetchNotes: () => Promise<void>;
  saveNote: (note: Omit<VoiceNote, 'id' | 'created_at' | 'is_synced'>) => Promise<VoiceNote>;
  setIsRecording: (recording: boolean) => void;
  setRecordingSeconds: (seconds: number | ((prev: number) => number)) => void;
}

export const useVoiceNotesStore = create<VoiceNotesState>((set) => ({
  notes: [],
  isLoading: false,
  isRecording: false,
  recordingSeconds: 0,

  fetchNotes: async () => {
    set({ isLoading: true });
    try {
      const notes = await api.getVoiceNotes();
      set({ notes, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  saveNote: async (noteData) => {
    set({ isLoading: true });
    const saved = await api.saveVoiceNote(noteData);
    set((state) => ({
      notes: [saved, ...state.notes],
      isLoading: false,
      isRecording: false,
      recordingSeconds: 0,
    }));
    return saved;
  },

  setIsRecording: (recording) => set({ isRecording: recording }),
  setRecordingSeconds: (val) =>
    set((state) => ({
      recordingSeconds: typeof val === 'function' ? val(state.recordingSeconds) : val,
    })),
}));
