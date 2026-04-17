// components/account/mobile/panels/3InvoicesPanel.tsx
// Converted from <!-- INVOICES PANEL --> in account-dashboard-v3.html
//
// HTML → JSX changes made:
//   class=        →  className=
//   onclick=      →  onClick=
//   onchange=     →  onChange=
//   onfocus=      →  onFocus=
//   onblur=       →  onBlur=
//   style="..."   →  style={{ ... }} with camelCase property names

import { useState } from 'react';
import { formatMoney, fmtDate, fmtTime } from '../../../../lib/utils';
import { useSwipeDownToClose } from '../../shared/hooks/useSwipeDownToClose';

interface InvoicesPanelProps {
  open:            boolean;
  invoices:        any[];
  onSelectInvoice: (inv: any) => void;
  onClose:         () => void;
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-card)',
  border: '1px solid var(--bdr2)',
  color: 'var(--text)',
  fontFamily: 'var(--font-mono)',
  fontSize: 16,
  padding: '12px 16px',
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
  transition: 'all 200ms ease',
  borderRadius: '8px',
};

export default function InvoicesPanel3({
  open, invoices, onSelectInvoice, onClose,
}: InvoicesPanelProps) {
  const [dateFrom,  setDateFrom]  = useState('');
  const [dateTo,    setDateTo]    = useState('');

  // ── Swipe down to close ──
  const { elementRef, touchHandlers } = useSwipeDownToClose({ onClose });

  // Filter invoices by date range if set
  const filtered = invoices.filter(inv => {
    if (!inv.paid_at) return true;
    const d = new Date(inv.paid_at).toISOString().slice(0, 10);
    if (dateFrom && d < dateFrom) return false;
    if (dateTo   && d > dateTo)   return false;
    return true;
  });

  const clearSearch = () => { setDateFrom(''); setDateTo(''); };

  return (
    <div ref={elementRef} className={`slide-panel${open ? ' open' : ''}`}>

      {/* Panel header -- from .panel-header in HTML */}
      <div className="panel-header" {...touchHandlers}>
        <span className="panel-title">Invoices</span>
        <button className="panel-close" onClick={onClose}>✕</button>
      </div>

      {/* Search + export bar -- converted from inline styles in HTML */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--bdr2)', display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--bg-deep)' }}>

        {/* Date range row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              style={INPUT_STYLE}
              onFocus={e  => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(207,221,78,0.1)'; }}
              onBlur={e   => { e.currentTarget.style.borderColor = 'var(--bdr2)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              style={INPUT_STYLE}
              onFocus={e  => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(207,221,78,0.1)'; }}
              onBlur={e   => { e.currentTarget.style.borderColor = 'var(--bdr2)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
          <button
            onClick={clearSearch}
            title="Clear"
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--bdr2)',
              color: 'var(--text)', fontSize: 16,
              width: 44, height: 44, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
              borderRadius: '8px', marginTop: 20
            }}
          >✕</button>
        </div>

        {/* Count row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 13,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>
            {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
          </span>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--gold)', border: 'none',
            color: 'var(--bg-deep)', fontFamily: 'var(--font-mono)',
            fontSize: 12, fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '10px 18px', cursor: 'pointer', borderRadius: '6px'
          }}>
            ⬇ Export All
          </button>
        </div>
      </div>

      {/* Invoice grid -- inv-grid class from CSS */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div className="inv-empty">
            <div className="inv-empty-title">No invoices yet</div>
            <div className="inv-empty-sub">Your paid invoices will appear here</div>
          </div>
        ) : (
          <div className="inv-grid">
            {filtered.map((inv, idx) => {
              const item  = inv.line_items?.[0];
              const emoji = ['💎', '🟢', '🔴', '💛', '🔵'][idx % 5];
              const paid  = inv.paid_at ? fmtDate(inv.paid_at) : '--';
              return (
                // inv-thumb: tappable thumbnail -- first tap shows overlay, second tap opens drawer
                // In React we simplify to single tap opens drawer directly
                <div
                  key={inv.invoice_id}
                  className="inv-thumb"
                  onClick={() => onSelectInvoice(inv)}
                >
                  {/* inv-photo: the large emoji/image placeholder */}
                  <div className="inv-photo">{emoji}</div>

                  {/* inv-overlay: appears on tap showing price and date */}
                  <div className="inv-overlay">
                    <div className="inv-price">{formatMoney(inv.total_amount)}</div>
                    <div className="inv-date">Paid {paid}</div>
                    <div className="inv-tap-hint">Tap to view invoice</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}