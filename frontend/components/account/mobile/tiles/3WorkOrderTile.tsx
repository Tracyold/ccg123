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
        minHeight: 110, cursor: 'pointer',
        padding: '16px 14px', justifyContent: 'center',
      } as React.CSSProperties}
      onClick={onClick}
    >
      {lit && <div className="t-badge" />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <div style={{ fontSize: 22, lineHeight: 1, color: 'rgba(255,255,255,0.85)', flexShrink: 0 }}>⚙︎</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text)', lineHeight: 1.4 }}>
          {hasNew ? (
            <>
              <span style={{ color: 'rgba(207,221,78,0.7)', WebkitTextStroke: '0.4px rgba(0,0,0,0.5)' } as React.CSSProperties}>New</span>
              {' '}work order!
            </>
          ) : hasUpdated ? (
            <>Status <strong>updated</strong></>
          ) : workOrders.length > 0 ? (
            `${workOrders.length} order${workOrders.length !== 1 ? 's' : ''}`
          ) : (
            'No active orders'
          )}
        </div>
      </div>
    </div>
  );
}