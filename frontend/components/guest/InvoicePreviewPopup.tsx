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

  const sectionLabel: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif", fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'rgba(255,255,255,0.30)', marginBottom: '10px', marginTop: '18px' };
  const divider: React.CSSProperties = { height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '16px 0' };

  return (
    <div style={popupOverlayStyle}>
      <div style={{ ...popupBoxStyle, maxWidth: '520px' }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'rgba(255,255,255,0.52)', marginBottom: '18px' }}>
          Invoice Preview
        </p>

        <p style={sectionLabel}>From</p>
        {adminInfo && (
          <div style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>
            <div style={{ color: '#d4af37', fontWeight: 700 }}>{adminInfo.business_name}</div>
            <div>{adminInfo.full_name}</div>
            <div>{adminInfo.address}</div>
            <div>{adminInfo.contact_email}</div>
            <div>{adminInfo.phone}</div>
          </div>
        )}

        <div style={divider} />

        <p style={sectionLabel}>Bill To</p>
        <div style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>
          <div style={{ color: 'rgba(255,255,255,0.80)' }}>{buyerInfo.name}</div>
          <div>{buyerInfo.email}</div>
          <div>{buyerInfo.phone}</div>
          <div>{buyerInfo.shippingAddress}</div>
          {buyerInfo.businessName && <div>{buyerInfo.businessName}</div>}
        </div>

        <div style={divider} />

        <p style={sectionLabel}>Product</p>
        {specRows.map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.38)', flexShrink: 0 }}>{label}</span>
            <span style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.70)', textAlign: 'right' }}>{value}</span>
          </div>
        ))}

        <div style={divider} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.38)' }}>Total</span>
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: '20px', color: 'rgba(45,212,191,1)' }}>{formatMoney(product.total_price)}</span>
        </div>
        <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginBottom: '24px' }}>
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

