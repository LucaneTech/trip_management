import { api } from '../api/apiClient';
import type { Trip, TripPayload } from '../types';

export const tripService = {
  list: (): Promise<Trip[]> => api.get('/api/trips/'),
  get: (id: number): Promise<Trip> => api.get(`/api/trips/${id}/`),
  create: (payload: TripPayload): Promise<Trip> => api.post('/api/trips/', payload),
  update: (id: number, payload: Partial<TripPayload>): Promise<Trip> =>
    api.put(`/api/trips/${id}/`, payload),
  patch: (id: number, payload: Partial<TripPayload>): Promise<Trip> =>
    api.patch(`/api/trips/${id}/`, payload),
  remove: (id: number): Promise<void> => api.del(`/api/trips/${id}/`),
};
