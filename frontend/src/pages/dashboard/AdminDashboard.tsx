import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  CalendarCheck,
  Users,
  TrendingUp,
  Plus,
  CalendarPlus,
  CreditCard,
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useDashboard, useBookings } from '../../hooks/index';
import type { Booking, Trip, User, BookingStatus } from '../../types';

// ── helpers ───────────────────────────────────────────────────────────────────

function getCustomerLabel(customer: Booking['customer']): string {
  if (typeof customer === 'object' && customer !== null) {
    const u = customer as User;
    return u.first_name ? `${u.first_name} ${u.last_name}`.trim() : u.username;
  }
  return `Client #${customer}`;
}

function getTripLabel(trip: Booking['trip']): string {
  if (typeof trip === 'object' && trip !== null) {
    return (trip as Trip).title;
  }
  return `Voyage #${trip}`;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { data: stats, isLoading, isError } = useDashboard();
  const { data: bookings = [] } = useBookings();

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  );

  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === 'pending').length,
    [bookings],
  );
  const confirmedCount = useMemo(
    () => bookings.filter((b) => b.status === 'confirmed').length,
    [bookings],
  );
  const cancelledCount = useMemo(
    () => bookings.filter((b) => b.status === 'cancelled').length,
    [bookings],
  );
  const total = bookings.length || 1; // avoid divide-by-zero

  if (isLoading) return <PageSpinner />;

  if (isError || !stats) {
    return (
      <div className="px-8 py-8">
        <p className="text-sm text-muted">
          Impossible de charger le tableau de bord. Veuillez réessayer.
        </p>
      </div>
    );
  }

  const recentBookings = stats.recent_bookings.slice(0, 8);

  // ── quick action link class ────────────────────────────────────────────────
  const actionLinkClass =
    'inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium bg-[#1D4ED8] text-white hover:bg-[#1E40AF] transition-colors';

  return (
    <div className="px-8 py-8 max-w-screen-xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Tableau de bord
          </h1>
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            Administrateur
          </span>
        </div>
        <span className="text-sm text-muted capitalize">{today}</span>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="border-l-4 border-blue-500 rounded-lg">
          <StatCard
            label="Total Voyages"
            value={stats.total_trips}
            icon={
              <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50">
                <MapPin className="h-5 w-5 text-blue-600" />
              </span>
            }
            className="rounded-l-none"
          />
        </div>

        <div className="border-l-4 border-blue-500 rounded-lg">
          <StatCard
            label="Réservations"
            value={stats.total_bookings}
            icon={
              <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50">
                <CalendarCheck className="h-5 w-5 text-blue-600" />
              </span>
            }
            className="rounded-l-none"
          />
        </div>

        <div className="border-l-4 border-blue-500 rounded-lg">
          <StatCard
            label="Clients"
            value={stats.total_customers}
            icon={
              <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50">
                <Users className="h-5 w-5 text-blue-600" />
              </span>
            }
            className="rounded-l-none"
          />
        </div>

        <div className="border-l-4 border-blue-500 rounded-lg">
          <StatCard
            label="Revenus"
            value={formatCurrency(stats.revenue)}
            icon={
              <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </span>
            }
            className="rounded-l-none"
          />
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="flex flex-wrap gap-3">
        <Link to="/trips" className={actionLinkClass}>
          <Plus className="h-4 w-4 shrink-0" />
          Nouveau voyage
        </Link>
        <Link to="/bookings" className={actionLinkClass}>
          <CalendarPlus className="h-4 w-4 shrink-0" />
          Nouvelle réservation
        </Link>
        <Link to="/payments" className={actionLinkClass}>
          <CreditCard className="h-4 w-4 shrink-0" />
          Nouveau paiement
        </Link>
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — Recent bookings */}
        <div className="card flex flex-col lg:col-span-2">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-blue-700">
              Réservations récentes
            </h2>
          </div>

          {recentBookings.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted">
              Aucune réservation pour le moment.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Voyage</th>
                    <th>Places</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="font-medium text-ink">
                        {getCustomerLabel(booking.customer)}
                      </td>
                      <td className="text-muted">
                        {getTripLabel(booking.trip)}
                      </td>
                      <td>{booking.seats}</td>
                      <td className="font-semibold text-ink tabular-nums">
                        {formatCurrency(booking.total_price)}
                      </td>
                      <td>
                        <Badge value={booking.status as BookingStatus} />
                      </td>
                      <td className="text-muted">
                        {formatDate(booking.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT — Popular trips */}
        <div className="card flex flex-col lg:col-span-1">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-blue-700">
              Voyages populaires
            </h2>
          </div>

          {stats.popular_trips.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted">
              Aucun voyage disponible.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {stats.popular_trips.map((trip) => (
                <li
                  key={trip.id}
                  className="flex items-start justify-between gap-3 px-5 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {trip.title}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-muted mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {trip.destination}
                    </span>
                    {trip.available_seats !== undefined && (
                      <p className="text-xs text-muted mt-0.5">
                        {trip.available_seats} place
                        {trip.available_seats !== 1 ? 's' : ''} dispo.
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-ink shrink-0 tabular-nums">
                    {formatCurrency(trip.price)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Status breakdown ── */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-blue-700 mb-5">
          Répartition des réservations par statut
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Confirmed */}
          <div className="bg-status-confirmed-bg border border-status-confirmed/20 rounded-lg p-4">
            <p className="text-2xl font-bold text-ink tabular-nums">{confirmedCount}</p>
            <p className="text-xs font-semibold text-status-confirmed uppercase tracking-wider mt-1">
              Confirmées
            </p>
            <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-status-confirmed rounded-full"
                style={{ width: `${Math.round((confirmedCount / total) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              {Math.round((confirmedCount / total) * 100)}%
            </p>
          </div>

          {/* Pending */}
          <div className="bg-status-pending-bg border border-status-pending/20 rounded-lg p-4">
            <p className="text-2xl font-bold text-ink tabular-nums">{pendingCount}</p>
            <p className="text-xs font-semibold text-status-pending uppercase tracking-wider mt-1">
              En attente
            </p>
            <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-status-pending rounded-full"
                style={{ width: `${Math.round((pendingCount / total) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              {Math.round((pendingCount / total) * 100)}%
            </p>
          </div>

          {/* Cancelled */}
          <div className="bg-status-cancelled-bg border border-status-cancelled/20 rounded-lg p-4">
            <p className="text-2xl font-bold text-ink tabular-nums">{cancelledCount}</p>
            <p className="text-xs font-semibold text-status-cancelled uppercase tracking-wider mt-1">
              Annulées
            </p>
            <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-status-cancelled rounded-full"
                style={{ width: `${Math.round((cancelledCount / total) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              {Math.round((cancelledCount / total) * 100)}%
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
