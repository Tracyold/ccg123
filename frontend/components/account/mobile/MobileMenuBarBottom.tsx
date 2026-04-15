import type { PanelName } from '../shared/hooks/usePanel'

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  activePanel:  PanelName | null
  chatUnread:   boolean
  onOpenPanel:  (name: PanelName) => void
  onOpenMenu:   () => void
}

// ── Component ──────────────────────────────────────────────────────────────

export default function MobileMenuBarBottom({
  activePanel, chatUnread, onOpenPanel, onOpenMenu,
}: Props) {
  return (
    <>
      <style>{`
        .tab-bar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:100%;background:var(--bg-deep);border-top:0.5px solid var(--bdr2);display:flex;justify-content:space-around;align-items:center;padding:10px 0 calc(20px + env(safe-area-inset-bottom));z-index:110}        .tab{display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;padding:2px 14px;position:relative}
        .tab-icon{font-size:17px;opacity:0.45;transition:all 180ms ease}
        .tab-lbl{font-family:var(--font-mono);font-size:7.5px;letter-spacing:0.14em;text-transform:uppercase;color:var(--text-muted);transition:all 180ms ease}
        .tab.active .tab-icon{opacity:1}
        .tab.active .tab-lbl{color:var(--gold)}
        .tab-dot{position:absolute;top:0;right:8px;width:5px;height:5px;border-radius:50%;background:var(--gold)}
      `}</style>

      <div className="tab-bar">

        {/* Menu */}
        <div className={`tab ${activePanel === 'menu' ? 'active' : ''}`} onClick={onOpenMenu}>
          <div className="tab-icon">☰</div>
          <div className="tab-lbl">Menu</div>
        </div>

        {/* Chat */}
        <div
          className={`tab ${activePanel === 'chat' ? 'active' : ''}`}
          onClick={() => onOpenPanel('chat')}
          style={{ position: 'relative' }}
        >
          {chatUnread && <div className="tab-dot" />}
          <div
            className="tab-icon"
            style={{ color: activePanel === 'chat' || chatUnread ? 'var(--gold)' : undefined, opacity: chatUnread ? 1 : undefined }}
          >✉</div>
          <div
            className="tab-lbl"
            style={{ color: activePanel === 'chat' || chatUnread ? 'var(--gold)' : undefined }}
          >Chat</div>
        </div>

        {/* Invoices */}
        <div className={`tab ${activePanel === 'invoices' ? 'active' : ''}`} onClick={() => onOpenPanel('invoices')}>
          <div className="tab-icon">◈</div>
          <div className="tab-lbl">Invoices</div>
        </div>

        {/* Theme */}
        <div className="tab" onClick={() => {
          const root = document.documentElement
          root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'
        }}>
          <div className="tab-icon">◐</div>
          <div className="tab-lbl">Theme</div>
        </div>

      </div>
    </>
  )
}