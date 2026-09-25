import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Salon, QueueEntry, SalonQueueDetails, UserRole } from '../types';
import { api } from '../services/api';
import { Platform } from 'react-native';
import { storage } from '../services/storage';
import * as Location from 'expo-location';

import { useAuth } from './AuthContext';

export const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
};

const SALON_PHOTO_STORAGE_PREFIX = 'salon_custom_photo_';
const SALON_DETAILS_OVERRIDE_PREFIX = 'salon_details_override_';

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
  gpsActive: boolean;
  requestAndFetchUserLocation: () => Promise<{ lat: number; lng: number } | null>;
  updateSalonPhoto: (salonId: number, imageUri: string | null) => Promise<void>;
  updateSalonDetails: (salonId: number, details: Partial<Salon>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const BOOKING_STORAGE_KEY = 'salon_active_booking_pass';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(() => user?.role || 'CLIENT');
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);

  // Synchronous web hydration for active booking
  const [activeBooking, setActiveBookingState] = useState<QueueEntry | null>(() => {
    const sync = storage.getSync(BOOKING_STORAGE_KEY);
    if (sync) {
      try {
        return JSON.parse(sync);
      } catch (_) {}
    }
    return null;
  });

  // Universal restoration for native mobile platforms
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stored = await storage.getItem(BOOKING_STORAGE_KEY);
        if (stored && isMounted) {
          setActiveBookingState(JSON.parse(stored));
        }
      } catch (_) {}
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const setActiveBooking = (booking: QueueEntry | null) => {
    setActiveBookingState(booking);
    if (booking) {
      storage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(booking)).catch(() => {});
    } else {
      storage.removeItem(BOOKING_STORAGE_KEY).catch(() => {});
    }
  };

  const [ownerSalonId, setOwnerSalonId] = useState<number>(() => user?.salonId || 1);
  const [ownerQueueDetails, setOwnerQueueDetails] = useState<SalonQueueDetails | null>(null);

  // Sync role and ownerSalonId when auth user changes
  useEffect(() => {
    if (user) {
      setRole(user.role);
      if (user.salonId) {
        setOwnerSalonId(user.salonId);
      }
    }
  }, [user]);

  // Real GPS coordinates (Default: Central Bengaluru Hub if permission not granted yet)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.5946,
  });
  const [gpsActive, setGpsActive] = useState<boolean>(false);

  // Auto-request location access from user on app open & login
  const requestAndFetchUserLocation = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const newCoords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setUserLocation(newCoords);
        setGpsActive(true);
        return newCoords;
      }
    } catch (err) {
      console.warn('Real GPS auto-detection error:', err);
      // Web fallback
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const webCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(webCoords);
            setGpsActive(true);
          },
          () => {}
        );
      }
    }
    return null;
  }, []);

  // Update salon photo (persisted in universal storage)
  const updateSalonPhoto = useCallback(async (salonId: number, imageUri: string | null) => {
    try {
      const storageKey = SALON_PHOTO_STORAGE_PREFIX + salonId;
      if (imageUri) {
        await storage.setItem(storageKey, imageUri);
      } else {
        await storage.removeItem(storageKey);
      }

      setSalons((prev) =>
        prev.map((s) => (s.id === salonId ? { ...s, imageUrl: imageUri || undefined } : s))
      );
    } catch (err) {
      console.warn('Failed to update salon photo:', err);
    }
  }, []);

  // Update salon details (persisted in universal storage + backend API)
  const updateSalonDetails = useCallback(async (salonId: number, details: Partial<Salon>) => {
    try {
      const storageKey = SALON_DETAILS_OVERRIDE_PREFIX + salonId;
      const existingRaw = await storage.getItem(storageKey);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      const merged = { ...existing, ...details };
      await storage.setItem(storageKey, JSON.stringify(merged));

      setSalons((prev) =>
        prev.map((s) => (s.id === salonId ? { ...s, ...details } : s))
      );

      setSelectedSalon((prev) => (prev && prev.id === salonId ? { ...prev, ...details } : prev));

      // Synchronize with API backend
      await api.updateSalonDetails(salonId, details);
    } catch (err) {
      console.warn('Failed to update salon details:', err);
    }
  }, []);

  const refreshSalons = useCallback(async () => {
    try {
      const rawData = await api.getNearbySalons(userLocation.lat, userLocation.lng);

      // 1. Enrich salons with real distance from user GPS, custom photos, and details overrides
      const enrichedSalons: Salon[] = await Promise.all(
        rawData.map(async (salon) => {
          let customImage = salon.imageUrl;
          let detailsOverride: Partial<Salon> = {};
          try {
            const savedPhoto = await storage.getItem(SALON_PHOTO_STORAGE_PREFIX + salon.id);
            if (savedPhoto) {
              customImage = savedPhoto;
            }
            const savedDetails = await storage.getItem(SALON_DETAILS_OVERRIDE_PREFIX + salon.id);
            if (savedDetails) {
              detailsOverride = JSON.parse(savedDetails);
            }
          } catch (_) {}

          const mergedSalon = {
            ...salon,
            ...detailsOverride,
            imageUrl: customImage || detailsOverride.imageUrl,
          };

          const realDistance = calculateDistanceKm(
            userLocation.lat,
            userLocation.lng,
            mergedSalon.latitude,
            mergedSalon.longitude
          );

          return {
            ...mergedSalon,
            distanceKm: realDistance,
          };
        })
      );

      // 2. USER REQUIREMENT: Always show nearest salon and least waiting on top
      enrichedSalons.sort((a, b) => {
        const distA = a.distanceKm ?? 999;
        const distB = b.distanceKm ?? 999;
        const waitA = a.totalWaitTimeMinutes ?? (a.waitingCount ? a.waitingCount * 20 : 0);
        const waitB = b.totalWaitTimeMinutes ?? (b.waitingCount ? b.waitingCount * 20 : 0);

        // Proximity has primary priority; if within 2.5 km, least waiting time takes priority
        if (Math.abs(distA - distB) > 2.5) {
          return distA - distB;
        }
        return distA * 10 + waitA - (distB * 10 + waitB);
      });

      setSalons(enrichedSalons);
      if (enrichedSalons.length > 0 && !selectedSalon) {
        setSelectedSalon(enrichedSalons[0]);
      }
    } catch (err) {
      console.error('Failed to load salons:', err);
    } finally {
      setLoading(false);
    }
  }, [userLocation.lat, userLocation.lng, selectedSalon]);

  // Request location on mount and reload
  useEffect(() => {
    requestAndFetchUserLocation();
  }, [requestAndFetchUserLocation]);

  // Refetch when location or auth changes
  useEffect(() => {
    refreshSalons();
  }, [refreshSalons]);

  const refreshOwnerQueue = useCallback(async () => {
    const targetId = user?.salonId || ownerSalonId;
    if (!targetId) return;
    try {
      const details = await api.getSalonQueue(targetId);
      setOwnerQueueDetails(details);
    } catch (err) {
      console.error('Failed to load owner queue:', err);
    }
  }, [ownerSalonId, user?.salonId]);

  useEffect(() => {
    if (role === 'OWNER') {
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
        gpsActive,
        requestAndFetchUserLocation,
        updateSalonPhoto,
        updateSalonDetails,
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
