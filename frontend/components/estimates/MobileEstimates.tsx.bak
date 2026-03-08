import { paths } from './shared-estimates';

export default function MobileEstimates() {
  const scrollToNext = (currentN: string) => {
    const currentIndex = paths.findIndex(p => p.n === currentN);
    const nextId = currentIndex < paths.length - 1
      ? `mob-est-${paths[currentIndex + 1].n}`
      : 'mob-est-footer';
    const el = document.getElementById(nextId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <style>{`
        .mest-card {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 100px 0 100px;
          background: #1a2438;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4);
          scroll-margin-top: 0;
          overflow: hidden;
          position: relative;
        }
        .mest-num {
          font-family: 'Oranienbaum', serif;
          font-size: clamp(80px, 22vw, 120px);
          line-height: 1;
          color: rgba(100,160,220,0.35);
          margin-bottom: 16px;
          display: block;
        }
        .mest-tag {
          display: inline-block;
          padding: 5px 14px;
          background: rgba(212,175,55,0.12);
          border: 1px solid #d4af37;
          font-family: 'Comfortaa', sans-serif;
          font-size: 17px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(212,175,55,0.9);
          margin-bottom: 16px;
        }
        .mest-title {
          font-family: 'Oranienbaum', serif;
          font-size: clamp(32px, 9vw, 48px);
          color: #FAFAFA;
          margin-bottom: 20px;
          line-height: 1.1;
        }
        .mest-warning {
          padding: 16px 18px;
          background: rgba(212,175,55,0.06);
          border-left: 2px solid #d4af37;
          font-family: 'Comfortaa', sans-serif;
          font-size: clamp(17px, 4vw, 19px);
          color: rgba(255,220,100,0.95);
          line-height: 1.75;
          margin-bottom: 20px;
        }
        .mest-body {
          font-family: 'Comfortaa', sans-serif;
          font-size: clamp(17px, 4.5vw, 19px);
          color: rgba(255,255,255,0.85);
          line-height: 1.9;
          margin-bottom: 24px;
        }
        .mest-details {
          list-style: none;
          padding: 0;
          margin: 0 0 32px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .mest-details li {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          font-family: 'Comfortaa', sans-serif;
          font-size: clamp(17px, 4vw, 19px);
          color: rgba(255,255,255,0.8);
          line-height: 1.65;
        }
        .mest-details li::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(212,175,55,0.5);
          flex-shrink: 0;
          margin-top: 8px;
        }
        .mest-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 26px;
          border: 1px solid #d4af37;
          background: transparent;
          color: rgba(212,175,55,0.85);
          font-family: 'Comfortaa', sans-serif;
          font-size: 17px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 200ms;
          margin-bottom: 0;
        }
          50% { box-shadow: 0 0 0 10px rgba(100,160,220,0); }
        }
        .mest-footer {
          min-height: 40svh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 0;
          border-top: 1px solid rgba(255,255,255,0.05);
          scroll-margin-top: 0;
        }
        .mest-footer-text {
          font-family: 'Comfortaa', sans-serif;
          font-size: clamp(17px, 4vw, 19px);
          color: rgba(255,255,255,0.75);
          line-height: 1.9;
          text-align: center;
          max-width: 340px;
        }
      `}</style>

      <div>
        {paths.map((p) => (
          <div key={p.n} id={`mob-est-${p.n}`} className="mest-card">
            <span className="mest-num">{p.n}</span>
            {p.tag && <div className="mest-tag">{p.tag}</div>}
            <h2 className="mest-title">{p.title}</h2>
            {p.warning && <div className="mest-warning">{p.warning}</div>}
            <p className="mest-body">{p.body}</p>
            <ul className="mest-details">
              {p.details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
            <a href={p.cta.href} className="mest-cta-btn">{p.cta.label} →</a>
          </div>
        ))}

        <div id="mob-est-footer" className="mest-footer">
          <p className="mest-footer-text">
            Not sure where to start? All estimates are non-binding. We recommend an Online Estimate if you have photos, or an In-Person Estimate if you are ready to move forward.
          </p>
        </div>
      </div>
    </>
  );
}
