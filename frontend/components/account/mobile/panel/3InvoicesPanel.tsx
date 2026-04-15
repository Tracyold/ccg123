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

interface InvoicesPanelProps {
  open:            boolean;
  invoices:        any[];
  onSelectInvoice: (inv: any) => void;
  onClose:         () => void;
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-card)',
  border: '0.5px solid var(--bdr2)',
  color: 'var(--text)',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  padding: '7px 10px',
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
  transition: 'border-color 150ms ease',
};

export default function InvoicesPanel3({
  open, invoices, onSelectInvoice, onClose,
}: InvoicesPanelProps) {
  const [dateFrom,  setDateFrom]  = useState('');
  const [dateTo,    setDateTo]    = useState('');

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
    <div className={`slide-panel${open ? ' open' : ''}`}>

      {/* Panel header -- from .panel-header in HTML */}
      <div className="panel-header">
        <span className="panel-title">Invoices</span>
        <button className="panel-close" onClick={onClose}>✕</button>
      </div>

      {/* Search + export bar -- converted from inline styles in HTML */}
      <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(--bdr2)', display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Date range row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              style={INPUT_STYLE}
              onFocus={e  => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
              onBlur={e   => { e.currentTarget.style.borderColor = 'var(--bdr2)'; }}
              placeholder="From"
            />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', flexShrink: 0 }}>to</span>
          <div style={{ flex: 1 }}>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              style={INPUT_STYLE}
              onFocus={e  => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
              onBlur={e   => { e.currentTarget.style.borderColor = 'var(--bdr2)'; }}
            />
          </div>
          <button
            onClick={clearSearch}
            title="Clear"
            style={{
              background: 'transparent', border: '0.5px solid var(--bdr2)',
              color: 'var(--text-muted)', fontSize: 12,
              width: 30, height: 30, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* Count row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>
            {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
          </span>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'transparent', border: '0.5px solid var(--bdr2)',
            color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
            fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '5px 11px', cursor: 'pointer',
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