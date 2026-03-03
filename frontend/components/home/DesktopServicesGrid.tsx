import { useEffect, useRef } from 'react';
import { services } from './homeData';

export default function DesktopServicesGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('[data-service-card]');
    cards.forEach((el, i) => {
      const h = el as HTMLElement;
      h.style.opacity = '0';
      h.style.transform = 'translateY(80px)';
      h.dataset.delay = String(i * 100);
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = parseInt(el.dataset.delay || '0');
            setTimeout(() => {
              el.style.transition = 'opacity 1100ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
              const icon = el.querySelector('[data-service-icon]') as HTMLElement | null;
              if (icon) {
                setTimeout(() => {
                  icon.style.transition = 'opacity 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 520ms ease-out';
                  icon.style.opacity = '1';
                  icon.style.transform = 'translateY(0) scale(1)';
                }, 400);
              }
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -60px 0px' }
    );
    cards.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={gridRef}
      className="hidden md:grid"
      style={{
        marginTop: '-8px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'clamp(16px, 2vw, 48px)',
      }}
    >
      {services.map((service, i) => (
        <div
          key={service.title}
          data-service-card
          data-delay={`${i * 100}`}
          className="gem-card"
          style={{
            aspectRatio: '1 / 1',
            padding: 'clamp(24px, 3vw, 56px)',
            borderRadius: '14px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.55)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          <div
            data-service-icon
            style={{
              marginBottom: 'clamp(16px, 2vw, 32px)',
              opacity: 0,
              transform: 'translateY(24px) scale(0.85)',
              filter: 'drop-shadow(0 0 0 rgba(212,175,55,0))',
              transition: 'transform 250ms ease-out, filter 520ms ease-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              (e.currentTarget as HTMLElement).style.filter =
                'drop-shadow(0 0 10px rgba(212,175,55,0.18)) drop-shadow(0 0 22px rgba(212,175,55,0.10))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              (e.currentTarget as HTMLElement).style.filter =
                'drop-shadow(0 0 0 rgba(212,175,55,0))';
            }}
          >
            <service.Icon size={48} color="#d4af37" strokeWidth={1.5} />
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(18px, 1.8vw, 28px)',
              fontWeight: 400,
              color: '#FAFAFA',
              marginBottom: 'clamp(8px, 1vw, 20px)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {service.title}
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(12px, 1.1vw, 16px)',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.65)',
            }}
          >
            {service.description}
          </p>
        </div>
      ))}
    </div>
  );
}
