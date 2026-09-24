import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Salon, QueueEntry, SalonQueueDetails, UserRole } from '../types';
import { api } from '../services/api';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  salons: Salon[];
  loading: boolean;
  refreshSalons: () => Promise<void>;
  selectedSalon: Salon | null;
  setSelectedSalon: (salon: Salon | null) => void;
  activeBooking: QueueEntry | null;
  setActiveBooking: (booking: QueueEntry | null) => void;
  ownerSalonId: number;
  setOwnerSalonId: (id: number) => void;
  ownerQueueDetails: SalonQueueDetails | null;
  refreshOwnerQueue: () => Promise<void>;
  userLocation: { lat: number; lng: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('customer');
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [activeBooking, setActiveBooking] = useState<QueueEntry | null>(null);
  const [ownerSalonId, setOwnerSalonId] = useState<number>(1);
  const [ownerQueueDetails, setOwnerQueueDetails] = useState<SalonQueueDetails | null>(null);

  // Default coordinate (Bengaluru central hub)
  const userLocation = { lat: 12.9716, lng: 77.5946 };

  const refreshSalons = useCallback(async () => {
    try {
      const data = await api.getNearbySalons(userLocation.lat, userLocation.lng);
      setSalons(data);
      if (data.length > 0 && !selectedSalon) {
        setSelectedSalon(data[0]);
      }
    } catch (err) {
      console.error('Failed to load salons:', err);
    } finally {
      setLoading(false);
    }
  }, [userLocation.lat, userLocation.lng]);

  const refreshOwnerQueue = useCallback(async () => {
    if (!ownerSalonId) return;
    try {
      const details = await api.getSalonQueue(ownerSalonId);
      setOwnerQueueDetails(details);
    } catch (err) {
      console.error('Failed to load owner queue:', err);
    }
  }, [ownerSalonId]);

  useEffect(() => {
    refreshSalons();
  }, [refreshSalons]);

  useEffect(() => {
    if (role === 'owner') {
      refreshOwnerQueue();
    }
  }, [role, ownerSalonId, refreshOwnerQueue]);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        salons,
        loading,
        refreshSalons,
        selectedSalon,
        setSelectedSalon,
        activeBooking,
        setActiveBooking,
        ownerSalonId,
        setOwnerSalonId,
        ownerQueueDetails,
        refreshOwnerQueue,
        userLocation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
