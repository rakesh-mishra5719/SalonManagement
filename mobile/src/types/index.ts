export type UserRole = 'CLIENT' | 'OWNER';

export type ThemeMode = 'light' | 'dark';

export type DesignPattern = 'glassmorphism' | 'flat-minimal' | 'neumorphic';

export type QueueStatus = 'WAITING' | 'SERVING' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  salonId?: number;
  salon?: Salon;
  token?: string;
}

export interface Salon {
  id: number;
  name: string;
  tagline?: string;
  address: string;
  latitude: number;
  longitude: number;
  isOpen: boolean;
  rating: number;
  phone?: string;
  category?: string;
  imageUrl?: string;
  ownerId?: number;
  openingTime?: string;
  closingTime?: string;
  chairsCount?: number;
  averageServiceTimeMinutes?: number;
  distanceKm?: number;
  waitingCount?: number;
  servingCount?: number;
  totalWaitTimeMinutes?: number;
  waitLevel?: string;
}

export interface QueueEntry {
  id: number;
  salonId: number;
  userId?: number;
  customerName: string;
  customerPhone?: string;
  verificationCode: string; // 6-digit number
  serviceName?: string;
  slotTime?: string;
  status: QueueStatus;
  queuePosition?: number;
  createdAt: string;
  verifiedAt?: string;
  completedAt?: string;
}

export interface SalonQueueDetails {
  salon: Salon;
  waitingList: QueueEntry[];
  servingList: QueueEntry[];
  completedList: QueueEntry[];
  waitingCount: number;
  servingCount: number;
  completedTodayCount: number;
  estimatedWaitMinutes: number;
  waitLevel: string;
}
