import { fmtDate, fmtTime } from '../../../lib/utils';

interface InquiryDetailModalProps {
  selectedInq: any;
  setSelectedInq: (v: any) => void;
  selectedInqProduct: any;
  setSelectedInqProduct: (v: any) => void;
  user: any;
}

export default function InquiryDetailModal({ selectedInq, setSelectedInq, selectedInqProduct, setSelectedInqProduct, user }: InquiryDetailModalProps) {
  // JSX block — lines 622–698 of [id].tsx
  if (!selectedInq) return null;

  const onClose = () => { setSelectedInq(null); setSelectedInqProduct(null); };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.10)', padding: '31px', maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '2px' }}>

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '10px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', marginBottom: '6px' }}>
            {selectedInq.guest_inquiry_id ? 'Guest Inquiry' : 'Account Inquiry'}
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '22px', color: 'var(--wh)' }}>
            {selectedInq.name || user?.name || 'Inquiry'}
          </div>
          {selectedInq.email && <div style={{ fontSize: '13px', color: 'var(--d1)', marginTop: '3px' }}>{selectedInq.email}</div>}
          {selectedInq.phone && <div style={{ fontSize: '13px', color: '#377da2', marginTop: '2px' }}>{selectedInq.phone}</div>}
        </div>

        <div style={{ height: '1px', background: 'var(--ln)', margin: '16px 0' }} />

        {/* Message */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '10px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', marginBottom: '8px' }}>Message</div>
          <p style={{ fontSize: '15px', color: 'var(--tx)', lineHeight: 1.7 }}>{selectedInq.description}</p>
        </div>

        <div style={{ height: '1px', background: 'var(--ln)', margin: '16px 0' }} />

        {/* Product info */}
        {selectedInqProduct ? (
          <div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: '10px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', marginBottom: '12px' }}>Product Inquired About</div>
            {selectedInqProduct.photo_url && (
              <div style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', aspectRatio: '4/3', maxHeight: '220px' }}>
                <img
                  src={selectedInqProduct.photo_url.startsWith('http') ? selectedInqProduct.photo_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-photos/${selectedInqProduct.photo_url}`}
                  alt={selectedInqProduct.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <div style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--wh)', marginBottom: '4px' }}>{selectedInqProduct.title}</div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: '18px', color: 'rgba(45,212,191,1)', marginBottom: '14px' }}>{selectedInqProduct.total_price ? '$' + Number(selectedInqProduct.total_price).toLocaleString() : ''}</div>
            {[
              { label: 'Product ID', val: selectedInqProduct.product_id },
              { label: 'Gem Type', val: selectedInqProduct.gem_type },
              { label: 'Shape', val: selectedInqProduct.shape },
              { label: 'Weight', val: selectedInqProduct.weight ? selectedInqProduct.weight + ' ct' : null },
              { label: 'Color', val: selectedInqProduct.color },
              { label: 'Origin', val: selectedInqProduct.origin },
              { label: 'Treatment', val: selectedInqProduct.treatment },
              { label: 'GIA Report #', val: selectedInqProduct.gia_report_number },
              { label: 'Price / ct', val: selectedInqProduct.price_per_carat ? '$' + Number(selectedInqProduct.price_per_carat).toLocaleString() : null },
            ].filter(r => r.val).map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                <span style={{ fontFamily: 'var(--sans)', fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--d1)' }}>{r.label}</span>
                <span style={{ fontSize: '13px', color: 'var(--tx)', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>{r.val}</span>
              </div>
            ))}
            {selectedInqProduct.description && (
              <p style={{ fontSize: '13px', color: 'var(--d2)', lineHeight: 1.7, marginTop: '12px' }}>{selectedInqProduct.description}</p>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--d2)', fontStyle: 'italic' }}>No product linked to this inquiry</div>
        )}

        <div style={{ height: '1px', background: 'var(--ln)', margin: '20px 0 16px' }} />
        <div style={{ fontSize: '11px', color: 'var(--d2)' }}>{fmtDate(selectedInq.created_at)} · {fmtTime(selectedInq.created_at)}</div>

        <button onClick={onClose}
          style={{ marginTop: '20px', background: 'none', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.45)', padding: '10px 20px', fontFamily: 'var(--sans)', fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', cursor: 'pointer' }}>
          Close
        </button>
      </div>
    </div>
  );
}
