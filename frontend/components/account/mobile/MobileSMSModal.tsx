import { useState } from 'react'
import {
  SMS_TOGGLES,
  type SmsToggle,
} from '../shared/1HomeView'
import {
  useSmsConsentModal,
  PRIVACY_FOOTER,
  CHECKBOX_LABEL,
} from '../shared/1SmsConsentView'

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  isOpen:          boolean
  onClose:         () => void
  smsPrefs:        any
  hasOpenWorkOrder:boolean
  toggleSms:       (col: string, val: boolean) => void
}

// ── Consent Modal sub-component ────────────────────────────────────────────

function ConsentModal({ toggle, onConfirm, onCancel }: {
  toggle:    SmsToggle
  onConfirm: () => void
  onCancel:  () => void
}) {
  const { checked, copy, toggleChecked, handleConfirm } = useSmsConsentModal(toggle, onConfirm)

  return (
    <>
      <div
        className="sms-consent-overlay open"
        onClick={onCancel}
      />
      <div className="sms-consent-modal open">
        <div className="sms-handle" />
        <div className="sms-mhead">
          <span className="sms-mtitle">{copy.title}</span>
          <button className="sms-mclose" onClick={onCancel}>✕</button>
        </div>
        <div style={{ padding: '20px 20px 32px' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.75, color: 'var(--text-muted)', marginBottom: 16 }}>
            {copy.body}
          </p>

          {copy.requirement && (
            <div style={{ background: 'rgba(255,211,105,0.08)', border: '1px solid rgba(255,211,105,0.25)', padding: '15px 19px', marginBottom: 16 }}>
              <p style={{ fontSize: 12, lineHeight: 1.75, color: 'var(--gold)', margin: 0 }}>
                {copy.requirement}
              </p>
            </div>
          )}

          <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text-muted)', marginBottom: 20 }}>
            {PRIVACY_FOOTER}
          </p>

          <div
            onClick={toggleChecked}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 11, marginBottom: 24, cursor: 'pointer' }}
          >
            <div style={{
              width: 19, height: 19, borderRadius: 3, flexShrink: 0, marginTop: 1,
              border: '1px solid rgba(224,176,20,0.5)',
              background: checked ? '#e5c55c' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 200ms',
            }}>
              {checked && <span style={{ color: 'var(--bg)', fontSize: 15, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.65 }}>
              {CHECKBOX_LABEL}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onCancel}
              style={{ flex: 1, padding: 14, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              style={{
                flex: 2, padding: 14,
                background: checked ? 'var(--gold)' : 'rgba(255,211,105,0.2)',
                border: 'none',
                color: checked ? '#000000e9' : 'rgba(255,210,11,0.3)',
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                cursor: checked ? 'pointer' : 'not-allowed',
                transition: 'all 300ms',
              }}
            >
              Enable Notifications
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Component ──────────────────────────────────────────────────────────────

export default function MobileSMSModal({
  isOpen, onClose, smsPrefs, hasOpenWorkOrder, toggleSms,
}: Props) {
  const [pendingToggle, setPendingToggle] = useState<SmsToggle | null>(null)

  const handleToggleClick = (t: SmsToggle) => {
    const isOn = !!smsPrefs?.[t.col]
    if (isOn) {
      toggleSms(t.col, false)
    } else {
      setPendingToggle(t)
    }
  }

  const handleConfirm = () => {
    if (!pendingToggle) return
    toggleSms(pendingToggle.col, true)
    setPendingToggle(null)
  }

  return (
    <>
      <style>{`
        .sms-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:300;opacity:0;pointer-events:none;transition:opacity 240ms ease}
        .sms-overlay.open{opacity:1;pointer-events:all}
        .sms-modal{position:fixed;bottom:0;left:0;right:0;max-width:100%;margin:0 auto;background:var(--bg-deep);border-top:0.5px solid var(--bdr2);border-radius:10px 10px 0 0;z-index:301;transform:translateY(100%);transition:transform 360ms cubic-bezier(0.16,1,0.3,1);padding-bottom:32px;max-height:85vh;overflow-y:auto}
        .sms-modal.open{transform:translateY(0)}
        .sms-handle{width:36px;height:4px;border-radius:2px;background:var(--bdr2);margin:12px auto 0}
        .sms-mhead{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 12px;border-bottom:0.5px solid var(--bdr2)}
        .sms-mtitle{font-family:var(--font-mono);font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:var(--text-muted)}
        .sms-mclose{background:none;border:none;color:var(--text-muted);font-size:16px;cursor:pointer;padding:2px 6px}
        .sms-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 20px;border-bottom:0.5px solid var(--bdr2);cursor:pointer;transition:background 160ms ease}
        .sms-row:hover{background:rgba(255,255,255,0.025)}
        .sms-row:last-of-type{border-bottom:none}
        .sms-lbl{font-family:var(--font-ui);font-size:13px;font-weight:500;color:var(--text);letter-spacing:0.02em;margin-bottom:3px;transition:color 200ms ease}
        .sms-lbl.on{color:var(--gold)}
        .sms-desc{font-family:var(--font-ui);font-size:11px;color:var(--text-muted);line-height:1.45}
        .sms-note{font-family:var(--font-ui);font-size:10px;color:var(--text-muted);padding:14px 20px 0;line-height:1.65;opacity:0.7}
        .pill{width:44px;height:24px;border-radius:999px;border:none;cursor:pointer;position:relative;flex-shrink:0;transition:background 200ms ease;outline:none}
        .pill.on{background:var(--gold)}
        .pill.off{background:var(--bdr2)}
        .pill-thumb{position:absolute;top:2px;width:20px;height:20px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:left 200ms ease;display:block}
        .pill.on .pill-thumb{left:22px}
        .pill.off .pill-thumb{left:2px}
        .sms-consent-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:400;opacity:0;pointer-events:none;transition:opacity 240ms ease}
        .sms-consent-overlay.open{opacity:1;pointer-events:all}
        .sms-consent-modal{position:fixed;bottom:0;left:0;right:0;max-width:430px;margin:0 auto;background:var(--bg-deep);border-top:0.5px solid var(--bdr2);border-radius:10px 10px 0 0;z-index:401;transform:translateY(100%);transition:transform 360ms cubic-bezier(0.16,1,0.3,1);max-height:90vh;overflow-y:auto}
        .sms-consent-modal.open{transform:translateY(0)}
      `}</style>

      {/* ── Overlay ── */}
      <div className={`sms-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

      {/* ── Modal ── */}
      <div className={`sms-modal ${isOpen ? 'open' : ''}`}>
        <div className="sms-handle" />
        <div className="sms-mhead">
          <span className="sms-mtitle">SMS Notifications</span>
          <button className="sms-mclose" onClick={onClose}>✕</button>
        </div>

        {SMS_TOGGLES.map(t => {
          const isOn = !!smsPrefs?.[t.col]
          return (
            <div
              key={t.col}
              className="sms-row"
              onClick={() => handleToggleClick(t)}
            >
              <div>
                <div className={`sms-lbl ${isOn ? 'on' : ''}`}>{t.label}</div>
                <div className="sms-desc">{t.description}</div>
              </div>
              <button
                className={`pill ${isOn ? 'on' : 'off'}`}
                onClick={e => { e.stopPropagation(); handleToggleClick(t) }}
              >
                <span className="pill-thumb" />
              </button>
            </div>
          )
        })}

        <p className="sms-note">
          Sent to your phone on file. Msg &amp; data rates may apply. Reply STOP to opt out.
        </p>
      </div>

      {/* ── Consent Modal ── */}
      {pendingToggle && (
        <ConsentModal
          toggle={pendingToggle}
          onConfirm={handleConfirm}
          onCancel={() => setPendingToggle(null)}
        />
      )}
    </>
  )
}