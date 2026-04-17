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

      {/* sr-drawer: right-slide container */}
      <div
        ref={elementRef}
        className={`sr-drawer${open ? ' open' : ''}`}
        {...touchHandlers}
      >
        {/* sr-drawer-handle: left drag zone -- visual indicator */}
        <div className="sr-drawer-handle" />

        {/* sr-drawer-body: main content */}
        <div className="sr-drawer-body">

          {/* sr-drawer-topbar: badge + title + close */}
          <div className="sr-drawer-topbar">
            {/* sr-drawer-badge: status badge (gold border) */}
            <span className="sr-drawer-badge">
              {sr.status || 'Pending'}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--text-muted)', flex: 1,
            }}>
              {sr.service_request_id?.slice(0, 8) || 'Service Request'}
            </span>
            <button className="sr-drawer-close" onClick={onClose}>✕</button>
          </div>

          {/* sr-drawer-scroll: scrollable content */}
          <div className="sr-drawer-scroll">

            {/* ── Stone details section ── */}
            <div className="sr-drawer-section">
              <div className="sr-drawer-section-label">Stone Details</div>
              {stoneFields.map(f => (
                <div key={f.label} className="sr-drawer-field">
                  <span className="sr-drawer-key">{f.label}</span>
                  <span className="sr-drawer-val">{f.val}</span>
                </div>
              ))}
            </div>

            {/* ── Wizard result reference ── */}
            {/* Only shown if the SR was created from a wizard result */}
            {sr.wizard_result_id && (
              <div className="sr-drawer-section">
                <div className="sr-drawer-section-label">Wizard Result</div>
                <div className="sr-drawer-field">
                  <span className="sr-drawer-key">Reference</span>
                  <span className="sr-drawer-val" style={{ color: 'var(--tile-feasib)' }}>
                    {sr.wizard_result_id.slice(0, 8)}
                  </span>
                </div>
              </div>
            )}

            {/* ── Client notes / description ── */}
            {sr.description && (
              <div className="sr-drawer-section">
                <div className="sr-drawer-section-label">Description</div>
                <div className="sr-drawer-note" style={{ whiteSpace: 'pre-wrap' }}>
                  "{sr.description}"
                </div>
              </div>
            )}

            {/* ── Submission info ── */}
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9,
              color: 'var(--text-muted)', opacity: 0.6,
              marginTop: 8, lineHeight: 1.8,
            }}>
              Submitted {submitted}<br />
              {source}
            </div>

          </div>{/* end sr-drawer-scroll */}
        </div>{/* end sr-drawer-body */}
      </div>{/* end sr-drawer */}
    </>
  );
}
