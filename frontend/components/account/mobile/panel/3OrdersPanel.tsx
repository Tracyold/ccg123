// components/account/mobile/panels/3OrdersPanel.tsx

import { formatMoney, fmtDate, fmtTime } from '../../../../lib/utils';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  CREATED:   { bg: 'rgba(207,221,78,0.12)',  color: 'var(--gold)' },
  ACCEPTED:  { bg: 'rgba(45,212,191,0.12)',  color: '#2dd4bf' },
  CONFIRMED: { bg: 'rgba(106,176,245,0.12)', color: '#6ab0f5' },
  COMPLETED: { bg: 'rgba(78,201,148,0.12)',  color: '#4ec994' },
  CANCELLED: { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
};

interface OrdersPanelProps {
  open:       boolean;
  workOrders: any[];
  adminInfo:  any;
  profile:    any;
  onSelectWO: (wo: any) => void;
  onAcceptWO: (wo: any) => void;
  onClose:    () => void;
}

export default function OrdersPanel3({
  open, workOrders, onSelectWO, onAcceptWO, onClose,
}: OrdersPanelProps) {
  return (
    <div className={`slide-panel${open ? ' open' : ''}`}>
      <div className="panel-header">
        <span className="panel-title">Work Orders</span>
        <button className="panel-close" onClick={onClose}>✕</button>
      </div>
      <div className="orders-list">
        {workOrders.length === 0 && (
          <div style={{
            padding: '40px 0', textAlign: 'center',
            fontFamily: 'var(--font-ui)', fontSize: 13,
            color: 'var(--text-muted)', fontStyle: 'italic',
          }}>
            No work orders yet
          </div>
        )}
        {workOrders.map(wo => {
          const s = STATUS_STYLE[wo.status] ?? STATUS_STYLE.CREATED;
          return (
            <div key={wo.work_order_id} className="order-tile" onClick={() => onSelectWO(wo)}>
              <div className="order-status" style={{ background: s.bg, color: s.color }}>
                {wo.status}
              </div>
              <div className="order-title">{wo.title}</div>
              <div className="order-meta">
                #{String(wo.work_order_id).slice(-4)} · {fmtDate(wo.created_at)} · {fmtTime(wo.created_at)}
              </div>
              {wo.estimated_price && (
                <div className="order-price">{formatMoney(wo.estimated_price)}</div>
              )}
              {wo.status === 'CREATED' && (
                <button
                  className="order-accept"
                  onClick={e => { e.stopPropagation(); onAcceptWO(wo); }}
                >
                  Accept Work Order
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}