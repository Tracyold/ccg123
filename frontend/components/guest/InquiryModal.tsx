import { Product, popupOverlayStyle, popupBoxStyle, goldBtnStyle } from './shopTypes';
import { InquiryContactForm, InquiryDescForm } from './InquiryContactForm';

interface Props {
  inquiryStep: 'collect-info' | 'describe' | 'success' | null;
  product: Product;
  guestCollected: { firstName: string; lastName: string; email: string; phone: string } | null;
  accountUser: any;
  submitting: boolean;
  onGuestInfoSubmit: (info: any) => void;
  onClose: () => void;
  onDescSubmit: (desc: string) => void;
  onOK: () => void;
}

export default function InquiryModal({ inquiryStep, product: modalProduct, guestCollected, accountUser, submitting: inquirySubmitting, onGuestInfoSubmit: handleGuestInfoForInquiry, onClose: closeInquiry, onDescSubmit: handleInquiryDescSubmit, onOK: handleInquiryOK }: Props) {
  const displayName = guestCollected ? guestCollected.firstName + ' ' + guestCollected.lastName : accountUser?.name || '';
  const displayEmail = guestCollected?.email || accountUser?.email || '';
  const displayPhone = guestCollected?.phone || accountUser?.phone || '';

  if (inquiryStep === 'collect-info') return (
    <div style={popupOverlayStyle}>
      <div style={popupBoxStyle}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'var(--text-muted)', marginBottom: '6px' }}>Inquire About This Gem</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>Please share your contact details so we can follow up.</p>
        <InquiryContactForm onSubmit={handleGuestInfoForInquiry} onClose={closeInquiry} />
      </div>
    </div>
  );

  if (inquiryStep === 'describe') return (
    <div style={popupOverlayStyle}>
      <div style={popupBoxStyle}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'var(--text-muted)', marginBottom: '6px' }}>Inquiry — {modalProduct.title}</p>
        <div style={{ background: 'var(--border)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.5625rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)', marginBottom: '8px' }}>Your Details</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            {displayName && <div>{displayName}</div>}
            {displayEmail && <div>{displayEmail}</div>}
            {displayPhone && <div>{displayPhone}</div>}
          </div>
        </div>
        <InquiryDescForm onSubmit={handleInquiryDescSubmit} onClose={closeInquiry} submitting={inquirySubmitting} />
      </div>
    </div>
  );

  if (inquiryStep === 'success') return (
    <div style={popupOverlayStyle}>
      <div style={{ ...popupBoxStyle, textAlign: 'center' }}>
        <div style={{ fontSize: '2.0rem', marginBottom: '16px' }}>✓</div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'var(--accent)', marginBottom: '10px' }}>Inquiry Sent!</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '28px' }}>
          We've received your inquiry about <strong style={{ color: 'var(--text)' }}>{modalProduct.title}</strong> and will be in touch soon.
        </p>
        <button style={goldBtnStyle} onClick={handleInquiryOK}>OK</button>
      </div>
    </div>
  );

  return null;
}
