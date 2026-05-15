import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  CalendarCheck,
  Users,
  Clock,
  Plus,
  CheckCircle,
  Headphones,
  CreditCard,
  Check,
  X,
  Loader2,
  Receipt,
  Download,
  FileText,
  LayoutDashboard,
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { Avatar } from '../../components/ui/Avatar';
import { useToast } from '../../components/ui/Toast';
import { DashboardTabs } from '../../components/ui/DashboardTabs';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  useDashboard,
  useBookings,
  useCustomers,
  useUpdateBookingStatus,
  usePayments,
  useUpdatePaymentStatus,
  useInvoices,
} from '../../hooks/index';
import { invoiceService } from '../../services/invoiceService';
import { useAuthStore } from '../../store/authStore';
import type { Booking, Payment, Trip, User, BookingStatus, PaymentStatus } from '../../types';

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

function getBookingLabel(booking: Payment['booking']): string {
  if (typeof booking === 'object' && booking !== null) {
    const b = booking as Booking;
    return `Résa #${b.id}`;
  }
  return `Résa #${booking}`;
}

function getUserDisplayName(user: User): string {
  return user.first_name
    ? `${user.first_name} ${user.last_name}`.trim()
    : user.username;
}

const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'En attente',
  completed: 'Complété',
  failed: 'Échoué',
};

// ── BookingStatusActions ──────────────────────────────────────────────────────

function BookingStatusActions({ booking }: { booking: Booking }) {
  const { mutate, isPending, variables } = useUpdateBookingStatus();
  const { success, error } = useToast();

  const handle = (status: BookingStatus) => {
    mutate(
      { id: booking.id, status },
      {
        onSuccess: () => success(`Réservation ${BOOKING_STATUS_LABELS[status].toLowerCase()}`),
        onError: () => error('Erreur lors de la mise à jour'),
      },
    );
  };

  if (booking.status !== 'pending') {
    return <Badge value={booking.status} />;
  }

  const loading = isPending;
  const target = variables?.status;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => handle('confirmed')}
        disabled={loading}
        title="Confirmer"
        className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 transition-colors"
      >
        {loading && target === 'confirmed' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Check className="h-3 w-3" />
        )}
        Confirmer
      </button>
      <button
        onClick={() => handle('cancelled')}
        disabled={loading}
        title="Annuler"
        className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50 transition-colors"
      >
        {loading && target === 'cancelled' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <X className="h-3 w-3" />
        )}
        Annuler
      </button>
    </div>
  );
}

// ── PaymentStatusSelect ───────────────────────────────────────────────────────

function PaymentStatusSelect({ payment }: { payment: Payment }) {
  const { mutate, isPending } = useUpdatePaymentStatus();
  const { success, error } = useToast();
  const [value, setValue] = useState<PaymentStatus>(payment.status);

  const handle = (status: PaymentStatus) => {
    setValue(status);
    mutate(
      { id: payment.id, status },
      {
        onSuccess: () => success(`Paiement marqué : ${PAYMENT_STATUS_LABELS[status]}`),
        onError: () => {
          setValue(payment.status);
          error('Erreur lors de la mise à jour');
        },
      },
    );
  };

  const colorMap: Record<PaymentStatus, string> = {
    pending: 'text-amber-700 bg-amber-50 border-amber-200',
    completed: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    failed: 'text-red-700 bg-red-50 border-red-200',
  };

  return (
    <div className="relative inline-flex items-center gap-1">
      {isPending && <Loader2 className="h-3 w-3 animate-spin text-muted" />}
      <select
        value={value}
        onChange={(e) => handle(e.target.value as PaymentStatus)}
        disabled={isPending}
        className={`rounded-md border px-2 py-1 text-xs font-semibold appearance-none cursor-pointer disabled:opacity-50 focus:outline-none ${colorMap[value]}`}
      >
        <option value="pending">En attente</option>
        <option value="completed">Complété</option>
        <option value="failed">Échoué</option>
      </select>
    </div>
  );
}

// ── component ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview', label: 'Vue générale', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
  { id: 'invoices', label: 'Factures',     icon: <Receipt className="h-3.5 w-3.5" /> },
];

export default function AgentDashboard() {
  const { data: stats, isLoading, isError } = useDashboard();
  const { data: bookings = [] } = useBookings();
  const { data: customers = [] } = useCustomers();
  const { data: payments = [] } = usePayments();
  const { data: invoices = [] } = useInvoices();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('overview');
  const [downloading, setDownloading] = useState<number | null>(null);

  const pendingBookings = useMemo(
    () => bookings.filter((b) => b.status === 'pending'),
    [bookings],
  );

  const allBookings = useMemo(
    () => [...bookings].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    ).slice(0, 10),
    [bookings],
  );

  const recentPayments = useMemo(
    () => [...payments].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    ).slice(0, 10),
    [payments],
  );

  const recentCustomers = useMemo(() => customers.slice(-8).reverse(), [customers]);

  const greeting = user?.first_name || user?.username || 'Agent';

  const handleDownload = async (id: number, number: string) => {
    setDownloading(id);
    try {
      await invoiceService.downloadPdf(id, number);
      success('Facture téléchargée');
    } catch {
      error('Impossible de télécharger la facture');
    } finally {
      setDownloading(null);
    }
  };

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
    <div className="max-w-screen-xl mx-auto">

      {/* ── Hero strip ── */}
      <div className="relative overflow-hidden" style={{ height: '180px' }}>
        <img
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=75"
          alt="Équipe agent voyage"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-900/70 to-transparent" />
        <div className="relative z-10 flex items-center justify-between h-full px-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Headphones className="h-4 w-4 text-accent" />
              <span className="text-accent text-xs font-bold uppercase tracking-widest">Espace Agent</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Bonjour, {greeting}</h1>
            <p className="text-white/60 text-sm mt-1">Gérez vos clients et réservations depuis ici</p>
          </div>
          <div className="hidden md:flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{stats.total_customers}</p>
              <p className="text-white/60 text-xs mt-0.5">Clients</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{stats.total_bookings}</p>
              <p className="text-white/60 text-xs mt-0.5">Réservations</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-2xl font-bold text-accent tabular-nums">{pendingBookings.length}</p>
              <p className="text-white/60 text-xs mt-0.5">En attente</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="px-8 pt-4">
        <DashboardTabs
          tabs={TABS}
          active={activeTab}
          onChange={setActiveTab}
          accentClass="border-emerald-600 text-emerald-700"
        />
      </div>

      <div className="px-8 py-8 space-y-8">

      {activeTab === 'invoices' ? (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-700" />
              <h2 className="text-sm font-semibold text-emerald-800">Factures des réservations</h2>
            </div>
            <Link to="/invoices" className="text-xs text-emerald-700 font-medium hover:underline">
              Page complète →
            </Link>
          </div>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <FileText className="h-10 w-10 text-border" strokeWidth={1.5} />
              <p className="text-sm text-muted">Aucune facture pour le moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>N° Facture</th>
                    <th>Client</th>
                    <th>Voyage</th>
                    <th>Places</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                          {inv.invoice_number}
                        </span>
                      </td>
                      <td className="font-medium text-ink">{inv.customer_name}</td>
                      <td className="text-muted">{inv.trip_title}</td>
                      <td className="text-center">{inv.seats}</td>
                      <td className="font-semibold tabular-nums">{formatCurrency(inv.total_amount)}</td>
                      <td><Badge value={inv.booking_status as any} /></td>
                      <td className="text-muted">{formatDate(inv.generated_at)}</td>
                      <td>
                        <button
                          onClick={() => handleDownload(inv.id, inv.invoice_number)}
                          disabled={downloading === inv.id}
                          className="inline-flex items-center gap-1 rounded bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                        >
                          {downloading === inv.id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <Download className="h-3 w-3" />}
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <>

        {/* ── Header badge row ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold px-2.5 py-1">
            Agent
          </span>
          <p className="text-sm text-muted">Connecté en tant que <span className="font-semibold text-ink">{greeting}</span></p>
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

        {/* ── Réservations ── */}
        <div className="card flex flex-col">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-emerald-800">
              Réservations récentes
            </h2>
            <Link to="/bookings" className="text-xs text-emerald-700 font-medium hover:underline">
              Voir toutes →
            </Link>
          </div>

          {allBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-10 text-center">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
              <p className="text-sm text-muted">Aucune réservation</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Client</th>
                    <th>Voyage</th>
                    <th>Places</th>
                    <th>Montant</th>
                    <th>Date</th>
                    <th>Statut / Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="text-muted text-xs">#{booking.id}</td>
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
                        <BookingStatusActions booking={booking} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Paiements ── */}
        <div className="card flex flex-col">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-700" />
              <h2 className="text-sm font-semibold text-emerald-800">
                Paiements récents
              </h2>
            </div>
            <Link to="/payments" className="text-xs text-emerald-700 font-medium hover:underline">
              Voir tous →
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-10 text-center">
              <CreditCard className="h-8 w-8 text-muted" />
              <p className="text-sm text-muted">Aucun paiement enregistré</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Réservation</th>
                    <th>Montant</th>
                    <th>Méthode</th>
                    <th>Date</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="text-muted text-xs">#{payment.id}</td>
                      <td className="font-medium text-ink">
                        {getBookingLabel(payment.booking)}
                      </td>
                      <td className="font-semibold text-ink tabular-nums">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 capitalize">
                          {payment.method === 'card' ? '💳 Carte' : '💵 Espèces'}
                        </span>
                      </td>
                      <td className="text-muted">
                        {formatDate(payment.created_at)}
                      </td>
                      <td>
                        <PaymentStatusSelect payment={payment} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Two-column grid: clients + quick actions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Clients récents */}
          <div className="card flex flex-col">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-emerald-800">Clients récents</h2>
            </div>
            {recentCustomers.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted">Aucun client enregistré.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentCustomers.map((customer) => {
                  const name = getUserDisplayName(customer);
                  return (
                    <li key={customer.id} className="flex items-center gap-3 px-5 py-3">
                      <Avatar name={name} src={customer.avatar ?? null} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{name}</p>
                        <p className="text-xs text-muted truncate">{customer.email}</p>
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

          {/* Actions rapides */}
          <div className="card p-6 flex flex-col">
            <h2 className="text-sm font-semibold text-emerald-800 mb-5">Actions rapides</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/customers"
                className="card p-4 flex flex-col items-center gap-2 hover:bg-muted-bg transition-colors text-center"
              >
                <span className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <Users className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-ink">Tous les clients</span>
              </Link>
              <Link
                to="/bookings"
                className="card p-4 flex flex-col items-center gap-2 hover:bg-muted-bg transition-colors text-center"
              >
                <span className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <CalendarCheck className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-ink">Toutes les réservations</span>
              </Link>
              <Link
                to="/payments"
                className="card p-4 flex flex-col items-center gap-2 hover:bg-muted-bg transition-colors text-center"
              >
                <span className="h-10 w-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700">
                  <CreditCard className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-ink">Tous les paiements</span>
              </Link>
              <Link
                to="/trips"
                className="card p-4 flex flex-col items-center gap-2 hover:bg-muted-bg transition-colors text-center"
              >
                <span className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <MapPin className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-ink">Rechercher un voyage</span>
              </Link>
            </div>
          </div>

        </div>

        </> /* end overview */
      )} {/* end tab conditional */}

      </div>
    </div>
  );
}
