import type { PanelName } from '../shared/hooks/usePanel'

interface Props {
  isOpen:      boolean
  onClose:     () => void
  onNavigate:  (name: PanelName) => void
  activePanel: PanelName | null
}

const MENU_ITEMS: { label: string; panel: PanelName; color: string }[] = [
  { label: 'Dashboard',        panel: 'dashboard',       color: 'var(--gold)'         },
  { label: 'Work Orders',      panel: 'workorders',      color: 'var(--tile-orders)'  },
  { label: 'Invoices',         panel: 'invoices',        color: 'var(--tile-invoice)' },
  { label: 'Wizard',           panel: 'wizard',          color: 'var(--tile-feasib)'  },
  { label: 'Results',          panel: 'results',         color: 'var(--tile-feasib)'  },
  { label: 'Service Requests', panel: 'servicerequests', color: 'var(--gold)'         },
  { label: 'Inquiries',        panel: 'inquiries',       color: 'var(--tile-est)'     },
  { label: 'Profile',          panel: 'profile',         color: '#888'                },
]

export default function MobileHamburgerMenu({ isOpen, onClose, onNavigate, activePanel }: Props) {
  const handleNav = (panel: PanelName) => { onNavigate(panel); onClose() }

  return (
    <>
      <style>{`
        .menu-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:400;opacity:0;pointer-events:none;transition:opacity 280ms ease}
        .menu-overlay.open{opacity:1;pointer-events:all}
        .menu-drawer{position:fixed;bottom:0;left:0;right:0;max-width:430px;margin:0 auto;background:var(--bg-deep);border-top:0.5px solid var(--bdr2);border-radius:12px 12px 0 0;z-index:401;transform:translateY(100%);transition:transform 360ms cubic-bezier(0.16,1,0.3,1);padding-bottom:32px}
        .menu-drawer.open{transform:translateY(0)}
        .menu-drawer-handle{width:36px;height:4px;border-radius:2px;background:var(--bdr2);margin:12px auto 0}
        .menu-drawer-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 10px}
        .menu-drawer-title{font-family:var(--font-mono);font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:var(--text-muted)}
        .menu-drawer-close{background:none;border:0.5px solid var(--bdr2);color:var(--text-muted);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;transition:all 160ms ease}
        .menu-drawer-close:hover{border-color:var(--text);color:var(--text)}
        .menu-items{padding:4px 0 8px}
        .menu-item{display:flex;align-items:center;gap:16px;padding:16px 22px;cursor:pointer;transition:background 160ms ease;border-bottom:0.5px solid var(--bdr2)}
        .menu-item:last-child{border-bottom:none}
        .menu-item:hover{background:rgba(255,255,255,0.03)}
        .menu-item-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
        .menu-item-label{font-family:var(--font-display);font-size:20px;color:var(--text);letter-spacing:0.02em;flex:1}
        .menu-item-arrow{font-size:12px;color:var(--text-muted);opacity:0.35}
      `}</style>

      <div className={`menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

      <div className={`menu-drawer ${isOpen ? 'open' : ''}`}>
        <div className="menu-drawer-handle" />
        <div className="menu-drawer-head">
          <span className="menu-drawer-title">Navigate</span>
          <button className="menu-drawer-close" onClick={onClose}>✕</button>
        </div>
        <div className="menu-items">
          {MENU_ITEMS.map(item => (
            <div key={item.panel} className="menu-item" onClick={() => handleNav(item.panel)}>
              <div
                className="menu-item-dot"
                style={{ background: activePanel === item.panel ? item.color : 'var(--accent)' }}
              />
              <span className="menu-item-label">{item.label}</span>
              <span className="menu-item-arrow">→</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}