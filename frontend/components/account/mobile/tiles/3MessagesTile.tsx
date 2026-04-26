// components/account/mobile/tiles/3MessagesTile.tsx

interface MessagesTileProps {
  chatThread: any;
  messages:   any[];
  onClick:    () => void;
}

export default function MessagesTile3({ chatThread, messages, onClick }: MessagesTileProps) {
  const hasUnread = !!chatThread?.account_has_unread;
  // We don't have a last_read_at column, so we can't compute a true per-message unread
  // count. Keep it simple: dim when caught up, lit with a "new" label when there's
  // something waiting. Total message count is still available if we want it later.

  return (
    <div
      className={`tile wide ${hasUnread ? 'lit' : 'dim'}`}
      style={{ 
        '--tc': 'var(--tile-chat)', 
        minHeight: 100, 
        gap: 18, 
        padding: '22px 20px',
        background: hasUnread ? 'rgba(207,221,78,0.05)' : 'var(--bg-card)'
      } as React.CSSProperties}
      onClick={onClick}
    >
      {hasUnread && <div className="t-badge" />}
      <div style={{ 
        fontSize: '2.0rem', 
        flexShrink: 0, 
        lineHeight: 1, 
        color: hasUnread ? 'var(--gold)' : 'rgba(255,255,255,0.85)',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}>✉︎</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        {hasUnread ? (
          <>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
              color: 'var(--gold)', letterSpacing: '0.18em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 999,
              background: 'rgba(207,221,78,0.12)',
            }}>
              New
            </span>
            <span style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '1.125rem', 
              color: 'var(--text)',
              fontWeight: 500
            }}>
              message from the shop
            </span>
          </>
        ) : (
          <span style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.125rem', 
            color: 'var(--text)',
            opacity: 0.9
          }}>
            Chat with the shop
          </span>
        )}
      </div>
    </div>
  );
}
