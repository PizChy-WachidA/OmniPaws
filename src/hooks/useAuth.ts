import { useState } from 'react';
import { User } from '@/types';
import { MOCK_USER } from '@/constants/mockData';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('omnipaws_user');
    return stored ? (JSON.parse(stored) as User) : null;
  });

  const login = () => {
    localStorage.setItem('omnipaws_user', JSON.stringify(MOCK_USER));
    setUser(MOCK_USER);
  };

  const logout = () => {
    localStorage.removeItem('omnipaws_user');
    setUser(null);
  };

  return { user, login, logout };
};
