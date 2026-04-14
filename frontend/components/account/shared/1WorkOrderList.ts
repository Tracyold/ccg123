import { formatMoney, fmtDate } from '../../../lib/utils'

// ── Types ────────────────────────────────────────────────────────────

export interface WorkOrderListProps {
  workOrders: any[]
  onSelect:   (wo: any) => void
  onAccept:   (wo: any) => void
}

// ── Derived Data Helpers ─────────────────────────────────────────────

export function getFormattedPrice(wo: any): string | null {
  return wo.estimated_price ? formatMoney(wo.estimated_price) : null
}

export function getFormattedDate(wo: any): string {
  return fmtDate(wo.created_at)
}
