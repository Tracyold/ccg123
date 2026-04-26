import { useEffect } from 'react';

export default function MobileIndustrySection() {
  useEffect(() => {
    const yearsEl = document.getElementById('mobile-years');
    const sevenEl = document.getElementById('mobile-seven');
    const industrySection = document.getElementById('mobile-industry-section');
    if (!yearsEl || !sevenEl || !industrySection) return;
    let glowTriggered = false;
    const glowObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !glowTriggered) {
            glowTriggered = true;
            yearsEl.style.transition = 'color 700ms ease-out, text-shadow 700ms ease-out';
            yearsEl.style.color = 'var(--gold)';
            yearsEl.style.textShadow =
              '0 0 10px rgba(212,175,55,0.55), 0 0 22px rgba(212,175,55,0.28), 0 0 44px rgba(212,175,55,0.14)';
            setTimeout(() => {
              sevenEl.style.transition = 'color 700ms ease-out, text-shadow 700ms ease-out';
              sevenEl.style.color = 'var(--gold)';
              sevenEl.style.textShadow =
                '0 0 10px rgba(212,175,55,0.55), 0 0 22px rgba(212,175,55,0.28), 0 0 44px rgba(212,175,55,0.14)';
            }, 250);
          }
        });
      },
      { threshold: 0.65 }
    );
    glowObserver.observe(industrySection);
    return () => glowObserver.disconnect();
  }, []);

  return (
    <section
      id="mobile-industry-section"
      className="md:hidden text-center px-4 flex flex-col items-center justify-center"
      style={{
        background: 'transparent',
        borderTop: '1px solid var(--border)',
        minHeight: '100svh',
        paddingTop: '40px',
        paddingBottom: '40px',
      }}
    >
      <p
        className="uppercase mb-2"
        style={{
          fontSize: '0.6875rem',
          letterSpacing: '0.29em',
          color: 'var(--text-muted)',
        }}
      >
        Industry for
      </p>
      <p
        id="mobile-years"
        style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--text)',
        }}
      >
        13 Years
      </p>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
        Cutting for <span id="mobile-seven">Seven</span>
      </p>
    </section>
  );
}
