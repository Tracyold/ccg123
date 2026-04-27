// frontend/components/account/mobile/tiles/3ServiceRequestsTile.tsx
//
// Changed this revision: count filters out archived rows so the tile
// reflects only active (non-archived) service requests. The number
// updates in realtime because Supabase realtime UPDATEs flow through
// useAccountInfo → MobileAccount → this tile's `serviceRequests` prop.

interface ServiceRequestsTileProps {
  serviceRequests: any[];
  onClick:         () => void;
}

export default function ServiceRequestsTile3({ serviceRequests, onClick }: ServiceRequestsTileProps) {
  // Active-only count — archived rows live on the Archive tab inside the panel.
  const activeCount = serviceRequests.filter(sr => !sr.is_archived).length;


  return (
    <div
      className="tile dim"
      style={{
        '--tc': 'var(--muted)',
        minHeight: 2, padding: '2em',
        flexDirection: 'row', alignItems: 'center', gap: 20, cursor: 'pointer',
      } as React.CSSProperties}
      onClick={onClick}
    >
      <div style={{ flex: 2 }}>
        <div style={{
          fontFamily: 'var(--font-ui)', fontSize: '1.33rem', letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--background)', marginBottom: 8,
          fontWeight: 600, opacity: 0.9
        }}>
          New Service Requests
        </div>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '1.2rem',
          color: '0 4px 5px var(--text)',
          textTransform: 'uppercase',
          letterSpacing: '.1em',
          lineHeight: 1.5,
          border: '.1px',
          borderColor: '0 .1px .1px var(--bg-card)',
          opacity: .9
        }}>
          Active Service Requests
        </div>
      </div>
      <div style={{
        fontFamily: 'var(--font-mono-mob)', fontSize: '3.5rem', fontWeight: 800,
        color: 'var(--gold)', letterSpacing: '-0.02em', lineHeight: 1,
        textShadow: '0 4px 12px rgba(0,0,0,0.4)',
        opacity: 0.9
      }}>
        {activeCount}
      </div>
    </div>
  );
}
