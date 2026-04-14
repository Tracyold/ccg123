import { supabase } from '../../../lib/supabase'
import { formatMoney, fmtDate, fmtTime } from '../../../lib/utils'

// ── Types ────────────────────────────────────────────────────────────────

export interface WorkOrderDetailModalProps {
  selectedWO:          any
  adminInfo:           any
  profile:             any
  showAddressEdit:     boolean
  tempAddress:         string
  addressConfirmed:    boolean
  setSelectedWO:       (fn: any) => void
  setShowAddressEdit:  (v: boolean) => void
  setTempAddress:      (v: string) => void
  setAddressConfirmed: (v: boolean) => void
  setWorkOrders:       (fn: any) => void
  acceptWO:            (wo: any) => void
}

export interface DetailRow {
  label: string
  val:   string
}

export interface ActivityEntry {
  action: string
  by:     string
  at:     string
  detail?: string
}

// ── Status helpers ────────────────────────────────────────────────────────

export function statusClass(s: string): string {
  const map: Record<string, string> = {
    'CREATED':     'wo-s-created',
    'ACCEPTED':    'wo-s-accepted',
    'IN PROGRESS': 'wo-s-progress',
    'COMPLETED':   'wo-s-completed',
    'CONFIRMED':   'wo-s-accepted',
    'CANCELLED':   'wo-s-cancelled',
  }
  return map[s] ?? 'wo-s-created'
}

export function orderStatusStyle(s: string): { background: string; color: string } {
  const map: Record<string, { background: string; color: string }> = {
    'CREATED':     { background: 'rgba(207,221,78,0.12)',  color: 'var(--gold)'        },
    'ACCEPTED':    { background: 'rgba(45,212,191,0.12)',  color: '#2dd4bf'            },
    'IN PROGRESS': { background: 'rgba(106,176,245,0.12)', color: 'var(--tile-orders)' },
    'COMPLETED':   { background: 'rgba(100,100,100,0.12)', color: 'var(--text-muted)'  },
    'CONFIRMED':   { background: 'rgba(120,80,200,0.12)',  color: '#a78bfa'            },
    'CANCELLED':   { background: 'rgba(248,113,113,0.12)', color: '#f87171'            },
  }
  return map[s] ?? map['CREATED']
}

// ── Derived Data Helpers ──────────────────────────────────────────────────

export function getDetailRows(wo: any): DetailRow[] {
  return [
    { label: 'Service Type',    val: wo.service_type },
    { label: 'Gem Type',        val: wo.gem_type },
    { label: 'Est. Turnaround', val: wo.estimated_turnaround },
    { label: 'Created',         val: fmtDate(wo.created_at)   + ' · ' + fmtTime(wo.created_at) },
    { label: 'Accepted',        val: wo.accepted_at  ? fmtDate(wo.accepted_at)  + ' · ' + fmtTime(wo.accepted_at)  : '' },
    { label: 'Confirmed',       val: wo.confirmed_at ? fmtDate(wo.confirmed_at) + ' · ' + fmtTime(wo.confirmed_at) : '' },
    { label: 'Completed',       val: wo.completed_at ? fmtDate(wo.completed_at) + ' · ' + fmtTime(wo.completed_at) : '' },
  ].filter(r => r.val)
}

export function getFormattedPrice(wo: any): string | null {
  return wo.estimated_price ? formatMoney(wo.estimated_price) : null
}

export function hasCustomAddress(wo: any, profile: any): boolean {
  return !!(wo.wo_shipping_address && wo.wo_shipping_address !== profile?.shipping_address)
}

export function getActivityLog(wo: any): ActivityEntry[] {
  if (!Array.isArray(wo.edit_history) || wo.edit_history.length === 0) return []
  return [...wo.edit_history].reverse()
}

// ── Action Handlers ───────────────────────────────────────────────────────

export function handleCloseModal(
  setSelectedWO:       (fn: any) => void,
  setShowAddressEdit:  (v: boolean) => void,
  setAddressConfirmed: (v: boolean) => void,
): void {
  setSelectedWO(null)
  setShowAddressEdit(false)
  setAddressConfirmed(false)
}

export function handleEditAddress(
  wo:                 any,
  profile:            any,
  setTempAddress:     (v: string) => void,
  setShowAddressEdit: (v: boolean) => void,
): void {
  setTempAddress(wo.wo_shipping_address || profile?.shipping_address || '')
  setShowAddressEdit(true)
}

export async function handleConfirmAddress(
  tempAddress:         string,
  selectedWO:          any,
  setSelectedWO:       (fn: any) => void,
  setWorkOrders:       (fn: any) => void,
  setAddressConfirmed: (v: boolean) => void,
): Promise<void> {
  if (!tempAddress.trim()) return

  const log: ActivityEntry[] = [
    ...(Array.isArray(selectedWO.edit_history) ? selectedWO.edit_history : []),
    { action: 'Return address updated by user', by: 'user', at: new Date().toISOString() },
  ]

  await supabase
    .from('work_orders')
    .update({ wo_shipping_address: tempAddress.trim(), edit_history: log })
    .eq('work_order_id', selectedWO.work_order_id)

  setSelectedWO((prev: any) => ({
    ...prev,
    wo_shipping_address: tempAddress.trim(),
    edit_history: log,
  }))

  setWorkOrders((prev: any[]) =>
    prev.map(w =>
      w.work_order_id === selectedWO.work_order_id
        ? { ...w, wo_shipping_address: tempAddress.trim(), edit_history: log }
        : w
    )
  )

  setAddressConfirmed(true)
}