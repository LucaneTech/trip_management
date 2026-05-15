import { useState } from 'react';
import { FileText, Download, Search, Loader2, Receipt } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';
import { useInvoices } from '../../hooks/index';
import { invoiceService } from '../../services/invoiceService';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function InvoicePage() {
  const { data: invoices = [], isLoading } = useInvoices();
  const { success, error } = useToast();
  const [downloading, setDownloading] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filtered = invoices.filter((inv) =>
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    inv.trip_title.toLowerCase().includes(search.toLowerCase()),
  );

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
    <div className="page-inner">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-50">
            <Receipt className="h-5 w-5 text-indigo-600" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-ink">Factures</h1>
            <p className="text-sm text-muted">{invoices.length} facture{invoices.length !== 1 ? 's' : ''} générée{invoices.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Chercher une facture…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input pl-9 w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <FileText className="h-10 w-10 text-border" strokeWidth={1.5} />
            <p className="text-sm font-medium text-ink">Aucune facture trouvée</p>
            <p className="text-xs text-muted">Les factures sont générées automatiquement à chaque réservation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>N° Facture</th>
                  <th>Client</th>
                  <th>Voyage</th>
                  <th>Destination</th>
                  <th>Places</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                        <FileText className="h-3 w-3" />
                        {inv.invoice_number}
                      </span>
                    </td>
                    <td className="font-medium text-ink">{inv.customer_name}</td>
                    <td className="text-muted">{inv.trip_title}</td>
                    <td className="text-muted">{inv.trip_destination}</td>
                    <td className="text-center">{inv.seats}</td>
                    <td className="font-semibold text-ink tabular-nums">
                      {formatCurrency(inv.total_amount)}
                    </td>
                    <td><Badge value={inv.booking_status as any} /></td>
                    <td className="text-muted">{formatDate(inv.generated_at)}</td>
                    <td>
                      <button
                        onClick={() => handleDownload(inv.id, inv.invoice_number)}
                        disabled={downloading === inv.id}
                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                      >
                        {downloading === inv.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        Télécharger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
