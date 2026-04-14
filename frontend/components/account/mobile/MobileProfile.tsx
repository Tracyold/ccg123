import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import {
  PROFILE_FIELDS,
  SMS_FOOTER_TEXT,
} from '../shared/1HomeView'

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  isOpen:              boolean
  onClose:             () => void
  profile:             any
  editProfile:         any
  profileSaving:       boolean
  profileFlash:        boolean
  hasProfileChanges:   boolean
  setEditProfile:      (v: any) => void
  onSave:              () => void
  session:             any
  showDeleteModal:     boolean
  deleteConfirmText:   string
  deleteError:         string
  deleting:            boolean
  setShowDeleteModal:  (v: boolean) => void
  setDeleteConfirmText:(v: string) => void
  onDeleteAccount:     () => void
  onSignOut:           () => void
}

// ── Component ──────────────────────────────────────────────────────────────

export default function MobileProfile({
  isOpen, onClose,
  profile, editProfile, profileSaving, profileFlash,
  hasProfileChanges, setEditProfile, onSave,
  session,
  showDeleteModal, deleteConfirmText, deleteError, deleting,
  setShowDeleteModal, setDeleteConfirmText,
  onDeleteAccount, onSignOut,
}: Props) {

  const [wizTermsOn,      setWizTermsOn]      = useState(!!profile?.wizard_terms_accepted)
  const [termsModalOpen,  setTermsModalOpen]  = useState(false)
  const [termsChecked,    setTermsChecked]    = useState(false)
  const [termsSaving,     setTermsSaving]     = useState(false)

  // ── Wizard terms toggle ──
  const handleWizTermsToggle = async () => {
    if (wizTermsOn) {
      // Turning off — update DB
      setWizTermsOn(false)
      if (session) {
        await supabase
          .from('account_users')
          .update({ wizard_terms_accepted: false })
          .eq('account_user_id', session.user.id)
      }
    } else {
      // Turning on — show terms modal first
      setTermsChecked(false)
      setTermsModalOpen(true)
    }
  }

  const handleConfirmTerms = async () => {
    if (!termsChecked) return
    setTermsSaving(true)
    if (session) {
      await supabase
        .from('account_users')
        .update({ wizard_terms_accepted: true })
        .eq('account_user_id', session.user.id)
    }
    setWizTermsOn(true)
    setTermsSaving(false)
    setTermsModalOpen(false)
  }

  return (
    <>
      <style>{`
        .slide-panel{position:fixed;left:0;right:0;max-width:430px;margin:0 auto;top:0;bottom:62px;z-index:105;background:var(--bg);display:flex;flex-direction:column;transform:translateY(100%);transition:transform 420ms cubic-bezier(0.16,1,0.3,1)}
        .slide-panel.open{transform:translateY(0)}
        .panel-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--bg-deep);border-bottom:0.5px solid var(--bdr2);flex-shrink:0}
        .panel-title{font-family:var(--font-mono);font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:var(--text-muted)}
        .panel-close{background:none;border:none;color:var(--text-muted);font-size:16px;cursor:pointer;padding:2px 6px}
        .profile-body{padding:24px 18px;overflow-y:auto;flex:1}
        .profile-field{margin-bottom:16px}
        .profile-label{font-family:var(--font-mono);font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--text-muted);margin-bottom:6px;display:block}
        .profile-input{width:100%;background:var(--bg-card);border:0.5px solid var(--bdr2);color:var(--text);font-family:var(--font-ui);font-size:14px;padding:10px 12px;outline:none;transition:border-color 150ms ease}
        .profile-input:focus{border-color:var(--gold)}
        .profile-save{width:100%;background:var(--gold);color:var(--bg-deep);border:none;padding:13px;font-family:var(--font-mono);font-size:10px;letter-spacing:0.2em;text-transform:uppercase;cursor:pointer;margin-top:8px;transition:opacity 180ms ease}
        .profile-save:hover{opacity:0.85}
        .profile-save:disabled{opacity:0.4;cursor:not-allowed}
        .pill{width:44px;height:24px;border-radius:999px;border:none;cursor:pointer;position:relative;flex-shrink:0;transition:background 200ms ease;outline:none}
        .pill.on{background:var(--gold)}
        .pill.off{background:var(--bdr2)}
        .pill-thumb{position:absolute;top:2px;width:20px;height:20px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:left 200ms ease;display:block}
        .pill.on .pill-thumb{left:22px}
        .pill.off .pill-thumb{left:2px}
        .wiz-terms-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:400;opacity:0;pointer-events:none;transition:opacity 240ms ease}
        .wiz-terms-overlay.open{opacity:1;pointer-events:all}
        .wiz-terms-modal{position:fixed;bottom:0;left:0;right:0;max-width:430px;margin:0 auto;background:var(--bg-deep);border-top:0.5px solid var(--bdr2);border-radius:10px 10px 0 0;z-index:401;transform:translateY(100%);transition:transform 360ms cubic-bezier(0.16,1,0.3,1);padding:0 0 32px;max-height:88vh;overflow-y:auto}
        .wiz-terms-modal.open{transform:translateY(0)}
        .sms-handle{width:36px;height:4px;border-radius:2px;background:var(--bdr2);margin:12px auto 0}
        .sms-mhead{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 12px;border-bottom:0.5px solid var(--bdr2)}
        .sms-mtitle{font-family:var(--font-mono);font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:var(--text-muted)}
        .sms-mclose{background:none;border:none;color:var(--text-muted);font-size:16px;cursor:pointer;padding:2px 6px}
        .dr-foot-btn{background:none;border:none;padding:0;text-align:left;font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--text-muted);cursor:pointer;transition:color 160ms ease;width:100%;margin-bottom:10px}
        .dr-foot-btn:hover{color:#f87171}
        .dr-foot-btn.danger{color:rgba(248,113,113,0.6)}
        .dr-foot-btn.danger:hover{color:#f87171}
        .delete-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:700;display:flex;align-items:center;justify-content:center;padding:24px}
        .delete-modal{background:var(--bg-deep);border:1px solid var(--bdr2);padding:40px;max-width:440px;width:100%}
      `}</style>

      {/* ── Panel ── */}
      <div className={`slide-panel ${isOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <span className="panel-title">Profile</span>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>

        <div className="profile-body">

          {/* Profile fields */}
          {editProfile && PROFILE_FIELDS.map(f => (
            <div className="profile-field" key={f.key}>
              <label className="profile-label">{f.label}</label>
              <input
                className="profile-input"
                value={editProfile[f.key] || ''}
                placeholder={f.placeholder}
                onChange={e => setEditProfile({ ...editProfile, [f.key]: e.target.value })}
              />
            </div>
          ))}

          {/* Save button */}
          {hasProfileChanges && (
            <button
              className="profile-save"
              onClick={onSave}
              disabled={profileSaving}
            >
              {profileSaving ? 'Saving...' : 'Save Changes'}
            </button>
          )}

          {profileFlash && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--tile-feasib)', letterSpacing: '0.16em', textTransform: 'uppercase', display: 'block', marginTop: 8 }}>
              ✓ Saved
            </span>
          )}

          {/* Wizard Preferences */}
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: '0.5px solid var(--bdr2)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
              Wizard Preferences
            </div>

            <div
              onClick={handleWizTermsToggle}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer', padding: '12px 0' }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, color: wizTermsOn ? 'var(--gold)' : 'var(--text)', marginBottom: 3, transition: 'color 200ms ease' }}>
                  Skip wizard intro screen
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Jump straight to step 1 each time you open the wizard
                </div>
              </div>
              <button
                className={`pill ${wizTermsOn ? 'on' : 'off'}`}
                onClick={e => { e.stopPropagation(); handleWizTermsToggle() }}
              >
                <span className="pill-thumb" />
              </button>
            </div>

            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6, opacity: 0.7 }}>
              Turn off to see the terms screen again next time you open the wizard.
            </p>
          </div>

          {/* Account actions */}
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: '0.5px solid var(--bdr2)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
              Account
            </div>
            <button className="dr-foot-btn" onClick={onSignOut}>Sign Out</button>
            <button
              className="dr-foot-btn danger"
              onClick={() => { setShowDeleteModal(true); setDeleteConfirmText('') }}
            >
              Delete Account
            </button>
          </div>

        </div>
      </div>

      {/* ── Wizard Terms Modal ── */}
      <div className={`wiz-terms-overlay ${termsModalOpen ? 'open' : ''}`} onClick={() => setTermsModalOpen(false)} />
      <div className={`wiz-terms-modal ${termsModalOpen ? 'open' : ''}`}>
        <div className="sms-handle" />
        <div className="sms-mhead">
          <span className="sms-mtitle">Wizard Terms</span>
          <button className="sms-mclose" onClick={() => setTermsModalOpen(false)}>✕</button>
        </div>

        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontStyle: 'italic', color: 'var(--text)', marginBottom: 6, lineHeight: 1.3 }}>
            Before you skip the intro
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 18 }}>
            The Cut Feasibility Wizard provides an estimate based on the information you provide. Results are for reference only and do not constitute a professional assessment or guarantee of outcome.
          </p>

          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--bdr2)', padding: 16, marginBottom: 18 }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.75 }}>
              By enabling this setting you acknowledge that:<br /><br />
              · Results depend entirely on the accuracy of your inputs<br />
              · A high score does not guarantee a successful cut<br />
              · Cutting Corners Gems is not liable for decisions made based on wizard output<br />
              · A professional in-person evaluation is always recommended
            </p>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 20 }}>
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={e => setTermsChecked(e.target.checked)}
              style={{ marginTop: 3, flexShrink: 0, accentColor: 'var(--gold)', width: 16, height: 16 }}
            />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
              I understand and agree. skip the terms screen from now on
            </span>
          </label>

          <button
            disabled={!termsChecked || termsSaving}
            onClick={handleConfirmTerms}
            style={{
              width: '100%', background: termsChecked ? 'var(--gold)' : 'var(--border)',
              color: termsChecked ? 'var(--bg-deep)' : 'var(--text-muted)',
              border: 'none', padding: 14,
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              cursor: termsChecked ? 'pointer' : 'not-allowed',
              transition: 'all 200ms ease',
              opacity: termsChecked ? 1 : 0.4,
            }}
          >
            {termsSaving ? 'Saving...' : 'Confirm & Enable'}
          </button>

          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.6, opacity: 0.7, textAlign: 'center' }}>
            You can turn this off anytime from Profile settings.
          </p>
        </div>
      </div>

      {/* ── Delete Account Modal ── */}
      {showDeleteModal && (
        <div className="delete-overlay">
          <div className="delete-modal">
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(180,60,60,0.8)', marginBottom: 16 }}>
              Permanent Action
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 25, color: 'var(--text)', marginBottom: 16, lineHeight: 1.2 }}>
              Delete Account
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 28 }}>
              This will permanently delete your account. Any open work orders or invoices will remain on file. This cannot be undone.
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
              Type DELETE to confirm
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid rgba(180,60,60,0.3)', color: 'var(--text)', fontFamily: 'var(--font-ui)', fontSize: 13, padding: '12px 14px', marginBottom: 12, boxSizing: 'border-box', outline: 'none' }}
            />
            {deleteError && (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'rgba(220,80,80,0.9)', marginBottom: 12 }}>
                {deleteError}
              </p>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={onDeleteAccount}
                disabled={deleting}
                style={{ flex: 1, background: 'rgba(180,60,60,0.8)', border: 'none', color: 'var(--text)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', padding: 13, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.5 : 1 }}
              >
                {deleting ? 'Deleting...' : 'Delete My Account'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', padding: 13, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}