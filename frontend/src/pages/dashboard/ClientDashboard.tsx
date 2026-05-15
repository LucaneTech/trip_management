import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CalendarCheck, CreditCard, ArrowRight, Star } from 'lucide-react';
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
      <span className={`h-14 w-14 rounded-xl flex items-center justify-center text-white shrink-0 ${iconBg}`}>
        {icon}
      </span>
      <div>
        <p className="font-semibold text-ink group-hover:underline">{title}</p>
        <p className="text-sm text-muted mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

// ── Destination gallery card ───────────────────────────────────────────────

const DESTINATIONS = [
  {
    name: 'Santorin',
    country: 'Grèce',
    img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=75',
    rating: 4.9,
  },
  {
    name: 'Marrakech',
    country: 'Maroc',
    img: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=75',
    rating: 4.7,
  },
  {
    name: 'Bali',
    country: 'Indonésie',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=75',
    rating: 4.8,
  },
  {
    name: 'Maldives',
    country: 'Océan Indien',
    img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=75',
    rating: 5.0,
  },
  {
    name: 'Tokyo',
    country: 'Japon',
    img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=75',
    rating: 4.8,
  },
  {
    name: 'Paris',
    country: 'France',
    img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=75',
    rating: 4.6,
  },
];

function DestCard({ name, country, img, rating }: typeof DESTINATIONS[0]) {
  return (
    <div className="relative rounded-xl overflow-hidden group cursor-pointer">
      <img
        src={img}
        alt={name}
        className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-bold text-sm leading-tight">{name}</p>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-white/70 text-xs flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5" /> {country}
          </span>
          <span className="flex items-center gap-0.5 text-xs text-yellow-300 font-semibold">
            <Star className="h-2.5 w-2.5 fill-yellow-300" /> {rating}
          </span>
        </div>
      </div>
    </div>
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

  const greeting = user ? user.first_name || user.username : 'vous';

  if (isLoading) return <PageSpinner />;

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-10">

      {/* ── Welcome ── */}
      <div>
        <h1 className="text-3xl font-bold text-ink tracking-tight">
          Bonjour, {greeting} 👋
        </h1>
        <p className="text-muted text-lg mt-1">Prêt pour votre prochain voyage ?</p>
      </div>

      {/* ── Hero banner ── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ height: '300px' }}>
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1400&q=80"
          alt="Avion en vol"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/60 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-12">
          <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-widest mb-3">
            <span className="h-1.5 w-6 bg-accent rounded-full" />
            Nouvelles destinations
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Où allez-vous<br />cette saison ?
          </h2>
          <p className="text-white/70 mt-3 max-w-sm text-sm">
            Des centaines de voyages vous attendent. Trouvez celui qui correspond à vos envies.
          </p>
          <Link
            to="/explore"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold text-sm transition-colors self-start"
          >
            Explorer maintenant
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── Quick-access cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickCard
          to="/explore"
          iconBg="bg-accent"
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

      {/* ── Destination gallery ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Destinations à la une</h2>
            <p className="text-sm text-muted mt-0.5">Inspirez-vous pour votre prochain voyage</p>
          </div>
          <Link to="/explore" className="text-sm text-accent font-semibold hover:underline flex items-center gap-1">
            Voir tout <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DESTINATIONS.map((dest) => (
            <DestCard key={dest.name} {...dest} />
          ))}
        </div>
      </div>

      {/* ── Recent bookings ── */}
      <div>
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
              <div key={booking.id} className="card flex items-center gap-4 p-4 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{getTripLabel(booking.trip)}</p>
                  <p className="text-xs text-muted mt-0.5">{formatDate(booking.created_at)}</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
                  <span className="text-sm font-semibold text-ink tabular-nums">
                    {formatCurrency(booking.total_price)}
                  </span>
                  <span className="text-xs text-muted">
                    {booking.seats} place{booking.seats > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="shrink-0">
                  <Badge value={booking.status} />
                </div>
              </div>
            ))}
            <div className="mt-2">
              <Link to="/my-bookings" className="text-sm text-muted hover:text-ink transition-colors">
                Voir toutes mes réservations →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* ── Travel tip banner ── */}
      <div className="relative rounded-xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=75"
          alt="Voyage"
          className="w-full h-36 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-ink/40" />
        <div className="absolute inset-0 flex items-center px-8 gap-6">
          <div className="flex-1">
            <p className="text-white font-bold text-base">Voyagez malin, voyagez avec nous</p>
            <p className="text-white/70 text-sm mt-1">Des offres exclusives chaque semaine pour nos membres.</p>
          </div>
          <Link
            to="/explore"
            className="shrink-0 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Voir les offres
          </Link>
        </div>
      </div>

    </div>
  );
}
