import { useRouter } from 'next/router';
import TopNav from '../../components/shared/TopNav';

export default function EstimateResult() {
  const router = useRouter();
  const { weight, color, shape, damage, species, transparency, service } = router.query;

  return (
    <>
      <TopNav />
      <div style={{ minHeight: '100svh', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 60px' }}>
        <div style={{ maxWidth: '580px', width: '100%' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '20px' }}>Your Estimate</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(27px, 5vw, 42px)', color: 'var(--text)', lineHeight: 1.2, marginBottom: '40px' }}>We have what we need.</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '48px' }}>
            {[['Weight', weight], ['Color', color], ['Shape', shape], ['Damage', damage], ['Species', species], ['Transparency', transparency], ['Service', service]].map(([l, v]) => v ? (
              <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{l}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text)' }}>{v}</p>
              </div>
            ) : null)}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '32px' }}>
            This is a preliminary estimate summary. A formal estimate will be prepared once we review your stone in person or via submitted photos.
          </p>
          <button onClick={() => router.push('/account')}
            style={{ padding: '15px 36px', background: 'var(--gold)', border: 'none', color: 'var(--bg)', fontFamily: 'var(--font-ui)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Continue to Account
          </button>
        </div>
      </div>
    </>
  );
}
