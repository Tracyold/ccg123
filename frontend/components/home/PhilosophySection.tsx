import { useEffect } from 'react';

const lines = [
  { gold: 'Color', rest: ' is the goal.' },
  { gold: 'Conscious', rest: ' of the weight.' },
  { gold: 'Careful', rest: ' with my approach.' },
  { gold: 'Cutting', rest: ' is my craft.' },
];

export default function PhilosophySection() {

  useEffect(() => {
    const words = document.querySelectorAll('[data-gold-word]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.style.color = '#d4af37';
          } else {
            el.style.color = '#FAFAFA';
          }
        });
      },
      { threshold: 0.8, rootMargin: '0px 0px -20% 0px' }
    );

    words.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        padding: '6rem 0',
      }}
    >
      <div className="container-custom" style={{ maxWidth: '720px' }}>
        <p
          className="uppercase text-gray-500 mb-4 text-center"
          style={{ fontSize: '12px', letterSpacing: '0.20em' }}
        >
          Philosophy
        </p>
        <h2 className="title-xl tracking-tight mb-16 text-center">My Four C&apos;s</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {lines.map(({ gold, rest }) => (
            <p
              key={gold}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.875rem, 4vw, 2.5rem)',
                fontWeight: 400,
                lineHeight: 1.25,
                color: '#FAFAFA',
              }}
            >
              <span
                data-gold-word
                style={{
                  color: '#FAFAFA',
                  transition: 'color 600ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {gold}
              </span>
              {rest}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
