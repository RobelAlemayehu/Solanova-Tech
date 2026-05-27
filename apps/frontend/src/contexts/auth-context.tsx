'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

export interface User {
  _id: string;
  email: string;
  role: 'admin' | 'owner' | 'user';
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    setIsLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('proplist_token') : null;
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get<User>('/auth/me');
      setUser(response.data);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const logout = useCallback(() => {
    localStorage.removeItem('proplist_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, refetch: fetchMe, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
