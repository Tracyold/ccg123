import { useState, useRef } from 'react'
import {
  SERVICE_TYPES,
  SERVICE_REQUEST_DISCLAIMER,
  type Inquiry,
  type ServiceRequest,
  formatInquiryDate,
  canSubmitSR,
} from '../shared/1InquiryList'

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  isOpen:          boolean
  onClose:         () => void
  serviceRequests: ServiceRequest[]
  showSRForm:      boolean
  srType:          string
  srDesc:          string
  srSubmitting:    boolean
  srGateMsg:       string
  setSrType:       (v: string) => void
  setSrDesc:       (v: string) => void
  setShowSRForm:   (v: boolean) => void
  onOpenSRForm:    () => void
  onSubmitSR:      () => void
}

// ── Component ──────────────────────────────────────────────────────────────

export default function MobileServiceRequests({
  isOpen, onClose,
  serviceRequests,
  showSRForm, srType, srDesc, srSubmitting, srGateMsg,
  setSrType, setSrDesc, setShowSRForm,
  onOpenSRForm, onSubmitSR,
}: Props) {

  const [selected,   setSelected]   = useState<ServiceRequest | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [tipVisible, setTipVisible] = useState(false)
  const [tipShown,   setTipShown]   = useState(false)

  const drawerRef = useRef<HTMLDivElement>(null)
  const dragRef   = useRef<{ startX: number; dragging: boolean }>({ startX: 0, dragging: false })

  // ── Slide tip ──
  const showSlideTip = () => {
    if (tipShown) return
    setTipShown(true)
    setTimeout(() => setTipVisible(true), 500)
    setTimeout(() => setTipVisible(false), 3300)
  }

  // ── Drag to close ──
  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    dragRef.current = { startX: x, dragging: false }
    if (drawerRef.current) drawerRef.current.style.transition = 'none'
  }
  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    const x  = 'touches' in e ? e.touches[0].clientX : e.clientX
    const dx = x - dragRef.current.startX
    if (!dragRef.current.dragging && Math.abs(dx) > 6) dragRef.current.dragging = true
    if (dragRef.current.dragging && dx > 0 && drawerRef.current)
      drawerRef.current.style.transform = `translateX(${dx}px)`
    if (e.cancelable) e.preventDefault()
  }
  const onDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    const x  = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX
    const dx = x - dragRef.current.startX
    if (drawerRef.current) {
      drawerRef.current.style.transition = ''
      drawerRef.current.style.transform  = ''
    }
    if (dragRef.current.dragging && dx > 80) closeDrawer()
    dragRef.current.dragging = false
  }

  const openDrawer = (sr: ServiceRequest) => {
    setSelected(sr)
    setDrawerOpen(true)
    showSlideTip()
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setSelected(null)
  }

  return (
    <>
      <style>{`
        .slide-panel{position:fixed;left:0;right:0;max-width:430px;margin:0 auto;top:0;bottom:62px;z-index:105;background:var(--bg);display:flex;flex-direction:column;transform:translateY(100%);transition:transform 420ms cubic-bezier(0.16,1,0.3,1)}
        .slide-panel.open{transform:translateY(0)}
        .panel-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--bg-deep);border-bottom:0.5px solid var(--bdr2);flex-shrink:0}
        .panel-title{font-family:var(--font-mono);font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:var(--text-muted)}
        .panel-close{background:none;border:none;color:var(--text-muted);font-size:16px;cursor:pointer;padding:2px 6px}
        .sr-list{padding:16px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;flex:1}
        .sr-card{background:var(--bg-card);border:0.5px solid var(--bdr2);border-left:3px solid var(--gold);padding:14px 16px;cursor:pointer;transition:all 200ms ease}
        .sr-card:hover{border-color:color-mix(in srgb,var(--gold) 40%,var(--bdr2))}
        .sr-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
        .sr-card-stone{font-family:var(--font-display);font-size:15px;color:var(--text)}
        .sr-card-status{font-family:var(--font-mono);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;padding:2px 8px;background:rgba(207,221,78,0.1);color:var(--gold)}
        .sr-card-rec{font-family:var(--font-mono);font-size:9px;letter-spacing:0.16em;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px}
        .sr-card-date{font-family:var(--font-mono);font-size:8.5px;color:var(--text-muted);opacity:0.6}
        .sr-drawer{position:fixed;inset:0;z-index:500;transform:translateX(100%);transition:transform 380ms cubic-bezier(0.16,1,0.3,1);display:flex;box-shadow:none}
        .sr-drawer.open{transform:translateX(0);box-shadow:-12px 0 40px rgba(0,0,0,0.45)}
        .sr-drawer-handle{width:32px;background:transparent;flex-shrink:0;cursor:grab}
        .sr-drawer-handle:active{cursor:grabbing}
        .sr-drawer-body{flex:1;background:var(--bg);display:flex;flex-direction:column;overflow:hidden}
        .sr-drawer-topbar{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:0.5px solid var(--border);flex-shrink:0;gap:10px}
        .sr-drawer-badge{font-family:var(--font-mono);font-size:8px;letter-spacing:0.18em;text-transform:uppercase;padding:3px 10px;flex-shrink:0;color:var(--gold);border:0.5px solid var(--gold)}
        .sr-drawer-close{background:none;border:0.5px solid var(--border);color:var(--text-muted);width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;border-radius:50%}
        .sr-drawer-scroll{flex:1;overflow-y:auto;padding:20px 18px}
        .sr-drawer-section{margin-bottom:22px}
        .sr-drawer-section-label{font-family:var(--font-mono);font-size:8px;letter-spacing:0.24em;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px;padding-bottom:6px;border-bottom:0.5px solid var(--border)}
        .sr-drawer-field{display:flex;justify-content:space-between;padding:6px 0;border-bottom:0.5px solid var(--border)}
        .sr-drawer-field:last-child{border-bottom:none}
        .sr-drawer-key{font-family:var(--font-mono);font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:var(--text-muted)}
        .sr-drawer-val{font-family:var(--font-ui);font-size:12px;color:var(--text);text-align:right;max-width:60%}
        .sr-drawer-note{font-family:var(--font-ui);font-size:13px;color:var(--text);line-height:1.7;font-style:italic}
        .acc-btn-gold{background:var(--gold);color:var(--bg-deep);border:none;padding:10px 20px;font-family:var(--font-mono);font-size:9px;letter-spacing:0.18em;text-transform:uppercase;cursor:pointer;transition:opacity 180ms ease}
        .acc-btn-gold:hover{opacity:0.85}
        .acc-btn-gold:disabled{opacity:0.4;cursor:not-allowed}
        .acc-btn-ghost{background:none;border:0.5px solid var(--border);color:var(--text-muted);padding:10px 16px;font-family:var(--font-mono);font-size:9px;letter-spacing:0.16em;text-transform:uppercase;cursor:pointer;transition:all 160ms ease}
        .acc-btn-ghost:hover{border-color:var(--text);color:var(--text)}
        .acc-label{font-family:var(--font-mono);font-size:8.5px;letter-spacing:0.2em;text-transform:uppercase;color:var(--text-muted);margin-bottom:6px;display:block}
        .acc-input{width:100%;background:var(--bg-card);border:0.5px solid var(--bdr2);color:var(--text);font-family:var(--font-ui);font-size:13px;padding:10px 12px;outline:none;transition:border-color 150ms ease}
        .acc-input:focus{border-color:var(--gold)}
        .acc-select{width:100%;background:var(--bg-card);border:0.5px solid var(--bdr2);color:var(--text);font-family:var(--font-ui);font-size:13px;padding:10px 12px;outline:none;appearance:none;cursor:pointer}
        .acc-textarea{width:100%;background:var(--bg-card);border:0.5px solid var(--bdr2);color:var(--text);font-family:var(--font-ui);font-size:13px;padding:10px 12px;outline:none;resize:vertical;line-height:1.6;transition:border-color 150ms ease}
        .acc-textarea:focus{border-color:var(--gold)}
        .acc-empty{font-family:var(--font-ui);font-size:12px;color:var(--text-muted);text-align:center;padding:40px 0;font-style:italic;opacity:0.6}
        .slide-tip{position:fixed;left:0;top:50%;transform:translateY(-50%) translateX(-100%);z-index:600;display:flex;align-items:center;gap:10px;background:rgba(26,26,27,0.5);border:0.5px solid rgba(255,255,255,0.08);border-left:none;border-radius:0 8px 8px 0;padding:10px 14px 10px 12px;opacity:0;pointer-events:none;transition:opacity 300ms ease,transform 300ms ease;box-shadow:3px 0 10px rgba(0,0,0,0.35);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
        .slide-tip.show{opacity:1;transform:translateY(-50%) translateX(0);pointer-events:all}
        .slide-tip-arrow{font-size:22px;color:var(--gold);animation:slideHint 1.2s ease-in-out infinite}
        .slide-tip-label{font-family:var(--font-mono);font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--text-muted)}
        @keyframes slideHint{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}
      `}</style>

      {/* ── Panel ── */}
      <div className={`slide-panel ${isOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <span className="panel-title">Service Requests</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="acc-btn-gold"
              style={{ padding: '5px 12px', fontSize: 8 }}
              onClick={onOpenSRForm}
            >
              + New
            </button>
            <button className="panel-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="sr-list">

          {/* Gate message */}
          {srGateMsg && (
            <div style={{ background: 'rgba(207,221,78,0.06)', border: '0.5px solid var(--bdr2)', borderLeft: '2px solid var(--gold)', padding: '12px 14px', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {srGateMsg}
            </div>
          )}

          {/* SR Form */}
          {showSRForm && (
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--bdr2)', padding: 16 }}>
              <div style={{ marginBottom: 14 }}>
                <label className="acc-label">Service Type *</label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="acc-select"
                    value={srType}
                    onChange={e => setSrType(e.target.value)}
                  >
                    <option value="">Select service type</option>
                    {SERVICE_TYPES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: 'var(--text-muted)', pointerEvents: 'none' }}>▾</span>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="acc-label">Description *</label>
                <textarea
                  className="acc-textarea"
                  rows={5}
                  value={srDesc}
                  onChange={e => setSrDesc(e.target.value)}
                  placeholder="Describe your request..."
                />
              </div>

              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 14, lineHeight: 1.6 }}>
                {SERVICE_REQUEST_DISCLAIMER}
              </p>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="acc-btn-gold"
                  onClick={onSubmitSR}
                  disabled={!canSubmitSR(srType, srDesc, srSubmitting)}
                >
                  {srSubmitting ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  className="acc-btn-ghost"
                  onClick={() => setShowSRForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* SR list */}
          {serviceRequests.length === 0 && !showSRForm ? (
            <p className="acc-empty">
              No service requests yet.<br />Create one from your wizard results.
            </p>
          ) : (
            serviceRequests.map(sr => (
              <div
                key={sr.service_request_id}
                className="sr-card"
                onClick={() => openDrawer(sr)}
              >
                <div className="sr-card-top">
                  <div className="sr-card-stone">{sr.service_type}</div>
                  <span className="sr-card-status">Pending</span>
                </div>
                <div className="sr-card-rec">{sr.description?.split('\n')[0] ?? ''}</div>
                <div className="sr-card-date">{sr.service_request_id?.slice(-6).toUpperCase()} · {formatInquiryDate(sr.created_at)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── SR Detail Drawer ── */}
      <div
        ref={drawerRef}
        className={`sr-drawer ${drawerOpen ? 'open' : ''}`}
        onMouseDown={onDragStart} onMouseMove={onDragMove} onMouseUp={onDragEnd}
        onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
      >
        <div className="sr-drawer-handle" />
        <div className="sr-drawer-body">

          <div className="sr-drawer-topbar">
            <span className="sr-drawer-badge">Pending</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', flex: 1 }}>
              {selected?.service_request_id?.slice(-6).toUpperCase() ?? ''}
            </span>
            <button className="sr-drawer-close" onClick={closeDrawer}>✕</button>
          </div>

          <div className="sr-drawer-scroll">
            {selected && (
              <>
                <div className="sr-drawer-section">
                  <div className="sr-drawer-section-label">Service Request</div>
                  {[
                    { key: 'Service Type', val: selected.service_type },
                    { key: 'Submitted',    val: formatInquiryDate(selected.created_at) },
                  ].map(f => (
                    <div key={f.key} className="sr-drawer-field">
                      <span className="sr-drawer-key">{f.key}</span>
                      <span className="sr-drawer-val">{f.val}</span>
                    </div>
                  ))}
                </div>

                {selected.description && (
                  <div className="sr-drawer-section">
                    <div className="sr-drawer-section-label">Description</div>
                    <div className="sr-drawer-note">"{selected.description}"</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Slide tip ── */}
      <div className={`slide-tip ${tipVisible ? 'show' : ''}`}>
        <span className="slide-tip-arrow">→</span>
        <span className="slide-tip-label">Slide</span>
      </div>
    </>
  )
}