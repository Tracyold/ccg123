import { X, ShoppingCart, MessageSquare } from 'lucide-react';
import { formatMoney } from '../../lib/utils';
import { Product, popupOverlayStyle, popupBoxStyle, goldBtnStyle } from './shopTypes';

interface Props {
  product: Product;
  onClose: () => void;
  onBuy: () => void;
  onInquire: () => void;
  getPhotoUrl: (url: string | null) => string | null;
}

export default function ProductDetailModal({ product: modalProduct, onClose, onBuy: handleBuyClick, onInquire: handleInquiryClick, getPhotoUrl }: Props) {
  return (

        <div
          style={popupOverlayStyle}
          onClick={(e) => { if (e.target === e.currentTarget) { onClose(); } }}
        >
          <div style={{ ...popupBoxStyle, maxWidth: '560px' }}>
            <button
              onClick={() => { onClose(); }}
              style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)', zIndex: 10 }}
            >
              <X size={18} />
            </button>

            {/* Product image */}
            {modalProduct.photo_url && (
              <div style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', aspectRatio: '4/3' }}>
                <img
                  src={getPhotoUrl(modalProduct.photo_url)!}
                  alt={modalProduct.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--text)', marginBottom: '8px' }}>
              {modalProduct.title}
            </h2>

            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.375rem', color: 'var(--accent)', marginBottom: '20px' }}>
              {formatMoney(modalProduct.total_price)}
            </p>

            {/* Specs */}
            <div style={{ marginBottom: '20px' }}>
              {[
                { label: 'Gem Type', value: modalProduct.gem_type },
                { label: 'Shape', value: modalProduct.shape },
                { label: 'Weight', value: modalProduct.weight ? `${modalProduct.weight} ct` : null },
                { label: 'Color', value: modalProduct.color },
                { label: 'Origin', value: modalProduct.origin },
                { label: 'Treatment', value: modalProduct.treatment },
                { label: 'Price/ct', value: modalProduct.price_per_carat ? formatMoney(modalProduct.price_per_carat) : null },
              ].filter(r => r.value).map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.5625rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text)' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* GIA */}
            {modalProduct.gia_report_number && (
              <div style={{ marginBottom: '20px', padding: '12px', background: 'var(--border)', border: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.5625rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)' }}>GIA Report</span>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text)', margin: '4px 0 0' }}>
                  #{modalProduct.gia_report_number}
                  {modalProduct.gia_report_pdf_url && (
                    <a href={modalProduct.gia_report_pdf_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', marginLeft: '8px', fontSize: '0.6875rem' }}>
                      View Report
                    </a>
                  )}
                </p>
              </div>
            )}

            {modalProduct.description && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', lineHeight: 1.75, color: 'var(--text-muted)', marginBottom: '24px' }}>
                {modalProduct.description}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                style={{ ...goldBtnStyle, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleBuyClick}
              >
                <ShoppingCart size={14} /> Buy Now
              </button>
              <button
                style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.20em', backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '14px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleInquiryClick}
              >
                <MessageSquare size={14} /> Inquire
              </button>
            </div>
          </div>
        </div>
  );
}
