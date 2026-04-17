// components/account/mobile/tiles/3WorkOrderTile.tsx

interface WorkOrderTileProps {
  workOrders: any[];
  onClick:    () => void;
}

export default function WorkOrderTile3({ workOrders, onClick }: WorkOrderTileProps) {
  const hasNew     = workOrders.some(w => w.status === 'CREATED');
  const hasUpdated = workOrders.some(w => w.status === 'ACCEPTED');
  const lit        = hasNew || hasUpdated;

  return (
    <div
      className={`tile ${lit ? 'lit' : 'dim'}`}
      style={{
        '--tc': 'var(--tile-orders)',
        minHeight: 120, cursor: 'pointer',
        padding: '20px 18px', justifyContent: 'center',
        background: lit ? 'rgba(106,176,245,0.05)' : 'var(--bg-card)'
      } as React.CSSProperties}
      onClick={onClick}
    >
      {lit && <div className="t-badge" />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
        <div style={{ 
          fontSize: 32, 
          lineHeight: 1, 
          color: lit ? 'var(--tile-orders)' : 'rgba(255,255,255,0.85)', 
          flexShrink: 0,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>⚙︎</div>
        <div style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 18, 
          color: 'var(--text)', 
          lineHeight: 1.4,
          fontWeight: 500
        }}>
          {hasNew ? (
            <>
              <span style={{ 
                color: 'var(--gold)', 
                fontWeight: 700,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              } as React.CSSProperties}>New</span>
              {' '}work order!
            </>
          ) : hasUpdated ? (
            <>Status <strong style={{ color: 'var(--tile-orders)' }}>updated</strong></>
          ) : workOrders.length > 0 ? (
            <span style={{ fontSize: 20, fontWeight: 600 }}>
              {workOrders.length} order{workOrders.length !== 1 ? 's' : ''}
            </span>
          ) : (
            'No active orders'
          )}
        </div>
      </div>
    </div>
  );
}
