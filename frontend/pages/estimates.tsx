import TopNav from '../components/shared/TopNav';
import Footer from '../components/shared/Footer';
import DesktopEstimates from '../components/estimates/DesktopEstimates';
import MobileEstimates from '../components/estimates/MobileEstimates';

export default function EstimatesPage() {
  return (
    <>
      <TopNav />
      <main>
        <section style={{ padding: '140px 0 80px', background: 'transparent' }}>
          <div className="container-custom" style={{ maxWidth: '1160px', width: '100%', margin: '0 auto' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px', textAlign: 'center' }}>
              Get Started
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 64px)', color: 'var(--text)', textAlign: 'center', marginBottom: '20px', lineHeight: 1.1 }}>
              Choose Your Estimate Path
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(14px, 1.5vw, 17px)', color: 'var(--text)', textAlign: 'center', maxWidth: '560px', margin: '0 auto 64px', lineHeight: 1.8 }}>
              Every path yields a different estimate. Start wherever feels right — you can always go deeper.
            </p>

            <div className="hidden-mobile">
              <DesktopEstimates />
            </div>
            <div className="hidden-desktop" style={{ position: 'fixed', inset: 0, zIndex: 10, overflowY: 'hidden' }}>
              <MobileEstimates />
            </div>

            <div style={{ marginTop: '64px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, maxWidth: '560px', margin: '0 auto' }}>
                Not sure which path is right for you? All estimates are non-binding. We recommend starting with an Online Estimate if you have photos, or an In-Person Estimate if you are ready to move forward.
              </p>
            </div>

            <div style={{ marginTop: '80px', padding: '64px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '20px' }}>Ready to start?</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(27px, 5vw, 48px)', color: 'var(--text)', lineHeight: 1.2, marginBottom: '24px' }}>Get an instant estimate now.</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto 40px' }}>
                Answer seven quick questions about your stone and the service you need. No account required.
              </p>
              <a href="/get-estimate/instant"
                style={{ display: 'inline-block', padding: '19px 56px', background: 'var(--gold)', color: 'var(--bg)', fontFamily: 'var(--font-ui)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', textDecoration: 'none', transition: 'opacity 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                Start Instant Estimate
              </a>
            </div>
          </div>
        </section>
      </main>
      <div className="hidden-mobile"><Footer /></div>
    </>
  );
}

