import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CalendarCheck, CreditCard } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import { useBookings } from '../../hooks/index';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { Booking, Trip, User } from '../../types';

// ── helpers ───────────────────────────────────────────────────────────────

function getTripLabel(trip: Booking['trip']): string {
  if (typeof trip === 'object' && trip !== null) {
    return (trip as Trip).title;
  }
  return `Réservation #${trip}`;
}

// ── Quick-access card ─────────────────────────────────────────────────────

interface QuickCardProps {
  to: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

function QuickCard({ to, icon, iconBg, title, description }: QuickCardProps) {
  return (
    <Link
      to={to}
      className="card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow group"
    >
      <span
        className={`h-14 w-14 rounded-xl flex items-center justify-center text-white shrink-0 ${iconBg}`}
      >
        {icon}
      </span>
      <div>
        <p className="font-semibold text-ink group-hover:underline">{title}</p>
        <p className="text-sm text-muted mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

// ── Component ─────────────────────────────────────────────────────────────

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const { data: bookings = [], isLoading } = useBookings();

  const myBookings = useMemo(() => {
    if (!user) return [];
    return bookings.filter((b: Booking) => {
      const custId =
        typeof b.customer === 'object' ? (b.customer as User).id : b.customer;
      return custId === user.id;
    });
  }, [bookings, user]);

  const recentBookings = myBookings.slice(0, 3);

  const greeting = user
    ? user.first_name || user.username
    : 'vous';

  if (isLoading) return <PageSpinner />;

  return (
    <div className="px-8 py-12 max-w-4xl mx-auto">

      {/* ── Welcome block ── */}
      <div>
        <h1 className="text-3xl font-bold text-ink tracking-tight">
          Bonjour, {greeting} 👋
        </h1>
        <p className="text-muted text-lg mt-1">Prêt pour votre prochain voyage ?</p>
      </div>

      {/* ── Quick-access cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <QuickCard
          to="/explore"
          iconBg="bg-ink"
          icon={<MapPin className="h-8 w-8" />}
          title="Explorer"
          description="Découvrez nos destinations"
        />
        <QuickCard
          to="/my-bookings"
          iconBg="bg-slate-800"
          icon={<CalendarCheck className="h-8 w-8" />}
          title="Mes réservations"
          description="Suivez vos réservations"
        />
        <QuickCard
          to="/my-payments"
          iconBg="bg-slate-700"
          icon={<CreditCard className="h-8 w-8" />}
          title="Mes paiements"
          description="Historique des paiements"
        />
      </div>

      {/* ── Recent bookings ── */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-ink mb-4">
          Mes dernières réservations
        </h2>

        {recentBookings.length === 0 ? (
          <div className="card p-8 flex flex-col items-center text-center gap-4">
            <p className="text-sm text-muted max-w-xs">
              Aucune réservation pour le moment. Commencez par explorer nos voyages !
            </p>
            <Link to="/explore">
              <Button variant="primary">Explorer les voyages</Button>
            </Link>
          </div>
        ) : (
          <>
            {recentBookings.map((booking: Booking) => (
              <div
                key={booking.id}
                className="card flex items-center gap-4 p-4 mb-3"
              >
                {/* Trip info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">
                    {getTripLabel(booking.trip)}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {formatDate(booking.created_at)}
                  </p>
                </div>

                {/* Center: seats + price */}
                <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
                  <span className="text-sm font-semibold text-ink tabular-nums">
                    {formatCurrency(booking.total_price)}
                  </span>
                  <span className="text-xs text-muted">
                    {booking.seats} place{booking.seats > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Status badge */}
                <div className="shrink-0">
                  <Badge value={booking.status} />
                </div>
              </div>
            ))}

            <div className="mt-2">
              <Link
                to="/my-bookings"
                className="text-sm text-muted hover:text-ink transition-colors"
              >
                Voir toutes mes réservations →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
