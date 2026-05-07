import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { useCustomer, useBookings } from '../../hooks/index';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { Booking, Trip, User } from '../../types';

function fullName(user: User): string {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
  return name || user.username;
}

function getTripLabel(trip: number | Trip): string {
  if (typeof trip === 'object') return trip.title;
  return `Voyage #${trip}`;
}

function getCustomerId(customer: number | User): number {
  return typeof customer === 'object' ? customer.id : customer;
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const customerId = parseInt(id ?? '0', 10);

  const { data: customer, isLoading: customerLoading } = useCustomer(customerId);
  const { data: allBookings, isLoading: bookingsLoading } = useBookings();

  if (customerLoading) return <PageSpinner />;

  if (!customer) {
    return (
      <div className="px-8 py-8">
        <p className="text-muted">Client introuvable.</p>
      </div>
    );
  }

  const customerBookings = (allBookings ?? []).filter(
    (b: Booking) => getCustomerId(b.customer) === customerId
  );

  return (
    <div className="px-8 py-8">
      {/* Back link */}
      <Link
        to="/customers"
        className="inline-flex items-center text-sm text-muted hover:text-ink mb-6"
      >
        ← Clients
      </Link>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT — Customer profile */}
        <div className="col-span-2">
          <div className="card p-6">
            {/* Avatar + name header */}
            <div className="flex items-center gap-4 mb-6">
              <Avatar name={fullName(customer)} src={customer.avatar} size="lg" />
              <div>
                <h2 className="text-xl font-bold text-ink leading-tight">{fullName(customer)}</h2>
                <p className="text-sm text-muted mt-0.5">{customer.email}</p>
                <div className="mt-1.5">
                  <Badge value={customer.role} />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-5">
              <h3 className="text-sm font-semibold text-ink mb-4">Profil client</h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-xs text-muted uppercase tracking-wide mb-1">
                    Nom d'utilisateur
                  </dt>
                  <dd className="text-sm text-ink font-medium">@{customer.username}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase tracking-wide mb-1">Email</dt>
                  <dd className="text-sm text-ink font-medium">{customer.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase tracking-wide mb-1">Téléphone</dt>
                  <dd className="text-sm text-ink font-medium tabular-nums">
                    {customer.phone ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase tracking-wide mb-1">Rôle</dt>
                  <dd>
                    <Badge value={customer.role} />
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* RIGHT — Customer bookings */}
        <div className="col-span-1">
          <div className="card p-6">
            <h2 className="text-base font-semibold text-ink mb-4">
              Réservations du client
            </h2>

            {bookingsLoading ? (
              <p className="text-sm text-muted">Chargement…</p>
            ) : customerBookings.length === 0 ? (
              <p className="text-sm text-muted">Aucune réservation.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {customerBookings.map((booking: Booking) => (
                  <li
                    key={booking.id}
                    className="flex flex-col gap-1 border border-border rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-ink truncate">
                        {getTripLabel(booking.trip)}
                      </span>
                      <Badge value={booking.status} />
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-muted tabular-nums">
                        {formatCurrency(booking.total_price)}
                      </span>
                      <span className="text-xs text-muted tabular-nums">
                        {formatDate(booking.created_at)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
