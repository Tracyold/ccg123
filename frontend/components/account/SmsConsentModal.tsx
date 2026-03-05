import { useState } from 'react';

interface ConsentModalProps {
  toggle: { label: string; col: string };
  onConfirm: () => void;
  onCancel: () => void;
  hasOpenWorkOrder?: boolean;
}

const CONSENT_COPY: Record<string, { title: string; body: string; requirement?: string }> = {
  opt_in_work_orders: {
    title: 'Work Order SMS Alerts',
    body: 'By enabling this, you agree to receive SMS notifications from Cutting Corners Gems regarding your work order status, including acceptance, updates, and completion. Message & data rates may apply. Reply STOP at any time to opt out — however, see the note below.',
    requirement: 'Important: If you have an open work order, this notification type is required. Because your gemstone is in our possession, we must be able to reach you with updates. This toggle will become available to turn off once your work order is complete and your item has been returned to you. Continuing confirms you understand this requirement.',
  },
  opt_in_tracking: {
    title: 'Tracking Update Alerts',
    body: 'By enabling this, you agree to receive SMS notifications from Cutting Corners Gems with shipping and tracking updates for your orders. Message & data rates may apply. Reply STOP at any time to opt out.',
  },
  opt_in_chat: {
    title: 'Chat Message Alerts',
    body: 'By enabling this, you agree to receive SMS notifications from Cutting Corners Gems when you have a new message from our team. Message & data rates may apply. Reply STOP at any time to opt out.',
  },
  opt_in_purchases: {
    title: 'Purchase Confirmation Alerts',
    body: 'By enabling this, you agree to receive SMS confirmations from Cutting Corners Gems when a purchase is completed. Message & data rates may apply. Reply STOP at any time to opt out.',
  },
  opt_in_new_listings: {
    title: 'New Gem Listing Alerts',
    body: 'By enabling this, you agree to receive SMS notifications from Cutting Corners Gems when new gemstones are listed in the shop. Message frequency varies. Message & data rates may apply. Reply STOP at any time to opt out.',
  },
};

export default function SmsConsentModal({ toggle, onConfirm, onCancel, hasOpenWorkOrder }: ConsentModalProps) {
  const [checked, setChecked] = useState(false);
  const copy = CONSENT_COPY[toggle.col] || {
    title: toggle.label,
    body: `By enabling this, you agree to receive SMS notifications from Cutting Corners Gems for ${toggle.label}. Message & data rates may apply. Reply STOP at any time to opt out.`,
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: '#111',
        border: '1px solid rgba(212,175,55,0.3)',
        maxWidth: '480px', width: '100%',
        padding: '32px',
      }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
          SMS Consent Required
        </p>
        <h2 style={{ fontFamily: "'Oranienbaum', serif", fontSize: '22px', color: '#FAFAFA', marginBottom: '20px' }}>
          {copy.title}
        </h2>

        <p style={{ fontSize: '13px', lineHeight: 1.75, color: 'rgba(255,255,255,0.65)', marginBottom: '16px' }}>
          {copy.body}
        </p>

        {copy.requirement && (
          <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', padding: '14px 16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', lineHeight: 1.75, color: 'rgba(255,220,100,0.85)', margin: 0 }}>
              {copy.requirement}
            </p>
          </div>
        )}

        <p style={{ fontSize: '11px', lineHeight: 1.65, color: 'rgba(255,255,255,0.35)', marginBottom: '20px' }}>
          Cutting Corners Gems will never sell or share your phone number. You can manage your notification preferences at any time from your account dashboard. For help reply HELP. To stop all messages reply STOP.
        </p>

        <div onClick={() => setChecked(c => !c)} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '24px', cursor: 'pointer' }}>
          <div style={{
            width: '18px', height: '18px', borderRadius: '3px', flexShrink: 0, marginTop: '1px',
            border: '1px solid rgba(212,175,55,0.5)',
            background: checked ? '#d4af37' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 200ms',
          }}>
            {checked && <span style={{ color: '#000', fontSize: '12px', fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
            I agree to receive SMS notifications from Cutting Corners Gems. I understand I can opt out at any time by replying STOP, and that message & data rates may apply.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => { if (checked) onConfirm(); }}
            style={{
              flex: 2, padding: '12px',
              background: checked ? '#d4af37' : 'rgba(212,175,55,0.2)',
              border: 'none', color: checked ? '#000' : 'rgba(255,255,255,0.3)',
              fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase',
              cursor: checked ? 'pointer' : 'not-allowed',
              transition: 'all 300ms',
            }}
          >
            Enable Notifications
          </button>
        </div>
      </div>
    </div>
  );
}
