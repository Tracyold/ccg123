// components/account/mobile/tiles/3SmsTile.tsx

interface SmsTileProps {
  smsPrefs: any;
  onClick:  () => void;
}

export default function SmsTile3({ smsPrefs, onClick }: SmsTileProps) {
  const activeCount = smsPrefs
    ? Object.entries(smsPrefs).filter(([k, v]) => k.startsWith('opt_in') && v).length
    : 0;

  return (
    <div
      className="tile dim"
      style={{
        '--tc': 'var(--tile-sms)',
        minHeight: 110, cursor: 'pointer', padding: '20px 18px',
        justifyContent: 'center', flexDirection: 'row', alignItems: 'center',
      } as React.CSSProperties}
      onClick={onClick}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
          <div style={{ 
            fontSize: '2.0rem', 
            lineHeight: 1, 
            color: activeCount > 0 ? 'var(--tile-sms)' : 'rgba(255,255,255,0.85)', 
            flexShrink: 0,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>📱</div>
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.125rem', 
            color: 'var(--text)',
            fontWeight: 500
          }}>SMS Alerts</div>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: activeCount > 0 ? 'var(--tile-sms)' : 'var(--text-muted)',
          marginTop: 8, fontWeight: 600
        }}>
          {activeCount} active
        </div>
      </div>
    </div>
  );
}
