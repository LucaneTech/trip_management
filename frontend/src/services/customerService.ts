import { api } from '../api/apiClient';
import type { User, CustomerProfile } from '../types';

export const customerService = {
  list: (): Promise<User[]> => api.get('/api/customers/list/'),
  get: (id: number): Promise<User> => api.get(`/api/customers/list/${id}/`),
  profiles: (): Promise<CustomerProfile[]> => api.get('/api/customers/profiles/'),
  getProfile: (id: number): Promise<CustomerProfile> => api.get(`/api/customers/profiles/${id}/`),
  updateProfile: (id: number, payload: Partial<CustomerProfile>): Promise<CustomerProfile> =>
    api.patch(`/api/customers/profiles/${id}/`, payload),
};
