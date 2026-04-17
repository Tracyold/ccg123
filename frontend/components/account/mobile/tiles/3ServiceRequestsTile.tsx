// components/account/mobile/tiles/3ServiceRequestsTile.tsx

interface ServiceRequestsTileProps {
  serviceRequests: any[];
  onClick:         () => void;
}

export default function ServiceRequestsTile3({ serviceRequests, onClick }: ServiceRequestsTileProps) {
  return (
    <div
      className="tile dim"
      style={{
        '--tc': 'var(--gold)',
        minHeight: 0, padding: '22px 22px',
        flexDirection: 'row', alignItems: 'center', gap: 20, cursor: 'pointer',
      } as React.CSSProperties}
      onClick={onClick}
    >
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.25em',
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8,
          fontWeight: 600, opacity: 0.9
        }}>
          Service Requests
        </div>
        <div style={{ 
          fontFamily: 'var(--font-ui)', 
          fontSize: 14, 
          color: 'var(--text)', 
          lineHeight: 1.5,
          opacity: 0.8
        }}>
          Submitted over your account history
        </div>
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 56, fontWeight: 800,
        color: 'var(--gold)', letterSpacing: '-0.02em', lineHeight: 1,
        textShadow: '0 4px 12px rgba(0,0,0,0.4)',
        opacity: 0.9
      }}>
        {serviceRequests.length}
      </div>
    </div>
  );
}
