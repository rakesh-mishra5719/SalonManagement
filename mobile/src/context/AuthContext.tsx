import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { Platform } from 'react-native';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<User>;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string; demoOtp?: string }>;
  registerClient: (data: { name: string; phone: string; password: string; otpCode: string }) => Promise<User>;
  registerOwner: (data: any) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'salon_auth_session';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore saved session if available
  useEffect(() => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      }
    } catch (err) {
      console.warn('Could not restore auth session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveUserSession = (userData: User) => {
    setUser(userData);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      }
    } catch (_) {}
  };

  const login = async (identifier: string, pass: string): Promise<User> => {
    const res = await api.login(identifier, pass);
    const loggedInUser: User = {
      id: res.id,
      name: res.name,
      phone: res.phone,
      email: res.email,
      role: res.role,
      salonId: res.salonId,
      salon: res.salon,
      token: res.token,
    };
    saveUserSession(loggedInUser);
    return loggedInUser;
  };

  const sendOtp = async (phone: string) => {
    return await api.sendOtp(phone);
  };

  const registerClient = async (data: { name: string; phone: string; password: string; otpCode: string }): Promise<User> => {
    const res = await api.registerClient(data);
    const clientUser: User = {
      id: res.id,
      name: res.name,
      phone: res.phone,
      email: res.email,
      role: 'CLIENT',
      token: res.token,
    };
    saveUserSession(clientUser);
    return clientUser;
  };

  const registerOwner = async (data: any): Promise<User> => {
    const res = await api.registerOwner(data);
    const ownerUser: User = {
      id: res.id,
      name: res.name,
      phone: res.phone,
      email: res.email,
      role: 'OWNER',
      salonId: res.salonId,
      salon: res.salon,
      token: res.token,
    };
    saveUserSession(ownerUser);
    return ownerUser;
  };

  const logout = () => {
    setUser(null);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (_) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        sendOtp,
        registerClient,
        registerOwner,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
