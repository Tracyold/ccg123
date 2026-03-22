import { useState } from 'react';
import { formatMoney } from '../../lib/utils';
import SmsConsentModal from './SmsConsentModal';
import { Switch } from '@/components/ui/switch';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field';


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

      <h2 style={{ fontFamily: "'comfortaa', serif", fontSize: '24px', color: 'var(--text)', marginBottom: '24px' }}>Profile</h2>
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
        <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '17px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-muted)', marginBottom: '16px' }}>Notification Preferences</h3>
        <FieldGroup className="w-full">
          {smToggles.map(t => {
            const descriptions: Record<string, string> = {
              opt_in_work_orders:  'Status updates while your stone is with us',
              opt_in_tracking:     'Shipping and delivery notifications',
              opt_in_chat:         'Alerts when you have a new message',
              opt_in_purchases:    'Confirmations when a purchase completes',
              opt_in_new_listings: 'Notify me when new gems are listed',
            };
            return (
              <FieldLabel key={t.col} htmlFor={t.col}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{t.label}</FieldTitle>
                    <FieldDescription>{descriptions[t.col]}</FieldDescription>
                  </FieldContent>
                  <Switch
                    id={t.col}
                    checked={!!smsPrefs?.[t.col]}
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        toggleSms(t.col, false);
                      } else {
                        setPendingToggle(t);
                      }
                    }}
                  />
                </Field>
              </FieldLabel>
            );
          })}
        </FieldGroup>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', lineHeight: 1.65 }}>
          SMS alerts are sent to your phone number on file. Message & data rates may apply. Reply STOP to any message to opt out. For help reply HELP.
        </p>
      </div>
    </div>
  );
}
