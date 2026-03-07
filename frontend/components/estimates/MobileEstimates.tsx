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
          border-bottom: 1px solid rgba(255,255,255,0.05);
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
          border: 1px solid rgba(212,175,55,0.3);
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
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
          border-left: 2px solid rgba(212,175,55,0.4);
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(15px, 4vw, 17px);
          color: rgba(255,220,100,0.95);
          line-height: 1.75;
          margin-bottom: 20px;
        }
        .mest-body {
          font-family: 'Comfortaa', sans-serif;
          font-size: clamp(16px, 4.5vw, 19px);
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
          font-size: clamp(15px, 4vw, 17px);
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
          border: 1px solid rgba(212,175,55,0.35);
          background: transparent;
          color: rgba(212,175,55,0.85);
          font-family: 'Montserrat', sans-serif;
          font-size: 15px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 200ms;
          margin-bottom: 0;
        }
        .mest-scroll-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 1px solid rgba(100,160,220,0.4);
          background: transparent;
          cursor: pointer;
          transition: background 200ms, border-color 200ms;
          animation: mest-pulse 2s ease-in-out infinite;
          position: absolute;
          bottom: 40px;
          left: 0;
          flex-shrink: 0;
        }
        .mest-scroll-btn:hover {
          background: rgba(100,160,220,0.1);
          border-color: rgba(100,160,220,0.8);
          animation: none;
        }
        .mest-scroll-arrow {
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 12px solid rgba(212,175,55,0.85);
          margin-top: 2px;
        }
        @keyframes mest-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(100,160,220,0.3); }
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
          font-size: clamp(15px, 4vw, 17px);
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
            <button
              className="mest-scroll-btn"
              onClick={() => scrollToNext(p.n)}
              aria-label="Scroll to next"
            >
              <div className="mest-scroll-arrow" />
            </button>
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
