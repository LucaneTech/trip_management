import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle, CreditCard, Banknote, ChevronRight,
  Calendar, MapPin, Users, ArrowLeft, Download, Loader2,
  ShieldCheck, Lock,
} from 'lucide-react';
import { PageSpinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { useBooking, useCreatePayment, useUpdateBookingStatus } from '../../hooks/index';
import { invoiceService } from '../../services/invoiceService';
import { invoiceService as inv } from '../../services/invoiceService';
import { formatCurrency, formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';
import type { Trip } from '../../types';

type PayMethod = 'card' | 'cash';
type Step = 1 | 2 | 3;

// ── Step indicator ────────────────────────────────────────────────────────────

function StepBar({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: 'Récapitulatif' },
    { n: 2, label: 'Paiement' },
    { n: 3, label: 'Confirmation' },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="flex flex-col items-center">
            <div className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
              current > s.n ? 'bg-emerald-500 text-white' :
              current === s.n ? 'bg-sky-600 text-white' :
              'bg-muted-bg text-muted border border-border',
            )}>
              {current > s.n ? <CheckCircle className="h-4 w-4" /> : s.n}
            </div>
            <span className={cn(
              'text-xs mt-1 font-medium',
              current === s.n ? 'text-sky-700' : current > s.n ? 'text-emerald-600' : 'text-muted',
            )}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn(
              'h-0.5 w-16 mx-1 mb-5 transition-colors',
              current > s.n ? 'bg-emerald-400' : 'bg-border',
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Fake card input ───────────────────────────────────────────────────────────

function FakeCardForm({ disabled }: { disabled?: boolean }) {
  const [num, setNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const fmtNum = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExp = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-5 text-white shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase tracking-widest">Titulaire</p>
            <p className="font-semibold text-sm">{name || 'PRÉNOM NOM'}</p>
          </div>
          <CreditCard className="h-6 w-6 text-slate-400" />
        </div>
        <p className="font-mono text-lg tracking-widest mb-4">
          {num || '•••• •••• •••• ••••'}
        </p>
        <div className="flex justify-between">
          <div>
            <p className="text-xs text-slate-400">Expiration</p>
            <p className="font-mono text-sm">{expiry || 'MM/AA'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">CVV</p>
            <p className="font-mono text-sm">{cvv ? '•••' : '•••'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="field-label">Titulaire de la carte</label>
          <input
            className="field-input"
            placeholder="Jean Dupont"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            disabled={disabled}
          />
        </div>
        <div>
          <label className="field-label">Numéro de carte</label>
          <input
            className="field-input font-mono tracking-widest"
            placeholder="1234 5678 9012 3456"
            value={num}
            onChange={(e) => setNum(fmtNum(e.target.value))}
            maxLength={19}
            disabled={disabled}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Date d'expiration</label>
            <input
              className="field-input font-mono"
              placeholder="MM/AA"
              value={expiry}
              onChange={(e) => setExpiry(fmtExp(e.target.value))}
              maxLength={5}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="field-label">CVV</label>
            <input
              className="field-input font-mono"
              placeholder="•••"
              type="password"
              maxLength={3}
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted">
        <Lock className="h-3 w-3" /> Connexion sécurisée SSL — vos données ne sont pas stockées
      </p>
    </div>
  );
}

// ── CheckoutPage ──────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const bookingId = Number(id);
  const { data: booking, isLoading } = useBooking(bookingId);
  const createPayment = useCreatePayment();
  const updateStatus = useUpdateBookingStatus();

  const [step, setStep] = useState<Step>(1);
  const [method, setMethod] = useState<PayMethod>('card');
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [downloading, setDownloading] = useState(false);

  if (isLoading) return <PageSpinner />;
  if (!booking) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted">Réservation introuvable.</p>
    </div>
  );

  if (booking.status !== 'pending') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <CheckCircle className="h-12 w-12 text-emerald-500" />
        <p className="text-lg font-semibold text-ink">
          {booking.status === 'confirmed' ? 'Cette réservation est déjà confirmée.' : 'Réservation annulée.'}
        </p>
        <Link to="/my-bookings" className="text-sm text-sky-600 hover:underline">
          ← Retour à mes réservations
        </Link>
      </div>
    );
  }

  const trip = typeof booking.trip === 'object' ? booking.trip as Trip : null;
  const total = parseFloat(booking.total_price);

  const handlePay = async () => {
    try {
      await createPayment.mutateAsync({
        booking: booking.id,
        amount: booking.total_price,
        method,
      });
      await updateStatus.mutateAsync({ id: booking.id, status: 'confirmed' });

      // Fetch invoice info to allow download
      try {
        const { invoiceService: is } = await import('../../services/invoiceService');
        const invoices = await is.list();
        const myInv = invoices.find((i) => i.booking === booking.id);
        if (myInv) {
          setInvoiceId(myInv.id);
          setInvoiceNumber(myInv.invoice_number);
        }
      } catch { /* invoice fetch failure is non-blocking */ }

      setStep(3);
    } catch {
      toastError('Erreur lors du paiement. Veuillez réessayer.');
    }
  };

  const handleDownload = async () => {
    if (!invoiceId) return;
    setDownloading(true);
    try {
      await invoiceService.downloadPdf(invoiceId, invoiceNumber);
      success('Facture téléchargée');
    } catch {
      toastError('Impossible de télécharger la facture');
    } finally {
      setDownloading(false);
    }
  };

  const isPaying = createPayment.isPending || updateStatus.isPending;

  return (
    <div className="min-h-screen bg-paper py-10 px-4">
      <div className="max-w-lg mx-auto">

        {/* Back link (steps 1 & 2 only) */}
        {step < 3 && (
          <button
            onClick={() => step === 1 ? navigate('/my-bookings') : setStep(1)}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 1 ? 'Retour' : 'Étape précédente'}
          </button>
        )}

        <StepBar current={step} />

        {/* ── STEP 1: Récapitulatif ── */}
        {step === 1 && (
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-bold text-ink">Récapitulatif de la réservation</h2>

            {/* Trip info */}
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 space-y-2">
              {trip?.image && (
                <img
                  src={trip.image}
                  alt={trip.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <p className="font-bold text-ink text-base">{trip?.title ?? `Voyage #${booking.trip}`}</p>
              {trip && (
                <>
                  <span className="flex items-center gap-1.5 text-sm text-muted">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />{trip.destination}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-muted">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    Du {formatDate(trip.start_date)} au {formatDate(trip.end_date)}
                  </span>
                </>
              )}
              <span className="flex items-center gap-1.5 text-sm text-muted">
                <Users className="h-3.5 w-3.5 shrink-0" />
                {booking.seats} place{booking.seats > 1 ? 's' : ''} réservée{booking.seats > 1 ? 's' : ''}
              </span>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted">
                <span>Prix unitaire</span>
                <span>{formatCurrency(trip?.price ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted">
                <span>Nombre de places</span>
                <span>× {booking.seats}</span>
              </div>
              <div className="border-t border-border my-2" />
              <div className="flex justify-between text-base font-bold text-ink">
                <span>Total à payer</span>
                <span className="tabular-nums text-sky-700">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-700">Réservation sécurisée — annulation gratuite avant confirmation</p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Procéder au paiement
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── STEP 2: Paiement ── */}
        {step === 2 && (
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-bold text-ink">Mode de paiement</h2>

            {/* Method selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMethod('card')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors',
                  method === 'card'
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-border bg-surface text-muted hover:border-sky-200',
                )}
              >
                <CreditCard className="h-6 w-6" />
                <span className="text-sm font-semibold">Carte bancaire</span>
              </button>
              <button
                onClick={() => setMethod('cash')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors',
                  method === 'cash'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-border bg-surface text-muted hover:border-emerald-200',
                )}
              >
                <Banknote className="h-6 w-6" />
                <span className="text-sm font-semibold">Espèces</span>
              </button>
            </div>

            {/* Card form or cash info */}
            {method === 'card' ? (
              <FakeCardForm disabled={isPaying} />
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-amber-800 text-sm">Paiement en espèces</p>
                <p className="text-sm text-amber-700">
                  Vous pourrez régler en espèces directement auprès de notre agence ou de l'agent responsable de votre réservation.
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Votre réservation sera confirmée dès réception du paiement.
                </p>
              </div>
            )}

            {/* Amount reminder */}
            <div className="flex justify-between items-center bg-muted-bg rounded-lg px-4 py-3">
              <span className="text-sm text-muted font-medium">Montant total</span>
              <span className="text-lg font-bold text-ink tabular-nums">{formatCurrency(total)}</span>
            </div>

            <button
              onClick={handlePay}
              disabled={isPaying}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {isPaying ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Traitement en cours…</>
              ) : (
                <><Lock className="h-4 w-4" /> Confirmer le paiement — {formatCurrency(total)}</>
              )}
            </button>
          </div>
        )}

        {/* ── STEP 3: Confirmation ── */}
        {step === 3 && (
          <div className="card p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-ink">Paiement confirmé !</h2>
              <p className="text-muted mt-2 text-sm">
                Votre réservation a été confirmée. Vous recevrez bientôt une confirmation par e-mail.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-left space-y-2">
              <p className="text-sm font-semibold text-emerald-800">Détails du paiement</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Voyage</span>
                <span className="font-medium text-ink">{trip?.title ?? `#${booking.trip}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Montant payé</span>
                <span className="font-bold text-ink tabular-nums">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Méthode</span>
                <span className="font-medium text-ink">{method === 'card' ? 'Carte bancaire' : 'Espèces'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Statut</span>
                <Badge value="confirmed" />
              </div>
            </div>

            <div className="space-y-3">
              {invoiceId && (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {downloading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Download className="h-4 w-4" />}
                  Télécharger la facture PDF
                </button>
              )}
              <Link
                to="/my-bookings"
                className="flex items-center justify-center w-full border border-border rounded-xl py-3 text-sm font-semibold text-ink hover:bg-muted-bg transition-colors"
              >
                Voir mes réservations
              </Link>
              <Link
                to="/explore"
                className="block text-sm text-muted hover:text-ink transition-colors"
              >
                Continuer à explorer →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
