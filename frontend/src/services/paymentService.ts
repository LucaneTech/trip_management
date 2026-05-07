import { api } from '../api/apiClient';
import type { Payment, PaymentPayload } from '../types';

export const paymentService = {
  list: (): Promise<Payment[]> => api.get('/api/payments/'),
  get: (id: number): Promise<Payment> => api.get(`/api/payments/${id}/`),
  create: (payload: PaymentPayload): Promise<Payment> => api.post('/api/payments/', payload),
};
