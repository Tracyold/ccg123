import {
  type Inquiry,
  getInquiryStatus,
  getStatusStyle,
  getStatusLabel,
  getProductSpecLine,
  formatInquiryDate,
} from '../shared/1InquiryList'

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  isOpen:    boolean
  onClose:   () => void
  inquiries: Inquiry[]
}

// ── Component ──────────────────────────────────────────────────────────────

export default function MobileInquiries({ isOpen, onClose, inquiries }: Props) {
  return (
    <>
      <style>{`
        .slide-panel{position:fixed;left:0;right:0;max-width:430px;margin:0 auto;top:0;bottom:62px;z-index:105;background:var(--bg);display:flex;flex-direction:column;transform:translateY(100%);transition:transform 420ms cubic-bezier(0.16,1,0.3,1)}
        .slide-panel.open{transform:translateY(0)}
        .panel-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--bg-deep);border-bottom:0.5px solid var(--bdr2);flex-shrink:0}
        .panel-title{font-family:var(--font-mono);font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:var(--text-muted)}
        .panel-close{background:none;border:none;color:var(--text-muted);font-size:16px;cursor:pointer;padding:2px 6px}
        .inq-list{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
        .inq-card{background:var(--bg-card);border:0.5px solid var(--bdr2);padding:16px}
        .inq-card-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
        .inq-product-name{font-family:var(--font-display);font-size:15px;color:var(--text);margin-bottom:2px}
        .inq-product-spec{font-family:var(--font-mono);font-size:9px;letter-spacing:0.12em;color:var(--text-muted)}
        .inq-status{font-family:var(--font-mono);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;padding:2px 8px;flex-shrink:0}
        .inq-message{font-family:var(--font-ui);font-size:12px;color:var(--text-muted);line-height:1.6;border-top:0.5px solid var(--bdr2);padding-top:8px;margin-top:4px}
        .inq-reply{font-family:var(--font-ui);font-size:12px;color:var(--text);line-height:1.6;border-top:0.5px solid var(--bdr2);padding-top:8px;margin-top:8px}
        .inq-reply-label{font-family:var(--font-mono);font-size:8px;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase;display:block;margin-bottom:4px}
        .inq-date{font-family:var(--font-mono);font-size:8.5px;color:var(--text-muted);margin-top:8px;opacity:0.6}
        .inq-empty{font-family:var(--font-ui);font-size:12px;color:var(--text-muted);text-align:center;padding:40px 0;font-style:italic;opacity:0.6}
        .inq-footer{font-family:var(--font-ui);font-size:11px;color:var(--text-muted);text-align:center;padding:8px 0;opacity:0.6;line-height:1.6}
      `}</style>

      <div className={`slide-panel ${isOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <span className="panel-title">Inquiries</span>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>

        <div className="inq-list">

          {inquiries.length === 0 ? (
            <p className="inq-empty">No product inquiries yet.</p>
          ) : (
            inquiries.map(inq => {
              const status    = getInquiryStatus(inq)
              const statusSty = getStatusStyle(status)
              const specLine  = getProductSpecLine(inq)

              return (
                <div key={inq.account_inquiry_id} className="inq-card">

                  {/* Product name + status badge */}
                  <div className="inq-card-head">
                    <div>
                      {inq.products?.title && (
                        <div className="inq-product-name">{inq.products.title}</div>
                      )}
                      {specLine && (
                        <div className="inq-product-spec">{specLine}</div>
                      )}
                    </div>
                    <span
                      className="inq-status"
                      style={{ background: statusSty.background, color: statusSty.color }}
                    >
                      {getStatusLabel(status)}
                    </span>
                  </div>

                  {/* User message */}
                  <div className="inq-message">
                    "{inq.description}"
                  </div>

                  {/* Admin reply */}
                  {inq.reply && (
                    <div className="inq-reply">
                      <span className="inq-reply-label">Michael replied</span>
                      "{inq.reply}"
                    </div>
                  )}

                  {/* Date */}
                  <div className="inq-date">{formatInquiryDate(inq.created_at)}</div>

                </div>
              )
            })
          )}

          <p className="inq-footer">
            Inquiries are submitted from product pages in the shop.
          </p>

        </div>
      </div>
    </>
  )
}