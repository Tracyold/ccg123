import { useState } from 'react';
import { formatMoney } from '../../lib/utils';
import SmsConsentModal from './SmsConsentModal';

const smToggles = [
  { label: 'Work Order Updates', col: 'opt_in_work_orders', description: 'Status updates while your stone is with us' },
  { label: 'Tracking Updates', col: 'opt_in_tracking', description: 'Shipping and delivery notifications' },
  { label: 'Chat Message Alerts', col: 'opt_in_chat', description: 'Alerts when you have a new message' },
  { label: 'Purchase Confirmations', col: 'opt_in_purchases', description: 'Confirmations when a purchase completes' },
  { label: 'New Gem Listings', col: 'opt_in_new_listings', description: 'Notify me when new gems are listed' },
];

interface Props {
  editProfile: any;
  profile: any;
  profileSaving: boolean;
  profileFlash: boolean;
  hasProfileChanges: boolean;
  invoiceCount: number;
  invoiceTotal: number;
  smsPrefs: any;
  hasOpenWorkOrder?: boolean;
  setEditProfile: (v: any) => void;
  saveProfile: () => void;
  toggleSms: (col: string, val: boolean) => void;
}

function PillToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: '52px',
        height: '28px',
        borderRadius: '999px',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
        background: checked ? 'var(--accent)' : 'var(--border)',
        transition: 'background 220ms ease',
        outline: 'none',
      }}
    >
      <span style={{
        position: 'absolute',
        top: '3px',
        left: checked ? '27px' : '3px',
        width: '22px',
        height: '22px',
        borderRadius: '999px',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        transition: 'left 220ms ease',
        display: 'block',
      }} />
    </button>
  );
}

export default function HomeTab({
  editProfile, profile, profileSaving, profileFlash, hasProfileChanges,
  invoiceCount, invoiceTotal, smsPrefs, hasOpenWorkOrder,
  setEditProfile, saveProfile, toggleSms,
}: Props) {
  const [pendingToggle, setPendingToggle] = useState<{ label: string; col: string } | null>(null);

  return (
    <div style={{ padding: '28px' }}>
      {pendingToggle && (
        <SmsConsentModal
          toggle={pendingToggle}
          hasOpenWorkOrder={hasOpenWorkOrder}
          onConfirm={() => {
            toggleSms(pendingToggle.col, true);
            setPendingToggle(null);
          }}
          onCancel={() => setPendingToggle(null)}
        />
      )}

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text)', marginBottom: '24px', fontWeight: 400 }}>Profile</h2>

      {editProfile && (
        <div style={{ display: 'grid', gap: '12px', maxWidth: '500px' }}>
          {[
            { label: 'Name', key: 'name', placeholder: 'Full name' },
            { label: 'Email', key: 'email', placeholder: 'Email' },
            { label: 'Phone', key: 'phone', placeholder: 'Phone' },
            { label: 'Shipping Address', key: 'shipping_address', placeholder: 'Address' },
            { label: 'Business Name', key: 'business_name', placeholder: 'Add business name' },
          ].map(f => (
            <div key={f.key}>
              <label className="acc-label">{f.label}</label>
              <input
                className="acc-input"
                value={editProfile[f.key] || ''}
                placeholder={f.placeholder}
                onChange={e => setEditProfile({ ...editProfile, [f.key]: e.target.value })}
              />
            </div>
          ))}
          {hasProfileChanges && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button className="acc-btn-gold" onClick={saveProfile} disabled={profileSaving}>
                {profileSaving ? 'Saving...' : 'Save'}
              </button>
              <button className="acc-btn-ghost" onClick={() => setEditProfile({ ...profile })}>Cancel</button>
            </div>
          )}
          {profileFlash && <span style={{ color: 'var(--accent)', fontSize: '11px' }}>✓ Saved</span>}
        </div>
      )}

      {/* Purchase stats */}
      <div style={{ marginTop: '32px', padding: '20px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '19px', color: 'rgb(48, 177, 98)' }}>{invoiceCount}</span>
        <span style={{ fontSize: '17px', color: 'var(--text-muted)', marginLeft: '8px' }}>items purchased</span>
        <span style={{ margin: '0 12px', color: 'var(--border)' }}>|</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'rgb(48, 177, 98)' }}>{invoiceTotal}</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>total spent</span>
      </div>

      {/* SMS Preferences */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: 'var(--text-muted)',
          marginBottom: '16px',
        }}>
          Notification Preferences
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
        }}>
          {smToggles.map(t => {
            const isOn = !!smsPrefs?.[t.col];
            return (
              <div
                key={t.col}
                onClick={() => {
                  if (isOn) {
                    toggleSms(t.col, false);
                  } else {
                    setPendingToggle(t);
                  }
                }}
                style={{
                  background: 'var(--bg-deep)',
                  border: `1px solid ${isOn ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '999px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'border-color 220ms ease, background 220ms ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isOn ? 'var(--accent)' : 'var(--text)',
                    transition: 'color 220ms ease',
                  }}>
                    {t.label}
                  </span>
                  <PillToggle
                    checked={isOn}
                    onChange={(v) => {
                      if (!v) {
                        toggleSms(t.col, false);
                      } else {
                        setPendingToggle(t);
                      }
                    }}
                  />
                </div>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.55,
                  margin: 0,
                }}>
                  {t.description}
                </p>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px', lineHeight: 1.65 }}>
          SMS alerts are sent to your phone number on file. Message & data rates may apply. Reply STOP to any message to opt out. For help reply HELP.
        </p>
      </div>
    </div>
  );
}
