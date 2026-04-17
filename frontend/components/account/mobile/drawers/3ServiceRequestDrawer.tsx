// components/account/mobile/drawers/3ServiceRequestDrawer.tsx
// Converted from <!-- SERVICE REQUEST RIGHT DRAWER --> in account-dashboard-v3.html
//
// Right-slide drawer. Uses sr-drawer, sr-drawer-handle, sr-drawer-body,
// sr-drawer-topbar, sr-drawer-scroll, sr-drawer-section classes from MobileShell.css.
//
// The entire drawer responds to swipe right to close.
//
// HTML → JSX changes:
//   class=      → className=
//   onclick=    → onClick=
//   style="..." → style={{ camelCase }}

import { fmtDate, fmtTime } from '../../../../lib/utils';
import { useSwipeToClose } from '../../shared/hooks/useSwipeToClose';

interface ServiceRequestDrawerProps {
  open:    boolean;
  sr:      any;
  onClose: () => void;
}

export default function ServiceRequestDrawer3({ open, sr, onClose }: ServiceRequestDrawerProps) {

  // ── Swipe to close ──
  const { elementRef, touchHandlers } = useSwipeToClose({ onClose });

  if (!sr) return null;

  // Stone detail fields -- label/value pairs shown in the drawer
  // Mapping from Supabase service_requests table fields
  const stoneFields = [
    { label: 'Service Type', val: sr.service_type   },
    { label: 'Stone',        val: sr.stone          },
    { label: 'Weight',       val: sr.weight         },
    { label: 'Cut',          val: sr.cut            },
    { label: 'Dimensions',   val: sr.dims           },
  ].filter(f => f.val && f.val !== '--');

  const submitted = sr.created_at ? `${fmtDate(sr.created_at)} · ${fmtTime(sr.created_at)}` : '--';
  const source    = sr.wizard_result_id ? 'Created from Wizard Result' : 'Created from Service Request Form';

  return (
    <>
      {/* ── Overlay ── */}
      <div className={`overlay${open ? ' open' : ''}`} onClick={onClose} />

      {/* ── Drawer ── */}
      <div
        ref={elementRef}
        className={`shop-item-drawer${open ? ' open' : ''}`}
        {...touchHandlers}
      >
        {/* Visual handle on the left edge */}
        <div className="shop-item-handle" />

        <div className="shop-item-body">
          {/* Header */}
          <div className="shop-item-header">
            <span className="shop-item-header-title">
              {sr.service_request_id?.slice(0, 8) || 'Service Request'}
            </span>
            <button className="shop-item-close" onClick={onClose}>✕</button>
          </div>

          {/* Scrollable Content */}
          <div className="shop-item-scroll">
            <div className="shop-item-content">
              
              {/* Status Badge */}
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '4px 8px',
                  border: '0.5px solid var(--gold)',
                  color: 'var(--gold)',
                  borderRadius: '4px'
                }}>
                  {sr.status || 'Pending'}
                </span>
              </div>

              {/* Stone Details */}
              <div className="shop-item-specs">
                {stoneFields.map(f => (
                  <div key={f.label} className="spec-row" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderBottom: '0.5px solid var(--bdr2)'
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)'
                    }}>{f.label}</span>
                    <span style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '15px',
                      color: 'var(--text)'
                    }}>{f.val}</span>
                  </div>
                ))}
              </div>

              {/* Wizard Result Reference */}
              {sr.wizard_result_id && (
                <div className="shop-item-desc" style={{ marginTop: '1.5rem' }}>
                  <div className="shop-item-desc-label">Wizard Result</div>
                  <p style={{ color: 'var(--tile-feasib)', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                    {sr.wizard_result_id.slice(0, 8)}
                  </p>
                </div>
              )}

              {/* Description */}
              {sr.description && (
                <div className="shop-item-desc" style={{ marginTop: '1.5rem' }}>
                  <div className="shop-item-desc-label">Description</div>
                  <p>"{sr.description}"</p>
                </div>
              )}

              {/* Submission Info */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: 'var(--text-muted)',
                opacity: 0.6,
                marginTop: '2rem',
                lineHeight: 1.8,
                borderTop: '0.5px solid var(--bdr2)',
                paddingTop: '1rem'
              }}>
                Submitted {submitted}<br />
                {source}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .shop-item-drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 90%;
          height: 100dvh;
          background: var(--bg);
          color: var(--text);
          z-index: 10101;
          transform: translateX(100%);
          transition: transform 500ms cubic-bezier(0.33, 1, 0.68, 1);
          display: flex;
          /* Shadow removed as per request to match Shop Drawer behavior/skeleton */
        }
        .shop-item-drawer.open {
          transform: translateX(0);
        }
        .shop-item-handle {
          width: 20px;
          background: transparent;
          flex-shrink: 0;
        }
        .shop-item-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .shop-item-header {
          padding: 1rem 1.25rem;
          border-bottom: 0.5px solid var(--bdr2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-deep);
        }
        .shop-item-header-title {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .shop-item-close {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 18px;
          cursor: pointer;
        }
        .shop-item-scroll {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .shop-item-content {
          padding: 1.5rem 1.25rem;
        }
        .shop-item-specs {
          margin-bottom: 2rem;
          border-top: 0.5px solid var(--bdr2);
        }
        .shop-item-desc-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .shop-item-desc p {
          font-family: var(--font-body);
          font-size: 16px;
          line-height: 1.6;
          color: var(--text) !important;
          opacity: 0.8;
        }
      `}</style>
    </>
  );
}
