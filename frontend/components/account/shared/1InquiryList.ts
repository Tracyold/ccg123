import { fmtDate } from '../../../lib/utils';

// ── Constants ──────────────────────────────────────────────────────────────

export const SERVICE_TYPES = [
  'Custom Rough Cut',
  'Re-Cut & Re-Polish',
  'Table Re-Polish',
  'Crown Re-Polish',
  'Pavilion Re-Polish',
  'Gemstone Material Cut Design',
  'Virtual Consultation',
] as const;

export type ServiceType = typeof SERVICE_TYPES[number];

export const SERVICE_REQUEST_DISCLAIMER =
  'All prices are estimated starting prices. Some gems may be less, some may be more. No work order prices are set in stone until I am able to inspect the piece and the customer accepts the work order through the website.';

export type InquiryTab = 'inquiries' | 'service';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Inquiry {
  account_inquiry_id: string;
  description:        string;
  created_at:         string;
}

export interface ServiceRequest {
  service_request_id: string;
  service_type:       string;
  description:        string;
  created_at:         string;
}

export interface InquiryViewProps {
  inquiries:       Inquiry[];
  serviceRequests: ServiceRequest[];
  inquiryTab:      InquiryTab;
  setInquiryTab:   (tab: InquiryTab) => void;
  showSRForm:      boolean;
  srType:          string;
  srDesc:          string;
  srSubmitting:    boolean;
  srGateMsg:       string;
  setSrType:       (v: string) => void;
  setSrDesc:       (v: string) => void;
  setShowSRForm:   (v: boolean) => void;
  onOpenSRForm:    () => void;
  onSubmitSR:      () => void;
}

// ── Pure helpers ───────────────────────────────────────────────────────────

export function formatInquiryDate(iso: string): string {
  return fmtDate(iso);
}

export function canSubmitSR(srType: string, srDesc: string, srSubmitting: boolean): boolean {
  return !srSubmitting && !!srType && !!srDesc.trim();
}
