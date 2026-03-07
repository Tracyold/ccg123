import { chapters } from './shared-model';

export default function MobileCompanyModel() {
  const scrollToNext = (currentId: string) => {
    const currentIndex = chapters.findIndex(ch => ch.id === currentId);
    const nextId = currentIndex < chapters.length - 1
      ? `mob-chapter-${chapters[currentIndex + 1].id}`
      : 'mob-cta';
    const el = document.getElementById(nextId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <style>{`
        .mob-chapter {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 100px 0 60px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          scroll-margin-top: 0;
          overflow: hidden;
          position: relative;
        }
        .mob-chapter-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(212,175,55,0.85);
          margin-bottom: 18px;
        }
        .mob-chapter-heading {
          font-family: 'Oranienbaum', serif;
          font-size: clamp(32px, 9vw, 48px);
          color: #FAFAFA;
          line-height: 1.1;
          margin-bottom: 32px;
        }
        .mob-chapter-body p {
          font-family: 'Comfortaa', sans-serif;
          font-size: clamp(16px, 4.5vw, 19px);
          color: rgba(255,255,255,0.85);
          line-height: 1.9;
          margin-bottom: 20px;
        }
        .mob-chapter-body p:first-child {
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: clamp(16px, 4.5vw, 18px);
          color: rgba(100,160,220,0.9);
          line-height: 1.8;
        }
        .mob-stat {
          display: inline-block;
          padding: 24px 28px;
          border: 1px solid rgba(212,175,55,0.15);
          background: rgba(212,175,55,0.04);
          margin: 12px 0 36px;
        }
        .mob-stat-value {
          font-family: 'Oranienbaum', serif;
          font-size: 52px;
          color: rgba(212,175,55,0.95);
          line-height: 1;
          margin-bottom: 6px;
        }
        .mob-stat-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.75);
        }
        .mob-scroll-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 1px solid rgba(100,160,220,0.4);
          background: transparent;
          cursor: pointer;
          margin-top: auto;
          padding-top: 32px;
          transition: background 200ms, border-color 200ms;
          animation: mob-pulse 2s ease-in-out infinite;
          flex-shrink: 0;
          position: absolute;
          bottom: 40px;
          left: 0;
        }
        .mob-scroll-btn:hover {
          background: rgba(100,160,220,0.1);
          border-color: rgba(100,160,220,0.8);
          animation: none;
        }
        .mob-scroll-arrow {
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 12px solid rgba(212,175,55,0.85);
          margin-top: 2px;
        }
        @keyframes mob-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(100,160,220,0.3); }
          50% { box-shadow: 0 0 0 10px rgba(100,160,220,0); }
        }
        .mob-cta {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 0;
          border-top: 1px solid rgba(255,255,255,0.05);
          scroll-margin-top: 0;
        }
        .mob-cta-heading {
          font-family: 'Oranienbaum', serif;
          font-size: clamp(26px, 7vw, 36px);
          color: #FAFAFA;
          margin-bottom: 18px;
          line-height: 1.2;
        }
        .mob-cta-sub {
          font-family: 'Comfortaa', sans-serif;
          font-size: clamp(16px, 4.5vw, 19px);
          color: rgba(255,255,255,0.8);
          margin-bottom: 36px;
          line-height: 1.85;
          max-width: 360px;
        }
        .mob-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 32px;
          border: 1px solid rgba(212,175,55,0.4);
          background: transparent;
          color: rgba(212,175,55,0.9);
          font-family: 'Montserrat', sans-serif;
          font-size: 15px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 200ms;
        }
        .mob-cta-btn:hover { background: rgba(212,175,55,0.08); }
      `}</style>

      <div>
        {chapters.map((ch) => (
          <div key={ch.id} id={`mob-chapter-${ch.id}`} className="mob-chapter">

            <p className="mob-chapter-label">{ch.label}</p>
            <h2 className="mob-chapter-heading">{ch.heading}</h2>

            <div className="mob-chapter-body">
              {ch.body.map((para, i) => <p key={i}>{para}</p>)}
            </div>

            {((ch as any).link || (ch as any).link2) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px 0 0' }}>
                {(ch as any).link && (
                  <a href={(ch as any).link.href} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '14px 22px',
                    border: '1px solid rgba(212,175,55,0.35)',
                    color: 'rgba(212,175,55,0.85)',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase',
                    textDecoration: 'none',
                  }}>
                    {(ch as any).link.label} →
                  </a>
                )}
                {(ch as any).link2 && (
                  <a href={(ch as any).link2.href} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '14px 22px',
                    border: '1px solid rgba(212,175,55,0.35)',
                    color: 'rgba(212,175,55,0.85)',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase',
                    textDecoration: 'none',
                  }}>
                    {(ch as any).link2.label} →
                  </a>
                )}
              </div>
            )}

            {ch.stat && (
              <div className="mob-stat">
                <div className="mob-stat-value">{ch.stat.value}</div>
                <div className="mob-stat-label">{ch.stat.label}</div>
              </div>
            )}

            <button
              className="mob-scroll-btn"
              onClick={() => scrollToNext(ch.id)}
              aria-label="Scroll to next section"
            >
              <div className="mob-scroll-arrow" />
            </button>

          </div>
        ))}

        <div id="mob-cta" className="mob-cta">
          <h3 className="mob-cta-heading">Ready to find out what your stone is worth?</h3>
          <p className="mob-cta-sub">Every estimate path is designed for a different level of commitment. Start wherever feels right.</p>
          <a href="/estimates" className="mob-cta-btn">Choose Your Estimate Path →</a>
        </div>
      </div>
    </>
  );
}
