import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Search, Compass } from 'lucide-react';
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
    <div className="card overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
      {trip.image ? (
        <div className="relative overflow-hidden">
          <img
            src={trip.image}
            alt={trip.title}
            className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="w-full h-44 bg-muted-bg flex items-center justify-center">
          <MapPin className="h-10 w-10 text-border" strokeWidth={1.5} />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-2">
          <span className={cn('h-2 w-2 rounded-full shrink-0', hasSeats ? 'bg-status-confirmed' : 'bg-status-cancelled')} />
          <span className="text-xs text-muted">{hasSeats ? 'Disponible' : 'Complet'}</span>
        </div>

        <p className="text-base font-bold text-ink leading-snug">{trip.title}</p>

        <span className="flex items-center gap-1 text-sm text-muted mt-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {trip.destination}
        </span>

        <div className="border-t border-border my-3" />

        <span className="flex items-center gap-1 text-sm text-muted">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          Du {formatDate(trip.start_date)} au {formatDate(trip.end_date)}
        </span>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div>
            <p className="text-xl font-bold text-ink tabular-nums">{formatCurrency(trip.price)}</p>
            <p className="text-xs text-muted">{seats} place{seats !== 1 ? 's' : ''}</p>
          </div>
          <Link to={`/trips/${trip.id}`}>
            <Button variant="primary" size="sm">Réserver</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Quick-filter destinations ─────────────────────────────────────────────

const QUICK_FILTERS = ['Europe', 'Asie', 'Afrique', 'Amériques', 'Océanie'];

// ── TripSearch page ───────────────────────────────────────────────────────

export default function TripSearch() {
  const { data: trips = [], isLoading } = useTrips();

  const [searchDest, setSearchDest] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [activeSearch, setActiveSearch] = useState({ dest: '', from: '', to: '' });

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

  const handleQuickFilter = (region: string) => {
    setSearchDest(region);
    setActiveSearch({ dest: region, from: dateFrom, to: dateTo });
    setHasSearched(true);
  };

  const filtered = useMemo<Trip[]>(() => {
    return trips.filter((trip: Trip) => {
      if (activeSearch.dest) {
        const q = activeSearch.dest.toLowerCase();
        if (!trip.destination.toLowerCase().includes(q) && !trip.title.toLowerCase().includes(q)) return false;
      }
      if (activeSearch.from && trip.start_date < activeSearch.from) return false;
      if (activeSearch.to && trip.end_date > activeSearch.to) return false;
      return true;
    });
  }, [trips, activeSearch]);

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-6xl mx-auto">

      {/* ── Hero section ── */}
      <div className="relative overflow-hidden" style={{ height: '320px' }}>
        <img
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80"
          alt="Carte et boussole de voyage"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/50 to-ink/80" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest mb-3">
            <Compass className="h-4 w-4" />
            Explorez le monde
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Trouvez votre prochaine<br />
            <span className="text-accent">aventure</span>
          </h1>
          <p className="text-white/70 mt-3 text-sm max-w-sm">
            Des centaines de destinations vous attendent. Utilisez les filtres pour trouver le voyage idéal.
          </p>

          {/* Quick filter chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {QUICK_FILTERS.map((region) => (
              <button
                key={region}
                onClick={() => handleQuickFilter(region)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                  activeSearch.dest === region
                    ? 'bg-accent border-accent text-white'
                    : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                )}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">

        {/* ── Search bar ── */}
        <div className="card p-6">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-48">
              <label className="field-label">Destination</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="text"
                  value={searchDest}
                  onChange={(e) => setSearchDest(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Destination (ex: Paris, Maroc...)"
                  className="field-input pl-9"
                />
              </div>
            </div>

            <div className="min-w-40">
              <label className="field-label">Date départ</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="field-input"
              />
            </div>

            <div className="min-w-40">
              <label className="field-label">Date retour</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="field-input"
              />
            </div>

            <div className="flex gap-2 shrink-0">
              <Button variant="primary" onClick={handleSearch}>Rechercher</Button>
              <Button variant="secondary" onClick={handleReset}>Réinitialiser</Button>
            </div>
          </div>
        </div>

        {/* ── Results count ── */}
        {hasSearched && (
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{filtered.length}</span> voyage{filtered.length !== 1 ? 's' : ''} trouvé
            {filtered.length !== 1 ? 's' : ''}
            {activeSearch.dest && (
              <span> pour <span className="font-semibold text-accent">« {activeSearch.dest} »</span></span>
            )}
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
                <Button variant="secondary" onClick={handleReset}>Effacer les filtres</Button>
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
    </div>
  );
}
