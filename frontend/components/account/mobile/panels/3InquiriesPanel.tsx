// components/account/mobile/panels/3InquiriesPanel.tsx
import { useState, useEffect } from 'react';
import { fmtDate } from '../../../../lib/utils';
import { useSwipeDownToClose } from '../../shared/hooks/useSwipeDownToClose';
import { supabase } from '../../../../lib/supabase';
import FirstTimeTips from '../ui/FirstTimeTips';

interface InquiriesPanelProps {
  open:      boolean;
  inquiries: any[];
  onClose:   () => void;
}

// ── Swipeable Tile Component ──
function SwipeableInquiry({ inq, onDelete }: { inq: any; onDelete: (id: string) => void }) {
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const threshold = -80; // Swipe left 80px to reveal delete

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX - offsetX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    // Only allow swiping left
    if (diff <= 0) {
      setOffsetX(Math.max(diff, threshold - 20)); // Allow slight overshoot
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (offsetX < threshold / 2) {
      setOffsetX(threshold);
    } else {
      setOffsetX(0);
    }
  };

  const isPending = !inq.reply;

  // Product info comes from the join on products(title, weight, shape, total_price).
  // Compose a small meta string from whichever fields are present.
  const productTitle = inq.products?.title;
  const productMetaParts: string[] = [];
  if (inq.products?.weight) productMetaParts.push(`${inq.products.weight} ct`);
  if (inq.products?.shape)  productMetaParts.push(inq.products.shape);
  if (inq.products?.total_price != null) {
    productMetaParts.push(`$${Number(inq.products.total_price).toLocaleString()}`);
  }
  const productMeta = productMetaParts.join(' · ');

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
      {/* Delete Button (Behind) */}
      <button
        onClick={() => onDelete(inq.account_inquiry_id)}
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 80,
          background: '#ef4444', color: 'white', border: 'none',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1
        }}
      >
        Delete
      </button>

      {/* The Tile (Foreground) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="tile dim"
        style={{
          minHeight: 'auto', 
          padding: 'clamp(1rem, 4.5vw, 1.25rem) clamp(1.125rem, 5vw, 1.5rem)', 
          cursor: 'default',
          position: 'relative', zIndex: 2,
          transform: `translateX(${offsetX}px)`,
          transition: isSwiping ? 'none' : 'transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          borderRadius: '12px !important'
        } as React.CSSProperties}
      >
        {/* Top row: product name + status badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text)', marginBottom: 2 }}>
              {productTitle || 'Product Inquiry'}
            </div>
            {productMeta && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
                {productMeta}
              </div>
            )}
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.15em',
            textTransform: 'uppercase', padding: '3px 10px', flexShrink: 0,
            borderRadius: 999,
            background: isPending ? 'rgba(207,221,78,0.1)' : 'rgba(45,212,191,0.1)',
            color: isPending ? 'var(--gold)' : '#2dd4bf',
          }}>
            {isPending ? 'Pending' : 'Replied'}
          </span>
        </div>

        {/* Customer message */}
        <div style={{
          fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)',
          lineHeight: 1.6, borderTop: '0.5px solid var(--bdr2)', paddingTop: 8, marginTop: 4,
        }}>
          "{inq.description}"
        </div>

        {/* Submitted timestamp */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: 'var(--text-muted)', marginTop: 8, opacity: 0.6 }}>
          Submitted {inq.created_at ? fmtDate(inq.created_at) : '--'}
        </div>

        {/* Reply block */}
        {inq.reply && (
          <div style={{
            fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text)',
            lineHeight: 1.6, borderTop: '0.5px solid var(--bdr2)', paddingTop: 8, marginTop: 8,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--gold)',
              letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 4,
            }}>
              Michael replied
            </span>
            "{inq.reply}"
            {inq.replied_at && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: 'var(--text-muted)', marginTop: 6, opacity: 0.6 }}>
                {fmtDate(inq.replied_at)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InquiriesPanel3({ open, inquiries, onClose }: InquiriesPanelProps) {
  const { elementRef, touchHandlers } = useSwipeDownToClose({ onClose });
  const [localInquiries, setLocalInquiries] = useState(inquiries);

  useEffect(() => {
    setLocalInquiries(inquiries);
  }, [inquiries]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    
    // Optimistic update
    setLocalInquiries(prev => prev.filter(i => i.account_inquiry_id !== id));
    
    try {
      // Soft delete: update is_archived to true instead of deleting the row
      const { error } = await supabase
        .from('account_inquiries')
        .update({ is_archived: true })
        .eq('account_inquiry_id', id);
      
      if (error) {
        console.error('Archive error:', error);
        alert('Failed to delete inquiry. Please try again.');
        setLocalInquiries(inquiries); // Rollback
      }
    } catch (err) {
      console.error('Archive exception:', err);
      setLocalInquiries(inquiries); // Rollback
    }
  };

  return (
    <div ref={elementRef} className={`slide-panel${open ? ' open' : ''}`}>
      <FirstTimeTips type="panel-down" show={open} />
      <div className="panel-header" {...touchHandlers}>
        <span className="panel-title">Inquiries</span>
        <button className="panel-close" onClick={onClose}>✕</button>
      </div>

      <div className="inq-list" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: 'clamp(1rem, 4.5vw, 1.25rem)', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 'clamp(0.875rem, 4vw, 1.125rem)' 
      }}>
        {localInquiries.length === 0 ? (
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)',
            textAlign: 'center', padding: '40px 0', fontStyle: 'italic', opacity: 0.6, lineHeight: 1.6,
          }}>
            No product inquiries yet.<br />Inquiries are submitted from product pages in the shop.
          </p>
        ) : (
          localInquiries.map(inq => (
            <SwipeableInquiry key={inq.account_inquiry_id} inq={inq} onDelete={handleDelete} />
          ))
        )}

        {localInquiries.length > 0 && (
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)',
            textAlign: 'center', padding: '8px 0', opacity: 0.6, lineHeight: 1.6,
          }}>
            Inquiries are submitted from product pages in the shop.
          </p>
        )}
      </div>
    </div>
  );
}
