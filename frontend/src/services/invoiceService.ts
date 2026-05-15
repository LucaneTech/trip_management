import { api, API_BASE } from '../api/apiClient';

export interface Invoice {
  id: number;
  invoice_number: string;
  total_amount: string;
  generated_at: string;
  booking: number;
  booking_status: string;
  customer_name: string;
  trip_title: string;
  trip_destination: string;
  seats: number;
}

export const invoiceService = {
  list: (): Promise<Invoice[]> => api.get('/api/invoices/'),
  get: (id: number): Promise<Invoice> => api.get(`/api/invoices/${id}/`),

  downloadPdf: async (id: number, invoiceNumber: string): Promise<void> => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${API_BASE}/api/invoices/${id}/pdf/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Erreur lors du téléchargement');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facture-${invoiceNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
