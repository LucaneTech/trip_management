import { api } from '../api/apiClient';
import type { DashboardStats } from '../types';

export const dashboardService = {
  stats: (): Promise<DashboardStats> => api.get('/api/dashboard/'),
};
