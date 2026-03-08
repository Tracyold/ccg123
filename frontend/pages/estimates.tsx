import { useState } from 'react';
import TopNav from '../components/shared/TopNav';
import Footer from '../components/shared/Footer';
import { paths } from '../components/estimates/shared-estimates';

export default function EstimatesPage() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const prices = ['Free', '$3', '$10', '$30'];
  const priceLabels = ['No charge', 'Per submission', 'Credited to service', 'Waived if service rendered'];
  return (
    <>
      <TopNav />
      <style>{`
        .est-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.06); }
        @media (max-width: 900px) { .est-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .est-grid { grid-template-columns: 1fr; } }
        .est-card { background: #050505; padding: 40px 28px 32px; display: flex; flex-direction: column; cursor: pointer; transition: background 200ms; }
        .est-card:hover { background: rgba(212,175,55,0.03); }
        .est-card.active { background: rgba(212,175,55,0.04); }
        .est-card.recommended { border-top: 2px solid #d4af37; }
        .est-n { font-family: 'Oranienbaum', serif; font-size: 72px; color: rgba(255,255,255,0.06); line-height: 1; margin-bottom: 20px; transition: color 200ms; }
        .est-card:hover .est-n, .est-card.active .est-n { color: rgba(212,175,55,0.15); }
        .est-tag { font-family: 'Montserrat', sans-serif; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #d4af37; margin-bottom: 10px; }
        .est-title { font-family: 'Oranienbaum', serif; font-size: 21px; color: #FAFAFA; line-height: 1.2; margin-bottom: 20px; }
        .est-price { font-family: 'Oranienbaum', serif; font-size: 40px; color: #d4af37; line-height: 1; margin-bottom: 6px; }
        .est-price-label { font-family: 'Montserrat', sans-serif; font-size: 11px; letter-spacing: 0.1em; color: rgba(255,255,255,0.35); margin-bottom: 24px; }
        .est-divider { height: 1px; background: rgba(255,255,255,0.06); margin-bottom: 24px; }
        .est-body { font-family: 'Montserrat', sans-serif; font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.8; margin-bottom: 24px; flex: 1; }
        .est-toggle { display: flex; align-items: center; gap: 8px; font-family: 'Montserrat', sans-serif; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.35); background: none; border: none; padding: 0; cursor: pointer; transition: color 150ms; }
        .est-toggle:hover { color: rgba(212,175,55,0.8); }
        .est-card.active .est-toggle { color: rgba(212,175,55,0.8); }
        .est-arrow { display: inline-block; transition: transform 200ms; font-size: 10px; }
        .est-card.active .est-arrow { transform: rotate(180deg); }
        .est-details { overflow: hidden; max-height: 0; transition: max-height 300ms ease, opacity 200ms ease, margin-top 200ms ease; opacity: 0; margin-top: 0; }
        .est-card.active .est-details { max-height: 500px; opacity: 1; margin-top: 20px; }
        .est-detail-item { font-family: 'Montserrat', sans-serif; font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.7; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; align-items: flex-start; gap: 10px; }
        .est-detail-item:last-child { border-bottom: none; }
        .est-dot { color: rgba(212,175,55,0.6); margin-top: 2px; flex-shrink: 0; }
        .est-warning { font-family: 'Montserrat', sans-serif; font-size: 11px; color: rgba(255,255,255,0.3); line-height: 1.75; padding: 12px 14px; border-left: 2px solid rgba(212,175,55,0.3); background: rgba(212,175,55,0.02); margin-top: 16px; }
        .est-cta { display: inline-block; margin-top: 20px; padding: 13px 22px; background: #d4af37; color: #050505; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none; transition: opacity 150ms; }
        .est-cta:hover { opacity: 0.85; }
        .est-cta-ghost { display: inline-block; margin-top: 20px; padding: 13px 22px; background: none; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.65); font-family: 'Montserrat', sans-serif; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none; transition: border-color 150ms, color 150ms; }
        .est-cta-ghost:hover { border-color: rgba(212,175,55,0.5); color: #d4af37; }
      `}</style>
      <main>
        <section style={{ padding: '140px 0 80px', background: '#050505' }}>
          <div style={{ maxWidth: '1160px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '16px', textAlign: 'center' }}>Get Started</p>
            <h1 style={{ fontFamily: 'Oranienbaum, serif', fontSize: 'clamp(32px, 5vw, 64px)', color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: '16px', lineHeight: 1.1 }}>Choose Your Estimate Path</h1>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(13px, 1.5vw, 15px)', color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: '520px', margin: '0 auto 64px', lineHeight: 1.8 }}>Every path yields a different level of accuracy. Start wherever feels right — you can always go deeper.</p>
            <div className="est-grid">
              {paths.map((p, i) => (
                <div key={i} className={`est-card${expanded === i ? ' active' : ''}${p.tag ? ' recommended' : ''}`} onClick={() => setExpanded(expanded === i ? null : i)}>
                  {p.tag && <p className="est-tag">{p.tag}</p>}
                  <p className="est-n">{p.n}</p>
                  <p className="est-title">{p.title}</p>
                  <p className="est-price">{prices[i]}</p>
                  <p className="est-price-label">{priceLabels[i]}</p>
                  <div className="est-divider" />
                  <p className="est-body">{p.body}</p>
                  <button className="est-toggle"><span className="est-arrow">▼</span>{expanded === i ? 'Less info' : 'More info'}</button>
                  <div className="est-details">
                    {p.details.map((d, j) => (
                      <div key={j} className="est-detail-item"><span className="est-dot">—</span><span>{d}</span></div>
                    ))}
                    {p.warning && <p className="est-warning">{p.warning}</p>}
                    <a href={p.cta.href} className={i === 0 ? 'est-cta' : 'est-cta-ghost'} onClick={e => e.stopPropagation()}>{p.cta.label} →</a>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '80px', padding: '64px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.7)', marginBottom: '20px' }}>Ready to start?</p>
              <h2 style={{ fontFamily: 'Oranienbaum, serif', fontSize: 'clamp(27px, 5vw, 48px)', color: '#FAFAFA', lineHeight: 1.2, marginBottom: '24px' }}>Get an instant estimate now.</h2>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto 40px' }}>Answer a short series of questions about your stone and receive an estimate immediately. No account required.</p>
              <a href="/get-estimate/instant" style={{ display: 'inline-block', padding: '19px 56px', background: '#d4af37', color: '#050505', fontFamily: 'Montserrat, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', textDecoration: 'none' }} onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>Start Instant Estimate</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
