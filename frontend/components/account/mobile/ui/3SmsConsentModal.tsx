// components/account/mobile/ui/3SmsConsentModal.tsx

interface SmsToggle {
  label: string;
  col:   string;
  description?: string;
  desc?: string;
}

interface SmsConsentModalProps {
  toggle:           SmsToggle;
  hasOpenWorkOrder: boolean;
  onConfirm:        () => void;
  onCancel:         () => void;
}

export default function SmsConsentModal3({
  toggle, hasOpenWorkOrder, onConfirm, onCancel,
}: SmsConsentModalProps) {
  return (
    <>
      <div className="sms-overlay open" onClick={onCancel} />
      <div className="sms-modal open">
        <div className="sms-handle" />
        <div className="sms-mhead">
          <span className="sms-mtitle">Enable SMS Alerts</span>
          <button className="sms-mclose" onClick={onCancel}>✕</button>
        </div>
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '1.25rem',
            fontStyle: 'italic', color: 'var(--text)', marginBottom: 8, lineHeight: 1.3,
          }}>
            {toggle.label}
          </div>
          <div style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.8125rem',
            color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20,
          }}>
            {toggle.description || toggle.desc}
            {hasOpenWorkOrder && toggle.col === 'opt_in_work_orders' && (
              <span style={{ display: 'block', marginTop: 8, color: 'var(--gold)' }}>
                You have an active work order -- enabling this keeps you updated on its progress.
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 32 }}>
            <button onClick={onConfirm} style={{
              background: 'var(--gold)', color: 'var(--bg-deep)', border: 'none',
              padding: 14, fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
              letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer',
            }}>
              Enable SMS Alerts
            </button>
            <button onClick={onCancel} style={{
              background: 'transparent', color: 'var(--text-muted)',
              border: '0.5px solid var(--bdr2)', padding: 13,
              fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
              letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer',
            }}>
              Cancel
            </button>
          </div>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.625rem',
            color: 'var(--text-muted)', lineHeight: 1.65, opacity: 0.7, paddingBottom: 20,
          }}>
            SMS alerts are sent to your phone number on file. Message &amp; data rates may apply.
            Reply STOP to opt out.
          </p>
        </div>
      </div>
    </>
  );
}