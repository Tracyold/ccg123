// components/account/mobile/tiles/3MessagesTile.tsx

interface MessagesTileProps {
  chatThread: any;
  messages:   any[];
  onClick:    () => void;
}

export default function MessagesTile3({ chatThread, messages, onClick }: MessagesTileProps) {
  const hasUnread   = !!chatThread?.account_has_unread;
  const unreadCount = messages.filter(m => m.actor !== 'ACCOUNT').length;

  return (
    <div
      className={`tile wide ${hasUnread ? 'lit' : 'dim'}`}
      style={{ '--tc': 'var(--tile-chat)', minHeight: 80, gap: 14, padding: '18px 16px' } as React.CSSProperties}
      onClick={onClick}
    >
      {hasUnread && <div className="t-badge" />}
      <div style={{ fontSize: 24, flexShrink: 0, lineHeight: 1, color: 'rgba(255,255,255,0.85)' }}>✉︎</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {hasUnread ? (
          <>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700,
              color: 'rgba(207,221,78,0.7)', lineHeight: 1,
              WebkitTextStroke: '0.5px rgba(0,0,0,0.6)',
            }}>
              {unreadCount}
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text)' }}>
              new message{unreadCount !== 1 ? 's' : ''}
            </span>
          </>
        ) : (
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text)' }}>
            Chat with the shop
          </span>
        )}
      </div>
    </div>
  );
}