import { create } from 'zustand';

type MediaMap = Record<string, boolean>;

interface RemoteMediaControlState {
  mutedByNickname: MediaMap;
  hiddenByNickname: MediaMap;
  toggleMute: (nickname: string) => void;
  toggleHide: (nickname: string) => void;
  setMute: (nickname: string, value: boolean) => void;
  setHide: (nickname: string, value: boolean) => void;
}

export const useRemoteMediaControlStore = create<RemoteMediaControlState>((set) => ({
  mutedByNickname: {},
  hiddenByNickname: {},
  toggleMute: (nickname) =>
    set((state) => ({
      mutedByNickname: {
        ...state.mutedByNickname,
        [nickname]: !state.mutedByNickname[nickname],
      },
    })),
  toggleHide: (nickname) =>
    set((state) => ({
      hiddenByNickname: {
        ...state.hiddenByNickname,
        [nickname]: !state.hiddenByNickname[nickname],
      },
    })),
  setMute: (nickname, value) =>
    set((state) => ({
      mutedByNickname: {
        ...state.mutedByNickname,
        [nickname]: value,
      },
    })),
  setHide: (nickname, value) =>
    set((state) => ({
      hiddenByNickname: {
        ...state.hiddenByNickname,
        [nickname]: value,
      },
    })),
}));
