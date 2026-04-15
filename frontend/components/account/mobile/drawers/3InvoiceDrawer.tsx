// components/account/mobile/drawers/3InvoiceDrawer.tsx
// Converted from <!-- INVOICE RIGHT DRAWER --> in account-dashboard-v3.html
//
// Right-slide drawer. Uses inv-drawer, inv-drawer-handle, inv-drawer-body,
// inv-drawer-topbar, inv-pdf classes from MobileShell.css.
//
// The PDF view is always white/light -- it intentionally does NOT follow the
// dark/light theme because it represents a printed document.
//
// HTML → JSX changes:
//   class=      → className=
//   onclick=    → onClick=
//   style="..." → style={{ camelCase }}

import { useRef } from 'react';
import { formatMoney, fmtDate, fmtTime } from '../../../../lib/utils';

interface InvoiceDrawerProps {
  open:      boolean;
  invoice:   any;
  profile:   any;
  adminInfo: any;
  onClose:   () => void;
}

export default function InvoiceDrawer3({
  open, invoice, profile, adminInfo, onClose,
}: InvoiceDrawerProps) {

  // ── Swipe to close ──
  const startX   = useRef(0);
  const dragging = useRef(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current   = e.touches[0].clientX;
    dragging.current = false;
    if (drawerRef.current) drawerRef.current.style.transition = 'none';
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    if (!dragging.current && Math.abs(dx) > 6) dragging.current = true;
    if (dragging.current && dx > 0 && drawerRef.current) {
      drawerRef.current.style.transform = `translateX(${dx}px)`;
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (drawerRef.current) {
      drawerRef.current.style.transition = '';
      drawerRef.current.style.transform  = '';
    }
    const dx = e.changedTouches[0].clientX - startX.current;
    if (dragging.current && dx > 80) onClose();
    dragging.current = false;
  };

  if (!invoice) return null;

  const item     = invoice.line_items?.[0];
  const paidDate = invoice.paid_at ? fmtDate(invoice.paid_at) + ' · ' + fmtTime(invoice.paid_at) : '--';

  return (
    <>
      {/* Dark overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 499, opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 320ms ease',
        }}
        onClick={onClose}
      />

      {/* inv-drawer: right-slide container */}
      <div
        ref={drawerRef}
        className={`inv-drawer${open ? ' open' : ''}`}
      >
        {/* inv-drawer-handle: left drag zone -- touch to swipe close */}
        <div
          className="inv-drawer-handle"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />

        {/* inv-drawer-body: always white -- this is a printed document */}
        <div className="inv-drawer-body">

          {/* inv-drawer-topbar: just the close button, right-aligned */}
          <div className="inv-drawer-topbar">
            <button className="inv-drawer-close" onClick={onClose}>✕</button>
          </div>

          {/* inv-pdf: the PDF-style document content */}
          <div className="inv-pdf">

            {/* pdf-header: CCG brand name + invoice number */}
            <div className="pdf-header">
              <div>
                <div className="pdf-brand">Cutting Corners Gems</div>
                <div className="pdf-brand-sub">Gemstone Cutting Studio</div>
              </div>
              <div className="pdf-inv-num">
                Invoice #{invoice.invoice_number || '1000'}<br />
                <span style={{ fontSize: 10 }}>
                  Issued: {paidDate}
                </span>
              </div>
            </div>

            {/* Bill To section */}
            <div className="pdf-to" style={{ marginBottom: 20 }}>
              <div className="pdf-label">Bill To</div>
              <div className="pdf-name">{profile?.name || 'Customer'}</div>
              <div className="pdf-addr">
                {profile?.email && <div>{profile.email}</div>}
                {profile?.shipping_address && <div>{profile.shipping_address}</div>}
              </div>
            </div>

            {/* Line items table */}
            <table className="pdf-items">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items?.map((li: any, i: number) => (
                  <tr key={i}>
                    <td>{li.title || 'Product'}</td>
                    <td>{li.quantity || 1}</td>
                    <td>{formatMoney(li.price || invoice.total_amount)}</td>
                  </tr>
                )) ?? (
                  <tr>
                    <td>{item?.title || 'Product'}</td>
                    <td>1</td>
                    <td>{formatMoney(invoice.total_amount)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Total row */}
            <div className="pdf-total-row">
              <span className="pdf-total-lbl">Total</span>
              <span className="pdf-total-amt">{formatMoney(invoice.total_amount)}</span>
            </div>

            {/* PAID stamp -- shown when invoice is paid */}
            {invoice.paid_at && (
              <div className="pdf-stamp" style={{ marginTop: 24 }}>
                <div className="pdf-stamp-inner">
                  <div className="pdf-stamp-text">PAID</div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pdf-footer">
              <div className="pdf-footer-txt">
                Thank you for your business.<br />
                Questions? Contact us at {adminInfo?.contact_email || 'cuttingcornersgems@gmail.com'}
              </div>
            </div>

          </div>{/* end inv-pdf */}
        </div>{/* end inv-drawer-body */}
      </div>{/* end inv-drawer */}
    </>
  );
}