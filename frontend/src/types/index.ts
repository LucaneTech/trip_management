// ── Primitives ────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'agent' | 'client';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type PaymentMethod = 'card' | 'cash';

// ── Core models (mirror backend serializers) ──────────────────────────────
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  bio?: string;
}

export interface Trip {
  id: number;
  title: string;
  destination: string;
  price: string;
  start_date: string;
  end_date: string;
  capacity: number;
  available_seats?: number;
  description?: string;
  image?: string;
  created_at: string;
}

export interface Booking {
  id: number;
  customer: number | User;
  trip: number | Trip;
  seats: number;
  total_price: string;
  status: BookingStatus;
  created_at: string;
}

export interface Payment {
  id: number;
  booking: number | Booking;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string;
  created_at: string;
}

export interface CustomerProfile {
  id: number;
  user: User;
  phone?: string;
  address?: string;
  preferences?: Record<string, unknown>;
}

export interface DashboardStats {
  total_trips: number;
  total_bookings: number;
  total_customers: number;
  revenue: number;
  popular_trips: Trip[];
  recent_bookings: Booking[];
}

// ── Auth payloads ─────────────────────────────────────────────────────────
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// ── Form payloads ─────────────────────────────────────────────────────────
export interface TripPayload {
  title: string;
  destination: string;
  price: string;
  start_date: string;
  end_date: string;
  capacity: number;
  description?: string;
}

export interface BookingPayload {
  trip: number;
  seats: number;
}

export interface PaymentPayload {
  booking: number;
  amount: string;
  method: PaymentMethod;
}
