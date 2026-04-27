// frontend/components/account/mobile/panels/3InquiriesPanel.tsx
//
// Product inquiries panel (mobile).
//
// This revision mirrors the service requests panel pattern:
//   • Active / Archive tab row beneath the gold panel header
//   • Swipe-reveal button is "Archive" (teal --archive var, via CSS class)
//   • Archived items render as grayed-out, non-clickable cards
//   • Scroll container uses .sr-list (reused CSS class) with min-height: 0
//     so cards don't shrink as the list grows
//   • Archive writes to Supabase first, then updates local state on success.
//     DB is source of truth — nothing lives only in memory.
//   • Calls refreshInquiries() after the DB write as a realtime fallback
//
// What was preserved:
//   • Swipe mechanic (same touch handlers, threshold, transform as before)
//   • Panel down-slide animation
//   • Inquiry card visual structure (product title/meta, status pill,
//     description quote, reply block) — every font and color unchanged
//
// CSS classes used (all pre-existing in MobileShell.css / _additions.css):
//   .slide-panel, .panel-header, .panel-title, .panel-close       ← panel shell
//   .sr-tab-bar, .sr-tab, .sr-tab.active                          ← tab row
//   .sr-list, .sr-empty                                           ← scroll container
//   .sr-card-wrap, .sr-archive-btn                                ← swipe reveal
//   .sr-card.archived                                             ← grayed state

import { useState, useEffect } from 'react';
import { fmtDate } from '../../../../lib/utils';
import { useSwipeDownToClose } from '../../shared/hooks/useSwipeDownToClose';
import { supabase } from '../../../../lib/supabase';
import FirstTimeTips from '../ui/FirstTimeTips';

interface InquiriesPanelProps {
  open:              boolean;
  inquiries:         any[];
  onClose:           () => void;
  refreshInquiries?: () => Promise<void>;
}

type InqTab = 'active' | 'archive';

// ── Inquiry card body — extracted so active + archived variants share it ──
function InquiryBody({ inq, archived = false }: { inq: any; archived?: boolean }) {
  const isPending = !inq.reply;

  // Product info comes from the join on products(title, weight, shape, total_price).
  const productTitle = inq.products?.title;
  const productMetaParts: string[] = [];
  if (inq.products?.weight) productMetaParts.push(`${inq.products.weight} ct`);
  if (inq.products?.shape)  productMetaParts.push(inq.products.shape);
  if (inq.products?.total_price != null) {
    productMetaParts.push(`$${Number(inq.products.total_price).toLocaleString()}`);
  }
  const productMeta = productMetaParts.join(' · ');

  return (
    <>
      {/* Top row: product name + status badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display-mob)', fontSize: 'clamp(14px, 3.8vw, 16px)', color: 'var(--text)', marginBottom: 2 }}>
            {productTitle || 'Product Inquiry'}
          </div>
          {productMeta && (
            <div style={{ fontFamily: 'var(--font-mono-mob)', fontSize: 'clamp(9px, 2.4vw, 10px)', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
              {productMeta}
            </div>
          )}
        </div>
        <span style={{
          fontFamily: 'var(--font-mono-mob)',
          fontSize: 'clamp(9px, 2.4vw, 10px)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          padding: '3px 10px',
          flexShrink: 0,
          borderRadius: 999,
          background: archived
            ? 'rgba(127,127,127,0.1)'
            : (isPending ? 'rgba(207,221,78,0.1)' : 'rgba(45,212,191,0.1)'),
          color: archived
            ? 'var(--text-muted)'
            : (isPending ? 'var(--gold)' : '#2dd4bf'),
        }}>
          {archived ? 'Archived' : (isPending ? 'Pending' : 'Replied')}
        </span>
      </div>

      {/* Customer message */}
      <div style={{
        fontFamily: 'var(--font-ui-mob)',
        fontSize: 'clamp(13px, 3.4vw, 14px)',
        color: 'var(--text-muted)',
        lineHeight: 1.6,
        borderTop: '0.5px solid var(--bdr2)',
        paddingTop: 8,
        marginTop: 4,
      }}>
        "{inq.description}"
      </div>

      {/* Submitted timestamp */}
      <div style={{ fontFamily: 'var(--font-mono-mob)', fontSize: 'clamp(9px, 2.4vw, 10px)', color: 'var(--text-muted)', marginTop: 8, opacity: 0.6 }}>
        Submitted {inq.created_at ? fmtDate(inq.created_at) : '--'}
      </div>

      {/* Reply block */}
      {inq.reply && (
        <div style={{
          fontFamily: 'var(--font-ui-mob)',
          fontSize: 'clamp(13px, 3.4vw, 14px)',
          color: 'var(--text)',
          lineHeight: 1.6,
          borderTop: '0.5px solid var(--bdr2)',
          paddingTop: 8,
          marginTop: 8,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono-mob)',
            fontSize: 'clamp(9px, 2.4vw, 10px)',
            color: 'var(--gold)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: 4,
          }}>
            Michael replied
          </span>
          "{inq.reply}"
          {inq.replied_at && (
            <div style={{ fontFamily: 'var(--font-mono-mob)', fontSize: 'clamp(9px, 2.4vw, 10px)', color: 'var(--text-muted)', marginTop: 6, opacity: 0.6 }}>
              {fmtDate(inq.replied_at)}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ── Swipeable Inquiry tile ──
function SwipeableInquiry({ inq, onArchive }: { inq: any; onArchive: (id: string) => void }) {
  const [startX,    setStartX]    = useState(0);
  const [offsetX,   setOffsetX]   = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const threshold = -80;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX - offsetX);
    setIsSwiping(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const diff = e.touches[0].clientX - startX;
    if (diff <= 0) setOffsetX(Math.max(diff, threshold - 20));
  };
  const handleTouchEnd = () => {
    setIsSwiping(false);
    setOffsetX(offsetX < threshold / 2 ? threshold : 0);
  };

  return (
    <div className="sr-card-wrap">
      <button
        className="sr-archive-btn"
        onClick={(e) => { e.stopPropagation(); onArchive(inq.account_inquiry_id); }}
      >
        Archive
      </button>
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
          borderRadius: '12px',
        } as React.CSSProperties}
      >
        <InquiryBody inq={inq} />
      </div>
    </div>
  );
}

// ── Static archived tile — not swipeable, not clickable, grayed ──
function ArchivedInquiry({ inq }: { inq: any }) {
  return (
    <div className="sr-card-wrap">
      <div
        className="tile dim archived"
        style={{
          minHeight: 'auto',
          padding: 'clamp(1rem, 4.5vw, 1.25rem) clamp(1.125rem, 5vw, 1.5rem)',
          borderRadius: '12px',
          opacity: 0.45,
          filter: 'grayscale(1)',
          pointerEvents: 'none',
          userSelect: 'none',
        } as React.CSSProperties}
      >
        <InquiryBody inq={inq} archived />
      </div>
    </div>
  );
}

export default function InquiriesPanel3({
  open, inquiries, onClose, refreshInquiries,
}: InquiriesPanelProps) {
  const { elementRef, touchHandlers } = useSwipeDownToClose({ onClose });

  const [activeTab,      setActiveTab]      = useState<InqTab>('active');
  const [localInquiries, setLocalInquiries] = useState(inquiries);
  const [archiveError,   setArchiveError]   = useState<string | null>(null);

  useEffect(() => { setLocalInquiries(inquiries); }, [inquiries]);

  // ── Archive (DB first, optimistic, revert on failure) ──
  const handleArchive = async (id: string) => {
    if (!confirm('Archive this inquiry? It will move to the Archive tab.')) return;
    setArchiveError(null);

    // Capture prior value so we can revert.
    const prev = localInquiries.find(i => i.account_inquiry_id === id);
    const prevArchived = prev?.is_archived ?? false;

    // Optimistic update.
    setLocalInquiries(list => list.map(i =>
      i.account_inquiry_id === id ? { ...i, is_archived: true } : i
    ));

    const { error } = await supabase
      .from('account_inquiries')
      .update({ is_archived: true })
      .eq('account_inquiry_id', id);

    if (error) {
      console.error('Archive inquiry write failed:', error);
      // Revert.
      setLocalInquiries(list => list.map(i =>
        i.account_inquiry_id === id ? { ...i, is_archived: prevArchived } : i
      ));
      setArchiveError('Could not archive this inquiry. Please try again.');
      return;
    }

    // Success — refetch from DB so realtime-less tables stay in sync.
    if (refreshInquiries) {
      try { await refreshInquiries(); }
      catch (e) { console.warn('refreshInquiries failed', e); }
    }
  };

  // ── Filter by tab ──
  const activeList   = localInquiries.filter(i => !i.is_archived);
  const archivedList = localInquiries.filter(i =>  i.is_archived);
  const shownList    = activeTab === 'active' ? activeList : archivedList;

  return (
    <div ref={elementRef} className={`slide-panel${open ? ' open' : ''}`}>
      <FirstTimeTips type="panel-down" show={open} />
      <div className="panel-header" {...touchHandlers}>
        <span className="panel-title">Inquiries</span>
        <button className="panel-close" onClick={onClose}>✕</button>
      </div>

      {/* ── Active / Archive tabs ── */}
      <div className="sr-tab-bar">
        <button
          className={`sr-tab${activeTab === 'active' ? ' active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active{activeList.length > 0 ? ` · ${activeList.length}` : ''}
        </button>
        <button
          className={`sr-tab${activeTab === 'archive' ? ' active' : ''}`}
          onClick={() => setActiveTab('archive')}
        >
          Archive{archivedList.length > 0 ? ` · ${archivedList.length}` : ''}
        </button>
      </div>

      {archiveError && (
        <div style={{
          background: 'var(--bg-card)', color: 'var(--text-muted)',
          padding: 'clamp(0.75rem, 3.5vw, 1rem)',
          margin: 'clamp(0.5rem, 2.5vw, 0.75rem)',
          borderRadius: '8px',
          fontSize: 'clamp(13px, 3.4vw, 14px)',
          lineHeight: 1.5, textAlign: 'center',
        }}>
          {archiveError}
        </div>
      )}

      <div className="sr-list">
        {shownList.length === 0 ? (
          <div className="sr-empty">
            {activeTab === 'active'
              ? <>No product inquiries yet.<br />Inquiries are submitted from product pages in the shop.</>
              : <>Nothing archived yet.</>
            }
          </div>
        ) : (
          shownList.map(inq => (
            activeTab === 'active'
              ? (
                <SwipeableInquiry
                  key={inq.account_inquiry_id}
                  inq={inq}
                  onArchive={handleArchive}
                />
              )
              : (
                <ArchivedInquiry
                  key={inq.account_inquiry_id}
                  inq={inq}
                />
              )
          ))
        )}

        {activeTab === 'active' && activeList.length > 0 && (
          <p style={{
            fontFamily: 'var(--font-ui-mob)',
            fontSize: 'clamp(13px, 3.4vw, 14px)',
            color: 'var(--text-muted)',
            textAlign: 'center',
            padding: '8px 0',
            opacity: 0.6,
            lineHeight: 1.6,
          }}>
            Inquiries are submitted from product pages in the shop.
          </p>
        )}
      </div>
    </div>
  );
}
