import { create } from 'zustand';

interface MediaControlState {
  micOn: boolean;
  camOn: boolean;
  setMicOn: (value: boolean) => void;
  setCamOn: (value: boolean) => void;
  toggleMic: () => void;
  toggleCam: () => void;
}

export const useMediaControlStore = create<MediaControlState>((set) => ({
  micOn: true,
  camOn: true,
  setMicOn: (value) => set({ micOn: value }),
  setCamOn: (value) => set({ camOn: value }),
  toggleMic: () => set((state) => ({ micOn: !state.micOn })),
  toggleCam: () => set((state) => ({ camOn: !state.camOn })),
}));
