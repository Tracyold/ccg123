import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { formatMoney } from '../../../../lib/utils';
import { getPhotoUrl } from '../../shared/utils/photoUrl';
import { useSwipeToClose } from '../../shared/hooks/useSwipeToClose';

interface ShopProduct {
  product_id:        string;
  title:             string;
  total_price:       number | null;
  gem_type:          string | null;
  shape:             string | null;
  weight:            number | null;
  color:             string | null;
  origin:            string | null;
  treatment:         string | null;
  description:       string | null;
  photo_url:         string | null;
  gia_report_number: string | null;
}

interface ShopItemDrawerProps {
  open:    boolean;
  item:    ShopProduct | null;
  session: any;
  onClose: () => void;
}

export default function ShopItemDrawer3({ open, item, session, onClose }: ShopItemDrawerProps) {
  const [inquiryOpen,    setInquiryOpen]    = useState(false);
  const [inquiryText,    setInquiryText]    = useState('');
  const [inquirySent,    setInquirySent]    = useState(false);
  const [inquirySending, setInquirySending] = useState(false);

  // ── Swipe to close ──
  // The threshold is set to 80px by default in the hook.
  const { elementRef, touchHandlers } = useSwipeToClose({ onClose });

  // Reset state when drawer closes or a new item is loaded
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setInquiryOpen(false);
        setInquiryText('');
        setInquirySent(false);
      }, 400); // Wait for slide animation to finish
    }
  }, [open, item?.product_id]);

  const handleInquiry = async () => {
    if (!inquiryText.trim() || !item || !session) return;
    setInquirySending(true);
    
    const { error } = await supabase.from('account_inquiries').insert({
      account_user_id: session.user.id,
      product_id:      item.product_id,
      description:     inquiryText.trim(),
      status:          'pending',
    });

    setInquirySending(false);
    if (!error) {
      setInquirySent(true);
      setInquiryOpen(false);
    }
  };

  if (!item) return null;

  const photoUrl = getPhotoUrl(item.photo_url);

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
            <span className="shop-item-header-title">Product Details</span>
            <button className="shop-item-close" onClick={onClose}>✕</button>
          </div>

          {/* Scrollable Content */}
          <div className="shop-item-scroll">
            <div className="shop-item-content">
              {/* Main Image */}
              <div className="shop-item-hero">
                {photoUrl ? (
                  <img src={photoUrl} alt={item.title} />
                ) : (
                  <div className="shop-item-no-img">💎</div>
                )}
              </div>

              {/* Title & Price - BIG FONTS for native feel */}
              <h1 className="shop-item-title">{item.title}</h1>
              <div className="shop-item-price">{formatMoney(item.total_price)}</div>

              {/* Specs Grid */}
              <div className="shop-item-specs">
                <SpecRow label="Gem Type" value={item.gem_type} />
                <SpecRow label="Shape" value={item.shape} />
                <SpecRow label="Weight" value={item.weight ? `${item.weight} ct` : null} />
                <SpecRow label="Color" value={item.color} />
                <SpecRow label="Origin" value={item.origin} />
                <SpecRow label="Treatment" value={item.treatment} />
                <SpecRow label="GIA Report" value={item.gia_report_number} />
              </div>

              {/* Description */}
              {item.description && (
                <div className="shop-item-desc">
                  <div className="shop-item-desc-label">Description</div>
                  <p>{item.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="shop-item-footer">
            {!inquiryOpen && !inquirySent && (
              <div className="shop-item-btns">
                <button className="shop-item-btn buy">🛒 Buy Now</button>
                <button className="shop-item-btn inq" onClick={() => setInquiryOpen(true)}>✉ Inquire</button>
              </div>
            )}

            {inquiryOpen && (
              <div className="shop-item-inq-form">
                <textarea
                  className="shop-item-inq-input"
                  placeholder="Ask a question about this stone..."
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  rows={3}
                  autoFocus
                />
                <div className="shop-item-inq-actions">
                  <button className="shop-item-inq-cancel" onClick={() => setInquiryOpen(false)}>Cancel</button>
                  <button 
                    className="shop-item-inq-submit" 
                    onClick={handleInquiry}
                    disabled={!inquiryText.trim() || inquirySending}
                  >
                    {inquirySending ? 'Sending...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            )}

            {inquirySent && (
              <div className="shop-item-success">
                <div className="shop-item-btns">
                  <button className="shop-item-btn buy">🛒 Buy Now</button>
                  <button className="shop-item-btn inq" onClick={() => setInquiryOpen(true)}>✉ Inquire Again</button>
                </div>
                <div className="shop-item-success-msg">Success!</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .shop-item-drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 90%; /* Leaves 10% on the left */
          height: 100dvh;
          background: var(--bg);
          z-index: 10101;
          transform: translateX(100%);
          transition: transform 500ms cubic-bezier(0.33, 1, 0.68, 1);
          display: flex;
          box-shadow: -10px 0 30px rgba(0,0,0,0.5);
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
        .shop-item-hero {
          width: 100%;
          aspect-ratio: 1;
          background: var(--bg-card);
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .shop-item-hero img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .shop-item-no-img {
          font-size: 64px;
        }
        .shop-item-title {
          font-family: var(--font-display);
          font-size: 28px; /* Big font for native feel */
          line-height: 1.2;
          color: var(--text);
          margin-bottom: 0.5rem;
        }
        .shop-item-price {
          font-family: var(--font-mono);
          font-size: 22px;
          color: var(--gold);
          margin-bottom: 2rem;
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
          color: var(--text-muted);
        }
        .shop-item-footer {
          padding: 1.25rem;
          padding-bottom: calc(1.25rem + env(safe-area-inset-bottom));
          border-top: 0.5px solid var(--bdr2);
          background: var(--bg-deep);
        }
        .shop-item-btns {
          display: flex;
          gap: 12px;
        }
        .shop-item-btn {
          flex: 1;
          height: 54px;
          border-radius: 8px;
          font-family: var(--font-mono);
          font-size: 14px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
        }
        .shop-item-btn.buy {
          background: var(--gold);
          color: var(--bg-deep);
          border: none;
          font-weight: 700;
        }
        .shop-item-btn.inq {
          background: transparent;
          color: var(--text);
          border: 1px solid var(--bdr2);
        }
        .shop-item-inq-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .shop-item-inq-input {
          width: 100%;
          background: var(--bg-card);
          border: 1px solid var(--bdr2);
          border-radius: 8px;
          color: var(--text);
          padding: 12px;
          font-family: var(--font-ui);
          font-size: 16px;
          outline: none;
        }
        .shop-item-inq-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .shop-item-inq-cancel {
          background: none;
          border: none;
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 12px;
          text-transform: uppercase;
          cursor: pointer;
        }
        .shop-item-inq-submit {
          background: var(--gold);
          color: var(--bg-deep);
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-family: var(--font-mono);
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 700;
          cursor: pointer;
        }
        .shop-item-success-msg {
          text-align: center;
          margin-top: 12px;
          color: #4ec994;
          font-family: var(--font-mono);
          font-size: 14px;
          text-transform: uppercase;
          font-weight: 700;
        }
      `}</style>
    </>
  );
}

function SpecRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '0.5px solid var(--bdr2)'
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)'
      }}>{label}</span>
      <span style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '14px',
        color: 'var(--text)'
      }}>{value}</span>
    </div>
  );
}
