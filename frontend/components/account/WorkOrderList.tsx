import { formatMoney, fmtDate } from '../../lib/utils';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  CREATED: { bg: 'rgba(var(--gold-rgb), 0.12)', color: 'var(--gold)' },
  ACCEPTED: { bg: 'rgba(45,212,191,0.12)', color: 'var(--accent)' },
  COMPLETED: { bg: 'var(--border)', color: 'var(--text-muted)' },
  CONFIRMED: { bg: 'rgba(120,80,200,0.12)', color: 'var(--text-muted)' },
  CANCELLED: { bg: 'rgba(181,64,64,0.1)', color: 'var(--text-muted)' },
};

interface Props {
  workOrders: any[];
  onSelect: (wo: any) => void;
  onAccept: (wo: any) => void;
}

export default function WorkOrderList({ workOrders, onSelect, onAccept }: Props) {
  return (
    <div style={{ padding: '28px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text)', marginBottom: '24px' }}>Work Orders</h2>
      {workOrders.length === 0 ? (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>No work orders</p>
      ) : workOrders.map(wo => (
        <div key={wo.work_order_id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '16px', marginBottom: '12px', cursor: 'pointer' }} onClick={() => onSelect(wo)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--text)' }}>{wo.title}</span>
            <span style={{ fontSize: '8px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '3px 7px',
              background: STATUS_COLORS[wo.status]?.bg, color: STATUS_COLORS[wo.status]?.color }}>{wo.status}</span>
          </div>
          {wo.service_type && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{wo.service_type}</div>}
          {wo.estimated_price && <div style={{ fontSize: '19px', color: 'rgb(48, 177, 98)', fontFamily: 'var(--font-mono)' }}>{formatMoney(wo.estimated_price)}</div>}
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>{fmtDate(wo.created_at)}</div>
          {wo.status === 'CREATED' && (
            <button onClick={e => { e.stopPropagation(); onAccept(wo); }} className="acc-btn-gold" style={{ marginTop: '12px', width: 'auto', padding: '8px 16px' }}>
              Accept Work Order
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
