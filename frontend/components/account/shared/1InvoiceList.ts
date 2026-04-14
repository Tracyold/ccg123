import { formatMoney, fmtDate } from '../../../lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────

export interface LineItem {
  product_id:         string
  title:              string
  gem_type:           string
  shape:              string
  weight:             number
  color:              string
  origin:             string
  treatment:          string
  description:        string
  price_per_carat:    number
  total_price:        number
  gia_report_number:  string | null
  gia_report_pdf_url: string | null
  photo_url:          string | null
}

export interface AccountSnapshot {
  name:            string
  email:           string
  phone:           string
  shippingAddress: string
  businessName:    string | null
}

export interface Invoice {
  invoice_id:               string
  account_user_id:          string
  stripe_session_id:        string
  stripe_payment_intent_id: string
  total_amount:             number
  line_items:               LineItem[]
  account_snapshot:         AccountSnapshot
  invoice_state:            string
  paid_at:                  string
}

export interface InvoiceViewProps {
  invoices: Invoice[]
}

// ── Pure helpers ───────────────────────────────────────────────────────────

export function getInvoiceTitle(invoice: Invoice): string {
  return invoice.line_items?.[0]?.title || 'Product'
}

export function getInvoicePhoto(invoice: Invoice): string | null {
  return invoice.line_items?.[0]?.photo_url ?? null
}

export function getInvoiceLineItem(invoice: Invoice): LineItem | null {
  return invoice.line_items?.[0] ?? null
}

export function getInvoiceNumber(invoice: Invoice): string {
  return invoice.stripe_session_id?.slice(-6).toUpperCase() ?? '------'
}

export function formatInvoiceAmount(amount: number): string {
  return formatMoney(amount)
}

export function formatInvoiceDate(iso: string): string {
  return fmtDate(iso)
}