// components/account/mobile/panels/3ProfilePanel.tsx
// Converted from <!-- PROFILE PANEL --> in account-dashboard-v3.html
//
// HTML → JSX changes:
//   class=      → className=
//   onclick=    → onClick=
//   for=        → htmlFor=
//   style="..." → style={{ camelCase }}

import { formatMoney } from '../../../../lib/utils';
import { useSwipeDownToClose } from '../../shared/hooks/useSwipeDownToClose';
import FirstTimeTips from '../ui/FirstTimeTips';

const PROFILE_FIELDS = [
  { label: 'Full Name',        key: 'name',             placeholder: 'Full name'         },
  { label: 'Email',            key: 'email',            placeholder: 'Email address'     },
  { label: 'Phone',            key: 'phone',            placeholder: 'Phone number'      },
  { label: 'Shipping Address', key: 'shipping_address', placeholder: 'Shipping address'  },
  { label: 'Business Name',    key: 'business_name',    placeholder: 'Business name (optional)' },
] as const;

const SMS_TOGGLES = [
  { label: 'Work Order Updates',     col: 'opt_in_work_orders',  desc: 'Status updates while your stone is with us'  },
  { label: 'Chat Alerts',            col: 'opt_in_chat',         desc: 'Alerts when you have a new message'          },
  { label: 'Tracking Updates',       col: 'opt_in_tracking',     desc: 'Shipping and delivery notifications'         },
  { label: 'New Gem Listings',       col: 'opt_in_new_listings', desc: 'Notify when new gems are listed'             },
  { label: 'Purchase Confirmations', col: 'opt_in_purchases',    desc: 'Confirmations when a purchase completes'     },
];

interface ProfilePanelProps {
  open:              boolean;
  profile:           any;
  editProfile:       any;
  smsPrefs:          any;
  profileSaving:     boolean;
  profileFlash:      boolean;
  hasProfileChanges: boolean;
  invoiceCount:      number;
  invoiceTotal:      number;
  hasOpenWorkOrder:  boolean;
  setEditProfile:    (v: any) => void;
  saveProfile:       () => void;
  onSmsToggle:       (toggle: any) => void;
  onClose:           () => void;
  // Delete account logic from useDeleteAccount hook
  showDeleteModal:       boolean;
  setShowDeleteModal:    (v: boolean) => void;
  deleteConfirmText:     string;
  setDeleteConfirmText:  (v: string) => void;
  deleteError:           string;
  deleting:              boolean;
  onOpenDeleteModal:     () => void;
  onDeleteAccount:       () => Promise<void>;
}

// Pill toggle component -- the on/off switch
// pill, pill-thumb, pill.on, pill.off classes from MobileShell.css
function PillToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={e => { e.stopPropagation(); onChange(); }}
      className={`pill ${checked ? 'on' : 'off'}`}
    >
      <span className="pill-thumb" />
    </button>
  );
}

export default function ProfilePanel3({
  open, profile, editProfile, smsPrefs, profileSaving, profileFlash,
  hasProfileChanges, invoiceCount, invoiceTotal, hasOpenWorkOrder,
  setEditProfile, saveProfile, onSmsToggle, onClose,
  showDeleteModal, setShowDeleteModal, deleteConfirmText, setDeleteConfirmText,
  deleteError, deleting, onOpenDeleteModal, onDeleteAccount,
}: ProfilePanelProps) {
  const { elementRef, touchHandlers } = useSwipeDownToClose({ onClose });

  return (
    <div ref={elementRef} className={`slide-panel${open ? ' open' : ''}`}>
      <FirstTimeTips type="panel-down" show={open} />

      {/* Panel header */}
      <div className="panel-header" {...touchHandlers}>
        <span className="panel-title">Profile</span>
        <button className="panel-close" onClick={onClose}>✕</button>
      </div>

      {/* profile-body: scrollable content area */}
      <div className="profile-body">

        {/* ── Profile edit fields ── */}
        {/* Converted from the static input fields in the HTML */}
        {editProfile && PROFILE_FIELDS.map(f => (
          <div key={f.key} className="profile-field">
            {/* profile-label: uppercase mono label above each input */}
            <label className="profile-label" htmlFor={`pf-${f.key}`}>
              {f.label}
            </label>
            {/* profile-input: the text input */}
            <input
              id={`pf-${f.key}`}
              className="profile-input"
              value={editProfile[f.key] || ''}
              placeholder={f.placeholder}
              onChange={e => setEditProfile({ ...editProfile, [f.key]: e.target.value })}
            />
          </div>
        ))}

        {/* Save / Cancel buttons -- only shown when there are unsaved changes */}
        {hasProfileChanges && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              className="profile-save"
              onClick={saveProfile}
              disabled={profileSaving}
              style={{ flex: 1 }}
            >
              {profileSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setEditProfile({ ...profile })}
              style={{
                background: 'none', border: '0.5px solid var(--bdr2)',
                color: 'var(--text-muted)', padding: '13px 16px',
                fontFamily: 'var(--font-mono)', fontSize: '0.9375rem',
                letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Flash confirmation -- "✓ Saved" appears briefly after saving */}
        {profileFlash && (
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '1.0rem', color: 'var(--accent)', marginBottom: 16 }}>
            ✓ Saved
          </div>
        )}

        {/* ── Purchase stats block ── */}
        {/* Converted from the stats div in the HTML profile panel */}
        <div style={{
          background: 'var(--bg-card)', border: '0.5px solid var(--bdr2)',
          padding: 16, marginBottom: 28,
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5625rem', color: 'var(--accent)' }}>
            {invoiceCount}
          </span>
          <span style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', marginLeft: 8 }}>
            items purchased
          </span>
          <span style={{ margin: '0 10px', color: 'var(--bdr2)' }}>|</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1875rem', color: 'var(--accent)' }}>
            {formatMoney(invoiceTotal)}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginLeft: 8 }}>
            total spent
          </span>
        </div>

        {/* ── Wizard preferences toggle ── */}
        {/* Converted from the wizard terms toggle section in the HTML */}
        <div style={{ marginBottom: 28, paddingBottom: 22, borderBottom: '0.5px solid var(--bdr2)' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14,
          }}>
            Wizard Preferences
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>
                Skip wizard intro screen
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                Jump straight to step 1 each time you open the wizard
              </div>
            </div>
            {/* Wizard terms pill -- in production wire this to localStorage or Supabase */}
            <button className="pill off">
              <span className="pill-thumb" />
            </button>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6, opacity: 0.7 }}>
            Turn off to see the terms screen again next time you open the wizard.
          </p>
        </div>

        {/* ── SMS Notification toggles ── */}
        {/* Converted from the sms-row list in the SMS modal, adapted for the profile panel */}
        <div style={{ marginBottom: 8 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14,
          }}>
            SMS Notifications
          </div>

          {SMS_TOGGLES.map((t, i) => {
            const isOn = !!smsPrefs?.[t.col];
            return (
              // Each row: label on left, pill on right
              // Tapping anywhere on the row toggles it (or opens consent modal via onSmsToggle)
              <div
                key={t.col}
                onClick={() => onSmsToggle(t)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 14, padding: '14px 0', cursor: 'pointer',
                  borderBottom: i < SMS_TOGGLES.length - 1 ? '0.5px solid var(--bdr2)' : 'none',
                }}
              >
                <div>
                  {/* sms-lbl: the toggle label -- turns gold when on */}
                  <div className={`sms-lbl${isOn ? ' on' : ''}`}>{t.label}</div>
                  {/* sms-desc: the description below the label */}
                  <div className="sms-desc">{t.desc}</div>
                </div>
                <PillToggle checked={isOn} onChange={() => onSmsToggle(t)} />
              </div>
            );
          })}
        </div>

        {/* SMS footer note */}
        <p className="sms-note" style={{ paddingLeft: 0 }}>
          SMS alerts are sent to your phone number on file. Message &amp; data rates may apply.
          Reply STOP to any message to opt out. For help reply HELP.
        </p>

        {/* Delete account section */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '0.5px solid var(--bdr2)' }}>
          <button
            onClick={onOpenDeleteModal}
            style={{
              background: 'none', border: '0.5px solid rgba(248,113,113,0.3)',
              color: 'rgba(248,113,113,0.7)', width: '100%', padding: 13,
              fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', letterSpacing: '0.18em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Delete Account
          </button>
        </div>

      </div>{/* end profile-body */}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <>
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', zIndex: 20000,
            }}
            onClick={() => setShowDeleteModal(false)}
          />
          <div
            style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: 'var(--bg)', border: '1px solid var(--bdr2)', borderRadius: 8,
              padding: 24, maxWidth: 320, zIndex: 20001, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '1.0rem', fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>
              Delete Account?
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '1.0rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              style={{
                width: '100%', padding: 10, fontFamily: 'var(--font-ui)', fontSize: '1.0rem',
                border: '1px solid var(--bdr2)', borderRadius: 4, background: 'var(--bg-light)',
                color: 'var(--text)', marginBottom: 12, boxSizing: 'border-box',
              }}
            />
            {deleteError && (
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: '#f87171', marginBottom: 12 }}>
                {deleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1, padding: 10, fontFamily: 'var(--font-ui)', fontSize: '1.0rem',
                  border: '1px solid var(--bdr2)', background: 'var(--bg-light)', color: 'var(--text)',
                  borderRadius: 4, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={onDeleteAccount}
                disabled={deleting}
                style={{
                  flex: 1, padding: 10, fontFamily: 'var(--font-ui)', fontSize: '1.0rem',
                  border: 'none', background: '#f87171', color: 'white',
                  borderRadius: 4, cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}