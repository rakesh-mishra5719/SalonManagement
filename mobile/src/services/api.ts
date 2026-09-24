import { Platform } from 'react-native';
import { Salon, SalonQueueDetails, QueueEntry } from '../types';

const LIVE_RENDER_API = 'https://salonmanagement-h152.onrender.com/api';

const getDefaultApiUrl = () => {
  // If running in browser and pointing to localhost, can use localhost or live Render
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      // Connect to live Render API
      return LIVE_RENDER_API;
    }
  }
  // Default to live Render cloud API for all physical mobile devices (Android / iOS)
  return LIVE_RENDER_API;
};

let BASE_URL = getDefaultApiUrl();

export const setApiBaseUrl = (url: string) => {
  BASE_URL = url.replace(/\/+$/, '');
};

export const getApiBaseUrl = () => BASE_URL;

export const api = {
  async getNearbySalons(lat = 12.9716, lng = 77.5946): Promise<Salon[]> {
    try {
      const response = await fetch(`${BASE_URL}/salons/nearby?lat=${lat}&lng=${lng}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch salons: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('Backend API unavailable, using cached salon data:', err);
      return fallbackSalons;
    }
  },

  async getSalonQueue(salonId: number): Promise<SalonQueueDetails> {
    try {
      const response = await fetch(`${BASE_URL}/salons/${salonId}/queue`);
      if (!response.ok) {
        throw new Error(`Failed to fetch salon queue: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('Backend API unavailable, using fallback queue details:', err);
      const salon = fallbackSalons.find((s) => s.id === salonId) || fallbackSalons[0];
      return {
        salon,
        waitingList: fallbackWaitingList.filter((q) => q.salonId === salonId),
        servingList: fallbackServingList.filter((q) => q.salonId === salonId),
        completedList: [],
        waitingCount: 2,
        servingCount: 1,
        completedTodayCount: 5,
        estimatedWaitMinutes: 45,
        waitLevel: 'Short Wait',
      };
    }
  },

  async joinQueue(
    salonId: number,
    data: { customerName: string; customerPhone?: string; serviceName?: string; slotTime?: string }
  ): Promise<QueueEntry> {
    try {
      const response = await fetch(`${BASE_URL}/salons/${salonId}/queue/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errData = await response.text();
        throw new Error(errData || 'Failed to book slot');
      }
      return await response.json();
    } catch (err: any) {
      console.warn('API error, generating local queue entry:', err);
      // Fallback local generation if server is offline
      const randomCode = 'SLN-' + Math.floor(1000 + Math.random() * 9000);
      return {
        id: Date.now(),
        salonId,
        customerName: data.customerName || 'Valued Guest',
        customerPhone: data.customerPhone,
        serviceName: data.serviceName || 'Custom Styling',
        slotTime: data.slotTime || 'Immediate Slot',
        status: 'WAITING',
        queuePosition: 3,
        verificationCode: randomCode,
        createdAt: new Date().toISOString(),
      };
    }
  },

  async verifyArrival(salonId: number, verificationCode: string): Promise<{ success: boolean; message: string; entry: QueueEntry }> {
    const response = await fetch(`${BASE_URL}/salons/${salonId}/queue/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationCode: verificationCode.trim().toUpperCase() }),
    });
    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = 'Invalid verification code';
      try {
        const json = JSON.parse(errText);
        errorMsg = json.message || errorMsg;
      } catch (_) {
        errorMsg = errText || errorMsg;
      }
      throw new Error(errorMsg);
    }
    return await response.json();
  },

  async completeService(salonId: number, queueId: number): Promise<{ success: boolean; message: string; entry: QueueEntry }> {
    const response = await fetch(`${BASE_URL}/salons/${salonId}/queue/${queueId}/complete`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to complete service');
    }
    return await response.json();
  },

  async updateSalonStatus(salonId: number, isOpen: boolean): Promise<Salon> {
    const response = await fetch(`${BASE_URL}/salons/${salonId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOpen }),
    });
    if (!response.ok) {
      throw new Error('Failed to update salon status');
    }
    return await response.json();
  },
};

// Fallback seed data in case client runs isolated
const fallbackSalons: Salon[] = [
  {
    id: 1,
    name: 'Aura Minimalist Studio',
    tagline: 'High-end artisanal hair design & organic treatments',
    address: '104 Indiranagar 100ft Rd, Bengaluru',
    latitude: 12.9719,
    longitude: 77.6412,
    isOpen: true,
    rating: 4.9,
    phone: '+91 98450 11223',
    category: 'Artisanal Hair & Spa',
    averageServiceTimeMinutes: 25,
    distanceKm: 0.8,
    waitingCount: 2,
    servingCount: 1,
    totalWaitTimeMinutes: 50,
    waitLevel: 'Short Wait',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    name: 'Velvet & Blade Barbers',
    tagline: 'Master fades, beard sculpting & hot towel treatments',
    address: '58 Koramangala 4th Block, Bengaluru',
    latitude: 12.9352,
    longitude: 77.6245,
    isOpen: true,
    rating: 4.8,
    phone: '+91 98765 43210',
    category: 'Craft Barber Studio',
    averageServiceTimeMinutes: 20,
    distanceKm: 2.1,
    waitingCount: 1,
    servingCount: 0,
    totalWaitTimeMinutes: 20,
    waitLevel: 'Short Wait',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    name: 'Lumière Aesthetic Lounge',
    tagline: 'French couture coloring, botanical keratin & aesthetics',
    address: '12 Lavelle Road, Central Bengaluru',
    latitude: 12.9698,
    longitude: 77.5990,
    isOpen: true,
    rating: 4.95,
    phone: '+91 91234 56789',
    category: 'Couture Beauty Lounge',
    averageServiceTimeMinutes: 30,
    distanceKm: 3.4,
    waitingCount: 0,
    servingCount: 1,
    totalWaitTimeMinutes: 0,
    waitLevel: 'Available Now',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    name: 'Zenith Hair Atelier',
    tagline: 'Precision scissor cuts & Japanese scalp detox',
    address: '80 Richmond Town, Bengaluru',
    latitude: 12.9620,
    longitude: 77.6080,
    isOpen: true,
    rating: 4.7,
    phone: '+91 99887 76655',
    category: 'Holistic Atelier',
    averageServiceTimeMinutes: 20,
    distanceKm: 4.2,
    waitingCount: 0,
    servingCount: 0,
    totalWaitTimeMinutes: 0,
    waitLevel: 'Available Now',
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80',
  },
];

const fallbackWaitingList: QueueEntry[] = [
  {
    id: 2,
    salonId: 1,
    customerName: 'Priya Nair',
    serviceName: 'Botanical Scalp Treatment',
    slotTime: '10:30 AM',
    status: 'WAITING',
    queuePosition: 1,
    verificationCode: 'SLN-4819',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    salonId: 1,
    customerName: 'Aarav Mehta',
    serviceName: 'Beard Sculpt & Styling',
    slotTime: '11:15 AM',
    status: 'WAITING',
    queuePosition: 2,
    verificationCode: 'SLN-7230',
    createdAt: new Date().toISOString(),
  },
];

const fallbackServingList: QueueEntry[] = [
  {
    id: 1,
    salonId: 1,
    customerName: 'Rohan Verma',
    serviceName: 'Artisan Scissor Cut',
    slotTime: '10:00 AM',
    status: 'SERVING',
    verificationCode: 'SLN-1024',
    createdAt: new Date().toISOString(),
  },
];
