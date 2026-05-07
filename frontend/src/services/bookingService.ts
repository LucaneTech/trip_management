import { api } from '../api/apiClient';
import type { Booking, BookingPayload, BookingStatus } from '../types';

export const bookingService = {
  list: (): Promise<Booking[]> => api.get('/api/bookings/'),
  get: (id: number): Promise<Booking> => api.get(`/api/bookings/${id}/`),
  create: (payload: BookingPayload): Promise<Booking> => api.post('/api/bookings/', payload),
  updateStatus: (id: number, status: BookingStatus): Promise<Booking> =>
    api.patch(`/api/bookings/${id}/`, { status }),
  remove: (id: number): Promise<void> => api.del(`/api/bookings/${id}/`),
};
