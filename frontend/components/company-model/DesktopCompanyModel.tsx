import { useState, useEffect } from 'react';
import { chapters } from './shared-model';

export default function DesktopCompanyModel() {
  const [activeId, setActiveId] = useState('who-we-are');

  useEffect(() => {
    const handleScroll = () => {
      for (let i = chapters.length - 1; i >= 0; i--) {
        const el = document.getElementById(`chapter-${chapters[i].id}`);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) {
          setActiveId(chapters[i].id);
          return;
        }
      }
      setActiveId('who-we-are');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToChapter = (id: string) => {
    const el = document.getElementById(`chapter-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <style>{`
        .dtop-sidebar {
          width: 220px;
          flex-shrink: 0;
          position: sticky;
          top: 80px;
          height: fit-content;
          padding-top: 8px;
        }
        .dtop-nav-btn {
          display: block;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          border-left: 2px solid transparent;
          padding: 10px 16px;
          font-family: 'Comfortaa', sans-serif;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          transition: color 250ms, border-color 250ms;
        }
        .dtop-nav-btn:hover { color: rgba(255,255,255,0.65); }
        .dtop-nav-btn.active {
          color: #d4af37;
          border-left-color: #d4af37;
          padding-left: 14px;
        }
        .dtop-chapter {
          scroll-margin-top: 100px;
          padding: 80px 0;
          border-bottom: 1px solid var(--border);
        }
        .dtop-chapter:last-of-type { border-bottom: none; }
        .dtop-chapter-label {
          font-family: 'Comfortaa', sans-serif;
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(212,175,55,0.6);
          margin-bottom: 20px;
        }
        .dtop-chapter-heading {
          font-family: 'Oranienbaum', serif;
          font-size: clamp(28px, 3.5vw, 48px);
          color: var(--text);
          line-height: 1.15;
          margin-bottom: 32px;
        }
        .dtop-chapter-body p {
          font-family: 'Comfortaa', sans-serif;
          font-size: clamp(14px, 1.4vw, 16px);
          color: rgba(255,255,255,0.65);
          line-height: 1.9;
          margin-bottom: 20px;
        }
        .dtop-chapter-body p:first-child {
          font-size: clamp(14px, 1.4vw, 16px);
          color: rgba(100,160,220,0.9);
          font-family: 'Comfortaa', sans-serif;
          font-weight: 600;
          line-height: 1.75;
        }
        .dtop-stat {
          margin-top: 40px;
          padding: 24px 28px;
          border: 1px solid #d4af37;
          background: rgba(212,175,55,0.04);
          display: inline-block;
        }
        .dtop-stat-value {
          font-family: 'Oranienbaum', serif;
          font-size: 48px;
          color: rgba(212,175,55,0.8);
          line-height: 1;
          margin-bottom: 6px;
        }
        .dtop-stat-label {
          font-family: 'Comfortaa', sans-serif;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
        }
        .dtop-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          font-family: 'Comfortaa', sans-serif;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(100,160,220,0.9);
          text-decoration: none;
          border-bottom: 1px solid rgba(100,160,220,0.3);
          padding-bottom: 2px;
        }
        .dtop-cta {
          margin-top: 80px;
          text-align: center;
          padding: 64px 0 80px;
          border-top: 1px solid var(--border);
        }
        .dtop-cta-heading {
          font-family: 'Oranienbaum', serif;
          font-size: clamp(22px, 3vw, 36px);
          color: var(--text);
          margin-bottom: 16px;
        }
        .dtop-cta-sub {
          font-family: 'Comfortaa', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.45);
          margin-bottom: 36px;
          line-height: 1.8;
        }
        .dtop-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 36px;
          border: 1px solid #d4af37;
          background: transparent;
          color: rgba(212,175,55,0.9);
          font-family: 'Comfortaa', sans-serif;
          font-size: 12px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          transition: background 200ms, color 200ms;
        }
        .dtop-cta-btn:hover {
          background: rgba(212,175,55,0.1);
          color: #d4af37;
        }
      `}</style>

      <div style={{ display: 'flex', gap: '80px', alignItems: 'flex-start' }}>
        <nav className="dtop-sidebar" aria-label="Section navigation">
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)', marginBottom: '12px', paddingLeft: '16px' }}>
            In this section
          </p>
          {chapters.map(ch => (
            <button
              key={ch.id}
              className={`dtop-nav-btn${activeId === ch.id ? ' active' : ''}`}
              onClick={() => scrollToChapter(ch.id)}
            >
              {ch.label}
            </button>
          ))}
        </nav>

        <div style={{ flex: 1, minWidth: 0 }}>
          {chapters.map((ch) => (
            <div key={ch.id} id={`chapter-${ch.id}`} className="dtop-chapter">
              <p className="dtop-chapter-label">{ch.label}</p>
              <h3 className="dtop-chapter-heading">{ch.heading}</h3>
              <div className="dtop-chapter-body">
                {ch.body.map((para, i) => <p key={i}>{para}</p>)}
              </div>
              {((ch as any).link || (ch as any).link2) && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '20px 0' }}>
                  {(ch as any).link && (
                    <a href={(ch as any).link.href} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '16px 28px',
                      border: '1px solid rgba(80,200,120,0.7)',
                      color: 'rgba(80,200,120,1)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px', letterSpacing: '0.12em', textTransform: 'uppercase',
                      textDecoration: 'none',
                      transition: 'background 200ms',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(80,200,120,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      {(ch as any).link.label} →
                    </a>
                  )}
                  {(ch as any).link2 && (
                    <a href={(ch as any).link2.href} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '16px 28px',
                      border: '1px solid rgba(80,200,120,0.7)',
                      color: 'rgba(80,200,120,1)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px', letterSpacing: '0.12em', textTransform: 'uppercase',
                      textDecoration: 'none',
                      transition: 'background 200ms',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(80,200,120,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      {(ch as any).link2.label} →
                    </a>
                  )}
                </div>
              )}
              {ch.stat && (
                <div className="dtop-stat">
                  <div className="dtop-stat-value">{ch.stat.value}</div>
                  <div className="dtop-stat-label">{ch.stat.label}</div>
                </div>
              )}
            </div>
          ))}
          <div className="dtop-cta">
            <h3 className="dtop-cta-heading">Ready to find out what your stone is worth?</h3>
            <p className="dtop-cta-sub">
              Every estimate path is designed for a different level of commitment.<br />
              Start wherever feels right.
            </p>
            <a href="/estimate" className="dtop-cta-btn">Choose Your Estimate Path →</a>
          </div>
        </div>
      </div>
    </>
  );
}
