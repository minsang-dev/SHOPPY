import { create } from 'zustand';
import type { WebRTCSession } from '../../../shared/api/types';

interface SessionState {
  session: WebRTCSession | null;
  roomId: number | null;

  setSession: (roomId: number, session: WebRTCSession) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  roomId: null,

  setSession: (roomId: number, session: WebRTCSession) => {
    set({ roomId, session });
  },

  clearSession: () => {
    set({ session: null, roomId: null });
  },
}));
