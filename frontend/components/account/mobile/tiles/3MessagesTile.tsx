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
        fontSize: 32, 
        flexShrink: 0, 
        lineHeight: 1, 
        color: hasUnread ? 'var(--gold)' : 'rgba(255,255,255,0.85)',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}>✉︎</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        {hasUnread ? (
          <>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 42, fontWeight: 800,
              color: 'var(--gold)', lineHeight: 1,
              textShadow: '0 4px 8px rgba(0,0,0,0.5)',
              letterSpacing: '-0.05em'
            }}>
              {unreadCount}
            </span>
            <span style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: 18, 
              color: 'var(--text)',
              fontWeight: 500
            }}>
              new message{unreadCount !== 1 ? 's' : ''}
            </span>
          </>
        ) : (
          <span style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 18, 
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
