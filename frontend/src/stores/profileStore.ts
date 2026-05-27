import { create } from 'zustand';

interface ProfileState {
  userId: number;
  nickname: string;
  avatar: string | null;
  phoneMasked: string;

  setProfile: (data: { userId: number; nickname: string; avatar: string | null; phoneMasked: string }) => void;
  updateNickname: (nickname: string) => void;
  updateAvatar: (avatar: string | null) => void;
  resetProfile: () => void;
}

export const useProfileStore = create<ProfileState>()((set) => ({
  userId: 0,
  nickname: '',
  avatar: null,
  phoneMasked: '',

  setProfile: (data) =>
    set({ userId: data.userId, nickname: data.nickname, avatar: data.avatar, phoneMasked: data.phoneMasked }),

  updateNickname: (nickname) => set({ nickname }),

  updateAvatar: (avatar) => set({ avatar }),

  resetProfile: () => set({ userId: 0, nickname: '', avatar: null, phoneMasked: '' }),
}));
