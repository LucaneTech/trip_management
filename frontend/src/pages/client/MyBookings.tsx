import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { Empty } from '../../components/ui/Empty';
import { useBookings } from '../../hooks/index';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { Booking, BookingStatus, Trip, User } from '../../types';

// ── Status tab config ─────────────────────────────────────────────────────

type TabValue = '' | BookingStatus;

const STATUS_TABS: { value: TabValue; label: string }[] = [
  { value: '', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'cancelled', label: 'Annulées' },
];

// ── Helper ────────────────────────────────────────────────────────────────

function getTripLabel(trip: Booking['trip']): string {
  if (typeof trip === 'object' && trip !== null) {
    return (trip as Trip).title;
  }
  return `Voyage #${trip}`;
}

// ── Booking card ──────────────────────────────────────────────────────────

interface BookingCardProps {
  booking: Booking;
}

function BookingCard({ booking }: BookingCardProps) {
  return (
    <div className="card p-5 flex items-start justify-between gap-4">
      {/* Left: info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink truncate">
          {getTripLabel(booking.trip)}
        </p>
        <p className="text-sm text-muted mt-0.5">
          {booking.seats} place{booking.seats > 1 ? 's' : ''}&nbsp;·&nbsp;
          Total&nbsp;: {formatCurrency(booking.total_price)}
        </p>
        <p className="text-xs text-muted mt-1">
          Réservé le {formatDate(booking.created_at)}
        </p>
      </div>

      {/* Right: badge + link */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <Badge value={booking.status} />
        <Link
          to={`/bookings/${booking.id}`}
          className="text-xs text-muted hover:text-ink underline transition-colors"
        >
          Voir détails
        </Link>
      </div>
    </div>
  );
}

// ── MyBookings page ───────────────────────────────────────────────────────

export default function MyBookings() {
  const { user } = useAuthStore();
  const { data: bookings = [], isLoading } = useBookings();
  const [activeTab, setActiveTab] = useState<TabValue>('');

  // Filter to current user's bookings only
  const myBookings = useMemo(() => {
    if (!user) return [];
    return bookings.filter((b: Booking) => {
      const custId =
        typeof b.customer === 'object' ? (b.customer as User).id : b.customer;
      return custId === user.id;
    });
  }, [bookings, user]);

  // Apply status tab filter
  const displayed = useMemo(() => {
    if (activeTab === '') return myBookings;
    return myBookings.filter((b) => b.status === activeTab);
  }, [myBookings, activeTab]);

  if (isLoading) return <PageSpinner />;

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Mes réservations
        </h1>
        <span className="text-xs bg-muted-bg text-muted rounded-full px-2 py-0.5 font-semibold">
          {myBookings.length}
        </span>
      </div>

      {/* ── Status filter tabs ── */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={
              activeTab === tab.value
                ? 'bg-ink text-white rounded-full px-3 py-1 text-xs font-semibold transition-colors'
                : 'bg-muted-bg text-muted rounded-full px-3 py-1 text-xs font-semibold cursor-pointer hover:bg-border transition-colors'
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Bookings list ── */}
      {displayed.length === 0 ? (
        myBookings.length === 0 ? (
          <Empty
            title="Aucune réservation"
            description="Vous n'avez pas encore effectué de réservation. Explorez nos voyages pour commencer !"
            action={
              <Link to="/explore">
                <Button variant="primary">Explorer les voyages</Button>
              </Link>
            }
          />
        ) : (
          <Empty
            title="Aucune réservation dans cette catégorie"
            description="Essayez un autre filtre de statut."
          />
        )
      ) : (
        <div className="space-y-3">
          {displayed.map((booking: Booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
