import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '../services/tripService';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import { customerService } from '../services/customerService';
import { dashboardService } from '../services/dashboardService';
import type { TripPayload, BookingPayload, PaymentPayload, BookingStatus } from '../types';

// ── Dashboard ─────────────────────────────────────────────────────────────
export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: dashboardService.stats });
}

// ── Trips ─────────────────────────────────────────────────────────────────
export function useTrips() {
  return useQuery({ queryKey: ['trips'], queryFn: tripService.list });
}

export function useTrip(id: number) {
  return useQuery({ queryKey: ['trips', id], queryFn: () => tripService.get(id), enabled: !!id });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TripPayload) => tripService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useUpdateTrip(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<TripPayload>) => tripService.patch(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] });
      qc.invalidateQueries({ queryKey: ['trips', id] });
    },
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tripService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
}

// ── Bookings ──────────────────────────────────────────────────────────────
export function useBookings() {
  return useQuery({ queryKey: ['bookings'], queryFn: bookingService.list });
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingService.get(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookingPayload) => bookingService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['trips'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: BookingStatus }) =>
      bookingService.updateStatus(id, status),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['bookings', id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ── Payments ──────────────────────────────────────────────────────────────
export function usePayments() {
  return useQuery({ queryKey: ['payments'], queryFn: paymentService.list });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentPayload) => paymentService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ── Customers ─────────────────────────────────────────────────────────────
export function useCustomers() {
  return useQuery({ queryKey: ['customers'], queryFn: customerService.list });
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customerService.get(id),
    enabled: !!id,
  });
}
