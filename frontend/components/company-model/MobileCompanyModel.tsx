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
          padding: 56px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          scroll-margin-top: 80px;
        }
        .mob-chapter-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(212,175,55,0.6);
          margin-bottom: 14px;
        }
        .mob-chapter-heading {
          font-family: 'Oranienbaum', serif;
          font-size: clamp(26px, 7vw, 36px);
          color: #FAFAFA;
          line-height: 1.15;
          margin-bottom: 28px;
        }
        .mob-chapter-body p {
          font-family: 'Comfortaa', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          line-height: 1.9;
          margin-bottom: 18px;
        }
        .mob-chapter-body p:first-child {
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: rgba(100,160,220,0.9);
          line-height: 1.75;
        }
        .mob-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(100,160,220,0.9);
          text-decoration: none;
          border-bottom: 1px solid rgba(100,160,220,0.3);
          padding-bottom: 2px;
        }
        .mob-stat {
          display: inline-block;
          padding: 20px 24px;
          border: 1px solid rgba(212,175,55,0.15);
          background: rgba(212,175,55,0.04);
          margin: 8px 0 32px;
        }
        .mob-stat-value {
          font-family: 'Oranienbaum', serif;
          font-size: 40px;
          color: rgba(212,175,55,0.8);
          line-height: 1;
          margin-bottom: 4px;
        }
        .mob-stat-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
        }
        .mob-scroll-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 1px solid rgba(100,160,220,0.4);
          background: transparent;
          cursor: pointer;
          margin-top: 40px;
          transition: background 200ms, border-color 200ms;
          animation: mob-pulse 2s ease-in-out infinite;
        }
        .mob-scroll-btn:hover {
          background: rgba(100,160,220,0.1);
          border-color: rgba(100,160,220,0.8);
          animation: none;
        }
        .mob-scroll-arrow {
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 10px solid rgba(212,175,55,0.85);
          margin-top: 2px;
        }
        @keyframes mob-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(100,160,220,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(100,160,220,0); }
        }
        .mob-cta {
          padding: 64px 0;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.05);
          scroll-margin-top: 80px;
        }
        .mob-cta-heading {
          font-family: 'Oranienbaum', serif;
          font-size: clamp(20px, 5vw, 28px);
          color: #FAFAFA;
          margin-bottom: 14px;
          line-height: 1.2;
        }
        .mob-cta-sub {
          font-family: 'Comfortaa', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 28px;
          line-height: 1.8;
        }
        .mob-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border: 1px solid rgba(212,175,55,0.4);
          background: transparent;
          color: rgba(212,175,55,0.9);
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px 0' }}>
                {(ch as any).link && (
                  <a href={(ch as any).link.href} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '12px 20px',
                    border: '1px solid rgba(212,175,55,0.35)',
                    color: 'rgba(212,175,55,0.85)',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase',
                    textDecoration: 'none',
                  }}>
                    {(ch as any).link.label} →
                  </a>
                )}
                {(ch as any).link2 && (
                  <a href={(ch as any).link2.href} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '12px 20px',
                    border: '1px solid rgba(212,175,55,0.35)',
                    color: 'rgba(212,175,55,0.85)',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase',
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
