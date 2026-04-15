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
        minHeight: 110, cursor: 'pointer',
        flexDirection: 'row', alignItems: 'center', gap: 14, padding: '16px 14px',
      } as React.CSSProperties}
      onClick={onClick}
    >
      {hasUnpaid && <div className="t-badge" />}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text)', flex: 1 }}>
        Invoices
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 38, fontWeight: 700,
        lineHeight: 1, color: 'rgba(90,90,90,0.6)',
        WebkitTextStroke: '1.5px rgba(207,221,78,0.7)',
      } as React.CSSProperties}>
        {invoices.length}
      </div>
    </div>
  );
}