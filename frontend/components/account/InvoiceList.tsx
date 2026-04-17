import { formatMoney, fmtDate } from '../../lib/utils';

interface Props {
  invoices: any[];
}

export default function InvoiceList({ invoices }: Props) {
  return (
    <div style={{ padding: '28px' }}>
      <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '24px', color: 'var(--text)', marginBottom: '24px' }}>Invoices</h2>
      {invoices.length === 0 ? <p className="acc-empty">No invoices</p> :
      invoices.map(inv => {
        const item = inv.line_items?.[0];
        return (
          <div key={inv.invoice_id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--text)' }}>{item?.title || 'Product'}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{fmtDate(inv.paid_at)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '17px', color: 'rgb(48, 177, 98)' }}>{formatMoney(inv.total_amount)}</div>
                <span style={{ fontSize: '8px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '2px 6px', background: 'rgba(var(--gold-rgb), 0.08)', color: 'var(--accent)' }}>PAID</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

