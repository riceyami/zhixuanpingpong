import api from '@/services/api';

export interface ProfileResponse {
  userId: number;
  nickname: string;
  avatar: string | null;
  phone: string;
  phoneMasked: string;
}

export const fetchProfile = async () => {
  const res = await api.get<{ code: number; data: ProfileResponse }>('/api/profile/me');
  return res.data.data;
};

export const updateNickname = async (nickname: string) => {
  const res = await api.put<{ code: number; data: ProfileResponse }>('/api/profile/me', { nickname });
  return res.data.data;
};

export const updateAvatar = async (avatarUrl: string) => {
  const res = await api.put<{ code: number; data: ProfileResponse }>('/api/profile/avatar', { avatarUrl });
  return res.data.data;
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  await api.put('/api/profile/password', { oldPassword, newPassword });
};
