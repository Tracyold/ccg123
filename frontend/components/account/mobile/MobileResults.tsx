import { useState, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import type { WizardResult } from '../../../lib/wizardResultsService'
import {
  useWizardResultsTab,
  formatRowDate,
  getStoneLabel,
} from '../shared/1WizardResultsTab'
import {
  getStoneFields,
  formatResultDate,
  handleExportPdf,
  handleDeleteWithConfirm,
} from '../shared/1WizardResultsModal'
import { getBandColor } from '../shared/1Dashboard'

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  isOpen:                  boolean
  onClose:                 () => void
  session:                 any
  setServiceRequests:      (fn: any) => void
  onServiceRequestCreated: () => void
}

// ── Score ring helper ──────────────────────────────────────────────────────

function ScoreRing({ pct, color, size = 48, stroke = 2.5 }: {
  pct: number; color: string; size?: number; stroke?: number
}) {
  const r      = (size / 2) - stroke
  const circ   = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const cx     = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--bdr2)" strokeWidth={stroke} />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`} />
    </svg>
  )
}

// ── Selection list helper ──────────────────────────────────────────────────

function SelectionList({ label, items }: { label: string; items: string[] }) {
  if (!items?.length) return null
  return (
    <div className="res-section">
      <div className="res-section-label" style={{ color: 'var(--text-muted)' }}>{label}</div>
      {items.map(s => (
        <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
          <span style={{ color: 'var(--gold)', fontSize: 12, flexShrink: 0, marginTop: 1 }}>✓</span>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text)' }}>{s}</span>
        </div>
      ))}
    </div>
  )
}

// ── SR selection list helper ───────────────────────────────────────────────

function SrSelectionList({ label, items }: { label: string; items: string[] }) {
  if (!items?.length) return null
  return (
    <div className="sr-sel-section">
      <div className="sr-sel-label">{label}</div>
      {items.map(s => (
        <div key={s} className="sr-sel-item">
          <span className="sr-sel-check">✓</span>{s}
        </div>
      ))}
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────

export default function MobileResults({
  isOpen, onClose, session, setServiceRequests, onServiceRequestCreated,
}: Props) {

  const { results, loading, selected, setSelected, handleDelete } = useWizardResultsTab()

  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [srModalOpen,  setSrModalOpen]  = useState(false)
  const [srNotes,      setSrNotes]      = useState('')
  const [srSubmitting, setSrSubmitting] = useState(false)
  const [tipVisible,   setTipVisible]   = useState(false)
  const [tipShown,     setTipShown]     = useState(false)

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

  const openDrawer = (r: WizardResult) => {
    setSelected(r)
    setDrawerOpen(true)
    showSlideTip()
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setSelected(null)
  }

  const openSrModal = () => {
    setSrNotes('')
    setSrModalOpen(true)
  }

  const closeSrModal = () => setSrModalOpen(false)

  const submitSr = async () => {
    if (!selected || !session) return
    setSrSubmitting(true)
    await supabase.from('service_requests').insert({
      account_user_id:  session.user.id,
      service_type:     selected.recommendation,
      description:
        `Stone: ${getStoneLabel(selected)}` +
        `\nWizard Score: ${Math.round(selected.feasibility_percent)}%` +
        `\nRecommendation: ${selected.recommendation}` +
        `\nWeight Loss Estimate: ${selected.weight_loss}` +
        (srNotes ? `\n\nAdditional Notes: ${srNotes}` : ''),
      wizard_result_id: selected.id,
    })
    await supabase.functions.invoke('send-admin-notification', {
      body: { event_type: 'service_requests', user_id: session.user.id },
    })
    const { data: sr } = await supabase
      .from('service_requests').select('*')
      .eq('account_user_id', session.user.id)
      .order('created_at', { ascending: false })
    setServiceRequests(sr || [])
    setSrSubmitting(false)
    closeSrModal()
    closeDrawer()
    onServiceRequestCreated()
  }

  return (
    <>
      <style>{`
        .slide-panel{position:fixed;left:0;right:0;max-width:430px;margin:0 auto;top:0;bottom:62px;z-index:105;background:var(--bg);display:flex;flex-direction:column;transform:translateY(100%);transition:transform 420ms cubic-bezier(0.16,1,0.3,1)}
        .slide-panel.open{transform:translateY(0)}
        .panel-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--bg-deep);border-bottom:0.5px solid var(--bdr2);flex-shrink:0}
        .panel-title{font-family:var(--font-mono);font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:var(--text-muted)}
        .panel-close{background:none;border:none;color:var(--text-muted);font-size:16px;cursor:pointer;padding:2px 6px}
        .wiz-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:16px;overflow-y:auto;flex:1}
        .wiz-thumb{position:relative;background:var(--bg-card);padding:16px 14px 14px;cursor:pointer;transition:all 220ms ease;display:flex;flex-direction:column;gap:6px;border:0.5px solid var(--bdr2)}
        .wiz-thumb:active{transform:scale(0.97)}
        .wiz-score-ring{position:relative;width:48px;height:48px;margin-bottom:2px;flex-shrink:0}
        .wiz-score-num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:11px;font-weight:700}
        .wiz-band-label{font-family:var(--font-mono);font-size:8px;letter-spacing:0.2em;text-transform:uppercase}
        .wiz-stone{font-family:var(--font-display);font-size:13px;color:var(--text);line-height:1.2;margin-top:2px}
        .wiz-date{font-family:var(--font-mono);font-size:8px;color:var(--text-muted);opacity:0.6;margin-top:4px;letter-spacing:0.08em}
        .wiz-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:40px 24px;text-align:center}
        .wiz-empty-title{font-family:var(--font-display);font-size:22px;font-style:italic;color:var(--text);margin-bottom:10px;line-height:1.3}
        .wiz-empty-sub{font-family:var(--font-ui);font-size:12px;color:var(--text-muted);line-height:1.6}
        .wiz-empty-link{display:inline-block;margin-top:18px;font-family:var(--font-mono);font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--tile-feasib);border:0.5px solid var(--tile-feasib);padding:10px 20px;text-decoration:none;transition:all 180ms ease}
        .res-drawer{position:fixed;inset:0;z-index:500;transform:translateX(100%);transition:transform 380ms cubic-bezier(0.16,1,0.3,1);display:flex;box-shadow:none}
        .res-drawer.open{transform:translateX(0);box-shadow:-12px 0 40px rgba(0,0,0,0.45)}
        .res-handle{width:32px;background:transparent;flex-shrink:0;cursor:grab}
        .res-handle:active{cursor:grabbing}
        .res-body{flex:1;background:var(--bg);display:flex;flex-direction:column;overflow:hidden}
        .res-topbar{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:0.5px solid var(--border);flex-shrink:0;gap:10px}
        .res-band-badge{font-family:var(--font-mono);font-size:8px;letter-spacing:0.18em;text-transform:uppercase;padding:3px 10px;flex-shrink:0;border:0.5px solid currentColor}
        .res-close{background:none;border:0.5px solid var(--border);color:var(--text-muted);width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;border-radius:50%}
        .res-scroll{flex:1;overflow-y:auto;padding:20px 18px}
        .res-hero{display:flex;align-items:center;gap:18px;margin-bottom:22px;padding-bottom:18px;border-bottom:0.5px solid var(--border)}
        .res-ring{position:relative;width:72px;height:72px;flex-shrink:0}
        .res-ring-num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:16px;font-weight:700}
        .res-stone-name{font-family:var(--font-display);font-size:18px;color:var(--text);margin-bottom:4px;line-height:1.2}
        .res-stone-meta{font-family:var(--font-ui);font-size:11px;color:var(--text-muted);line-height:1.6}
        .res-rec{font-family:var(--font-mono);font-size:9px;letter-spacing:0.18em;text-transform:uppercase;margin-top:6px}
        .res-section{margin-bottom:20px}
        .res-section-label{font-family:var(--font-mono);font-size:8.5px;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:10px;padding-bottom:6px;border-bottom:0.5px solid var(--border)}
        .res-date{font-family:var(--font-mono);font-size:9px;letter-spacing:0.14em;color:var(--text-muted);margin-top:20px;opacity:0.6}
        .sr-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:600;opacity:0;pointer-events:none;transition:opacity 260ms ease}
        .sr-overlay.open{opacity:1;pointer-events:all}
        .sr-modal{position:fixed;bottom:0;left:0;right:0;max-width:100%;margin:0 auto;background:var(--bg-deep);border-top:0.5px solid var(--bdr2);border-radius:12px 12px 0 0;z-index:601;transform:translateY(100%);transition:transform 380ms cubic-bezier(0.16,1,0.3,1);max-height:90vh;display:flex;flex-direction:column}
        .sr-modal.open{transform:translateY(0)}
        .sr-modal-handle{width:36px;height:4px;border-radius:2px;background:var(--bdr2);margin:12px auto 0;flex-shrink:0}
        .sr-modal-head{display:flex;align-items:center;justify-content:space-between;padding:14px 20px 10px;border-bottom:0.5px solid var(--bdr2);flex-shrink:0}
        .sr-modal-title{font-family:var(--font-mono);font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:var(--text-muted)}
        .sr-modal-close{background:none;border:none;color:var(--text-muted);font-size:16px;cursor:pointer}
        .sr-modal-body{flex:1;overflow-y:auto;padding:18px 20px}
        .sr-auto-block{background:var(--bg-card);border:0.5px solid var(--bdr2);padding:14px;margin-bottom:16px}
        .sr-auto-label{font-family:var(--font-mono);font-size:8px;letter-spacing:0.22em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px}
        .sr-auto-row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:0.5px solid var(--bdr2)}
        .sr-auto-row:last-child{border-bottom:none}
        .sr-auto-key{font-family:var(--font-mono);font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:var(--text-muted)}
        .sr-auto-val{font-family:var(--font-ui);font-size:12px;color:var(--text);text-align:right;max-width:60%}
        .sr-sel-section{margin-bottom:10px}
        .sr-sel-label{font-family:var(--font-mono);font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:var(--text-muted);margin-bottom:5px}
        .sr-sel-item{font-family:var(--font-ui);font-size:12px;color:var(--text);padding:4px 0;display:flex;align-items:flex-start;gap:8px}
        .sr-sel-check{color:var(--gold);flex-shrink:0;font-size:11px;margin-top:1px}
        .sr-notes-label{font-family:var(--font-mono);font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px;display:block}
        .sr-notes-input{width:100%;background:var(--bg-card);border:0.5px solid var(--bdr2);color:var(--text);font-family:var(--font-ui);font-size:13px;padding:11px 13px;outline:none;resize:none;line-height:1.6;transition:border-color 150ms ease}
        .sr-notes-input:focus{border-color:var(--gold)}
        .sr-modal-footer{padding:14px 20px 32px;border-top:0.5px solid var(--bdr2);flex-shrink:0}
        .sr-submit-btn{width:100%;background:var(--gold);color:var(--bg-deep);border:none;padding:14px;font-family:var(--font-mono);font-size:10px;letter-spacing:0.22em;text-transform:uppercase;cursor:pointer;transition:opacity 180ms ease}
        .sr-submit-btn:hover{opacity:0.85}
        .sr-submit-btn:disabled{opacity:0.4;cursor:not-allowed}
        .slide-tip{position:fixed;left:0;top:50%;transform:translateY(-50%) translateX(-100%);z-index:600;display:flex;align-items:center;gap:10px;background:rgba(26,26,27,0.5);border:0.5px solid rgba(255,255,255,0.08);border-left:none;border-radius:0 8px 8px 0;padding:10px 14px 10px 12px;opacity:0;pointer-events:none;transition:opacity 300ms ease,transform 300ms ease;box-shadow:3px 0 10px rgba(0,0,0,0.35);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
        .slide-tip.show{opacity:1;transform:translateY(-50%) translateX(0);pointer-events:all}
        .slide-tip-arrow{font-size:22px;color:var(--gold);animation:slideHint 1.2s ease-in-out infinite}
        .slide-tip-label{font-family:var(--font-mono);font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--text-muted)}
        @keyframes slideHint{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}
      `}</style>

      {/* ── Panel ── */}
      <div className={`slide-panel ${isOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <span className="panel-title">Wizard Results</span>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)' }}>Loading...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="wiz-empty">
            <div className="wiz-empty-title">No saved results yet.</div>
            <div className="wiz-empty-sub">Complete the Cut Feasibility Wizard and save your results to see them here.</div>
            <a className="wiz-empty-link" href="/feasibility-check">Open Wizard →</a>
          </div>
        ) : (
          <div className="wiz-grid">
            {results.map(r => {
              const pct   = Math.round(r.feasibility_percent)
              const color = getBandColor(r.band)
              return (
                <div
                  key={r.id}
                  className="wiz-thumb"
                  style={{ borderColor: `${color}80` }}
                  onClick={() => openDrawer(r)}
                >
                  <div className="wiz-score-ring">
                    <ScoreRing pct={pct} color={color} />
                    <div className="wiz-score-num" style={{ color }}>{pct}</div>
                  </div>
                  <div className="wiz-band-label" style={{ color }}>{r.recommendation}</div>
                  <div className="wiz-stone">{getStoneLabel(r)}</div>
                  <div className="wiz-date">{formatRowDate(r.created_at)}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Result Detail Drawer ── */}
      <div
        ref={drawerRef}
        className={`res-drawer ${drawerOpen ? 'open' : ''}`}
        onMouseDown={onDragStart} onMouseMove={onDragMove} onMouseUp={onDragEnd}
        onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
      >
        <div className="res-handle" />
        <div className="res-body">

          {/* Topbar */}
          <div className="res-topbar">
            <span className="res-band-badge" style={{ color: selected ? getBandColor(selected.band) : 'var(--text-muted)', borderColor: selected ? getBandColor(selected.band) : 'var(--border)' }}>
              {selected?.band ?? '--'}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', flex: 1 }}>
              {selected ? getStoneLabel(selected) : ''}
            </span>
            <button className="res-close" onClick={closeDrawer}>✕</button>
          </div>

          <div className="res-scroll">
            {selected && (
              <ResultDrawerBody
                selected={selected}
                onOpenSrModal={openSrModal}
                onDelete={handleDelete}
              />
            )}
          </div>

        </div>
      </div>

      {/* ── SR from Result Modal ── */}
      <div className={`sr-overlay ${srModalOpen ? 'open' : ''}`} onClick={closeSrModal} />
      <div className={`sr-modal ${srModalOpen ? 'open' : ''}`}>
        <div className="sr-modal-handle" />
        <div className="sr-modal-head">
          <span className="sr-modal-title">New Service Request</span>
          <button className="sr-modal-close" onClick={closeSrModal}>✕</button>
        </div>

        {selected && (
          <>
            <div className="sr-modal-body">
              <div className="sr-auto-block">
                <div className="sr-auto-label">Stone Information</div>
                {[
                  { key: 'Stone',          val: getStoneLabel(selected)                    },
                  { key: 'Weight',         val: selected.stone_weight_ct                   },
                  { key: 'Cut',            val: selected.stone_cut                         },
                  { key: 'Dimensions',     val: selected.stone_dimensions                  },
                  { key: 'Recommendation', val: selected.recommendation                    },
                  { key: 'Weight Loss',    val: selected.weight_loss                       },
                ].filter(r => r.val).map(r => (
                  <div key={r.key} className="sr-auto-row">
                    <span className="sr-auto-key">{r.key}</span>
                    <span className="sr-auto-val" style={{ color: r.key === 'Recommendation' ? 'var(--gold)' : 'var(--text)' }}>{r.val}</span>
                  </div>
                ))}
              </div>

              <SrSelectionList label="Positive Characteristics" items={selected.positive_selections} />
              <SrSelectionList label="Limiting Characteristics" items={selected.limiting_selections} />
              <SrSelectionList label="Structural Condition"     items={selected.structural_selections} />

              <div style={{ marginTop: 8 }}>
                <label className="sr-notes-label">
                  Additional Notes <span style={{ opacity: 0.5 }}>(optional)</span>
                </label>
                <textarea
                  className="sr-notes-input"
                  rows={4}
                  value={srNotes}
                  onChange={e => setSrNotes(e.target.value)}
                  placeholder="Describe any specific preferences, concerns, or instructions for the cutter..."
                />
              </div>
            </div>

            <div className="sr-modal-footer">
              <button
                className="sr-submit-btn"
                onClick={submitSr}
                disabled={srSubmitting}
              >
                {srSubmitting ? 'Submitting...' : 'Submit Service Request →'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Slide tip ── */}
      <div className={`slide-tip ${tipVisible ? 'show' : ''}`}>
        <span className="slide-tip-arrow">→</span>
        <span className="slide-tip-label">Slide</span>
      </div>
    </>
  )
}

// ── Drawer body sub-component ──────────────────────────────────────────────

function ResultDrawerBody({ selected, onOpenSrModal, onDelete }: {
  selected:      WizardResult
  onOpenSrModal: () => void
  onDelete:      (id: string) => void
}) {
  const pct         = Math.round(selected.feasibility_percent)
  const color       = getBandColor(selected.band)
  const stoneFields = getStoneFields(selected)
  const date        = formatResultDate(selected.created_at)

  return (
    <>
      {/* Score hero */}
      <div className="res-hero">
        <div className="res-ring">
          <ScoreRing pct={pct} color={color} size={72} stroke={3} />
          <div className="res-ring-num" style={{ color }}>{pct}</div>
        </div>
        <div>
          <div className="res-stone-name">{getStoneLabel(selected)}</div>
          <div className="res-stone-meta">
            {stoneFields.filter(f => ['Weight','Cut / Shape','Dimensions'].includes(f.label)).map(f => f.value).filter(Boolean).join(' · ')}
          </div>
          <div className="res-rec" style={{ color }}>{selected.recommendation}</div>
        </div>
      </div>

      {/* Stone info */}
      <div className="res-section">
        <div className="res-section-label" style={{ color: 'var(--text-muted)' }}>Stone Information</div>
        {stoneFields.map(f => (
          <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{f.label}</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text)' }}>{f.value}</span>
          </div>
        ))}
      </div>

      <SelectionList label="Positive Characteristics" items={selected.positive_selections} />
      <SelectionList label="Limiting Characteristics" items={selected.limiting_selections} />
      <SelectionList label="Structural Condition"     items={selected.structural_selections} />

      {/* Create SR */}
      <button
        onClick={onOpenSrModal}
        style={{ width: '100%', background: 'var(--gold)', color: 'var(--bg-deep)', border: 'none', padding: 13, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: 'pointer', transition: 'opacity 180ms ease', marginBottom: 12 }}
        onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseOut={e  => (e.currentTarget.style.opacity = '1')}
      >
        + Create Service Request
      </button>

      {/* Export + Delete */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => handleExportPdf()}
          style={{ flex: 1, background: 'transparent', color: 'var(--text-muted)', border: '0.5px solid var(--border)', padding: '10px', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer' }}
        >
          ⬇ Export PDF
        </button>
        <button
          onClick={() => handleDeleteWithConfirm(selected.id, onDelete)}
          style={{ flex: 1, background: 'transparent', color: '#f87171', border: '0.5px solid rgba(248,113,113,0.3)', padding: '10px', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer' }}
        >
          Delete
        </button>
      </div>

      <div className="res-date">{date}</div>
    </>
  )
}