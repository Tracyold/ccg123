// components/account/mobile/drawers/3ServiceRequestDrawer.tsx
//
// Right-slide drawer showing the full content of a submitted service request.
// This revision displays every field the new form captures:
//
//   • Status pill (unchanged)
//   • Contact snapshot block (name / email / phone / shipping address)
//   • Specs grid (service type, gem type, color, weight ct, L × W × D mm, qty)
//   • Custom fields — fetched separately from service_request_custom_fields
//   • Description
//   • Photos — supports both the new photo_urls[] array and the legacy
//     single photo_url column, so old SRs still render
//   • SMS consent note (if recorded)
//   • Submitted-at / source footer (unchanged)
//
// Each section is conditional — if the field is empty/null, the section
// is hidden. Old SRs without the new columns still render gracefully.

import { useEffect, useState } from 'react';
import { fmtDate, fmtTime } from '../../../../lib/utils';
import { useSwipeToClose } from '../../shared/hooks/useSwipeToClose';
import { supabase } from '../../../../lib/supabase';
import FirstTimeTips from '../ui/FirstTimeTips';

interface ServiceRequestDrawerProps {
  open:    boolean;
  sr:      any;
  onClose: () => void;
}

interface CustomFieldRow {
  id:         string;
  label:      string;
  value:      string | null;
  sort_order: number;
}

export default function ServiceRequestDrawer3({ open, sr, onClose }: ServiceRequestDrawerProps) {

  const { elementRef, touchHandlers } = useSwipeToClose({ onClose });

  // ── Fetch custom fields when a new SR is displayed ──
  const [customFields,     setCustomFields]     = useState<CustomFieldRow[]>([]);
  const [loadingCFs,       setLoadingCFs]       = useState(false);

  useEffect(() => {
    if (!open || !sr?.service_request_id) {
      setCustomFields([]);
      return;
    }
    let cancelled = false;
    setLoadingCFs(true);
    (async () => {
      const { data, error } = await supabase
        .from('service_request_custom_fields')
        .select('id, label, value, sort_order')
        .eq('service_request_id', sr.service_request_id)
        .order('sort_order', { ascending: true });
      if (cancelled) return;
      if (error) {
        console.warn('Custom fields fetch failed (non-blocking):', error);
        setCustomFields([]);
      } else {
        setCustomFields(data ?? []);
      }
      setLoadingCFs(false);
    })();
    return () => { cancelled = true; };
  }, [open, sr?.service_request_id]);

  if (!sr) return null;

  // ── Compose display values ──
  const specs: Array<{ label: string; val: string }> = [];
  if (sr.service_type) specs.push({ label: 'Service Type', val: sr.service_type });
  if (sr.gem_type)     specs.push({ label: 'Gem Type',     val: sr.gem_type });
  if (sr.gem_color)    specs.push({ label: 'Gem Color',    val: sr.gem_color });
  if (sr.weight_ct != null) {
    specs.push({ label: 'Weight', val: `${sr.weight_ct} ct` });
  }
  // Dimensions — only show if at least one of L/W/D is set
  if (sr.dim_length_mm != null || sr.dim_width_mm != null || sr.dim_depth_mm != null) {
    const L = sr.dim_length_mm ?? '?';
    const W = sr.dim_width_mm  ?? '?';
    const D = sr.dim_depth_mm  ?? '?';
    specs.push({ label: 'Dimensions', val: `${L} × ${W} × ${D} mm` });
  }
  if (sr.quantity != null && sr.quantity !== 1) {
    // Only show quantity if it's meaningful (not the default of 1)
    specs.push({ label: 'Quantity', val: String(sr.quantity) });
  }

  // Contact snapshot — show only if at least one contact field is present
  const contact: Array<{ label: string; val: string }> = [];
  if (sr.contact_name)    contact.push({ label: 'Name',     val: sr.contact_name });
  if (sr.contact_email)   contact.push({ label: 'Email',    val: sr.contact_email });
  if (sr.contact_phone)   contact.push({ label: 'Phone',    val: sr.contact_phone });
  if (sr.contact_address) contact.push({ label: 'Shipping', val: sr.contact_address });

  // Photos — new column wins; fall back to legacy single photo_url
  const photos: string[] = Array.isArray(sr.photo_urls) && sr.photo_urls.length > 0
    ? sr.photo_urls.filter((u: any) => typeof u === 'string' && u.length > 0)
    : (sr.photo_url ? [sr.photo_url] : []);

  const submitted = sr.created_at ? `${fmtDate(sr.created_at)} · ${fmtTime(sr.created_at)}` : '--';
  const source    = sr.wizard_result_id ? 'Created from Wizard Result' : 'Created from Service Request Form';
  const consentedAt = sr.workorder_sms_consent_at
    ? new Date(sr.workorder_sms_consent_at).toLocaleDateString()
    : null;

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
        <FirstTimeTips type="drawer-slide" show={open} />
        <div className="shop-item-handle" />

        <div className="shop-item-body">
          <div className="shop-item-header">
            <span className="shop-item-header-title">
              {sr.service_request_id?.slice(0, 8) || 'Service Request'}
            </span>
            <button className="shop-item-close" onClick={onClose}>✕</button>
          </div>

          <div className="shop-item-scroll">
            <div className="shop-item-content">

              {/* Status Badge */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(0.625rem, 2.6vw, 0.6875rem)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  border: '0.5px solid var(--gold)',
                  color: 'var(--gold)',
                  borderRadius: '999px',
                }}>
                  {sr.is_archived ? 'Archived' : (sr.status || 'Pending')}
                </span>
              </div>

              {/* ── CONTACT ── */}
              {contact.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div className="shop-item-desc-label" style={{ marginBottom: '0.625rem' }}>Contact</div>
                  <div style={{
                    background: 'var(--bg-card)',
                    border: '0.5px solid var(--bdr2)',
                    borderRadius: '12px',
                    padding: 'clamp(0.625rem, 3vw, 0.875rem) clamp(0.75rem, 3.5vw, 1rem)',
                  }}>
                    {contact.map((c, i) => (
                      <div key={c.label} style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'flex-start', gap: 12,
                        padding: '6px 0',
                        borderBottom: i === contact.length - 1 ? 'none' : '0.5px dashed var(--bdr2)',
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'clamp(0.5625rem, 2.4vw, 0.625rem)',
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: 'var(--text-muted)',
                          opacity: 0.75,
                          minWidth: 70, flexShrink: 0, paddingTop: 2,
                        }}>{c.label}</span>
                        <span style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: 'clamp(0.8125rem, 3.5vw, 0.9375rem)',
                          color: 'var(--text)',
                          wordBreak: 'break-word',
                          textAlign: 'right',
                          flex: 1,
                        }}>{c.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SPECS ── */}
              {specs.length > 0 && (
                <div className="shop-item-specs" style={{ marginBottom: '1.5rem', borderTop: '0.5px solid var(--bdr2)' }}>
                  {specs.map(s => (
                    <div key={s.label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0',
                      borderBottom: '0.5px solid var(--bdr2)',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(0.625rem, 2.6vw, 0.6875rem)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                      }}>{s.label}</span>
                      <span style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 'clamp(0.8125rem, 3.6vw, 0.9375rem)',
                        color: 'var(--text)',
                      }}>{s.val}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── CUSTOM FIELDS ── */}
              {!loadingCFs && customFields.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div className="shop-item-desc-label" style={{ marginBottom: '0.625rem' }}>Custom Fields</div>
                  {customFields.map(cf => (
                    <div key={cf.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '0.625rem 0',
                      borderBottom: '0.5px solid var(--bdr2)',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(0.625rem, 2.6vw, 0.6875rem)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        flexShrink: 0,
                        maxWidth: '45%',
                        wordBreak: 'break-word',
                      }}>{cf.label}</span>
                      <span style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 'clamp(0.8125rem, 3.6vw, 0.9375rem)',
                        color: 'var(--text)',
                        textAlign: 'right',
                        wordBreak: 'break-word',
                        flex: 1,
                      }}>{cf.value || '—'}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Wizard Result Reference */}
              {sr.wizard_result_id && (
                <div className="shop-item-desc" style={{ marginTop: '1.5rem' }}>
                  <div className="shop-item-desc-label">Wizard Result</div>
                  <p style={{ color: 'var(--tile-feasib)', fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.8125rem, 3.5vw, 0.9375rem)' }}>
                    {sr.wizard_result_id.slice(0, 8)}
                  </p>
                </div>
              )}

              {/* ── DESCRIPTION ── */}
              {sr.description && (
                <div className="shop-item-desc" style={{ marginTop: '1.5rem' }}>
                  <div className="shop-item-desc-label">Description</div>
                  <p>"{sr.description}"</p>
                </div>
              )}

              {/* ── PHOTOS ── */}
              {photos.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div className="shop-item-desc-label" style={{ marginBottom: '0.625rem' }}>Photos</div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${Math.min(photos.length, 3)}, 1fr)`,
                    gap: 'clamp(0.5rem, 2.5vw, 0.75rem)',
                  }}>
                    {photos.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          aspectRatio: '1 / 1',
                          borderRadius: '12px',
                          border: '0.5px solid var(--bdr2)',
                          backgroundImage: `url(${url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'block',
                        }}
                        aria-label={`Photo ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── SMS CONSENT note ── */}
              {sr.workorder_sms_consent && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: 'clamp(0.625rem, 3vw, 0.875rem) clamp(0.75rem, 3.5vw, 1rem)',
                  background: 'var(--bg-card)',
                  border: '0.5px solid var(--bdr2)',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 'clamp(0.8125rem, 3.4vw, 0.875rem)',
                  color: 'var(--text-muted)',
                  lineHeight: 1.55,
                }}>
                  ✓ Work-order SMS consent recorded{consentedAt ? ` on ${consentedAt}` : ''}.
                </div>
              )}

              {/* Submission Info */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(0.5625rem, 2.4vw, 0.625rem)',
                color: 'var(--text-muted)',
                opacity: 0.6,
                marginTop: '2rem',
                lineHeight: 1.8,
                borderTop: '0.5px solid var(--bdr2)',
                paddingTop: '1rem',
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
          font-size: clamp(0.6875rem, 2.8vw, 0.8125rem);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .shop-item-close {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: clamp(1.0625rem, 4.5vw, 1.25rem);
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
          font-size: clamp(0.625rem, 2.6vw, 0.6875rem);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .shop-item-desc p {
          font-family: var(--font-body);
          font-size: clamp(0.875rem, 3.8vw, 1.0rem);
          line-height: 1.6;
          color: var(--text) !important;
          opacity: 0.85;
          margin: 0;
        }
      `}</style>
    </>
  );
}

