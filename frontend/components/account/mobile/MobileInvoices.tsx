import { useState, useRef } from 'react'
import { formatMoney, fmtDate } from '../../../lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────
interface LineItem {
  product_id:         string
  title:              string
  gem_type:           string
  shape:              string
  weight:             number
  color:              string
  origin:             string
  treatment:          string
  description:        string
  price_per_carat:    number
  total_price:        number
  gia_report_number:  string | null
  gia_report_pdf_url: string | null
  photo_url:          string | null
}

interface AccountSnapshot {
  name:            string
  email:           string
  phone:           string
  shippingAddress: string
  businessName:    string | null
}

interface Invoice {
  invoice_id:               string
  stripe_session_id:        string
  total_amount:             number
  line_items:               LineItem[]
  account_snapshot:         AccountSnapshot
  invoice_state:            string
  paid_at:                  string
}

// ── Props ──────────────────────────────────────────────────────────────────
interface Props {
  isOpen:   boolean
  onClose:  () => void
  invoices: Invoice[]
}

// ── Component ──────────────────────────────────────────────────────────────
export default function MobileInvoices({ isOpen, onClose, invoices }: Props) {
  const [tapped,     setTapped]     = useState<string | null>(null)
  const [selected,   setSelected]   = useState<Invoice | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dateFrom,   setDateFrom]   = useState('')
  const [dateTo,     setDateTo]     = useState('')
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
    if (drawerRef.current) { drawerRef.current.style.transition = ''; drawerRef.current.style.transform = '' }
    if (dragRef.current.dragging && dx > 80) closeDrawer()
    dragRef.current.dragging = false
  }

  const openDrawer = (inv: Invoice) => { setSelected(inv); setDrawerOpen(true); showSlideTip() }
  const closeDrawer = () => { setDrawerOpen(false); setTapped(null) }

  // ── Two-tap ──
  const tapThumb = (inv: Invoice) => {
    if (tapped === inv.invoice_id) openDrawer(inv)
    else setTapped(inv.invoice_id)
  }

  // ── Date filter ──
  const filtered = invoices.filter(inv => {
    const d = inv.paid_at?.split('T')[0] ?? ''
    if (dateFrom && d < dateFrom) return false
    if (dateTo   && d > dateTo)   return false
    return true
  })

  return (
    <>
      <style>{`
        .slide-panel{position:fixed;left:0;right:0;max-width:430px;margin:0 auto;top:0;bottom:62px;z-index:105;background:var(--bg);display:flex;flex-direction:column;transform:translateY(100%);transition:transform 420ms cubic-bezier(0.16,1,0.3,1)}
        .slide-panel.open{transform:translateY(0)}
        .panel-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--bg-deep);border-bottom:0.5px solid var(--bdr2);flex-shrink:0}
        .panel-title{font-family:var(--font-mono);font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:var(--text-muted)}
        .panel-close{background:none;border:none;color:var(--text-muted);font-size:16px;cursor:pointer;padding:2px 6px}
        .inv-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:16px}
        .inv-thumb{position:relative;background:var(--bg-card);border:0.5px solid var(--bdr2);aspect-ratio:1;overflow:hidden;cursor:pointer;transition:all 220ms ease}
        .inv-thumb:hover{border-color:color-mix(in srgb,var(--gold) 40%,var(--bdr2))}
        .inv-photo{width:100%;height:100%;object-fit:cover;display:flex;align-items:center;justify-content:center;font-size:48px;background:var(--bg-deep)}
        .inv-overlay{position:absolute;inset:0;background:color-mix(in srgb,var(--gold) 55%,rgba(0,0,0,0.2));display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity 220ms ease;padding:12px}
        .inv-thumb.tapped .inv-overlay{opacity:1}
        .inv-price{font-family:var(--font-mono);font-size:18px;font-weight:700;color:#fff;margin-bottom:4px}
        .inv-date{font-family:var(--font-ui);font-size:10px;letter-spacing:0.1em;color:rgba(255,255,255,0.7)}
        .inv-tap-hint{font-family:var(--font-ui);font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-top:10px}
        .inv-drawer{position:fixed;inset:0;z-index:500;transform:translateX(100%);transition:transform 380ms cubic-bezier(0.16,1,0.3,1);display:flex;box-shadow:none}
        .inv-drawer.open{transform:translateX(0);box-shadow:-12px 0 40px rgba(0,0,0,0.45)}
        .inv-drawer-handle{width:32px;background:transparent;border-right:none;box-shadow:none;display:flex;align-items:center;justify-content:center;cursor:grab;flex-shrink:0;position:relative}
        .inv-drawer-handle:active{cursor:grabbing}
        .inv-drawer-body{flex:1;background:#fff;display:flex;flex-direction:column;overflow:hidden}
        .inv-drawer-topbar{display:flex;align-items:center;justify-content:flex-end;padding:12px 14px;background:#fff;border-bottom:0.5px solid #e0e0e0;flex-shrink:0}
        .inv-drawer-close{background:none;border:0.5px solid #ccc;color:#555;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;border-radius:50%}
        .inv-pdf{flex:1;overflow-y:auto;padding:24px 20px;background:#fff}
        .pdf-stamp{display:flex;align-items:center;justify-content:center;margin-bottom:20px}
        .pdf-stamp-inner{border:3px solid #c0392b;border-radius:4px;padding:4px 18px;transform:rotate(-8deg)}
        .pdf-stamp-text{font-family:var(--font-mono);font-size:22px;font-weight:700;color:#c0392b;letter-spacing:0.15em;text-transform:uppercase}
        .pdf-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #e0e0e0}
        .pdf-brand{font-family:var(--font-display);font-size:18px;color:#1a1a1a;letter-spacing:0.04em}
        .pdf-brand-sub{font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#888;margin-top:2px}
        .pdf-inv-num{font-family:var(--font-mono);font-size:11px;color:#888;text-align:right}
        .pdf-to{margin-bottom:20px}
        .pdf-label{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#888;margin-bottom:4px;font-family:var(--font-mono)}
        .pdf-name{font-size:14px;color:#1a1a1a;font-family:var(--font-ui);font-weight:600}
        .pdf-addr{font-size:12px;color:#555;font-family:var(--font-ui);line-height:1.6}
        .pdf-items{width:100%;border-collapse:collapse;margin-bottom:20px}
        .pdf-items th{font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#888;font-family:var(--font-mono);padding:8px 0;border-bottom:1px solid #e0e0e0;text-align:left;font-weight:400}
        .pdf-items th:last-child,.pdf-items td:last-child{text-align:right}
        .pdf-items td{font-size:13px;color:#1a1a1a;font-family:var(--font-ui);padding:10px 0;border-bottom:0.5px solid #f0f0f0;vertical-align:top}
        .pdf-items td:last-child{font-family:var(--font-mono)}
        .pdf-total-row{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-top:2px solid #1a1a1a;margin-top:4px}
        .pdf-total-lbl{font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#1a1a1a;font-family:var(--font-mono)}
        .pdf-total-amt{font-size:20px;font-weight:700;color:#1a1a1a;font-family:var(--font-mono)}
        .pdf-footer{margin-top:24px;padding-top:16px;border-top:0.5px solid #e0e0e0;text-align:center}
        .pdf-footer-txt{font-size:10px;color:#aaa;font-family:var(--font-ui);line-height:1.6}
        .pdf-export-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:#0c70b8;color:#fff;border:none;padding:13px;font-family:var(--font-mono);font-size:11px;letter-spacing:0.2em;text-transform:uppercase;cursor:pointer;margin-top:16px;transition:opacity 180ms ease}
        .pdf-export-btn:hover{opacity:0.85}
        .pdf-gia-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:transparent;color:#0c70b8;border:1px solid #0c70b8;padding:11px;font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;cursor:pointer;margin-top:8px;text-decoration:none;transition:opacity 180ms ease}
        .pdf-gia-btn:hover{opacity:0.75}
        .slide-tip{position:fixed;left:0;top:50%;transform:translateY(-50%) translateX(-100%);z-index:600;display:flex;align-items:center;gap:10px;background:rgba(26,26,27,0.5);border:0.5px solid rgba(255,255,255,0.08);border-left:none;border-radius:0 8px 8px 0;padding:10px 14px 10px 12px;opacity:0;pointer-events:none;transition:opacity 300ms ease,transform 300ms ease;box-shadow:3px 0 10px rgba(0,0,0,0.35);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
        .slide-tip.show{opacity:1;transform:translateY(-50%) translateX(0);pointer-events:all}
        .slide-tip-arrow{font-size:22px;color:var(--gold);animation:slideHint 1.2s ease-in-out infinite}
        .slide-tip-label{font-family:var(--font-mono);font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--text-muted)}
        @keyframes slideHint{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}
      `}</style>

      {/* ── Panel ── */}
      <div className={`slide-panel ${isOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <span className="panel-title">Invoices</span>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>

        {/* Date filter + count */}
        <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(--bdr2)', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ flex: 1, background: 'var(--bg-card)', border: '0.5px solid var(--bdr2)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 10, padding: '7px 10px', outline: 'none' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', flexShrink: 0 }}>to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ flex: 1, background: 'var(--bg-card)', border: '0.5px solid var(--bdr2)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 10, padding: '7px 10px', outline: 'none' }} />
            <button onClick={() => { setDateFrom(''); setDateTo('') }}
              style={{ background: 'transparent', border: '0.5px solid var(--bdr2)', color: 'var(--text-muted)', fontSize: 12, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>✕</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
            </span>
            <button onClick={() => window.print()}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: '0.5px solid var(--bdr2)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '5px 11px', cursor: 'pointer' }}>
              ⬇ Export All
            </button>
          </div>
        </div>

        {/* Invoice grid */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontStyle: 'italic', color: 'var(--text)', marginBottom: 10 }}>No invoices yet</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Your purchases will appear here once a payment is completed.
              </div>
            </div>
          ) : (
            <div className="inv-grid">
              {filtered.map(inv => {
                const item     = inv.line_items?.[0]
                const photoUrl = item?.photo_url ?? null
                const isTapped = tapped === inv.invoice_id
                return (
                  <div key={inv.invoice_id} className={`inv-thumb ${isTapped ? 'tapped' : ''}`} onClick={() => tapThumb(inv)}>
                    <div className="inv-photo">
                      {photoUrl
                        ? <img src={photoUrl} alt={item?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '💎'}
                    </div>
                    <div className="inv-overlay">
                      <div className="inv-price">{formatMoney(inv.total_amount)}</div>
                      <div className="inv-date">Paid {fmtDate(inv.paid_at)}</div>
                      <div className="inv-tap-hint">Tap again to view</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── PDF Drawer ── */}
      <div
        ref={drawerRef}
        className={`inv-drawer ${drawerOpen ? 'open' : ''}`}
        onMouseDown={onDragStart} onMouseMove={onDragMove} onMouseUp={onDragEnd}
        onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
      >
        <div className="inv-drawer-handle" />
        <div className="inv-drawer-body">
          <div className="inv-drawer-topbar">
            <button className="inv-drawer-close" onClick={closeDrawer}>✕</button>
          </div>
          {selected && (() => {
            const item     = selected.line_items?.[0]
            const buyer    = selected.account_snapshot
            const invNum   = selected.stripe_session_id?.slice(-6).toUpperCase() ?? '------'
            const paidDate = fmtDate(selected.paid_at)
            return (
              <div className="inv-pdf">
                <div className="pdf-stamp">
                  <div className="pdf-stamp-inner"><div className="pdf-stamp-text">Paid</div></div>
                </div>
                <div className="pdf-header">
                  <div>
                    <div className="pdf-brand">Cutting Corners Gems</div>
                    <div className="pdf-brand-sub">Tempe, Arizona</div>
                  </div>
                  <div className="pdf-inv-num">Invoice #{invNum}<br /><span style={{ fontSize: 10 }}>{paidDate}</span></div>
                </div>
                <div className="pdf-to">
                  <div className="pdf-label">Bill To</div>
                  <div className="pdf-name">{buyer?.name || 'Customer'}</div>
                  <div className="pdf-addr">
                    {buyer?.email && <div>{buyer.email}</div>}
                    {buyer?.phone && <div>{buyer.phone}</div>}
                    {buyer?.shippingAddress && <div>{buyer.shippingAddress}</div>}
                    {buyer?.businessName && <div>{buyer.businessName}</div>}
                  </div>
                </div>
                {item?.photo_url && (
                  <img src={item.photo_url} alt={item.title}
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', marginBottom: 16, display: 'block' }} />
                )}
                <table className="pdf-items">
                  <thead>
                    <tr><th>Description</th><th>Qty</th><th>Amount</th></tr>
                  </thead>
                  <tbody>
                    {item && (
                      <>
                        <tr>
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.title}</div>
                            <div style={{ fontSize: 11, color: '#888', marginTop: 3, lineHeight: 1.5 }}>
                              {[item.gem_type, item.shape, item.weight ? `${item.weight} ct` : null, item.color, item.origin, item.treatment ? `Treatment: ${item.treatment}` : null].filter(Boolean).join(' · ')}
                            </div>
                            {item.gia_report_number && (
                              <div style={{ fontSize: 10, color: '#0c70b8', marginTop: 3 }}>GIA #{item.gia_report_number}</div>
                            )}
                          </td>
                          <td>1</td>
                          <td>{formatMoney(item.total_price)}</td>
                        </tr>
                        <tr>
                          <td>Stone handling &amp; shipping</td>
                          <td>1</td>
                          <td>$0</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
                <div className="pdf-total-row">
                  <div className="pdf-total-lbl">Total Paid</div>
                  <div className="pdf-total-amt">{formatMoney(selected.total_amount)}</div>
                </div>
                <div className="pdf-footer">
                  <div className="pdf-footer-txt">Thank you for your business.<br />Cutting Corners Gems · cuttingcornersgems.com</div>
                </div>
                {item?.gia_report_pdf_url && (
                  <a href={item.gia_report_pdf_url} target="_blank" rel="noopener noreferrer" className="pdf-gia-btn">↗ View GIA Report</a>
                )}
                <button className="pdf-export-btn" onClick={() => window.print()}>⬇ Export / Print Invoice</button>
              </div>
            )
          })()}
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