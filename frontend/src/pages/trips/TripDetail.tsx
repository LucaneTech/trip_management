import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Tag, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { useTrip, useCreateBooking } from '../../hooks/index';
import { useAuthStore } from '../../store/authStore';

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const tripId = Number(id);

  const { data: trip, isLoading, isError } = useTrip(tripId);
  const createBooking = useCreateBooking();
  const { user } = useAuthStore();

  const [seats, setSeats] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  if (isLoading) return <PageSpinner />;

  if (isError || !trip) {
    return (
      <div className="px-8 py-8">
        <Link
          to="/trips"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voyages
        </Link>
        <div className="flex flex-col items-center justify-center min-h-64 gap-3">
          <p className="text-lg font-semibold text-ink">Voyage introuvable</p>
          <p className="text-sm text-muted">
            Ce voyage n&apos;existe pas ou a été supprimé.
          </p>
          <Link to="/trips">
            <Button variant="secondary">Retour aux voyages</Button>
          </Link>
        </div>
      </div>
    );
  }

  const availableSeats = trip.available_seats ?? trip.capacity;
  const priceNum = parseFloat(trip.price);
  const totalPrice = priceNum * seats;

  const handleBook = async () => {
    setBookingError(null);
    try {
      await createBooking.mutateAsync({ trip: trip.id, seats });
      setBookingSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Une erreur est survenue.';
      setBookingError(message);
    }
  };

  return (
    <div className="px-8 py-8">
      {/* Back link */}
      <Link
        to="/trips"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voyages
      </Link>

      {/* Two-column layout */}
      <div className="grid grid-cols-3 gap-8">
        {/* LEFT — trip info */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Main card */}
          <div className="card p-6">
            {/* Title + destination */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-ink mb-2">{trip.title}</h1>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                <MapPin className="h-4 w-4 shrink-0" />
                {trip.destination}
              </span>
            </div>

            {/* Description */}
            {trip.description && (
              <p className="text-sm text-muted leading-relaxed">
                {trip.description}
              </p>
            )}

            {!trip.description && (
              <p className="text-sm text-muted italic">
                Aucune description disponible.
              </p>
            )}
          </div>

          {/* Metadata grid */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-ink mb-4">
              Détails du voyage
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs text-muted font-medium uppercase tracking-wide">
                  <Tag className="h-3.5 w-3.5" />
                  Prix par personne
                </span>
                <span className="text-lg font-semibold text-ink tabular-nums">
                  {formatCurrency(trip.price)}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs text-muted font-medium uppercase tracking-wide">
                  <Users className="h-3.5 w-3.5" />
                  Capacité totale
                </span>
                <span className="text-lg font-semibold text-ink">
                  {trip.capacity} personnes
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs text-muted font-medium uppercase tracking-wide">
                  <Calendar className="h-3.5 w-3.5" />
                  Départ
                </span>
                <span className="text-base font-medium text-ink">
                  {formatDate(trip.start_date)}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs text-muted font-medium uppercase tracking-wide">
                  <Calendar className="h-3.5 w-3.5" />
                  Retour
                </span>
                <span className="text-base font-medium text-ink">
                  {formatDate(trip.end_date)}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs text-muted font-medium uppercase tracking-wide">
                  <Users className="h-3.5 w-3.5" />
                  Places disponibles
                </span>
                <span
                  className={cn(
                    'text-lg font-semibold',
                    availableSeats > 0 ? 'text-status-confirmed' : 'text-status-cancelled'
                  )}
                >
                  {availableSeats}
                  {availableSeats === 0 && (
                    <span className="ml-2 text-sm font-normal text-status-cancelled">
                      Complet
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — booking card */}
        <div className="col-span-1">
          <div className="card p-6 sticky top-8">
            <h2 className="text-base font-semibold text-ink mb-4">
              Réserver ce voyage
            </h2>

            {!user ? (
              /* Not logged in */
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted">
                  Vous devez être connecté pour réserver ce voyage.
                </p>
                <Link to="/login">
                  <Button variant="primary" className="w-full">
                    Se connecter
                  </Button>
                </Link>
              </div>
            ) : bookingSuccess ? (
              /* Success state */
              <div className="flex flex-col gap-3">
                <div className="rounded-lg bg-status-confirmed-bg border border-status-confirmed/20 px-4 py-3">
                  <p className="text-sm font-medium text-status-confirmed">
                    Réservation confirmée !
                  </p>
                  <p className="text-xs text-status-confirmed/80 mt-0.5">
                    Votre réservation a bien été enregistrée.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setBookingSuccess(false);
                    setSeats(1);
                  }}
                >
                  Nouvelle réservation
                </Button>
              </div>
            ) : availableSeats === 0 ? (
              /* No seats */
              <div className="rounded-lg bg-muted-bg border border-border px-4 py-3">
                <p className="text-sm text-muted font-medium">
                  Ce voyage est complet.
                </p>
              </div>
            ) : (
              /* Booking form */
              <div className="flex flex-col gap-4">
                {/* Seats input */}
                <div className="flex flex-col gap-1">
                  <label className="field-label">
                    Nombre de places
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={availableSeats}
                    value={seats}
                    onChange={(e) => {
                      const val = Math.max(
                        1,
                        Math.min(availableSeats, Number(e.target.value))
                      );
                      setSeats(val);
                    }}
                    className="field-input"
                  />
                  <p className="text-xs text-muted">
                    Maximum {availableSeats} place
                    {availableSeats > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Price calculation */}
                <div className="rounded-lg bg-paper border border-border px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-muted">
                    {seats} × {formatCurrency(trip.price)}
                  </span>
                  <span className="text-base font-semibold text-ink tabular-nums">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>

                {/* Error */}
                {bookingError && (
                  <p className="text-xs text-status-cancelled">{bookingError}</p>
                )}

                {/* Submit */}
                <Button
                  variant="primary"
                  className="w-full"
                  loading={createBooking.isPending}
                  onClick={handleBook}
                >
                  Réserver
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
