import { useEffect } from 'react';

const lines = [
  { gold: 'Color', rest: ' is the goal.' },
  { gold: 'Conscious', rest: ' of the weight.' },
  { gold: 'Careful', rest: ' with my approach.' },
  { gold: 'Cutting', rest: ' is my craft.' },
];

export default function PhilosophySection() {

  useEffect(() => {
    const words = Array.from(document.querySelectorAll('[data-gold-word]')) as HTMLElement[];
    let rafId: number;
    let mounted = true;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp = (v: number) => Math.max(0, Math.min(1, v));

    const vals = words.map(() => ({ t: 0 }));

    const tick = () => {
      if (!mounted) return;
      words.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - vh / 2) / (vh * 0.55);
        const target = clamp(1 - dist);
        vals[i].t = lerp(vals[i].t, target, 0.07);
        const t = vals[i].t;
        const r = Math.round(lerp(250, 212, t));
        const g = Math.round(lerp(250, 175, t));
        const b = Math.round(lerp(250, 55, t));
        el.style.color = `rgb(${r},${g},${b})`;
        el.style.filter = t > 0.05
          ? `brightness(${1 + t * 0.2}) drop-shadow(0 0 ${t * 8}px rgba(212,175,55,${t * 0.5})) drop-shadow(0 0 ${t * 22}px rgba(255,255,255,${t * 0.15}))`
          : 'none';
      });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => { mounted = false; cancelAnimationFrame(rafId); };
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
                data-gold="hero-word"
                data-gold-word
                style={{
                  transition: 'filter 1400ms cubic-bezier(0.25, 0.1, 0.25, 1)',
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
