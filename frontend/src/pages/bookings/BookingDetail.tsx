import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PageSpinner } from '../../components/ui/Spinner';
import {
  useBooking,
  useUpdateBookingStatus,
  usePayments,
  useCreatePayment,
} from '../../hooks/index';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { BookingStatus, Payment, PaymentMethod, Trip, User } from '../../types';

// ── Zod schema for payment form ───────────────────────────────────────────

const paymentSchema = z.object({
  amount: z.string().min(1, 'Montant requis'),
  method: z.enum(['card', 'cash'] as const),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

// ── Helper labels ─────────────────────────────────────────────────────────

const STATUS_BUTTONS: { value: BookingStatus; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'cancelled', label: 'Annulé' },
];

const METHOD_OPTIONS = [
  { value: 'card', label: 'Carte' },
  { value: 'cash', label: 'Espèces' },
];

function getCustomerLabel(customer: number | User): string {
  if (typeof customer === 'object') {
    const full = [customer.first_name, customer.last_name].filter(Boolean).join(' ');
    return full || customer.username;
  }
  return `#${customer}`;
}

function getTripLabel(trip: number | Trip): string {
  if (typeof trip === 'object') return trip.title;
  return `#${trip}`;
}

function getBookingId(booking: number | { id: number }): number {
  return typeof booking === 'object' ? booking.id : booking;
}

// ── Payment form inside modal ─────────────────────────────────────────────

interface PaymentFormProps {
  bookingId: number;
  defaultAmount: string;
  onSuccess: () => void;
}

function PaymentForm({ bookingId, defaultAmount, onSuccess }: PaymentFormProps) {
  const createPayment = useCreatePayment();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: defaultAmount, method: 'card' },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    await createPayment.mutateAsync({
      booking: bookingId,
      amount: data.amount,
      method: data.method as PaymentMethod,
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Montant (€)"
        type="number"
        step="0.01"
        min="0"
        error={errors.amount?.message}
        {...register('amount')}
      />
      <Controller
        control={control}
        name="method"
        render={({ field }) => (
          <Select
            label="Méthode"
            options={METHOD_OPTIONS}
            error={errors.method?.message}
            {...field}
          />
        )}
      />
      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="submit"
          variant="primary"
          loading={createPayment.isPending}
        >
          Enregistrer
        </Button>
      </div>
    </form>
  );
}

// ── BookingDetail page ────────────────────────────────────────────────────

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const bookingId = parseInt(id ?? '0', 10);

  const { user } = useAuthStore();
  const { data: booking, isLoading } = useBooking(bookingId);
  const { data: allPayments } = usePayments();
  const updateStatus = useUpdateBookingStatus();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const canManage = user?.role === 'admin' || user?.role === 'agent';

  if (isLoading) return <PageSpinner />;
  if (!booking) {
    return (
      <div className="px-8 py-8">
        <p className="text-muted">Réservation introuvable.</p>
      </div>
    );
  }

  const linkedPayments = (allPayments ?? []).filter(
    (p: Payment) => getBookingId(p.booking) === booking.id
  );

  const handleStatusChange = (status: BookingStatus) => {
    if (status === booking.status) return;
    updateStatus.mutate({ id: booking.id, status });
  };

  return (
    <div className="px-8 py-8">
      {/* Back link */}
      <Link
        to="/bookings"
        className="inline-flex items-center text-sm text-muted hover:text-ink mb-6"
      >
        ← Réservations
      </Link>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT — Booking details */}
        <div className="col-span-2">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-ink mb-5">
              Détails de la réservation
            </h2>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-xs text-muted uppercase tracking-wide mb-1">Client</dt>
                <dd className="text-sm text-ink font-medium">
                  {getCustomerLabel(booking.customer)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted uppercase tracking-wide mb-1">Voyage</dt>
                <dd className="text-sm text-ink font-medium">
                  {getTripLabel(booking.trip)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted uppercase tracking-wide mb-1">Places</dt>
                <dd className="text-sm text-ink font-medium tabular-nums">{booking.seats}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted uppercase tracking-wide mb-1">Montant total</dt>
                <dd className="text-sm text-ink font-medium tabular-nums">
                  {formatCurrency(booking.total_price)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted uppercase tracking-wide mb-1">Statut</dt>
                <dd>
                  <Badge value={booking.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted uppercase tracking-wide mb-1">Créé le</dt>
                <dd className="text-sm text-muted tabular-nums">
                  {formatDate(booking.created_at)}
                </dd>
              </div>
            </dl>

            {canManage && (
              <div className="mt-6 pt-5 border-t border-border">
                <p className="text-sm font-medium text-ink mb-3">Modifier le statut</p>
                <div className="flex items-center gap-2">
                  {STATUS_BUTTONS.map(({ value, label }) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={booking.status === value ? 'primary' : 'secondary'}
                      onClick={() => handleStatusChange(value)}
                      loading={
                        updateStatus.isPending && updateStatus.variables?.status === value
                      }
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Linked payments */}
        <div className="col-span-1">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-ink">Paiements liés</h2>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPaymentModalOpen(true)}
              >
                Ajouter
              </Button>
            </div>

            {linkedPayments.length === 0 ? (
              <p className="text-sm text-muted">Aucun paiement enregistré.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {linkedPayments.map((payment: Payment) => (
                  <li
                    key={payment.id}
                    className="flex flex-col gap-1 border border-border rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink tabular-nums">
                        {formatCurrency(payment.amount)}
                      </span>
                      <Badge value={payment.status} />
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-muted">
                        {payment.method === 'card' ? 'Carte' : 'Espèces'}
                      </span>
                      <span className="text-xs text-muted tabular-nums">
                        {formatDate(payment.created_at)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Add payment modal */}
      <Modal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Ajouter un paiement"
        size="sm"
      >
        <PaymentForm
          bookingId={booking.id}
          defaultAmount={booking.total_price}
          onSuccess={() => setPaymentModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
