import { formatMoney, fmtDate } from '../../../lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────

export interface LineItem {
  title: string;
}

export interface Invoice {
  invoice_id:   string;
  total_amount: number;
  paid_at:      string;
  line_items:   LineItem[] | null;
}

export interface InvoiceViewProps {
  invoices: Invoice[];
}

// ── Pure helpers ───────────────────────────────────────────────────────────

export function getInvoiceTitle(invoice: Invoice): string {
  return invoice.line_items?.[0]?.title || 'Product';
}

export function formatInvoiceAmount(amount: number): string {
  return formatMoney(amount);
}

export function formatInvoiceDate(iso: string): string {
  return fmtDate(iso);
}
