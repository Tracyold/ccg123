import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { formatMoney } from '../../../../lib/utils';
import { getPhotoUrl } from '../../shared/utils/photoUrl';
import { useSwipeToClose } from '../../shared/hooks/useSwipeToClose';
import FirstTimeTips from '../ui/FirstTimeTips';

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
  photo_url:           string | null;
  gia_report_number:   string | null;
  stripe_payment_link: string | null;
}

interface ShopItemDrawerProps {
  open:    boolean;
  item:    ShopProduct | null;
  session: any;
  onClose: () => void;
  // Called after a successful inquiry insert so the inquiries panel shows
  // the new row immediately even when realtime events lag or are missing.
  refreshInquiries?: () => Promise<void>;
}

export default function ShopItemDrawer3({ open, item, session, onClose, refreshInquiries }: ShopItemDrawerProps) {
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

  const [inquiryError, setInquiryError] = useState<string | null>(null);

  const handleInquiry = async () => {
    if (!inquiryText.trim() || !item || !session) return;
    setInquirySending(true);
    setInquiryError(null);

    try {
      // Direct await — no timeout race. Supabase's own network layer will
      // surface errors in the error field. A race-timeout was masking real
      // errors (trigger failures, RLS messages, etc.) behind a generic
      // "timed out" string.
      const { data, error } = await supabase
        .from('account_inquiries')
        .insert({
          account_user_id: session.user.id,
          product_id:      item.product_id,
          description:     inquiryText.trim(),
          status:          'pending',
        })
        .select('account_inquiry_id')
        .maybeSingle();

      if (error) {
        console.error('Inquiry insert error:', error);
        setInquiryError(error.message || 'Could not send inquiry. Please try again.');
        return;
      }
      if (!data) {
        // Insert succeeded but no row returned — unusual, but not fatal.
        console.warn('Inquiry insert returned no row');
      }

      setInquirySent(true);
      setInquiryOpen(false);
      setInquiryText('');

      // Fallback refresh — if realtime misses the INSERT on account_inquiries,
      // this still pulls the new row into the Inquiries panel.
      if (refreshInquiries) {
        try { await refreshInquiries(); }
        catch (e) { console.warn('refreshInquiries failed', e); }
      }
    } catch (err: any) {
      console.error('Inquiry exception:', err);
      setInquiryError(err?.message || 'An unexpected error occurred.');
    } finally {
      setInquirySending(false);
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
        <FirstTimeTips type="drawer-slide" show={open} />
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
                {item.stripe_payment_link ? (
                  <a 
                    href={item.stripe_payment_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="shop-item-btn buy"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    🛒 Buy Now
                  </a>
                ) : (
                  <button className="shop-item-btn buy" onClick={() => alert('Please inquire for purchase details.')}>🛒 Buy Now</button>
                )}
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
                  <button 
                    className="shop-item-inq-submit" 
                    onClick={handleInquiry}
                    disabled={!inquiryText.trim() || inquirySending}
                  >
                    {inquirySending ? 'Sending...' : 'Submit Request'}
                  </button>
                  <button className="shop-item-inq-cancel" onClick={() => {
                    setInquiryOpen(false);
                    setInquiryError(null);
                  }}>Cancel</button>
                </div>
                {inquiryError && (
                  <div style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '8px', fontFamily: 'var(--font-mono-mob)' }}>
                    Error: {inquiryError}
                  </div>
                )}
              </div>
            )}

            {inquirySent && (
              <div className="shop-item-success">
                <div className="shop-item-btns">
                  {item.stripe_payment_link ? (
                    <a 
                      href={item.stripe_payment_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="shop-item-btn buy"
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      🛒 Buy Now
                    </a>
                  ) : (
                    <button className="shop-item-btn buy" onClick={() => alert('Please inquire for purchase details.')}>🛒 Buy Now</button>
                  )}
                  <button className="shop-item-btn inq" onClick={() => {
                    setInquirySent(false);
                    setInquiryText('');
                    setInquiryError(null);
                    setInquiryOpen(true);
                  }}>✉ Inquire Again</button>
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
          color: var(--text); /* Force text color inheritance */
          z-index: 10101;
          transform: translateX(100%);
          transition: transform 500ms cubic-bezier(0.33, 1, 0.68, 1);
          display: flex;
          /* box-shadow: -10px 0 30px rgba(0,0,0,0.5); */
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
          font-family: var(--font-mono-mob);
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .shop-item-close {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.125rem;
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
          background: var(--bg-deep);
          border: 0.5px solid var(--bdr2);
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .shop-item-hero img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .shop-item-no-img {
          font-size: 4.0rem;
        }
        .shop-item-title {
          font-family: var(--font-display-mob);
          font-size: 1.75rem; /* Big font for native feel */
          line-height: 1.2;
          color: var(--text) !important; /* Force visibility */
          margin-bottom: 0.5rem;
        }
        .shop-item-price {
          font-family: var(--font-mono-mob);
          font-size: 1.375rem;
          color: var(--gold);
          margin-bottom: 2rem;
        }
        .shop-item-specs {
          margin-bottom: 2rem;
          border-top: 0.5px solid var(--bdr2);
        }
        .shop-item-desc-label {
          font-family: var(--font-mono-mob);
          font-size: 0.625rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .shop-item-desc p {
          font-family: var(--font-body);
          font-size: 1.0rem;
          line-height: 1.6;
          color: var(--text) !important; /* Force visibility */
          opacity: 0.8;
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
          border-radius: 12px;
          font-family: var(--font-mono-mob);
          font-size: 0.875rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }
        .shop-item-btn:active { transform: scale(0.96); }
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
          background: var(--bg-deep);
          border: 0.5px solid var(--bdr2);
          border-radius: 12px;
          color: var(--text);
          padding: 14px;
          font-family: var(--font-ui-mob);
          font-size: 1.0rem;
          outline: none;
          transition: all 0.2s ease;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
        }
        .shop-item-inq-input:focus {
          border-color: var(--gold);
          background: var(--bg-card);
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.1), 0 0 0 3px color-mix(in srgb, var(--gold) 15%, transparent);
        }
        .shop-item-inq-actions {
          display: flex;
          flex-direction: row-reverse; /* Put cancel on the right, submit on the left */
          justify-content: flex-end;
          align-items: center;
          gap: 16px;
        }
        .shop-item-inq-cancel {
          background: none;
          border: none;
          color: var(--text-muted);
          font-family: var(--font-mono-mob);
          font-size: 0.75rem;
          text-transform: uppercase;
          cursor: pointer;
        }
        .shop-item-inq-submit {
          background: var(--gold);
          color: var(--bg-deep);
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-family: var(--font-mono-mob);
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 700;
          cursor: pointer;
        }
        .shop-item-success-msg {
          text-align: center;
          margin-top: 12px;
          color: #4ec994;
          font-family: var(--font-mono-mob);
          font-size: 0.875rem;
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
        fontFamily: 'var(--font-mono-mob)',
        fontSize: '0.625rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)'
      }}>{label}</span>
      <span style={{
        fontFamily: 'var(--font-ui-mob)',
        fontSize: '0.875rem',
        color: 'var(--text)',
        fontWeight: 500
      }}>{value}</span>
    </div>
  );
}

