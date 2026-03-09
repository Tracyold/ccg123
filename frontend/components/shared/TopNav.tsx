import { useState, useEffect } from 'react';
import Link from 'next/link';

// ── TopNav — Cutting Corners Gems ────────────────────────────
// Absolutely positioned so it overlays the hero section.
// Transitions from transparent to solid dark on scroll.
// Mobile: hamburger drawer.
// Desktop: horizontal links.
// Auth-aware: shows "Account" if session exists, "Login" if not.
// ─────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Estimates', href: '/estimates' },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&family=Oranienbaum&display=swap');

.tnav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  transition: background 350ms ease, border-color 350ms ease, backdrop-filter 350ms ease;
  border-bottom: 0.5px solid transparent;
}
.tnav.scrolled {
  background: rgba(34,40,49,0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(19px);
  border-bottom-color: rgba(255, 255, 255, 0.73);
}
.tnav-brand {
  font-family: 'Comfortaa', Georgia, serif;
  font-size: 27px;
  font-weight: 650;
  color: var(--text)eb;
  text-decoration: none;
  letter-spacing: 0.05em;
  white-space: nowrap;
  transition: color 200ms ease;
}
.tnav-brand:hover { color: #f7c728; }
.tnav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}
.tnav-link {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 200ms ease;
  position: relative;
}
.tnav-link::after {
  content: '';
  position: absolute;
  bottom: -3px; left: 0; right: 100%;
  height: 0.5px;
  background: #d4af37;
  transition: right 220ms ease;
}
.tnav-link:hover { color: var(--text); }
.tnav-link:hover::after { right: 0; }
.tnav-auth {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #d4af37;
  text-decoration: none;
  border: 0.5px solid #d4af37;
  padding: 6px 14px;
  transition: all 200ms ease;
}
.tnav-auth:hover {
  background: rgba(212,175,55,0.08);
  border-color: #d4af37;
  color: #e5c84a;
}
.tnav-burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: auto;
  height: 36px;
  background: none;
  border: 0.5px solid var(--border);
  cursor: pointer;
  padding: 8px;
  transition: border-color 200ms ease;
}
.tnav-burger:hover { border-color: #ffcd27; }
.tnav-burger .bar {
  width: 100%;
  height: 1px;
  background: var(--text-muted);
  border-radius: 1.7px;
  transition: all 280ms ease;
  transform-origin: center;
}
.tnav-burger.open .bar:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.tnav-burger.open .bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
.tnav-burger.open .bar:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
.tnav-drawer {
  position: fixed;
  top: 56px; left: 0; right: 0;
  background: rgba(34,40,49,0.94);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 0.5px solid rgba(255,255,255,0.07);
  z-index: 99;
  display: flex;
  flex-direction: column;
  padding: 20px 28px 28px;
  gap: 1;
  transform: translateY(-8px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 240ms ease, transform 240ms ease;
}
.tnav-drawer.open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
.tnav-drawer-link {
  font-family: var(--font-body);
  font-size: 25px;
  font-weight: 500;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  padding: 17px 0;
  border-bottom: 0.5px solid var(--border);
  transition: color 180ms ease;
}
.tnav-drawer-link:hover { color: #f8e42f; }
.tnav-drawer-link:last-child { border-bottom: none; }
.tnav-drawer-auth {
  font-family: var(--font-body);
  font-size: 27px;
  font-weight: 500;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #ffe48c;
  text-decoration: none;
  padding: 18px 0 4px;
  margin-top: 4px;
  transition: color 180ms ease;
}
.tnav-drawer-auth:hover { color: #e5c84a; }

@media (max-width: 767px) {
  .tnav-links { display: none; }
  .tnav-auth-desktop { display: none; }
  .tnav-burger { display: flex; }
  .tnav { padding: 0 18px; }
}
@media (min-width: 768px) {
  .tnav-drawer { display: none !important; }
}
.tnav-theme {
  background: none;
  border: 0.5px solid var(--border);
  color: #EEEEEE;
  width: auto;
  height: 36px;
  cursor: pointer;
  font-size: 11px;
  letter-spacing: 0.15em;
  font-family: 'Montserrat', sans-serif;
  white-space: nowrap;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 200ms;
  position: relative;
  z-index: 201;
}
.tnav-theme:hover { border-color: #FFD369; }
`;

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('ccg-theme') as 'dark' | 'light' | null;
    const t = saved || 'dark'; setTheme(t as 'dark' | 'light'); document.documentElement.setAttribute('data-theme', t);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    document.body.style.background = '';
    document.body.offsetHeight; // force repaint
    localStorage.setItem('ccg-theme', next);
  };


  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

 // Auth detection — check Supabase session
useEffect(() => {
  let subscription: any;
  async function checkAuth() {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const guestId = process.env.NEXT_PUBLIC_GUEST_ACCOUNT_USER_ID;
      const { data: { session } } = await supabase.auth.getSession();
      setAuthed(!!session && session.user.id !== guestId);

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_e, s) => {
        setAuthed(!!s && s.user.id !== guestId);
      });
      subscription = sub;
    } catch {
      setAuthed(false);
    }
  }
  checkAuth();
  return () => { if (subscription) subscription.unsubscribe(); };
}, []);


  // Close drawer on outside click
  useEffect(() => {
    if (!drawerOpen) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.tnav')) setDrawerOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [drawerOpen]);

    const authHref = authed ? '/account' : '/login';
  const authLabel = authed ? 'Account' : 'Login';

  const handleAuthClick = async (e: React.MouseEvent) => {
    if (!authed) {
      e.preventDefault();
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <nav className={`tnav${scrolled ? ' scrolled' : ''}`}>
        {/* Brand */}
        <Link href="/" className="tnav-brand">Cutting Corners Gems</Link>

        {/* Desktop links */}
        <div className="tnav-links">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="tnav-link">{l.label}</Link>
          ))}
                    <Link href={authHref} className="tnav-auth tnav-auth-desktop" onClick={handleAuthClick}>{authLabel}</Link>

        </div>

        {/* Mobile burger */}
        <button className="tnav-theme" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '● Dark' : '○ Light'} [{typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : '?'}]
        </button>
        <button
          className={`tnav-burger${drawerOpen ? ' open' : ''}`}
          onClick={() => setDrawerOpen(p => !p)}
          aria-label="Toggle menu"
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`tnav-drawer${drawerOpen ? ' open' : ''}`}>
        {NAV_LINKS.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className="tnav-drawer-link"
            onClick={() => setDrawerOpen(false)}
          >
            {l.label}
          </Link>
        ))}
        <a
          href={authHref}
          className="tnav-drawer-auth"
          onClick={(e) => { setDrawerOpen(false); handleAuthClick(e); }}
        >
          {authLabel}
        </a>
      </div>
    </>
  );
}
