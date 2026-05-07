import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  CalendarCheck,
  Users,
  Clock,
  Plus,
  CheckCircle,
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { Avatar } from '../../components/ui/Avatar';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useDashboard, useBookings, useCustomers } from '../../hooks/index';
import { useAuthStore } from '../../store/authStore';
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

function getUserDisplayName(user: User): string {
  return user.first_name
    ? `${user.first_name} ${user.last_name}`.trim()
    : user.username;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function AgentDashboard() {
  const { data: stats, isLoading, isError } = useDashboard();
  const { data: bookings = [] } = useBookings();
  const { data: customers = [] } = useCustomers();
  const user = useAuthStore((s) => s.user);

  const pendingBookings = useMemo(
    () => bookings.filter((b) => b.status === 'pending'),
    [bookings],
  );

  const recentCustomers = useMemo(() => customers.slice(-8).reverse(), [customers]);

  const greeting = user?.first_name || user?.username || 'Agent';

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

  return (
    <div className="px-8 py-8 max-w-screen-xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Espace Agent
          </h1>
          <span className="bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold px-2.5 py-1">
            Agent
          </span>
        </div>
        <p className="text-sm text-muted">Bonjour, {greeting}</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="border-l-4 border-emerald-500 rounded-lg">
          <StatCard
            label="Total Clients"
            value={stats.total_customers}
            icon={
              <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-50">
                <Users className="h-5 w-5 text-emerald-700" />
              </span>
            }
            className="rounded-l-none"
          />
        </div>

        <div className="border-l-4 border-emerald-500 rounded-lg">
          <StatCard
            label="Total Réservations"
            value={stats.total_bookings}
            icon={
              <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-50">
                <CalendarCheck className="h-5 w-5 text-emerald-700" />
              </span>
            }
            className="rounded-l-none"
          />
        </div>

        <div className="border-l-4 border-amber-500 rounded-lg">
          <StatCard
            label="En attente"
            value={pendingBookings.length}
            icon={
              <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </span>
            }
            className="rounded-l-none"
          />
        </div>

      </div>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT — Pending bookings */}
        <div className="card flex flex-col">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-emerald-800">
              Réservations en attente de traitement
            </h2>
          </div>

          {pendingBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-10 text-center">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
              <p className="text-sm text-muted">
                Aucune réservation en attente
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Voyage</th>
                    <th>Places</th>
                    <th>Montant</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBookings.map((booking) => (
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
                      <td className="text-muted">
                        {formatDate(booking.created_at)}
                      </td>
                      <td>
                        <Link
                          to={`/bookings/${booking.id}`}
                          className="text-sm font-medium text-emerald-700 hover:underline"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT — Recent customers */}
        <div className="card flex flex-col">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-emerald-800">
              Clients récents
            </h2>
          </div>

          {recentCustomers.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted">
              Aucun client enregistré.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentCustomers.map((customer) => {
                const name = getUserDisplayName(customer);
                return (
                  <li
                    key={customer.id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <Avatar
                      name={name}
                      src={customer.avatar ?? null}
                      size="sm"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {name}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {customer.email}
                      </p>
                    </div>

                    <Badge value={customer.role} />

                    <Link
                      to={`/customers/${customer.id}`}
                      className="text-sm font-medium text-emerald-700 hover:underline shrink-0"
                    >
                      Voir
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>

      {/* ── Quick actions ── */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-emerald-800 mb-5">
          Actions rapides
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

          <Link
            to="/customers"
            className="card p-4 flex flex-col items-center gap-2 hover:bg-muted-bg transition-colors cursor-pointer text-center"
          >
            <span className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Users className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-ink">
              Voir tous les clients
            </span>
          </Link>

          <Link
            to="/bookings"
            className="card p-4 flex flex-col items-center gap-2 hover:bg-muted-bg transition-colors cursor-pointer text-center"
          >
            <span className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CalendarCheck className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-ink">
              Voir toutes les réservations
            </span>
          </Link>

          <Link
            to="/bookings"
            className="card p-4 flex flex-col items-center gap-2 hover:bg-muted-bg transition-colors cursor-pointer text-center"
          >
            <span className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-ink">
              Créer une réservation
            </span>
          </Link>

          <Link
            to="/trips"
            className="card p-4 flex flex-col items-center gap-2 hover:bg-muted-bg transition-colors cursor-pointer text-center"
          >
            <span className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <MapPin className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-ink">
              Rechercher un voyage
            </span>
          </Link>

        </div>
      </div>

    </div>
  );
}
