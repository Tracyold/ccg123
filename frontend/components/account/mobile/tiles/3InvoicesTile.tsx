// components/account/mobile/tiles/3InvoicesTile.tsx

interface InvoicesTileProps {
  invoices:     any[];
  invoiceTotal: number;
  onClick:      () => void;
}

export default function InvoicesTile3({ invoices, invoiceTotal, onClick }: InvoicesTileProps) {
  const hasUnpaid = invoices.some(inv => !inv.paid_at);

  return (
    <div
      className={`tile ${hasUnpaid ? 'lit' : 'dim'}`}
      style={{
        '--tc': 'var(--tile-invoice)',
        minHeight: 120, cursor: 'pointer',
        flexDirection: 'row', alignItems: 'center', gap: 16, padding: '20px 18px',
        background: hasUnpaid ? 'rgba(192,132,252,0.05)' : 'var(--bg-card)'
      } as React.CSSProperties}
      onClick={onClick}
    >
      {hasUnpaid && <div className="t-badge" />}
      <div style={{ 
        fontFamily: 'var(--font-display-mob)', 
        fontSize: '1.125rem', 
        color: 'var(--text)', 
        flex: 1,
        fontWeight: 500
      }}>
        Invoices
      </div>
      <div style={{
        fontFamily: 'var(--font-mono-mob)', fontSize: '3.0rem', fontWeight: 800,
        lineHeight: 1, color: hasUnpaid ? 'var(--tile-invoice)' : 'var(--text)',
        textShadow: '0 4px 10px rgba(0,0,0,0.4)',
        opacity: hasUnpaid ? 1 : 0.8,
        WebkitTextStroke: hasUnpaid ? '1px rgba(255,255,255,0.2)' : 'none'
      } as React.CSSProperties}>
        {invoices.length}
      </div>
    </div>
  );
}
