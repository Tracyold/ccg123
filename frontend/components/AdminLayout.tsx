import { useState, useEffect, useRef, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬡', route: '/admin/dashboard' },
  { id: 'products',  label: 'Products',  icon: '◈', route: '/admin/products' },
  { id: 'portfolio', label: 'Portfolio', icon: '◻', route: '/admin/portfolio' },
  { id: 'users',     label: 'User List', icon: '◯', route: '/admin/users' },
];

// The entire admin CSS design system from the reference TSX files
export const adminCss = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;1,300&family=DM+Sans:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --k0:#060606;--k1:#0d0d0d;--k2:#131313;--k3:#191919;--k4:#202020;
  --ln:rgba(255,255,255,0.06);--ln2:rgba(255,255,255,0.11);
  --g:#b89a2a;--gl:#cfb040;--gbg:rgba(184,154,42,0.07);
  --tx:#ddd;--d1:#777;--d2:#444;--wh:#f0f0f0;--er:#b54040;
  --serif:'Cormorant',Georgia,serif;--sans:'DM Sans',system-ui,sans-serif;
}
.shell{display:flex;height:100vh;background:var(--k0);font-family:var(--sans);color:var(--tx);overflow:hidden}
.sb{width:220px;flex-shrink:0;background:var(--k1);border-right:1px solid var(--ln);display:flex;flex-direction:column}
.sb-brand{padding:30px 24px 26px;border-bottom:1px solid var(--ln)}
.sb-name{font-family:var(--serif);font-size:18px;font-weight:400;color:var(--wh);letter-spacing:.07em;line-height:1.3}
.sb-role{font-size:9px;letter-spacing:.28em;text-transform:uppercase;color:var(--d2);margin-top:6px}
.sb-nav{flex:1;padding:12px 0}
.ni{display:flex;align-items:center;gap:12px;padding:14px 24px;font-size:11px;font-weight:400;letter-spacing:.14em;text-transform:uppercase;color:var(--d1);cursor:pointer;border:none;background:none;width:100%;text-align:left;transition:color .15s;position:relative;font-family:var(--sans)}
.ni::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--gl);opacity:0;transition:opacity .15s}
.ni.on{color:var(--wh)}.ni.on::before{opacity:1}.ni:hover:not(.on){color:#aaa}
.ni-ic{font-size:12px;opacity:.55}.ni.on .ni-ic{opacity:1}
.ni-bell{position:relative;margin-left:auto}
.ni-badge{position:absolute;top:-6px;right:-8px;background:var(--gl);color:#000;font-size:7.5px;font-weight:700;min-width:14px;height:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;padding:0 3px}
.sb-foot{padding:16px 24px;border-top:1px solid var(--ln);font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--d2);cursor:pointer;transition:color .15s}
.sb-foot:hover{color:var(--er)}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--k0)}
.ph{display:flex;align-items:center;justify-content:space-between;padding:28px 40px;border-bottom:1px solid var(--ln);flex-shrink:0}
.ph-title{font-family:var(--serif);font-size:26px;font-weight:300;color:var(--wh);letter-spacing:.05em}
.ph-right{display:flex;align-items:center;gap:12px}
.ph-actions{display:flex;gap:8px;align-items:center}
.err-bar{font-size:9.5px;color:var(--er);letter-spacing:.08em;padding:6px 12px;border:1px solid rgba(181,64,64,.25);background:rgba(181,64,64,.07)}
.btn-add{display:flex;align-items:center;gap:8px;background:var(--gl);color:#000;border:none;padding:11px 20px;font-family:var(--sans);font-size:10px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;transition:background .15s}
.btn-add:hover:not(:disabled){background:#dcc056}.btn-add:disabled{opacity:.4;cursor:not-allowed}
.btn-sel{background:transparent;color:var(--d1);border:1px solid var(--ln2);padding:11px 20px;font-family:var(--sans);font-size:10px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;transition:all .15s}
.btn-sel:hover{border-color:var(--g);color:var(--gl)}
.btn-sel.on{border-color:rgba(207,176,64,.4);color:var(--gl);background:var(--gbg)}
.tabs{display:flex;gap:28px;padding:0 40px;border-bottom:1px solid var(--ln);flex-shrink:0}
.tab{padding:15px 0;font-size:12px;font-weight:400;letter-spacing:2.7px;text-transform:uppercase;color:var(--d1);cursor:pointer;border:none;background:none;border-bottom:1px solid transparent;position:relative;top:1px;transition:color .15s;font-family:var(--sans)}
.tab.on{color:var(--wh);border-bottom-color:var(--gl)}.tab:hover:not(.on){color:#aaa}
.tab-n{margin-left:6px;font-size:10px;color:var(--d2)}.tab.on .tab-n{color:var(--g)}
.pb{flex:1;overflow-y:auto;padding:0 40px}
.loading{display:flex;align-items:center;justify-content:center;padding:80px 0;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--d2)}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 0;color:var(--d2)}
.empty-ic{font-size:28px;opacity:.18;margin-bottom:10px}
.empty-tx{font-size:10px;letter-spacing:.22em;text-transform:uppercase}
.tbl{width:100%;border-collapse:collapse}
.tbl thead tr{border-bottom:1px solid var(--ln)}
.tbl th{font-size:10px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:var(--d2);padding:16px 0 12px;text-align:left}
.tbl th:last-child{text-align:right}
.tbl tbody tr{border-bottom:1px solid var(--ln);transition:background .1s;cursor:pointer}
.tbl tbody tr:hover{background:var(--k2)}
.tbl td{padding:16px 0;font-size:13px;color:var(--tx);vertical-align:middle}
.tbl td:last-child{text-align:right}
.td-name{font-family:var(--serif);font-size:16px;font-weight:400;color:var(--wh)}
.td-sub{font-size:11px;color:var(--d1);letter-spacing:.07em;margin-top:2px}
.td-price{font-family:var(--serif);font-size:16px;color:var(--gl)}
.pill{display:inline-block;font-size:9px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;padding:4px 9px}
.pill-A{background:rgba(207,176,64,.09);color:var(--gl)}
.pill-D{background:rgba(255,255,255,.04);color:var(--d1)}
.pill-I{background:rgba(181,64,64,.1);color:#c07070}
.ra{display:flex;align-items:center;justify-content:flex-end;gap:6px;opacity:0;transition:opacity .15s}
.tbl tbody tr:hover .ra{opacity:1}
.ab{font-size:9px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;padding:5px 10px;border:1px solid var(--ln2);background:none;color:var(--d1);cursor:pointer;transition:all .15s;font-family:var(--sans)}
.ab:hover{border-color:var(--g);color:var(--gl)}
.ab.pub{border-color:rgba(207,176,64,.25);color:var(--g)}.ab.pub:hover{background:var(--gbg)}
.ab.rem:hover{border-color:var(--er);color:#c07070}
.ab.arc:hover{border-color:var(--er);color:#c07070}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.9);backdrop-filter:blur(8px);z-index:100;display:flex;align-items:stretch}
.qp{width:220px;flex-shrink:0;background:var(--k1);border-right:1px solid var(--ln);display:flex;flex-direction:column}
.qh{padding:20px 18px 15px;font-size:10px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:var(--d1);border-bottom:1px solid var(--ln)}
.ql{flex:1;overflow-y:auto;padding:8px}
.qi{padding:14px 16px;margin-bottom:2px;cursor:pointer;border-left:2px solid transparent;transition:all .12s}
.qi:hover{background:var(--k3)}.qi.cur{border-left-color:var(--gl);background:var(--k2)}
.qi-t{font-size:13px;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.qi-id{font-size:9.5px;color:var(--d2);margin-top:3px;font-family:monospace;letter-spacing:0}
.qi-s{font-size:8.5px;color:var(--g);margin-top:3px;letter-spacing:.1em;text-transform:uppercase}
.qi-year{font-family:var(--serif);font-size:13px;color:var(--gl)}
.qi-thumb{width:100%;aspect-ratio:1/1;object-fit:cover;background:var(--k3);margin-bottom:6px}
.qi-thumb-empty{width:100%;aspect-ratio:1/1;background:var(--k3);display:flex;align-items:center;justify-content:center;font-size:16px;opacity:.15;margin-bottom:6px}
.qadd{margin:7px;padding:8px;border:1px dashed var(--ln2);background:none;color:var(--d1);font-size:9.5px;font-family:var(--sans);letter-spacing:.12em;cursor:pointer;transition:all .15s;width:calc(100% - 14px)}
.qadd:hover:not(:disabled){border-color:var(--g);color:var(--gl)}.qadd:disabled{opacity:.22;cursor:not-allowed}
.fp{flex:1;display:flex;flex-direction:column;background:var(--k1);overflow:hidden}
.fh{display:flex;align-items:center;justify-content:space-between;padding:20px 30px;border-bottom:1px solid var(--ln);flex-shrink:0}
.fh-title{font-family:var(--serif);font-size:22px;font-weight:300;color:var(--wh)}
.fhr{display:flex;align-items:center;gap:13px}
.sf{font-size:8.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--g);opacity:0;transition:opacity .4s}.sf.on{opacity:1}
.xb{width:28px;height:28px;border:1px solid var(--ln2);background:none;color:var(--d1);font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}.xb:hover{border-color:#c07070;color:#c07070}
.fb{flex:1;overflow-y:auto;padding:26px 30px}
.fg{display:flex;flex-direction:column;gap:5px}
.fg label{font-size:10px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:var(--d1)}
.fg input,.fg textarea{background:var(--k2);border:1px solid var(--ln);border-top-color:var(--ln2);color:var(--tx);padding:10px 12px;font-family:var(--sans);font-size:13px;letter-spacing:.02em;outline:none;transition:border-color .15s;width:100%;height:38px}
.fg input:focus,.fg textarea:focus{border-color:var(--g)}
.fg input::placeholder,.fg textarea::placeholder{color:var(--d2)}
.fg input[readonly]{opacity:.38;cursor:default;font-family:monospace;font-size:10px;letter-spacing:0}
.fg textarea{resize:vertical;min-height:80px;height:auto}
.fr{display:grid;gap:14px;margin-bottom:14px}
.fr1{grid-template-columns:1fr}.fr2{grid-template-columns:1fr 1fr}.fr3{grid-template-columns:1fr 1fr 1fr}
.gia-blk{background:var(--k2);border:1px solid var(--ln);padding:16px 18px;margin-bottom:14px}
.gia-l{font-size:10px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:var(--d1);margin-bottom:10px}
.gia-mr{display:flex;gap:0;margin-bottom:10px}
.gmb{padding:5px 13px;font-size:9.5px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;border:1px solid var(--ln);background:none;color:var(--d1);cursor:pointer;margin-right:-1px;transition:all .12s;font-family:var(--sans)}
.gmb.on{background:var(--gbg);border-color:rgba(207,176,64,.35);color:var(--gl);z-index:1}
.uz{border:1px dashed var(--ln2);padding:18px;text-align:center;cursor:pointer;transition:all .15s;background:var(--k1)}
.uz:hover{border-color:var(--g)}.uz input{display:none}
.uz p{font-size:9.5px;color:var(--d1);letter-spacing:.1em}
.uz .ui{font-size:20px;opacity:.2;margin-bottom:5px}
.ufn{font-size:9.5px;color:var(--g);margin-top:5px;word-break:break-all}
.ff{display:flex;align-items:center;justify-content:space-between;padding:16px 30px;border-top:1px solid var(--ln);flex-shrink:0;background:var(--k1)}
.ff-note{font-size:10.5px;color:var(--d2);letter-spacing:.07em}
.ffa{display:flex;gap:7px}
.bg{padding:10px 16px;font-family:var(--sans);font-size:10px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;border:1px solid var(--ln2);background:none;color:var(--d1);cursor:pointer;transition:all .15s}
.bg:hover:not(:disabled){border-color:var(--g);color:var(--gl)}.bg:disabled{opacity:.4;cursor:not-allowed}
.bg.arc:hover{border-color:var(--er);color:#c07070}
.bn{padding:10px 16px;font-family:var(--sans);font-size:10px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;border:1px solid rgba(207,176,64,.28);background:var(--gbg);color:var(--gl);cursor:pointer;transition:all .15s}
.bn:hover{background:var(--gl);color:#000}
.bp{padding:10px 20px;font-family:var(--sans);font-size:10px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;border:none;background:var(--gl);color:#000;cursor:pointer;transition:background .15s}
.bp:hover:not(:disabled){background:#dcc056}.bp:disabled{opacity:.4;cursor:not-allowed}
.photo-blk{background:var(--k2);border:1px solid var(--ln);padding:16px 18px;margin-bottom:14px}
.photo-l{font-size:10px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:var(--d1);margin-bottom:10px}
.photo-mr{display:flex;gap:0;margin-bottom:10px}
.photo-preview{width:100%;aspect-ratio:1/1;object-fit:cover;background:var(--k3);margin-top:9px;border:1px solid var(--ln)}
.photo-preview-empty{width:100%;aspect-ratio:1/1;background:var(--k3);display:flex;align-items:center;justify-content:center;font-size:32px;opacity:.08;margin-top:9px;border:1px solid var(--ln)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.card{position:relative;cursor:pointer;background:var(--k2);border:1px solid var(--ln)}.card:hover{border-color:var(--ln2)}
.card.selected{border-color:rgba(207,176,64,.5);box-shadow:0 0 0 1px rgba(207,176,64,.2)}
.card-thumb{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;background:var(--k3)}
.card-thumb-empty{width:100%;aspect-ratio:1/1;background:var(--k3);display:flex;align-items:center;justify-content:center;font-size:28px;opacity:.1}
.card-meta{padding:9px 10px;border-top:1px solid var(--ln)}
.card-year{font-family:var(--serif);font-size:14px;font-weight:400;color:var(--gl);letter-spacing:.04em;line-height:1.2}
.card-year.empty{color:var(--d2);font-style:italic;font-size:11px}
.card-caption{font-size:10px;color:var(--d2);letter-spacing:.04em;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sort-badge{position:absolute;top:7px;left:7px;background:rgba(0,0,0,0.72);padding:3px 7px;font-size:10px;font-family:monospace;color:var(--d1);cursor:text;min-width:22px;text-align:center;transition:color .15s}
.sort-badge:hover{color:var(--gl)}
.sort-input{position:absolute;top:7px;left:7px;width:42px;background:rgba(0,0,0,0.92);border:1px solid var(--gl);color:var(--gl);font-size:10px;font-family:monospace;padding:2px 6px;outline:none;text-align:center}
.pub-dot{position:absolute;top:10px;right:10px;width:7px;height:7px;border-radius:50%}
.pub-dot.live{background:var(--gl);box-shadow:0 0 6px rgba(207,176,64,.5)}
.pub-dot.draft{background:rgba(255,255,255,.18)}
.card-check{position:absolute;top:8px;left:8px;width:16px;height:16px;accent-color:var(--gl);cursor:pointer}
.card-ra{position:absolute;bottom:52px;right:8px;display:flex;gap:5px;opacity:0;transition:opacity .15s}
.card:hover .card-ra{opacity:1}
.bulk-bar{display:flex;align-items:center;gap:10px;padding:10px 32px;background:var(--k2);border-bottom:1px solid var(--ln);flex-shrink:0}
.bulk-count{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--gl);margin-right:6px}
.bb{padding:6px 12px;font-family:var(--sans);font-size:9px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;border:1px solid var(--ln2);background:none;color:var(--d1);cursor:pointer;transition:all .15s}
.bb:hover{border-color:var(--g);color:var(--gl)}
.bb.pub{border-color:rgba(207,176,64,.25);color:var(--g)}.bb.pub:hover{background:var(--gbg)}
.bb.arc:hover{border-color:var(--er);color:#c07070}
.stat-card{background:var(--k1);border:1px solid var(--ln);padding:16px}
.stat-val{font-family:var(--serif);font-size:22px;color:var(--gl);letter-spacing:.03em}
.stat-label{font-size:8.5px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-top:4px}
.notif-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--ln);cursor:pointer;transition:background .1s}
.notif-row:hover{background:var(--k2)}
.notif-dot{width:6px;height:6px;border-radius:50%;background:var(--gl);flex-shrink:0}
.notif-icon{font-size:14px;opacity:.5;flex-shrink:0;width:20px;text-align:center}
.notif-body{flex:1;min-width:0}
.notif-msg{font-size:11px;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.notif-meta{font-size:9px;color:var(--d1);margin-top:2px}
.notif-time{font-size:9px;color:var(--d2);flex-shrink:0}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--ln2)}

/* ── Mobile Top Bar + Hamburger ── */
.mob-topbar{display:none}
.mob-dropdown{display:none}

@media(max-width:767px){
  .sb{display:none!important}
  .shell{flex-direction:column}
  .main{margin-left:0}

  .mob-topbar{
    display:flex;align-items:center;justify-content:space-between;
    position:fixed;top:0;left:0;right:0;z-index:90;
    height:52px;padding:0 16px;
    background:#0a0a0a;border-bottom:1px solid rgba(255,255,255,0.06)
  }
  .mob-brand{font-family:var(--serif);font-size:15px;color:#d4af37;letter-spacing:.05em}
  .mob-burger{
    display:flex;flex-direction:column;justify-content:center;gap:5px;
    width:28px;height:28px;background:none;cursor:pointer;padding:5px;
    border:0.5px solid rgba(255,255,255,0.15);transition:border-color .2s
  }
  .mob-burger:hover{border-color:rgba(212,175,55,0.5)}
  .mob-burger .mb{width:100%;height:1px;background:rgba(255,255,255,0.7);transition:all .25s ease;transform-origin:center}
  .mob-burger.open .mb:nth-child(1){transform:translateY(6px) rotate(45deg)}
  .mob-burger.open .mb:nth-child(2){opacity:0;transform:scaleX(0)}
  .mob-burger.open .mb:nth-child(3){transform:translateY(-6px) rotate(-45deg)}

  .mob-dropdown{
    position:fixed;top:52px;left:0;right:0;z-index:89;
    background:rgba(8,8,8,0.97);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
    border-bottom:1px solid rgba(255,255,255,0.06);
    flex-direction:column;
    transform:translateY(-8px);opacity:0;pointer-events:none;
    transition:opacity .22s ease,transform .22s ease
  }
  .mob-dropdown.open{display:flex;opacity:1;transform:translateY(0);pointer-events:auto}
  .mob-dropdown-item{
    display:block;
    font-family:var(--sans);font-size:11px;font-weight:500;
    letter-spacing:.22em;text-transform:uppercase;
    color:rgba(255,255,255,0.55);text-decoration:none;
    padding:15px 20px;
    border-bottom:1px solid rgba(255,255,255,0.05);
    transition:color .15s;cursor:pointer;background:none;border-left:none;border-right:none;border-top:none;
    width:100%;text-align:left
  }
  .mob-dropdown-item:last-child{border-bottom:none}
  .mob-dropdown-item:hover{color:#fff}
  .mob-dropdown-item.on{color:#d4af37}
  .mob-dropdown-signout{
    display:block;width:100%;text-align:left;
    font-family:var(--sans);font-size:10px;font-weight:400;
    letter-spacing:.18em;text-transform:uppercase;
    color:var(--d2);background:none;border:none;
    padding:14px 20px;cursor:pointer;transition:color .15s;
    border-top:1px solid rgba(255,255,255,0.05)
  }
  .mob-dropdown-signout:hover{color:var(--er)}

  .main{padding-top:52px;height:calc(100vh - 0px)}
  .ph{padding:16px 16px}
  .tabs{padding:0 16px;overflow-x:auto;flex-wrap:nowrap;white-space:nowrap}
  .pb{padding:0 16px}

  /* Form overlay: full screen, no queue panel */
  .ov{flex-direction:column}
  .qp{display:none}
  .fp{width:100%}
  .fh{padding:14px 16px}
  .fb{padding:16px}
  .ff{padding:12px 16px}
  .fr2,.fr3{grid-template-columns:1fr}

  /* Card grid: single column */
  .grid{grid-template-columns:1fr}

  /* Table: horizontal scroll */
  .tbl{display:block;overflow-x:auto}
  .ra{opacity:1}

  /* Dashboard: stack columns */
  .dash-grid{grid-template-columns:1fr!important}
}
`;

interface AdminLayoutProps {
  children: ReactNode;
  activeNav: string;
}

export default function AdminLayout({ children, activeNav }: AdminLayoutProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [bellCount, setBellCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auth guard
  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/admin/login'); return; }
      const { data: adminCheck } = await supabase
        .from('admin_users')
        .select('admin_user_id')
        .eq('admin_user_id', session.user.id)
        .single();
      if (!adminCheck) {
        await supabase.auth.signOut();
        router.replace('/admin/login');
        return;
      }
      setChecking(false);

      // Load unread notification count (stubbed — will be wired later)
      // TODO: Wire notification bell count from admin_notifications
      setBellCount(0);
    }
    check();
  }, [router]);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const handleMobileNav = (route: string) => {
    setMobileMenuOpen(false);
    router.push(route);
  };

  if (checking) return <div style={{ background: '#060606', height: '100vh' }} />;

  return (
    <>
      <style>{adminCss}</style>

      {/* Mobile top bar */}
      <div className="mob-topbar" ref={menuRef}>
        <span className="mob-brand">CCG</span>
        <button
          className={`mob-burger${mobileMenuOpen ? ' open' : ''}`}
          onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(p => !p); }}
          aria-label="Toggle admin menu"
        >
          <span className="mb" />
          <span className="mb" />
          <span className="mb" />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      <div className={`mob-dropdown${mobileMenuOpen ? ' open' : ''}`}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`mob-dropdown-item${activeNav === item.id ? ' on' : ''}`}
            onClick={() => handleMobileNav(item.route)}
          >
            {item.label}
          </button>
        ))}
        <button className="mob-dropdown-signout" onClick={handleSignOut}>Sign Out</button>
      </div>

      <div className="shell">
        {/* Desktop sidebar — untouched */}
        <div className="sb">
          <div className="sb-brand">
            <div className="sb-name">Cutting Corners<br />Gems</div>
            <div className="sb-role">Admin</div>
          </div>
          <nav className="sb-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`ni ${activeNav === item.id ? 'on' : ''}`}
                onClick={() => router.push(item.route)}
              >
                <span className="ni-ic">{item.icon}</span>
                {item.label}
                {item.id === 'dashboard' && bellCount > 0 && (
                  <span className="ni-bell">
                    <span className="ni-badge">{bellCount > 9 ? '9+' : bellCount}</span>
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="sb-foot" onClick={handleSignOut}>Sign Out</div>
        </div>
        <div className="main">
          {children}
        </div>
      </div>
    </>
  );
}
