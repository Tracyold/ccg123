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
        minHeight: 110, cursor: 'pointer', padding: '20px 18px',
        justifyContent: 'center', flexDirection: 'row', alignItems: 'center',
      } as React.CSSProperties}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
        <div style={{ 
          fontSize: 32, 
          lineHeight: 1, 
          color: 'rgba(255,255,255,0.85)', 
          flexShrink: 0,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>✎</div>
        <div style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 18, 
          color: 'var(--text)',
          fontWeight: 500
        }}>Inquiries</div>
      </div>
    </div>
  );
}
