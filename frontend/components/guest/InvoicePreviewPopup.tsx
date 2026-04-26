import { formatMoney } from '../../lib/utils';
import { Product, AdminInfo, popupOverlayStyle, popupBoxStyle, goldBtnStyle, ghostBtnStyle } from './shopTypes';

export function InvoicePreviewPopup({
  product, adminInfo, buyerInfo, onContinue, onCancel, loading
}: {
  product: Product;
  adminInfo: AdminInfo | null;
  buyerInfo: { name: string; email: string; phone: string; shippingAddress: string; businessName?: string | null };
  onContinue: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const specRows = [
    { label: 'Title', value: product.title },
    { label: 'Gem Type', value: product.gem_type },
    { label: 'Shape', value: product.shape },
    { label: 'Weight', value: product.weight ? `${product.weight} ct` : null },
    { label: 'Color', value: product.color },
    ...(product.origin ? [{ label: 'Origin', value: product.origin }] : []),
    ...(product.treatment ? [{ label: 'Treatment', value: product.treatment }] : []),
    ...(product.gia_report_number ? [{ label: 'GIA Report #', value: product.gia_report_number }] : []),
    ...(product.price_per_carat ? [{ label: 'Price / ct', value: formatMoney(product.price_per_carat) }] : []),
  ].filter(r => r.value);

  const sectionLabel: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: '0.5625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'var(--text-muted)', marginBottom: '10px', marginTop: '18px' };
  const divider: React.CSSProperties = { height: '1px', backgroundColor: 'var(--border)', margin: '16px 0' };

  return (
    <div style={popupOverlayStyle}>
      <div style={{ ...popupBoxStyle, maxWidth: '520px' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Invoice Preview
        </p>

        <p style={sectionLabel}>From</p>
        {adminInfo && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            <div style={{ color: 'var(--gold)', fontWeight: 700 }}>{adminInfo.business_name}</div>
            <div>{adminInfo.full_name}</div>
            <div>{adminInfo.address}</div>
            <div>{adminInfo.contact_email}</div>
            <div>{adminInfo.phone}</div>
          </div>
        )}

        <div style={divider} />

        <p style={sectionLabel}>Bill To</p>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <div style={{ color: 'var(--text)' }}>{buyerInfo.name}</div>
          <div>{buyerInfo.email}</div>
          <div>{buyerInfo.phone}</div>
          <div>{buyerInfo.shippingAddress}</div>
          {buyerInfo.businessName && <div>{buyerInfo.businessName}</div>}
        </div>

        <div style={divider} />

        <p style={sectionLabel}>Product</p>
        {specRows.map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.5625rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text)', textAlign: 'right' }}>{value}</span>
          </div>
        ))}

        <div style={divider} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)' }}>Total</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', color: 'var(--accent)' }}>{formatMoney(product.total_price)}</span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Payment method: Card via Stripe
        </p>

        <button style={goldBtnStyle} onClick={onContinue} disabled={loading}>
          {loading ? 'Redirecting...' : 'Continue to Payment'}
        </button>
        <button style={ghostBtnStyle} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

