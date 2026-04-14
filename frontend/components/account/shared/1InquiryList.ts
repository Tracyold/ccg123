import { supabase } from '../../../lib/supabase'
import { fmtDate } from '../../../lib/utils'

// ── Constants ──────────────────────────────────────────────────────────────

export const SERVICE_TYPES = [
  'Custom Rough Cut',
  'Re-Cut & Re-Polish',
  'Table Re-Polish',
  'Crown Re-Polish',
  'Pavilion Re-Polish',
  'Gemstone Material Cut Design',
  'Virtual Consultation',
] as const

export type ServiceType = typeof SERVICE_TYPES[number]

export const SERVICE_REQUEST_DISCLAIMER =
  'All prices are estimated starting prices. Some gems may be less, some may be more. No work order prices are set in stone until I am able to inspect the piece and the customer accepts the work order through the website.'

export type InquiryTab = 'inquiries' | 'service'

export type InquiryStatus = 'pending' | 'replied'

// ── Types ──────────────────────────────────────────────────────────────────

export interface InquiryProduct {
  title:       string
  weight:      number | null
  shape:       string | null
  total_price: number | null
}

export interface Inquiry {
  account_inquiry_id:   string
  account_user_id:      string
  product_id:           string | null
  description:          string
  reply:                string | null
  replied_at:           string | null
  replied_by_admin_id:  string | null
  status:               InquiryStatus
  created_at:           string
  products:             InquiryProduct | null
}

export interface ServiceRequest {
  service_request_id: string
  service_type:       string
  description:        string
  created_at:         string
}

export interface InquiryViewProps {
  inquiries:       Inquiry[]
  serviceRequests: ServiceRequest[]
  inquiryTab:      InquiryTab
  setInquiryTab:   (tab: InquiryTab) => void
  showSRForm:      boolean
  srType:          string
  srDesc:          string
  srSubmitting:    boolean
  srGateMsg:       string
  setSrType:       (v: string) => void
  setSrDesc:       (v: string) => void
  setShowSRForm:   (v: boolean) => void
  onOpenSRForm:    () => void
  onSubmitSR:      () => void
}

// ── Status helpers ────────────────────────────────────────────────────────

export function getInquiryStatus(inq: Inquiry): InquiryStatus {
  return inq.status ?? (inq.reply ? 'replied' : 'pending')
}

export function getStatusStyle(status: InquiryStatus): { background: string; color: string } {
  return status === 'replied'
    ? { background: 'rgba(45,212,191,0.1)', color: '#2dd4bf' }
    : { background: 'rgba(207,221,78,0.1)', color: 'var(--gold)' }
}

export function getStatusLabel(status: InquiryStatus): string {
  return status === 'replied' ? 'Replied' : 'Pending'
}

// ── Product spec line ─────────────────────────────────────────────────────

export function getProductSpecLine(inq: Inquiry): string {
  if (!inq.products) return ''
  const { weight, shape, total_price } = inq.products
  return [
    weight ? `${weight}ct` : null,
    shape  ?? null,
    total_price ? `$${Number(total_price).toLocaleString()}` : null,
  ].filter(Boolean).join(' · ')
}

// ── Pure helpers ───────────────────────────────────────────────────────────

export function formatInquiryDate(iso: string): string {
  return fmtDate(iso)
}

export function canSubmitSR(srType: string, srDesc: string, srSubmitting: boolean): boolean {
  return !srSubmitting && !!srType && !!srDesc.trim()
}

// ── Admin reply — shared between mobile admin and desktop admin ───────────

export async function submitInquiryReply(
  inquiryId: string,
  reply:     string,
  adminId:   string,
): Promise<boolean> {
  const { error } = await supabase
    .from('account_inquiries')
    .update({
      reply,
      replied_at:          new Date().toISOString(),
      replied_by_admin_id: adminId,
      status:              'replied',
    })
    .eq('account_inquiry_id', inquiryId)

  if (error) { console.error('submitInquiryReply error:', error); return false }
  return true
}