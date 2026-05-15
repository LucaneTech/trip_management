import { api, request, API_BASE } from '../api/apiClient';
import type { User } from '../types';

export interface ProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

export const profileService = {
  update: (data: ProfilePayload): Promise<User> =>
    api.patch<User>('/api/auth/me/', data),

  uploadAvatar: (file: File): Promise<User> => {
    const fd = new FormData();
    fd.append('avatar', file);
    return request<User>('/api/auth/me/', { method: 'PATCH', body: fd });
  },
};
