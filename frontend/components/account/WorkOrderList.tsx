import { formatMoney, fmtDate } from '../../lib/utils';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  CREATED: { bg: 'rgba(212,175,55,0.12)', color: '#d4af37' },
  ACCEPTED: { bg: 'rgba(45,212,191,0.12)', color: 'rgba(45,212,191,1)' },
  COMPLETED: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' },
  CONFIRMED: { bg: 'rgba(120,80,200,0.12)', color: '#b388ff' },
  CANCELLED: { bg: 'rgba(181,64,64,0.1)', color: '#c07070' },
};

interface Props {
  workOrders: any[];
  onSelect: (wo: any) => void;
  onAccept: (wo: any) => void;
}

export default function WorkOrderList({ workOrders, onSelect, onAccept }: Props) {
  return (
    <div style={{ padding: '28px' }}>
      <h2 style={{ fontFamily: "'Oranienbaum', serif", fontSize: '24px', color: '#FAFAFA', marginBottom: '24px' }}>Work Orders</h2>
      {workOrders.length === 0 ? (
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>No work orders</p>
      ) : workOrders.map(wo => (
        <div key={wo.work_order_id} style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)', padding: '16px', marginBottom: '12px', cursor: 'pointer' }} onClick={() => onSelect(wo)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '16px', color: '#FAFAFA' }}>{wo.title}</span>
            <span style={{ fontSize: '8px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '3px 7px',
              background: STATUS_COLORS[wo.status]?.bg, color: STATUS_COLORS[wo.status]?.color }}>{wo.status}</span>
          </div>
          {wo.service_type && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginBottom: '4px' }}>{wo.service_type}</div>}
          {wo.estimated_price && <div style={{ fontSize: '19px', color: 'rgb(48, 177, 98)', fontFamily: "'Courier New', monospace" }}>{formatMoney(wo.estimated_price)}</div>}
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '8px' }}>{fmtDate(wo.created_at)}</div>
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
