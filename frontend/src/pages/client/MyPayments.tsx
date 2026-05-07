import React, { useMemo } from 'react';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { Empty } from '../../components/ui/Empty';
import { usePayments, useBookings } from '../../hooks/index';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { Booking, Payment, User } from '../../types';

// ── Helper ────────────────────────────────────────────────────────────────

function getBookingLabel(booking: Payment['booking']): string {
  if (typeof booking === 'object' && booking !== null) {
    return `Réservation #${(booking as Booking).id}`;
  }
  return `Réservation #${booking}`;
}

function getBookingId(booking: Payment['booking']): number {
  if (typeof booking === 'object' && booking !== null) {
    return (booking as Booking).id;
  }
  return booking as number;
}

// ── Payment card ──────────────────────────────────────────────────────────

interface PaymentCardProps {
  payment: Payment;
}

function PaymentCard({ payment }: PaymentCardProps) {
  return (
    <div className="card p-5 flex items-start justify-between gap-4">
      {/* Left: info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-ink">{getBookingLabel(payment.booking)}</p>
        <p className="text-sm text-muted mt-0.5">
          Montant&nbsp;: {formatCurrency(payment.amount)}
        </p>
        <p className="text-xs text-muted mt-0.5">
          Méthode&nbsp;: {payment.method === 'card' ? 'Carte bancaire' : 'Espèces'}
        </p>
        <p className="text-xs text-muted mt-1">{formatDate(payment.created_at)}</p>
      </div>

      {/* Right: status badge */}
      <div className="shrink-0">
        <Badge value={payment.status} />
      </div>
    </div>
  );
}

// ── MyPayments page ───────────────────────────────────────────────────────

export default function MyPayments() {
  const { user } = useAuthStore();
  const { data: payments = [], isLoading: loadingPayments } = usePayments();
  const { data: bookings = [], isLoading: loadingBookings } = useBookings();

  // Collect IDs of bookings that belong to the current user
  const myBookingIds = useMemo(() => {
    if (!user) return new Set<number>();
    const ids = bookings
      .filter((b: Booking) => {
        const custId =
          typeof b.customer === 'object' ? (b.customer as User).id : b.customer;
        return custId === user.id;
      })
      .map((b: Booking) => b.id);
    return new Set(ids);
  }, [bookings, user]);

  // Filter payments to those linked to the user's bookings
  const myPayments = useMemo(() => {
    return payments.filter((p: Payment) => {
      const bookingId = getBookingId(p.booking);
      return myBookingIds.has(bookingId);
    });
  }, [payments, myBookingIds]);

  // Sum of completed payments
  const totalPaid = useMemo(() => {
    return myPayments
      .filter((p: Payment) => p.status === 'completed')
      .reduce((acc: number, p: Payment) => acc + parseFloat(p.amount), 0);
  }, [myPayments]);

  const isLoading = loadingPayments || loadingBookings;
  if (isLoading) return <PageSpinner />;

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <h1 className="text-2xl font-bold tracking-tight text-ink mb-6">
        Mes paiements
      </h1>

      {/* ── Summary card ── */}
      <div className="card p-5 mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted font-semibold">
            Total payé
          </p>
          <p className="text-2xl font-bold font-mono text-ink mt-1 tabular-nums">
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <span className="text-xs bg-muted-bg text-muted rounded-full px-3 py-1 font-semibold shrink-0">
          {myPayments.length} paiement{myPayments.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Payments list ── */}
      {myPayments.length === 0 ? (
        <Empty
          title="Aucun paiement enregistré"
          description="Vos paiements apparaîtront ici une fois vos réservations confirmées."
        />
      ) : (
        <div className="space-y-3">
          {myPayments.map((payment: Payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  );
}
