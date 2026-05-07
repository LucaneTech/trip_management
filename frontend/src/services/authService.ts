import { api } from '../api/apiClient';
import type { LoginCredentials, RegisterPayload, User } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const tokens = await api.post('/api/auth/token/', credentials);
    api.setTokens(tokens.access, tokens.refresh);
    const user: User = await api.get('/api/auth/me/');
    return { tokens, user };
  },

  register: async (payload: RegisterPayload) => {
    const data = await api.post('/api/auth/register/', payload);
    if (data?.access) api.setTokens(data.access, data.refresh);
    return data;
  },

  me: (): Promise<User> => api.get('/api/auth/me/'),

  logout: () => {
    api.setTokens(null, null);
  },
};
