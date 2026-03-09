import { useState, useEffect, useRef } from 'react';
import { paths } from './shared-estimates';

const CARD_COLORS = [
  { bg: 'var(--bg)', accent: 'rgba(100,160,220,0.9)' },
  { bg: 'var(--bg-card)', accent: 'rgba(212,175,55,0.9)' },
  { bg: 'var(--bg)', accent: 'rgba(100,200,140,0.9)' },
  { bg: 'var(--bg-card)', accent: 'rgba(220,100,100,0.9)' },
];

export default function MobileEstimates() {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting && e.intersectionRatio > 0.5) {
            const idx = cardRefs.current.findIndex(r => r === e.target);
            if (idx >= 0) setActive(idx);
          }
        });
      },
      { threshold: 0.5 }
    );
    cardRefs.current.forEach(r => r && observer.observe(r));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .mest-wrap { height: 100svh; overflow-y: scroll; scroll-snap-type: y mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .mest-wrap::-webkit-scrollbar { display: none; }
        .mest-card { height: 100svh; scroll-snap-align: start; scroll-snap-stop: always; display: flex; flex-direction: column; justify-content: center; padding: 80px 32px; position: relative; overflow: hidden; }
        .mest-card::before { content: ''; position: absolute; inset: 0; pointer-events: none; }
        .mest-num { font-family: var(--font-display); font-size: clamp(96px, 25vw, 140px); line-height: 1; margin-bottom: 8px; display: block; opacity: 0.07; position: absolute; top: 24px; right: 24px; color: var(--text); }
        .mest-tag { display: inline-block; padding: 5px 14px; border: 1px solid var(--gold); font-family: var(--font-ui); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 20px; width: fit-content; }
        .mest-title { font-family: var(--font-display); font-size: clamp(33px, 9vw, 48px); color: var(--text); margin-bottom: 20px; line-height: 1.1; }
        .mest-warning { padding: 14px 16px; border-left: 3px solid #d4af37; font-family: var(--font-body); font-size: 13px; color: var(--accent); line-height: 1.75; margin-bottom: 20px; background: rgba(212,175,55,0.05); }
        .mest-body { font-family: var(--font-body); font-size: clamp(15px, 4vw, 17px); color: var(--text); line-height: 1.9; margin-bottom: 28px; }
        .mest-details { list-style: none; padding: 0; margin: 0 0 32px; display: flex; flex-direction: column; gap: 10px; }
        .mest-details li { display: flex; gap: 12px; align-items: flex-start; font-family: var(--font-body); font-size: clamp(13px, 3.5vw, 15px); color: var(--text); line-height: 1.65; }
        .mest-cta-btn { display: inline-flex; align-items: center; gap: 8px; padding: 15px 28px; background: var(--gold); color: var(--bg-deep); font-family: var(--font-ui); font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none; width: fit-content; }
        .mest-dots { position: fixed; right: 16px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 10px; z-index: 100; }
        .mest-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border); transition: background 300ms, transform 300ms; cursor: pointer; border: none; padding: 0; }
        .mest-dot.active { background: var(--gold); transform: scale(1.4); }
        .mest-swipe-hint { position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); font-family: var(--font-ui); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .mest-arrow-anim { animation: bounce 1.5s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
      `}</style>

      <div className="mest-dots">
        {paths.map((_, i) => (
          <button key={i} className={`mest-dot${active === i ? ' active' : ''}`} onClick={() => cardRefs.current[i]?.scrollIntoView({ behavior: 'smooth' })} />
        ))}
      </div>

      <div className="mest-wrap" ref={containerRef}>
        {paths.map((p, i) => (
          <div key={p.n} id={`mob-est-${p.n}`} className="mest-card" ref={el => { cardRefs.current[i] = el; }} style={{ background: CARD_COLORS[i].bg }}>
            <span className="mest-num">{p.n}</span>
            {p.tag && <div className="mest-tag">{p.tag}</div>}
            <h2 className="mest-title">{p.title}</h2>
            {p.warning && <div className="mest-warning">{p.warning}</div>}
            <p className="mest-body">{p.body}</p>
            <ul className="mest-details">
              {p.details.map((d, j) => <li key={j}><span style={{ color: CARD_COLORS[i].accent, flexShrink: 0 }}>—</span>{d}</li>)}
            </ul>
            <a href={p.cta.href} className="mest-cta-btn">{p.cta.label} →</a>
            {i < paths.length - 1 && (
              <div className="mest-swipe-hint"><span className="mest-arrow-anim">↓</span><span>Swipe</span></div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
