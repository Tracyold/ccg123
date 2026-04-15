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
        minHeight: 0, padding: '18px 18px',
        flexDirection: 'row', alignItems: 'center', gap: 16, cursor: 'pointer',
      } as React.CSSProperties}
      onClick={onClick}
    >
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4,
        }}>
          Service Requests
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
          Submitted over your account history
        </div>
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 48, fontWeight: 700,
        color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1, opacity: 0.15,
      }}>
        {serviceRequests.length}
      </div>
    </div>
  );
}