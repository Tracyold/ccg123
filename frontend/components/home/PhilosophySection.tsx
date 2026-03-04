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
            el.style.color = 'rgb(30, 60, 180)';
          } else {
            el.style.color = '#FAFAFA';
            el.style.textShadow = 'none';
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
      <div className="container-custom" style={{ maxWidth: '1400px', width: '100%' }}>
        <p
          className="uppercase text-gray-500 mb-4 text-center"
          style={{ fontSize: '12px', letterSpacing: '0.20em' }}
        >
          Philosophy
        </p>
        <h2 data-gold="philo-title" className="title-xl tracking-tight mb-16 text-center">My Four C&apos;s</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {lines.map(({ gold, rest }) => (
            <p
              key={gold}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.875rem, 6vw, 5.5rem)',
                fontWeight: 400,
                lineHeight: 1.25,
                color: '#FAFAFA',
              }}
            >
              <span
                data-gold-word
                style={{
                  color: '#FAFAFA',
                  transition: 'color 1400ms cubic-bezier(0.25, 0.1, 0.25, 1), text-shadow 1400ms cubic-bezier(0.25, 0.1, 0.25, 1), filter 1400ms cubic-bezier(0.25, 0.1, 0.25, 1)',
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
