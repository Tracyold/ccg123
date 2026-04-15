// components/account/mobile/panels/3InquiriesPanel.tsx
// Converted from <!-- INQUIRIES PANEL --> in account-dashboard-v3.html
//
// HTML → JSX changes:
//   class=      → className=
//   onclick=    → onClick=
//   style="..." → style={{ camelCase }}

import { fmtDate } from '../../../../lib/utils';

interface InquiriesPanelProps {
  open:      boolean;
  inquiries: any[];
  onClose:   () => void;
}

export default function InquiriesPanel3({ open, inquiries, onClose }: InquiriesPanelProps) {
  return (
    <div className={`slide-panel${open ? ' open' : ''}`}>

      {/* Panel header */}
      <div className="panel-header">
        <span className="panel-title">Inquiries</span>
        <button className="panel-close" onClick={onClose}>✕</button>
      </div>

      {/* Scrollable list body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {inquiries.length === 0 ? (
          // Empty state
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)',
            textAlign: 'center', padding: '40px 0', fontStyle: 'italic', opacity: 0.6, lineHeight: 1.6,
          }}>
            No product inquiries yet.<br />Inquiries are submitted from product pages in the shop.
          </p>
        ) : (
          inquiries.map(inq => {
            const isPending = !inq.reply_body;
            return (
              // Each inquiry card -- background, border, padding from HTML
              <div
                key={inq.account_inquiry_id}
                style={{ background: 'var(--bg-card)', border: '0.5px solid var(--bdr2)', padding: 16 }}
              >
                {/* Top row: product name + status badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    {/* Product name */}
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text)', marginBottom: 2 }}>
                      {inq.product_title || 'Product Inquiry'}
                    </div>
                    {/* Product meta -- weight, cut, price */}
                    {inq.product_meta && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
                        {inq.product_meta}
                      </div>
                    )}
                  </div>
                  {/* Status badge -- gold for Pending, teal for Replied */}
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.15em',
                    textTransform: 'uppercase', padding: '2px 8px', flexShrink: 0,
                    background: isPending ? 'rgba(207,221,78,0.1)' : 'rgba(45,212,191,0.1)',
                    color: isPending ? 'var(--gold)' : '#2dd4bf',
                  }}>
                    {isPending ? 'Pending' : 'Replied'}
                  </span>
                </div>

                {/* Customer message -- the inquiry text */}
                <div style={{
                  fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)',
                  lineHeight: 1.6, borderTop: '0.5px solid var(--bdr2)', paddingTop: 8, marginTop: 4,
                }}>
                  "{inq.description}"
                </div>

                {/* Submitted timestamp */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: 'var(--text-muted)', marginTop: 8, opacity: 0.6 }}>
                  Submitted {inq.created_at ? fmtDate(inq.created_at) : '--'}
                </div>

                {/* Reply block -- only shown when there is a reply */}
                {inq.reply_body && (
                  <div style={{
                    fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text)',
                    lineHeight: 1.6, borderTop: '0.5px solid var(--bdr2)', paddingTop: 8, marginTop: 8,
                  }}>
                    {/* "Michael replied" label in gold */}
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--gold)',
                      letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 4,
                    }}>
                      Michael replied
                    </span>
                    "{inq.reply_body}"
                    {inq.replied_at && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: 'var(--text-muted)', marginTop: 6, opacity: 0.6 }}>
                        {fmtDate(inq.replied_at)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Footer note -- from HTML empty state note */}
        {inquiries.length > 0 && (
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)',
            textAlign: 'center', padding: '8px 0', opacity: 0.6, lineHeight: 1.6,
          }}>
            Inquiries are submitted from product pages in the shop.
          </p>
        )}
      </div>
    </div>
  );
}