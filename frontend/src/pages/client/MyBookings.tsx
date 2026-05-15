import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard, X, Download, Loader2, CalendarCheck, AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { Empty } from '../../components/ui/Empty';
import { useToast } from '../../components/ui/Toast';
import { useBookings, useCancelBooking, useInvoices } from '../../hooks/index';
import { invoiceService } from '../../services/invoiceService';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';
import type { Booking, BookingStatus, Trip, User } from '../../types';

// ── Status tab config ─────────────────────────────────────────────────────────

type TabValue = '' | BookingStatus;

const STATUS_TABS: { value: TabValue; label: string }[] = [
  { value: '', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'cancelled', label: 'Annulées' },
];

function getTripLabel(trip: Booking['trip']): string {
  if (typeof trip === 'object' && trip !== null) return (trip as Trip).title;
  return `Voyage #${trip}`;
}
function getTripImage(trip: Booking['trip']): string | undefined {
  if (typeof trip === 'object' && trip !== null) return (trip as Trip).image ?? undefined;
}
function getTripDestination(trip: Booking['trip']): string | undefined {
  if (typeof trip === 'object' && trip !== null) return (trip as Trip).destination;
}

// ── Cancel confirm dialog ─────────────────────────────────────────────────────

function CancelDialog({
  onConfirm, onClose, loading,
}: { onConfirm: () => void; onClose: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
      <div className="bg-surface rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </span>
          <div>
            <p className="font-bold text-ink">Annuler la réservation ?</p>
            <p className="text-xs text-muted mt-0.5">Cette action est irréversible.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-border rounded-lg py-2 text-sm font-semibold text-ink hover:bg-muted-bg transition-colors">
            Garder
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Booking card ──────────────────────────────────────────────────────────────

interface BookingCardProps {
  booking: Booking;
  invoice?: { id: number; invoice_number: string } | null;
}

function BookingCard({ booking, invoice }: BookingCardProps) {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const cancelMut = useCancelBooking();
  const [showConfirm, setShowConfirm] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isPending = booking.status === 'pending';
  const image = getTripImage(booking.trip);
  const destination = getTripDestination(booking.trip);

  const handleCancel = async () => {
    try {
      await cancelMut.mutateAsync(booking.id);
      success('Réservation annulée');
    } catch {
      error('Impossible d\'annuler cette réservation');
    } finally {
      setShowConfirm(false);
    }
  };

  const handleDownload = async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      await invoiceService.downloadPdf(invoice.id, invoice.invoice_number);
      success('Facture téléchargée');
    } catch {
      error('Impossible de télécharger la facture');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {showConfirm && (
        <CancelDialog
          onConfirm={handleCancel}
          onClose={() => setShowConfirm(false)}
          loading={cancelMut.isPending}
        />
      )}

      <div className={cn(
        'card overflow-hidden transition-shadow hover:shadow-md',
        booking.status === 'cancelled' && 'opacity-60',
      )}>
        <div className="flex">
          {/* Trip image thumbnail */}
          {image ? (
            <div className="w-24 sm:w-32 shrink-0">
              <img src={image} alt={getTripLabel(booking.trip)} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="w-24 sm:w-32 shrink-0 bg-muted-bg flex items-center justify-center">
              <CalendarCheck className="h-8 w-8 text-border" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="font-bold text-ink truncate">{getTripLabel(booking.trip)}</p>
                {destination && <p className="text-xs text-muted mt-0.5">{destination}</p>}
              </div>
              <Badge value={booking.status} />
            </div>

            <p className="text-sm text-muted">
              {booking.seats} place{booking.seats > 1 ? 's' : ''} ·{' '}
              <span className="font-semibold text-ink tabular-nums">{formatCurrency(booking.total_price)}</span>
            </p>
            <p className="text-xs text-muted">Réservé le {formatDate(booking.created_at)}</p>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap mt-1">
              {/* Pay button — only for pending */}
              {isPending && (
                <button
                  onClick={() => navigate(`/checkout/${booking.id}`)}
                  className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Payer maintenant
                </button>
              )}

              {/* Cancel button — only for pending */}
              {isPending && (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Annuler
                </button>
              )}

              {/* Invoice download — always visible if invoice exists */}
              {invoice && (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                >
                  {downloading
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Download className="h-3.5 w-3.5" />}
                  Facture PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── MyBookings page ───────────────────────────────────────────────────────────

export default function MyBookings() {
  const { user } = useAuthStore();
  const { data: bookings = [], isLoading } = useBookings();
  const { data: invoices = [] } = useInvoices();
  const [activeTab, setActiveTab] = useState<TabValue>('');

  const myBookings = useMemo(() => {
    if (!user) return [];
    return bookings.filter((b: Booking) => {
      const custId = typeof b.customer === 'object' ? (b.customer as User).id : b.customer;
      return custId === user.id;
    });
  }, [bookings, user]);

  const displayed = useMemo(() => {
    if (activeTab === '') return myBookings;
    return myBookings.filter((b) => b.status === activeTab);
  }, [myBookings, activeTab]);

  // Map bookingId → invoice for fast lookup
  const invoiceMap = useMemo(() => {
    const m = new Map<number, { id: number; invoice_number: string }>();
    invoices.forEach((inv) => m.set(inv.booking, { id: inv.id, invoice_number: inv.invoice_number }));
    return m;
  }, [invoices]);

  if (isLoading) return <PageSpinner />;

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Mes réservations</h1>
        <span className="text-xs bg-muted-bg text-muted rounded-full px-2 py-0.5 font-semibold">
          {myBookings.length}
        </span>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)}
            className={activeTab === tab.value
              ? 'bg-ink text-white rounded-full px-3 py-1 text-xs font-semibold transition-colors'
              : 'bg-muted-bg text-muted rounded-full px-3 py-1 text-xs font-semibold cursor-pointer hover:bg-border transition-colors'
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        myBookings.length === 0 ? (
          <Empty
            title="Aucune réservation"
            description="Vous n'avez pas encore effectué de réservation. Explorez nos voyages pour commencer !"
            action={<Link to="/explore"><Button variant="primary">Explorer les voyages</Button></Link>}
          />
        ) : (
          <Empty title="Aucune réservation dans cette catégorie" description="Essayez un autre filtre." />
        )
      ) : (
        <div className="space-y-3">
          {displayed.map((booking: Booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              invoice={invoiceMap.get(booking.id) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
