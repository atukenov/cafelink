'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';

interface UseAuthOptions {
  requiredRoles?: string[];
  redirectTo?: string;
}

export const useAuth = (options: UseAuthOptions = {}) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { requiredRoles = [], redirectTo = '/staff-login' } = options;

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        if (requiredRoles.length > 0) {
          router.push(redirectTo);
          return;
        }
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(userData);
      
      if (requiredRoles.length > 0 && !requiredRoles.includes(parsedUser.role)) {
        router.push(redirectTo);
        return;
      }

      setUser(parsedUser);
    } catch (err) {
      setError('Invalid user data');
      localStorage.removeItem('user');
      if (requiredRoles.length > 0) {
        router.push(redirectTo);
      }
    } finally {
      setLoading(false);
    }
  }, [router, redirectTo]);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('selectedShopId');
    setUser(null);
    router.push('/');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return {
    user,
    loading,
    error,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };
};
