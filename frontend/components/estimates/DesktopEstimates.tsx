import { useEffect } from 'react';
import { paths } from './shared-estimates';

export default function DesktopEstimates() {
  useEffect(() => {
    const nums = Array.from(document.querySelectorAll('[data-est-num]')) as HTMLElement[];
    let rafId: number;
    let mounted = true;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    const vals = nums.map(() => ({ t: 0 }));
    const tick = () => {
      if (!mounted) return;
      nums.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - vh / 2) / (vh * 0.6);
        const target = clamp(1 - dist);
        vals[i].t = lerp(vals[i].t, target, 0.07);
        const t = vals[i].t;
        const r = Math.round(lerp(60, 212, t));
        const g = Math.round(lerp(60, 175, t));
        const b = Math.round(lerp(60, 55, t));
        el.style.color = `rgb(${r},${g},${b})`;
        el.style.filter = t > 0.05
          ? `brightness(${1 + t * 0.25}) drop-shadow(0 0 ${t * 12}px rgba(212,175,55,${t * 0.45}))`
          : 'none';
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => { mounted = false; cancelAnimationFrame(rafId); };
  }, []);

  return (
    <>
      <style>{`
        .dest-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .dest-card {
          padding: 64px 48px;
          margin: 12px;
          background: #1a2438;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4);
          position: relative;
        }
        .dest-num {
          font-family: 'Oranienbaum', serif;
          font-size: clamp(4.5rem, 10vw, 7.5rem);
          line-height: 1;
          color: rgb(60,60,60);
          margin-bottom: 24px;
          display: block;
        }
        .dest-tag {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(var(--gold-rgb), 0.12);
          border: 1px solid var(--gold);
          font-family: var(--font-body);
          font-size: 1.0625rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(var(--gold-rgb), 0.9);
          margin-bottom: 16px;
        }
        .dest-title {
          font-family: 'Oranienbaum', serif;
          font-size: clamp(1.375rem, 2.5vw, 2.0rem);
          color: var(--text);
          margin-bottom: 16px;
          line-height: 1.2;
        }
        .dest-warning {
          padding: 14px 18px;
          background: rgba(var(--gold-rgb), 0.06);
          border-left: 2px solid var(--gold);
          font-family: var(--font-body);
          font-size: 1.0625rem;
          color: rgba(255,220,100,0.95);
          line-height: 1.7;
          margin-bottom: 20px;
        }
        .dest-body {
          font-family: var(--font-body);
          font-size: 1.1875rem;
          color: #e8dcc8;
          line-height: 1.85;
          margin-bottom: 28px;
        }
        .dest-details {
          list-style: none;
          padding: 0;
          margin: 0 0 32px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .dest-details li {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-family: var(--font-body);
          font-size: 1.0625rem;
          color: #d4c9b0;
          line-height: 1.6;
        }
        .dest-details li::before {
          content: '';
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background:rgba(var(--gold-rgb), 0.45);
          flex-shrink: 0;
          margin-top: 7px;
        }
        .dest-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: 1px solid var(--gold);
          background: transparent;
          color: rgba(var(--gold-rgb), 0.5);
          font-family: var(--font-body);
          font-size: 1.0625rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 200ms;
        }
        .dest-cta-btn:hover { background: rgba(var(--gold-rgb), 0.85); }
      `}</style>

      <div className="dest-grid">
        {paths.map((p) => (
          <div key={p.n} className="dest-card">
            <span data-est-num className="dest-num">{p.n}</span>
            {p.tag && <div className="dest-tag">{p.tag}</div>}
            <h2 className="dest-title">{p.title}</h2>
            {p.warning && <div className="dest-warning">{p.warning}</div>}
            <p className="dest-body">{p.body}</p>
            <ul className="dest-details">
              {p.details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
            <a href={p.cta.href} className="dest-cta-btn">{p.cta.label} →</a>
          </div>
        ))}
      </div>
    </>
  );
}
