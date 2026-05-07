import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageSpinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { useBookings, useUpdateBookingStatus } from '../../hooks/index';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { Booking, BookingStatus, Trip, User } from '../../types';

const STATUS_OPTIONS: { value: '' | BookingStatus; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'cancelled', label: 'Annulé' },
];

const STATUS_CHANGE_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'cancelled', label: 'Annulé' },
];

function getCustomerLabel(customer: number | User): string {
  if (typeof customer === 'object') return customer.username;
  return `#${customer}`;
}

function getTripLabel(trip: number | Trip): string {
  if (typeof trip === 'object') return trip.title;
  return `#${trip}`;
}

export default function BookingList() {
  const { user } = useAuthStore();
  const { data: bookings, isLoading } = useBookings();
  const updateStatus = useUpdateBookingStatus();

  const [statusFilter, setStatusFilter] = useState<'' | BookingStatus>('');

  const canManage = user?.role === 'admin' || user?.role === 'agent';

  const filtered = (bookings ?? []).filter((b: Booking) =>
    statusFilter === '' ? true : b.status === statusFilter
  );

  const handleStatusChange = (booking: Booking, newStatus: BookingStatus) => {
    if (newStatus === booking.status) return;
    updateStatus.mutate({ id: booking.id, status: newStatus });
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Réservations</h1>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as '' | BookingStatus)}
            className="h-9 field-input appearance-none cursor-pointer pr-8 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table card */}
      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Voyage</th>
              <th>Places</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-muted text-sm">
                  Aucune réservation trouvée.
                </td>
              </tr>
            ) : (
              filtered.map((booking: Booking) => (
                <tr key={booking.id}>
                  <td className="text-muted text-sm tabular-nums">#{booking.id}</td>
                  <td className="text-sm text-ink">{getCustomerLabel(booking.customer)}</td>
                  <td className="text-sm text-ink">{getTripLabel(booking.trip)}</td>
                  <td className="text-sm tabular-nums">{booking.seats}</td>
                  <td className="text-sm tabular-nums">{formatCurrency(booking.total_price)}</td>
                  <td>
                    <Badge value={booking.status} />
                  </td>
                  <td className="text-sm text-muted tabular-nums">
                    {formatDate(booking.created_at)}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="text-sm font-medium text-ink hover:underline"
                      >
                        Voir
                      </Link>
                      {canManage && (
                        <select
                          value={booking.status}
                          onChange={(e) =>
                            handleStatusChange(booking, e.target.value as BookingStatus)
                          }
                          className="h-7 field-input appearance-none cursor-pointer text-xs px-2 pr-6"
                          disabled={updateStatus.isPending}
                        >
                          {STATUS_CHANGE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
