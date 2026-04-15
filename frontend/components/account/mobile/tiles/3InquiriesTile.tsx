// components/account/mobile/tiles/3InquiriesTile.tsx

interface InquiriesTileProps {
  inquiries: any[];
  onClick:   () => void;
}

export default function InquiriesTile3({ inquiries, onClick }: InquiriesTileProps) {
  return (
    <div
      className="tile dim"
      style={{
        '--tc': 'var(--tile-est)',
        minHeight: 110, cursor: 'pointer', padding: '16px 14px',
        justifyContent: 'center', flexDirection: 'row', alignItems: 'center',
      } as React.CSSProperties}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <div style={{ fontSize: 22, lineHeight: 1, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>◈</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text)' }}>Inquiries</div>
      </div>
    </div>
  );
}