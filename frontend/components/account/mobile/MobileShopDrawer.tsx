import { useState, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { formatMoney } from '../../../lib/utils'
import { getPhotoUrl } from '../shared/utils/photoUrl'

// ── Types ──────────────────────────────────────────────────────────────────

interface Product {
  product_id:        string
  title:             string
  total_price:       number
  gem_type:          string
  shape:             string
  weight:            number | null
  color:             string
  origin:            string
  treatment:         string
  description:       string
  photo_url:         string | null
  gia_report_number: string | null
}

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  isOpen:  boolean
  onClose: () => void
  item:    Product | null
  session: any
}

// ── Spec row helper ────────────────────────────────────────────────────────

function SpecRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div className="shop-spec-row">
      <span className="shop-spec-label">{label}</span>
      <span className="shop-spec-value">{value}</span>
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────

export default function MobileShopDrawer({ isOpen, onClose, item, session }: Props) {
  const [inquiryOpen,    setInquiryOpen]    = useState(false)
  const [inquiryText,    setInquiryText]    = useState('')
  const [inquirySent,    setInquirySent]    = useState(false)
  const [inquirySending, setInquirySending] = useState(false)
  const [tipVisible,     setTipVisible]     = useState(false)
  const [tipShown,       setTipShown]       = useState(false)

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
    if (dragRef.current.dragging && dx > 80) handleClose()
    dragRef.current.dragging = false
  }

  const handleClose = () => {
    setInquiryOpen(false)
    setInquiryText('')
    setInquirySent(false)
    onClose()
  }

  const openInquiry = () => {
    setInquiryText('')
    setInquirySent(false)
    setInquiryOpen(true)
  }

  const cancelInquiry = () => {
    setInquiryOpen(false)
    setInquiryText('')
  }

  const sendInquiry = async () => {
    if (!inquiryText.trim() || !item || !session) return
    setInquirySending(true)
    await supabase.from('account_inquiries').insert({
      account_user_id: session.user.id,
      product_id:      item.product_id,
      description:     inquiryText.trim(),
      status:          'pending',
    })
    setInquirySending(false)
    setInquirySent(true)
    setInquiryOpen(false)
    setInquiryText('')
  }

  // Show slide tip when drawer opens
  const handleOpen = () => { showSlideTip() }

  // Fire tip on open state change
  if (isOpen && !tipShown) handleOpen()

  const photoUrl = getPhotoUrl(item?.photo_url ?? null)

  return (
    <>
      <style>{`
        .shop-drawer{position:fixed;inset:0;z-index:500;transform:translateX(100%);transition:transform 380ms cubic-bezier(0.16,1,0.3,1);display:flex;box-shadow:none}
        .shop-drawer.open{transform:translateX(0);box-shadow:-12px 0 40px rgba(0,0,0,0.45)}
        .shop-drawer-handle{width:32px;background:transparent;display:flex;align-items:center;justify-content:center;cursor:grab;flex-shrink:0}
        .shop-drawer-handle:active{cursor:grabbing}
        .shop-drawer-body{flex:1;background:var(--bg);display:flex;flex-direction:column;overflow:hidden}
        .shop-drawer-topbar{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:0.5px solid var(--border);flex-shrink:0}
        .shop-drawer-title{font-family:var(--font-mono);font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:var(--text-muted)}
        .shop-drawer-close{background:none;border:0.5px solid var(--border);color:var(--text-muted);width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;border-radius:50%;transition:all 160ms ease}
        .shop-drawer-close:hover{border-color:var(--text);color:var(--text)}
        .shop-drawer-content{flex:1;overflow-y:auto;padding:20px 18px}
        .shop-img-full{width:100%;aspect-ratio:4/3;object-fit:cover;background:var(--bg-card);display:flex;align-items:center;justify-content:center;font-size:80px;margin-bottom:18px}
        .shop-spec-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px}
        .shop-spec-label{font-family:var(--font-ui);font-size:9px;text-transform:uppercase;letter-spacing:0.18em;color:var(--text-muted)}
        .shop-spec-value{font-family:var(--font-body);font-size:12px;color:var(--text)}
        .shop-btn-row{display:flex;gap:10px;padding:14px 18px;border-top:0.5px solid var(--border);flex-shrink:0}
        .shop-btn-buy{flex:1;background:var(--gold);color:var(--bg-deep);border:none;padding:13px;font-family:var(--font-mono);font-size:10px;letter-spacing:0.2em;text-transform:uppercase;cursor:pointer;transition:opacity 180ms ease}
        .shop-btn-buy:hover{opacity:0.85}
        .shop-btn-inq{flex:1;background:transparent;color:var(--text-muted);border:0.5px solid var(--border);padding:13px;font-family:var(--font-mono);font-size:10px;letter-spacing:0.2em;text-transform:uppercase;cursor:pointer;transition:all 180ms ease}
        .shop-btn-inq:hover{border-color:var(--text);color:var(--text)}
        .shop-inq-form{display:flex;flex-direction:column;gap:10px;padding:14px 18px;border-top:0.5px solid var(--border);background:var(--bg-card);flex-shrink:0}
        .shop-inq-textarea{width:100%;background:var(--bg);border:0.5px solid var(--bdr2);color:var(--text);font-family:var(--font-ui);font-size:14px;padding:10px 12px;outline:none;resize:none;line-height:1.6;border-radius:4px;transition:border-color 150ms ease}
        .shop-inq-textarea:focus{border-color:var(--gold)}
        .shop-inq-actions{display:flex;justify-content:space-between;align-items:center}
        .shop-inq-cancel{background:none;border:none;font-family:var(--font-mono);font-size:9px;letter-spacing:0.16em;text-transform:uppercase;color:var(--text-muted);cursor:pointer;padding:0}
        .shop-inq-send{background:var(--gold);color:var(--bg-deep);border:none;padding:9px 18px;font-family:var(--font-mono);font-size:9px;letter-spacing:0.18em;text-transform:uppercase;cursor:pointer;transition:opacity 180ms ease}
        .shop-inq-send:hover{opacity:0.85}
        .shop-inq-success{display:flex;align-items:center;gap:8px;padding:14px 18px;border-top:0.5px solid var(--border);background:var(--bg-card);flex-shrink:0}
        .shop-inq-success-text{font-family:var(--font-ui);font-size:13px;color:#4ec994}
        .slide-tip{position:fixed;left:0;top:50%;transform:translateY(-50%) translateX(-100%);z-index:600;display:flex;align-items:center;gap:10px;background:rgba(26,26,27,0.5);border:0.5px solid rgba(255,255,255,0.08);border-left:none;border-radius:0 8px 8px 0;padding:10px 14px 10px 12px;opacity:0;pointer-events:none;transition:opacity 300ms ease,transform 300ms ease;box-shadow:3px 0 10px rgba(0,0,0,0.35);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
        .slide-tip.show{opacity:1;transform:translateY(-50%) translateX(0);pointer-events:all}
        .slide-tip-arrow{font-size:22px;color:var(--gold);animation:slideHint 1.2s ease-in-out infinite}
        .slide-tip-label{font-family:var(--font-mono);font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--text-muted)}
        @keyframes slideHint{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}
      `}</style>

      {/* ── Drawer ── */}
      <div
        ref={drawerRef}
        className={`shop-drawer ${isOpen ? 'open' : ''}`}
        onMouseDown={onDragStart} onMouseMove={onDragMove} onMouseUp={onDragEnd}
        onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
      >
        <div className="shop-drawer-handle" />
        <div className="shop-drawer-body">

          {/* Topbar */}
          <div className="shop-drawer-topbar">
            <span className="shop-drawer-title">{item?.title ?? 'Product'}</span>
            <button className="shop-drawer-close" onClick={handleClose}>✕</button>
          </div>

          {/* Content */}
          <div className="shop-drawer-content">
            {item && (
              <>
                {/* Photo */}
                <div className="shop-img-full">
                  {photoUrl
                    ? <img src={photoUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '💎'
                  }
                </div>

                {/* Title + price */}
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', marginBottom: 6, fontWeight: 400 }}>
                  {item.title}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--gold)', marginBottom: 18 }}>
                  {formatMoney(item.total_price)}
                </div>

                {/* Specs */}
                <div style={{ marginBottom: 18 }}>
                  <SpecRow label="Gem Type"   value={item.gem_type}   />
                  <SpecRow label="Shape"       value={item.shape}      />
                  <SpecRow label="Weight"      value={item.weight ? `${item.weight} ct` : null} />
                  <SpecRow label="Color"       value={item.color}      />
                  <SpecRow label="Origin"      value={item.origin}     />
                  <SpecRow label="Treatment"   value={item.treatment}  />
                  {item.gia_report_number && (
                    <SpecRow label="GIA Report" value={item.gia_report_number} />
                  )}
                </div>

                {/* Description */}
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.75, color: 'var(--text-muted)' }}>
                  {item.description}
                </p>
              </>
            )}
          </div>

          {/* Buy + Inquire buttons */}
          {!inquiryOpen && !inquirySent && (
            <div className="shop-btn-row">
              <button className="shop-btn-buy">🛒 Buy Now</button>
              <button className="shop-btn-inq" onClick={openInquiry}>✉ Inquire</button>
            </div>
          )}

          {/* Inquiry form */}
          {inquiryOpen && (
            <div className="shop-inq-form">
              <textarea
                className="shop-inq-textarea"
                rows={3}
                value={inquiryText}
                onChange={e => setInquiryText(e.target.value)}
                placeholder="Type your question or inquiry about this stone..."
              />
              <div className="shop-inq-actions">
                <button className="shop-inq-cancel" onClick={cancelInquiry}>Cancel</button>
                <button
                  className="shop-inq-send"
                  onClick={sendInquiry}
                  disabled={!inquiryText.trim() || inquirySending}
                >
                  {inquirySending ? '…' : 'Send →'}
                </button>
              </div>
            </div>
          )}

          {/* Success state */}
          {inquirySent && (
            <div className="shop-inq-success">
              <span style={{ color: '#4ec994', fontSize: 18 }}>✓</span>
              <span className="shop-inq-success-text">Inquiry sent successfully</span>
            </div>
          )}

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