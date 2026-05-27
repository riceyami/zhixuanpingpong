'use client';

import { useEffect } from 'react';
import { useProfileStore } from '@/stores/profileStore';
import { fetchProfile } from '@/api/profile';

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setProfile = useProfileStore((s) => s.setProfile);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchProfile()
        .then(setProfile)
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
        });
    }
  }, [setProfile]);

  return <>{children}</>;
};

export default AuthInitializer;
