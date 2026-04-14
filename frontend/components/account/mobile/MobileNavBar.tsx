import { useState } from 'react'

export default function MobileNavBar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleTheme = () => {
    const root = document.documentElement
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'
  }

  const openSiteMenu  = () => setMenuOpen(true)
  const closeSiteMenu = () => setMenuOpen(false)

  return (
    <>
      <style>{`
        .nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--bg-deep);border-bottom:0.5px solid var(--bdr2);position:relative}
        .nav-logo{font-family:var(--font-display);font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:var(--text);opacity:0.8}
        .nav-logo em{color:var(--gold);font-style:normal}
        .nav-right{display:flex;align-items:center;gap:8px}
        .icon-btn{background:transparent;border:0.5px solid var(--bdr2);color:var(--text-muted);width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;transition:all 180ms ease}
        .icon-btn.lg{width:44px;height:44px;font-size:18px}
        .icon-btn:hover{border-color:var(--gold);color:var(--gold)}
        .site-menu-overlay{position:fixed;inset:0;z-index:150;display:${menuOpen ? 'block' : 'none'}}
        .site-menu-dropdown{position:absolute;top:56px;right:14px;background:var(--bg-deep);border:0.5px solid var(--bdr2);min-width:210px;z-index:151;transform:${menuOpen ? 'translateY(0)' : 'translateY(-6px)'};opacity:${menuOpen ? 1 : 0};pointer-events:${menuOpen ? 'all' : 'none'};transition:opacity 200ms ease,transform 200ms ease}
        .site-menu-item{display:block;padding:18px 22px;font-family:var(--font-body);font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-muted);text-decoration:none;border-bottom:0.5px solid var(--bdr2);cursor:pointer;transition:color 160ms ease;background:none;border-left:none;border-right:none;border-top:none;width:100%;text-align:left}
        .site-menu-item:last-child{border-bottom:none}
        .site-menu-item:hover{color:var(--text)}
        .site-menu-item.auth{color:#f87171}
        .site-menu-item.auth:hover{color:#f87171}
      `}</style>

      <nav className="nav">
        <div className="nav-logo">CCG <em>·</em> Account</div>
        <div className="nav-right">
          <button className="icon-btn" onClick={toggleTheme}>◐</button>
          <button className="icon-btn lg" onClick={openSiteMenu}>☰</button>
        </div>
      </nav>

      <div className="site-menu-overlay" onClick={closeSiteMenu} />

      <div className="site-menu-dropdown">
        <a className="site-menu-item" href="/">Home</a>
        <a className="site-menu-item" href="/shop">Shop</a>
        <a className="site-menu-item" href="/portfolio">Portfolio</a>
        <a className="site-menu-item auth" href="/login">Sign In / Sign Out</a>
      </div>
    </>
  )
}