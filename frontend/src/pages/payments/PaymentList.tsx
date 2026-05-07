import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PageSpinner } from '../../components/ui/Spinner';
import { usePayments, useCreatePayment } from '../../hooks/index';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { Payment, PaymentMethod } from '../../types';

// ── Zod schema ────────────────────────────────────────────────────────────

const newPaymentSchema = z.object({
  booking: z
    .string()
    .min(1, 'ID de réservation requis')
    .refine((v) => !isNaN(parseInt(v, 10)) && parseInt(v, 10) > 0, {
      message: 'ID invalide',
    }),
  amount: z
    .string()
    .min(1, 'Montant requis')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: 'Montant invalide',
    }),
  method: z.enum(['card', 'cash'] as const),
});

type NewPaymentFormValues = z.infer<typeof newPaymentSchema>;

// ── Filter options ────────────────────────────────────────────────────────

const METHOD_FILTER_OPTIONS = [
  { value: '', label: 'Toutes les méthodes' },
  { value: 'card', label: 'Carte' },
  { value: 'cash', label: 'Espèces' },
];

const METHOD_OPTIONS = [
  { value: 'card', label: 'Carte' },
  { value: 'cash', label: 'Espèces' },
];

function getBookingLabel(booking: number | { id: number }): string {
  return `#${typeof booking === 'object' ? booking.id : booking}`;
}

function truncate(str: string | undefined, max: number): string {
  if (!str) return '—';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

// ── New payment form ──────────────────────────────────────────────────────

interface NewPaymentFormProps {
  onSuccess: () => void;
}

function NewPaymentForm({ onSuccess }: NewPaymentFormProps) {
  const createPayment = useCreatePayment();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPaymentFormValues>({
    resolver: zodResolver(newPaymentSchema),
    defaultValues: { booking: '', amount: '', method: 'card' },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: NewPaymentFormValues) => {
    setSubmitError(null);
    try {
      await createPayment.mutateAsync({
        booking: parseInt(data.booking, 10),
        amount: data.amount,
        method: data.method as PaymentMethod,
      });
      onSuccess();
    } catch (err: unknown) {
      const apiErr = err as { data?: Record<string, unknown> };
      const detail = apiErr?.data;
      if (detail && typeof detail === 'object') {
        const booking = detail['booking'];
        if (booking) {
          setSubmitError(`Réservation : ${Array.isArray(booking) ? booking.join(' ') : booking}`);
        } else {
          const msg = Object.values(detail).flat().join(' ');
          setSubmitError(msg || 'Erreur lors de la création du paiement.');
        }
      } else {
        setSubmitError('Erreur lors de la création du paiement.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="ID de réservation"
        type="number"
        min="1"
        placeholder="Ex. 42"
        error={errors.booking?.message}
        {...register('booking')}
      />
      <Input
        label="Montant (€)"
        type="number"
        step="0.01"
        min="0"
        placeholder="Ex. 150.00"
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
      {submitError && (
        <p className="text-xs text-status-cancelled bg-status-cancelled-bg border border-status-cancelled/20 rounded px-3 py-2">
          {submitError}
        </p>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="submit" variant="primary" loading={createPayment.isPending}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}

// ── PaymentList page ──────────────────────────────────────────────────────

export default function PaymentList() {
  const { data: payments, isLoading } = usePayments();
  const [methodFilter, setMethodFilter] = useState<'' | PaymentMethod>('');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = (payments ?? []).filter((p: Payment) =>
    methodFilter === '' ? true : p.method === methodFilter
  );

  if (isLoading) return <PageSpinner />;

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Paiements</h1>
        <div className="flex items-center gap-3">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as '' | PaymentMethod)}
            className="h-9 field-input appearance-none cursor-pointer pr-8 text-sm"
          >
            {METHOD_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setModalOpen(true)}
          >
            Nouveau paiement
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Réservation</th>
              <th>Montant</th>
              <th>Méthode</th>
              <th>Statut</th>
              <th>Transaction ID</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted text-sm">
                  Aucun paiement trouvé.
                </td>
              </tr>
            ) : (
              filtered.map((payment: Payment) => (
                <tr key={payment.id}>
                  <td className="text-muted text-sm tabular-nums">#{payment.id}</td>
                  <td className="text-sm text-ink">{getBookingLabel(payment.booking)}</td>
                  <td className="text-sm tabular-nums">{formatCurrency(payment.amount)}</td>
                  <td className="text-sm text-ink">
                    {payment.method === 'card' ? 'Carte' : 'Espèces'}
                  </td>
                  <td>
                    <Badge value={payment.status} />
                  </td>
                  <td>
                    {payment.transaction_id ? (
                      <span className="text-xs font-mono text-muted">
                        {truncate(payment.transaction_id, 12)}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="text-sm text-muted tabular-nums">
                    {formatDate(payment.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New payment modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nouveau paiement"
        size="sm"
      >
        <NewPaymentForm onSuccess={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
