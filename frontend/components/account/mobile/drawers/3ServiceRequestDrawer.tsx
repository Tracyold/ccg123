// components/account/mobile/drawers/3ServiceRequestDrawer.tsx
// Converted from <!-- SERVICE REQUEST RIGHT DRAWER --> in account-dashboard-v3.html
//
// Right-slide drawer. Uses sr-drawer, sr-drawer-handle, sr-drawer-body,
// sr-drawer-topbar, sr-drawer-scroll, sr-drawer-section classes from MobileShell.css.
//
// HTML → JSX changes:
//   class=      → className=
//   onclick=    → onClick=
//   style="..." → style={{ camelCase }}

import { useRef } from 'react';
import { fmtDate, fmtTime } from '../../../../lib/utils';

interface ServiceRequestDrawerProps {
  open:    boolean;
  sr:      any;
  onClose: () => void;
}

export default function ServiceRequestDrawer3({ open, sr, onClose }: ServiceRequestDrawerProps) {

  // ── Swipe to close ──
  const startX    = useRef(0);
  const dragging  = useRef(false);
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

  if (!sr) return null;

  // Stone detail fields -- label/value pairs shown in the drawer
  const stoneFields = [
    { label: 'Stone',      val: sr.stone          },
    { label: 'Weight',     val: sr.weight         },
    { label: 'Cut',        val: sr.cut            },
    { label: 'Dimensions', val: sr.dims           },
    { label: 'Service',    val: sr.rec            },
  ].filter(f => f.val && f.val !== '--');

  const submitted = sr.date || (sr.created_at ? `${fmtDate(sr.created_at)} · ${fmtTime(sr.created_at)}` : '--');
  const source    = sr.fromWizard ? 'Created from Wizard Result' : 'Created from Service Request Form';

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
        ref={drawerRef}
        className={`sr-drawer${open ? ' open' : ''}`}
      >
        {/* sr-drawer-handle: left drag zone */}
        <div
          className="sr-drawer-handle"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />

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
              {sr.id || 'Service Request'}
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
            {sr.wizardRef && (
              <div className="sr-drawer-section">
                <div className="sr-drawer-section-label">Wizard Result</div>
                <div className="sr-drawer-field">
                  <span className="sr-drawer-key">Reference</span>
                  <span className="sr-drawer-val" style={{ color: 'var(--tile-feasib)' }}>
                    {sr.wizardRef}
                  </span>
                </div>
              </div>
            )}

            {/* ── Client notes / description ── */}
            {sr.notes && (
              <div className="sr-drawer-section">
                <div className="sr-drawer-section-label">Notes</div>
                <div className="sr-drawer-note">"{sr.notes}"</div>
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