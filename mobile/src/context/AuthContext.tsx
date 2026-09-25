import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { Platform } from 'react-native';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<User>;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string; demoOtp?: string }>;
  registerClient: (data: { name: string; email?: string; phone: string; password: string; otpCode?: string }) => Promise<User>;
  registerOwner: (data: any) => Promise<User>;
  logout: () => void;
  updateUserSalon: (updatedSalon: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'salon_auth_session';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Synchronous web hydration: loads user on first render without screen flicker
  const [user, setUser] = useState<User | null>(() => {
    const sync = storage.getSync(AUTH_STORAGE_KEY);
    if (sync) {
      try {
        return JSON.parse(sync);
      } catch (_) {}
    }
    return null;
  });

  // On Web, state is already known synchronously; on Native, wait for async restore
  const [loading, setLoading] = useState<boolean>(() => {
    if (Platform.OS === 'web') {
      return false;
    }
    return true;
  });

  // Universal session restoration (Native iOS/Android/Expo Go + Web verification)
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const stored = await storage.getItem(AUTH_STORAGE_KEY);
        if (stored && isMounted) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        }
      } catch (err) {
        console.warn('Could not restore auth session:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const saveUserSession = (userData: User) => {
    setUser(userData);
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData)).catch((err) => {
      console.warn('Failed to persist session:', err);
    });
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

  const registerClient = async (data: { name: string; email?: string; phone: string; password: string; otpCode?: string }): Promise<User> => {
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
    storage.removeItem(AUTH_STORAGE_KEY).catch((err) => {
      console.warn('Failed to remove auth session:', err);
    });
  };

  const updateUserSalon = (updatedSalon: any) => {
    if (!user) return;
    const existingSalon = user.salon || {};
    const newSalon = { ...existingSalon, ...updatedSalon };
    const updatedUser: User = { ...user, salon: newSalon };
    saveUserSession(updatedUser);
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
        updateUserSalon,
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
