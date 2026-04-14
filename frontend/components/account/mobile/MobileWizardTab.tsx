import { useState, useEffect } from 'react'
import WizardLauncher from '../WizardLauncher'

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  isOpen:  boolean
  onClose: () => void
  session: any
}

// ── Component ──────────────────────────────────────────────────────────────

export default function MobileWizardTab({ isOpen, onClose, session }: Props) {
  const [tipVisible, setTipVisible] = useState(false)
  const [tipShown,   setTipShown]   = useState(false)

  // ── Show wiz tip once on first open ──
  useEffect(() => {
    if (!isOpen || tipShown) return
    setTipShown(true)
    const showTimer = setTimeout(() => setTipVisible(true), 600)
    const hideTimer = setTimeout(() => setTipVisible(false), 5600)
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer) }
  }, [isOpen])

  return (
    <>
      <style>{`
        .slide-panel{position:fixed;left:0;right:0;max-width:430px;margin:0 auto;top:0;bottom:62px;z-index:105;background:var(--bg);display:flex;flex-direction:column;transform:translateY(100%);transition:transform 420ms cubic-bezier(0.16,1,0.3,1)}
        .slide-panel.open{transform:translateY(0)}
        .panel-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--bg-deep);border-bottom:0.5px solid var(--bdr2);flex-shrink:0}
        .panel-title{font-family:var(--font-mono);font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:var(--text-muted)}
        .panel-close{background:none;border:none;color:var(--text-muted);font-size:16px;cursor:pointer;padding:2px 6px}
        .wiz-tip{position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);max-width:320px;width:calc(100% - 32px);background:var(--bg-deep);border:0.5px solid var(--bdr2);border-left:2px solid var(--gold);padding:13px 16px;z-index:600;opacity:0;pointer-events:none;transition:opacity 300ms ease,transform 300ms ease;display:flex;align-items:flex-start;gap:12px}
        .wiz-tip.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:all}
        .wiz-tip-icon{color:var(--gold);font-size:14px;flex-shrink:0;margin-top:1px}
        .wiz-tip-text{font-family:var(--font-ui);font-size:12px;color:var(--text-muted);line-height:1.6;flex:1}
        .wiz-tip-text strong{color:var(--text);font-weight:500}
        .wiz-tip-close{background:none;border:none;color:var(--text-muted);font-size:13px;cursor:pointer;flex-shrink:0;padding:0;line-height:1;margin-top:1px}
      `}</style>

      {/* ── Panel ── */}
      <div className={`slide-panel ${isOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <span className="panel-title">Cut Feasibility Wizard</span>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>

        {/* WizardLauncher handles terms check via wizard_terms_accepted in account_users,
            step navigation, auto-select logic, and results saving to wizard_results table */}
        {isOpen && (
          <WizardLauncher
            session={session}
            onClose={onClose}
          />
        )}
      </div>

      {/* ── Wiz tip toast — shows once on first open ── */}
      <div className={`wiz-tip ${tipVisible ? 'show' : ''}`}>
        <span className="wiz-tip-icon">✦</span>
        <span className="wiz-tip-text">
          <strong>Tip:</strong> Toggle &ldquo;Skip wizard intro screen&rdquo; in{' '}
          <strong>Menu → Profile</strong> so you don&rsquo;t have to accept terms each time.
        </span>
        <button className="wiz-tip-close" onClick={() => setTipVisible(false)}>✕</button>
      </div>
    </>
  )
}