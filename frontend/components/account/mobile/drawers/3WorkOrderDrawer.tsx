// components/account/mobile/drawers/3WorkOrderDrawer.tsx
// Converted from <!-- WORK ORDER DRAWER --> in account-dashboard-v3.html
//
// Right-slide drawer. Uses wo-drawer, wo-handle, wo-body, wo-topbar,
// wo-status-badge, wo-scroll, wo-content classes from MobileShell.css.
//
// The entire drawer responds to swipe right to close.
//
// HTML → JSX changes:
//   class=      → className=
//   onclick=    → onClick=
//   style="..." → style={{ camelCase }}

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { formatMoney, fmtDate, fmtTime } from '../../../../lib/utils';
import { useSwipeToClose } from '../../shared/hooks/useSwipeToClose';

const STATUS_CLASS: Record<string, string> = {
  CREATED:   'wo-s-created',
  ACCEPTED:  'wo-s-accepted',
  CONFIRMED: 'wo-s-confirmed',
  COMPLETED: 'wo-s-completed',
  CANCELLED: 'wo-s-cancelled',
};

interface WorkOrderDrawerProps {
  open:       boolean;
  wo:         any;
  adminInfo:  any;
  profile:    any;
  onAccept:   (wo: any) => void;
  onClose:    () => void;
}

export default function WorkOrderDrawer3({
  open, wo, adminInfo, profile, onAccept, onClose,
}: WorkOrderDrawerProps) {
  const [showAddrEdit,  setShowAddrEdit]  = useState(false);
  const [tempAddr,      setTempAddr]      = useState('');
  const [addrConfirmed, setAddrConfirmed] = useState(false);

  // Reset addr edit state when a different WO is opened
  useEffect(() => {
    setShowAddrEdit(false);
    setAddrConfirmed(false);
  }, [wo?.work_order_id]);

  // ── Swipe to close ──
  const { elementRef, touchHandlers } = useSwipeToClose({ onClose });

  const saveAddress = async () => {
    if (!tempAddr.trim() || !wo) return;
    const log = [
      ...(Array.isArray(wo.edit_history) ? wo.edit_history : []),
      { action: 'Return address updated by user', by: 'user', at: new Date().toISOString() },
    ];
    await supabase
      .from('work_orders')
      .update({ wo_shipping_address: tempAddr.trim(), edit_history: log })
      .eq('work_order_id', wo.work_order_id);
    setAddrConfirmed(true);
  };

  if (!wo) return null;

  const statusClass = STATUS_CLASS[wo.status] ?? 'wo-s-created';

  // Detail rows -- label on left, value on right
  const detailRows = [
    { label: 'Service Type',    val: wo.service_type },
    { label: 'Gem Type',        val: wo.gem_type },
    { label: 'Est. Turnaround', val: wo.estimated_turnaround },
    { label: 'Created',         val: wo.created_at    ? `${fmtDate(wo.created_at)} · ${fmtTime(wo.created_at)}`       : null },
    { label: 'Accepted',        val: wo.accepted_at   ? `${fmtDate(wo.accepted_at)} · ${fmtTime(wo.accepted_at)}`     : null },
    { label: 'Confirmed',       val: wo.confirmed_at  ? `${fmtDate(wo.confirmed_at)} · ${fmtTime(wo.confirmed_at)}`   : null },
    { label: 'Completed',       val: wo.completed_at  ? `${fmtDate(wo.completed_at)} · ${fmtTime(wo.completed_at)}`   : null },
  ].filter(r => r.val);

  return (
    <>
      {/* Dark overlay behind the drawer */}
      <div
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 499, opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 550ms ease',
        }}
        onClick={onClose}
      />

      {/* wo-drawer: the drawer itself -- slides in from right */}
      <div
        ref={elementRef}
        className={`wo-drawer${open ? ' open' : ''}`}
        {...touchHandlers}
      >
        {/* wo-handle: left drag strip -- visual indicator */}
        <div className="wo-handle" />

        {/* wo-body: the white/themed content area */}
        <div className="wo-body">

          {/* wo-topbar: header with status badge, ID, and close button */}
          <div className="wo-topbar">
            {/* wo-status-badge: colored badge (wo-s-created, wo-s-accepted, etc.) */}
            <span className={`wo-status-badge ${statusClass}`}>
              {wo.status}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--text-muted)', flex: 1,
            }}>
              #{String(wo.work_order_id).slice(-4)}
            </span>
            <button className="wo-close" onClick={onClose}>✕</button>
          </div>

          {/* wo-scroll: scrollable content */}
          <div className="wo-scroll">
            <div className="wo-content">

              {/* ── SEND TO address (admin) ── */}
              {/* The address the customer sends their stone to */}
              {adminInfo && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    ← Send To This Address
                  </div>
                  <div style={{
                    background: 'var(--bg-card)', border: '0.5px solid var(--bdr2)',
                    padding: 14, fontFamily: 'var(--font-ui)', fontSize: 12,
                    color: 'var(--text-muted)', lineHeight: 2,
                  }}>
                    <div style={{ color: 'var(--gold)', fontSize: 13 }}>{adminInfo.business_name}</div>
                    <div>{adminInfo.full_name}</div>
                    <div>{adminInfo.address}</div>
                    <div>{adminInfo.contact_email}</div>
                    <div>{adminInfo.phone}</div>
                  </div>
                </div>
              )}

              {/* ── RETURN TO address (user) ── */}
              {/* The address we ship the stone back to */}
              {profile && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span>Return To This Address →</span>
                    {/* Edit button -- only shown on CREATED status */}
                    {wo.status === 'CREATED' && (
                      <button
                        className="wo-edit-btn"
                        onClick={() => {
                          setTempAddr(wo.wo_shipping_address || profile.shipping_address || '');
                          setShowAddrEdit(true);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <div style={{
                    background: 'var(--bg-card)', border: '0.5px solid var(--bdr2)',
                    padding: 14, fontFamily: 'var(--font-ui)', fontSize: 12,
                    color: 'var(--text-muted)', lineHeight: 2,
                  }}>
                    <div style={{ color: 'var(--text)', fontSize: 13 }}>{profile.name}</div>
                    <div>{profile.email}</div>
                    {profile.phone && <div>{profile.phone}</div>}
                    <div>{wo.wo_shipping_address || profile.shipping_address || 'No address on file'}</div>
                    {wo.wo_shipping_address && wo.wo_shipping_address !== profile.shipping_address && (
                      <div style={{ fontSize: 10, color: 'var(--accent)', marginTop: 4, fontStyle: 'italic' }}>
                        * Custom address for this work order only
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Address edit form ── */}
              {/* Shown when user taps Edit on the return address */}
              {showAddrEdit && (
                <div style={{
                  background: 'var(--bg-card)', border: '0.5px solid var(--bdr2)',
                  padding: 14, marginBottom: 16,
                }}>
                  {!addrConfirmed ? (
                    <>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 10 }}>
                        This change applies to this work order only and does not update your profile.
                        By confirming, you agree this is the address we will ship your item to upon completion.
                      </p>
                      <input
                        value={tempAddr}
                        onChange={e => setTempAddr(e.target.value)}
                        placeholder="Enter address for this work order..."
                        style={{
                          width: '100%', background: 'var(--bg)', border: '0.5px solid var(--bdr2)',
                          color: 'var(--text)', fontFamily: 'var(--font-ui)', fontSize: 12,
                          padding: '9px 11px', outline: 'none', marginBottom: 10,
                        }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={saveAddress}
                          style={{
                            background: 'var(--gold)', color: 'var(--bg-deep)', border: 'none',
                            padding: '9px 14px', fontFamily: 'var(--font-mono)', fontSize: 9,
                            letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
                          }}
                        >
                          Confirm Address
                        </button>
                        <button
                          onClick={() => setShowAddrEdit(false)}
                          style={{
                            background: 'none', border: '0.5px solid var(--bdr2)', color: 'var(--text-muted)',
                            padding: '9px 12px', fontFamily: 'var(--font-mono)', fontSize: 9,
                            letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--accent)' }}>
                      ✓ Address updated for this work order.
                    </p>
                  )}
                </div>
              )}

              {/* ── Work order detail rows ── */}
              <div style={{ marginBottom: 20 }}>
                {detailRows.map(row => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '7px 0', borderBottom: '0.5px solid var(--bdr2)',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      {row.label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text)', textAlign: 'right', maxWidth: '60%' }}>
                      {row.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Description */}
              {wo.description && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Description
                  </div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>
                    {wo.description}
                  </p>
                </div>
              )}

              {/* Notes */}
              {wo.notes && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Notes
                  </div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    {wo.notes}
                  </p>
                </div>
              )}

              {/* Estimated price block */}
              {wo.estimated_price && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  padding: 14, background: 'var(--bg-card)', border: '0.5px solid var(--bdr2)',
                  marginBottom: 16,
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Quoted Price
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--accent)' }}>
                    {formatMoney(wo.estimated_price)}
                  </span>
                </div>
              )}

              {/* CONFIRMED notice */}
              {wo.status === 'CONFIRMED' && (
                <div style={{ padding: 14, background: 'var(--bg-card)', border: '0.5px solid var(--bdr2)', marginBottom: 16 }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Your work order has been confirmed! Please send your item to the address above.
                    We'll notify you when we receive it.
                  </p>
                </div>
              )}

              {/* Accept button -- only on CREATED status */}
              {wo.status === 'CREATED' && (
                <button
                  className="wo-accept-btn"
                  onClick={() => onAccept(wo)}
                >
                  Accept Work Order
                </button>
              )}

              {/* Stripe payment link -- only on COMPLETED status */}
              {wo.status === 'COMPLETED' && wo.stripe_payment_link && (
                <a
                  href={wo.stripe_payment_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block', width: '100%', background: 'var(--gold)',
                    color: 'var(--bg-deep)', padding: 14, textAlign: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em',
                    textTransform: 'uppercase', textDecoration: 'none', marginBottom: 16,
                  }}
                >
                  Pay Now →
                </a>
              )}

              {/* Paid outside site notice */}
              {wo.status === 'COMPLETED' && wo.paid_outside_site && (
                <div style={{ padding: 14, background: 'rgba(207,221,78,0.06)', border: '0.5px solid var(--bdr2)', marginBottom: 16 }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--accent)' }}>
                    ✓ Payment received -- thank you!
                  </span>
                </div>
              )}

              {/* ── Audit log ── */}
              {/* wo-log-entry: each log entry with colored dot indicator */}
              {wo.edit_history && wo.edit_history.length > 0 && (
                <div className="wo-log" style={{ marginTop: 24, borderTop: '0.5px solid var(--bdr2)', paddingTop: 16 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
                    Activity Log
                  </div>
                  {[...wo.edit_history].reverse().map((entry: any, i: number) => (
                    // wo-log-entry class + admin/user variant class for dot color
                    <div key={i} className={`wo-log-entry ${entry.by === 'admin' ? 'admin' : 'user'}`}>
                      <div className="wo-log-stamp">
                        <span className="wo-log-who">{entry.by}</span>
                        <span>{fmtDate(entry.at)} · {fmtTime(entry.at)}</span>
                      </div>
                      <div className="wo-log-change">{entry.action}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>{/* end wo-content */}
          </div>{/* end wo-scroll */}
        </div>{/* end wo-body */}
      </div>{/* end wo-drawer */}
    </>
  );
}
