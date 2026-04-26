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
    body: 'By enabling this, you agree to receive SMS notifications from Cutting Corners Gems regarding your work order status, including acceptance, updates, and completion, changes and updates. Message & data rates may apply. Reply STOP at any time to opt out — however, see the note below.',
    requirement: 'Important: If you have an open work order, this notification type is required while the workorder is OPEN, because your gemstone is in our possession and we require live tracking records for each action taken during that that service . This toggle will become available to turn off once your work order when your gemstone is delivered to your hoe via shipping updates. By continuing you confirm you understand this requirement.',
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
      background: 'var(--bg-deep)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--bg-deep)',
        border: '1px solid rgba(var(--gold-rgb), 0.3)',
        maxWidth: '681px', width: '100%',
        padding: '32px',
      }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
          SMS Consent Required
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5625rem', color: 'var(--text)', marginBottom: '22px' }}>
          {copy.title}
        </h2>

        <p style={{ fontSize: '0.8125rem', lineHeight: 1.75, color: 'var(--text-muted)', marginBottom: '16px' }}>
          {copy.body}
        </p>

        {copy.requirement && (
          <div style={{ background: 'rgba(var(--gold-rgb), 0.08)', border: '1px solid rgba(var(--gold-rgb), 0.25)', padding: '15px 19px', marginBottom: '21px' }}>
            <p style={{ fontSize: '0.75rem', lineHeight: 1.75, color: 'var(--accent)', margin: 0 }}>
              {copy.requirement}
            </p>
          </div>
        )}

        <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: 'var(--text-muted)', marginBottom: '21px' }}>
          Cutting Corners Gems will never sell or share your phone number. You can manage your notification preferences at any time from your account dashboard. For help reply HELP. To stop all messages reply STOP.
        </p>

        <div onClick={() => setChecked(c => !c)} style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', marginBottom: '24px', cursor: 'pointer' }}>
          <div style={{
            width: '19px', height: '19px', borderRadius: '3px', flexShrink: 0, marginTop: '1px',
            border: '1px solid rgba(var(--gold-rgb), 0.5)',
            background: checked ? 'var(--gold)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 200ms',
          }}>
            {checked && <span style={{ color: 'var(--bg)', fontSize: '0.9375rem', fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{ fontSize: '0.9375rem', color: 'var(--text)', lineHeight: 1.65 }}>
            I agree to receive SMS notifications from Cutting Corners Gems. I understand I can opt out at any time by replying STOP, and that message & data rates may apply.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '17px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '17px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.9375rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => { if (checked) onConfirm(); }}
            style={{
              flex: 2, padding: '17px',
              background: checked ? 'var(--accent)' : 'rgba(var(--gold-rgb), 0.2)',
              border: 'none', color: checked ? '#000000e9' : 'rgba(var(--gold-rgb), 0.3)',
              fontSize: '0.9375rem', letterSpacing: '0.15em', textTransform: 'uppercase',
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
