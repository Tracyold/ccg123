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
        minHeight: 110, cursor: 'pointer', padding: '16px 14px',
        justifyContent: 'center', flexDirection: 'row', alignItems: 'center',
      } as React.CSSProperties}
      onClick={onClick}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{ fontSize: 22, lineHeight: 1, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>◉</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text)' }}>SMS Alerts</div>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: 'var(--text-muted)', marginTop: 6,
        }}>
          {activeCount} active
        </div>
      </div>
    </div>
  );
}