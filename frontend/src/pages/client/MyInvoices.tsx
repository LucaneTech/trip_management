import { useState } from 'react';
import { FileText, Download, Loader2, Receipt } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';
import { useInvoices } from '../../hooks/index';
import { invoiceService } from '../../services/invoiceService';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function MyInvoices() {
  const { data: invoices = [], isLoading } = useInvoices();
  const { success, error } = useToast();
  const [downloading, setDownloading] = useState<number | null>(null);

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

  return (
    <div className="page-inner max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-sky-50">
          <Receipt className="h-5 w-5 text-sky-600" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-ink">Mes factures</h1>
          <p className="text-sm text-muted">{invoices.length} facture{invoices.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-center">
          <FileText className="h-10 w-10 text-border" strokeWidth={1.5} />
          <p className="text-sm font-medium text-ink">Aucune facture disponible</p>
          <p className="text-xs text-muted">Vos factures apparaîtront ici après chaque réservation.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="card p-5 flex items-center justify-between gap-4 flex-wrap hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-50 shrink-0">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </span>
                <div>
                  <p className="font-mono text-xs font-bold text-indigo-700">{inv.invoice_number}</p>
                  <p className="text-sm font-semibold text-ink mt-0.5">{inv.trip_title}</p>
                  <p className="text-xs text-muted">{inv.trip_destination} · {inv.seats} place{inv.seats !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-base font-bold text-ink tabular-nums">{formatCurrency(inv.total_amount)}</p>
                  <p className="text-xs text-muted">{formatDate(inv.generated_at)}</p>
                </div>
                <Badge value={inv.booking_status as any} />
                <button
                  onClick={() => handleDownload(inv.id, inv.invoice_number)}
                  disabled={downloading === inv.id}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors shrink-0"
                >
                  {downloading === inv.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
