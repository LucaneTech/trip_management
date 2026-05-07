import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Empty } from '../../components/ui/Empty';
import { PageSpinner } from '../../components/ui/Spinner';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { useTrips } from '../../hooks/index';
import type { Trip } from '../../types';

// ── Trip card ─────────────────────────────────────────────────────────────

interface TripCardProps {
  trip: Trip;
}

function TripCard({ trip }: TripCardProps) {
  const seats = trip.available_seats ?? trip.capacity;
  const hasSeats = seats > 0;

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Image / placeholder */}
      {trip.image ? (
        <img
          src={trip.image}
          alt={trip.title}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-muted-bg flex items-center justify-center">
          <MapPin className="h-10 w-10 text-border" strokeWidth={1.5} />
        </div>
      )}

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Availability dot */}
        <div className="flex items-center gap-1.5 mb-2">
          <span
            className={cn(
              'h-2 w-2 rounded-full shrink-0',
              hasSeats ? 'bg-status-confirmed' : 'bg-status-cancelled'
            )}
          />
          <span className="text-xs text-muted">
            {hasSeats ? 'Disponible' : 'Complet'}
          </span>
        </div>

        {/* Title */}
        <p className="text-base font-bold text-ink leading-snug">{trip.title}</p>

        {/* Destination */}
        <span className="flex items-center gap-1 text-sm text-muted mt-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {trip.destination}
        </span>

        {/* Divider */}
        <div className="border-t border-border my-3" />

        {/* Dates */}
        <span className="flex items-center gap-1 text-sm text-muted">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          Du {formatDate(trip.start_date)} au {formatDate(trip.end_date)}
        </span>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div>
            <p className="text-xl font-bold text-ink tabular-nums">
              {formatCurrency(trip.price)}
            </p>
            <p className="text-xs text-muted">
              {seats} place{seats !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to={`/trips/${trip.id}`}>
            <Button variant="primary" size="sm">
              Réserver
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── TripSearch page ───────────────────────────────────────────────────────

export default function TripSearch() {
  const { data: trips = [], isLoading } = useTrips();

  const [searchDest, setSearchDest] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Active filter state (applied on button click)
  const [activeSearch, setActiveSearch] = useState({
    dest: '',
    from: '',
    to: '',
  });

  const handleSearch = () => {
    setActiveSearch({ dest: searchDest, from: dateFrom, to: dateTo });
    setHasSearched(true);
  };

  const handleReset = () => {
    setSearchDest('');
    setDateFrom('');
    setDateTo('');
    setActiveSearch({ dest: '', from: '', to: '' });
    setHasSearched(false);
  };

  const filtered = useMemo<Trip[]>(() => {
    return trips.filter((trip: Trip) => {
      // Destination / title filter
      if (activeSearch.dest) {
        const q = activeSearch.dest.toLowerCase();
        const matchesDest = trip.destination.toLowerCase().includes(q);
        const matchesTitle = trip.title.toLowerCase().includes(q);
        if (!matchesDest && !matchesTitle) return false;
      }

      // Date from filter
      if (activeSearch.from && trip.start_date < activeSearch.from) {
        return false;
      }

      // Date to filter
      if (activeSearch.to && trip.end_date > activeSearch.to) {
        return false;
      }

      return true;
    });
  }, [trips, activeSearch]);

  if (isLoading) return <PageSpinner />;

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">

      {/* ── Search bar ── */}
      <div className="card p-6 mb-8">
        <h1 className="text-xl font-bold text-ink mb-4">Rechercher un voyage</h1>

        <div className="flex gap-4 flex-wrap items-end">
          {/* Destination */}
          <div className="flex-1 min-w-48">
            <label className="field-label">Destination</label>
            <input
              type="text"
              value={searchDest}
              onChange={(e) => setSearchDest(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Destination (ex: Paris, Maroc...)"
              className="field-input"
            />
          </div>

          {/* Date départ */}
          <div className="min-w-40">
            <label className="field-label">Date départ</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="field-input"
            />
          </div>

          {/* Date retour */}
          <div className="min-w-40">
            <label className="field-label">Date retour</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="field-input"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            <Button variant="primary" onClick={handleSearch}>
              Rechercher
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      {hasSearched && (
        <p className="text-sm text-muted mb-4">
          {filtered.length} voyage{filtered.length !== 1 ? 's' : ''} trouvé
          {filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* ── Trip grid ── */}
      {filtered.length === 0 ? (
        <Empty
          title="Aucun voyage trouvé"
          description={
            hasSearched
              ? "Aucun voyage ne correspond à vos critères. Essayez d'autres filtres."
              : "Il n'y a aucun voyage disponible pour le moment."
          }
          action={
            hasSearched ? (
              <Button variant="secondary" onClick={handleReset}>
                Effacer les filtres
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((trip: Trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
