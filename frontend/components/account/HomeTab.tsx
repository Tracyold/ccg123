import { useState } from 'react';
import { formatMoney } from '../../lib/utils';
import SmsConsentModal from './SmsConsentModal';

const smToggles = [
  { label: 'Work Order Updates', col: 'opt_in_work_orders' },
  { label: 'Tracking Updates', col: 'opt_in_tracking' },
  { label: 'Chat Message Alerts', col: 'opt_in_chat' },
  { label: 'Purchase Confirmations', col: 'opt_in_purchases' },
  { label: 'New Gem Listings', col: 'opt_in_new_listings' },
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

      <h2 style={{ fontFamily: "'comfortaa', serif", fontSize: '24px', color: '#FAFAFA', marginBottom: '24px' }}>Profile</h2>
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
              <input className="acc-input" value={editProfile[f.key] || ''} placeholder={f.placeholder}
                onChange={e => setEditProfile({ ...editProfile, [f.key]: e.target.value })} />
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
          {profileFlash && <span style={{ color: '#d4af37', fontSize: '11px' }}>✓ Saved</span>}
        </div>
      )}

      {/* Purchase stats */}
      <div style={{ marginTop: '32px', padding: '20px', background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: '19px', color: 'rgb(48, 177, 98)' }}>{invoiceCount}</span>
        <span style={{ fontSize: '17px', color: 'rgba(255,255,255,0.55)', marginLeft: '8px' }}>items purchased</span>
        <span style={{ margin: '0 12px', color: 'rgba(255,255,255,0.15)' }}>|</span>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: '18px', color: 'rgb(48, 177, 98)' }}>{invoiceTotal}</span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginLeft: '8px' }}>total spent</span>
      </div>

      {/* SMS Preferences */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.55)', marginBottom: '16px' }}>Notification Preferences</h3>
        {smToggles.map(t => (
          <div key={t.col} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{t.label}</span>
            <button
              onClick={() => {
                if (smsPrefs?.[t.col]) {
                  toggleSms(t.col, false);
                } else {
                  setPendingToggle(t);
                }
              }}
              style={{
                width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer', position: 'relative',
                background: smsPrefs?.[t.col] ? '#d4af37' : 'rgba(255,255,255,0.12)', transition: 'background 200ms',
              }}
            >
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px',
                left: smsPrefs?.[t.col] ? '21px' : '3px', transition: 'left 200ms',
              }} />
            </button>
          </div>
        ))}
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '12px', lineHeight: 1.65 }}>
          SMS alerts are sent to your phone number on file. Message & data rates may apply. Reply STOP to any message to opt out. For help reply HELP.
        </p>
      </div>
    </div>
  );
}
