import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  oauthLogin: (data: {
    provider: 'GOOGLE' | 'FACEBOOK';
    email?: string;
    name: string;
    avatar?: string;
    providerId: string;
  }) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<{ devOtp?: string; message: string }>;
  verifyPhoneOtp: (phone: string, code: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const initAuth = async () => {
      try {
        await api.loadTokens();
        if (api.getAccessToken()) {
          const profile = await api.getMe();
          if (active) setUser(profile);
        }
      } catch {
        await api.clearTokens();
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    initAuth();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login({ email, password });
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    setIsLoading(true);
    try {
      const data = await api.register({ name, email, password, phone });
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const oauthLogin = async (data: {
    provider: 'GOOGLE' | 'FACEBOOK';
    email?: string;
    name: string;
    avatar?: string;
    providerId: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.oauthLogin(data);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const sendPhoneOtp = async (phone: string) => {
    const res = await api.sendPhoneOtp(phone);
    return { devOtp: res.devOtp, message: res.message };
  };

  const verifyPhoneOtp = async (phone: string, code: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await api.verifyPhoneOtp({ phone, code, name });
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.getMe();
      setUser(profile);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        oauthLogin,
        sendPhoneOtp,
        verifyPhoneOtp,
        logout,
        refreshProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
