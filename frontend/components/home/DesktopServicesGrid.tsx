import { useEffect } from 'react';
import { services } from './homeData';

export default function DesktopServicesGrid() {

  useEffect(() => {
    const cards = document.querySelectorAll('[data-service-card]');

    // Set initial hidden state before any transition is applied
    cards.forEach((el, i) => {
      const card = el as HTMLElement;
      card.style.opacity = '0';
      card.style.transform = 'translateY(50px)';

      const icon = card.querySelector('[data-service-icon]') as HTMLElement | null;
      if (icon) {
        icon.style.opacity = '0';
        icon.style.transform = 'translateY(30px)';
      }

      const title = card.querySelector('[data-service-title]') as HTMLElement | null;
      if (title) {
        title.style.opacity = '0';
        title.style.transform = 'translateY(16px)';
      }

      const desc = card.querySelector('[data-service-desc]') as HTMLElement | null;
      if (desc) {
        desc.style.opacity = '0';
        desc.style.transform = 'translateY(12px)';
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target as HTMLElement;
            const i = parseInt(card.dataset.index || '0');
            const base = i * 80;

            // Card fades in
            card.style.transition = `opacity 600ms ease-out ${base}ms, transform 600ms ease-out ${base}ms`;
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';

            // Icon flies in from further below with more drama
            const icon = card.querySelector('[data-service-icon]') as HTMLElement | null;
            if (icon) {
              icon.style.transition = `opacity 700ms ease-out ${base + 150}ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${base + 150}ms`;
              icon.style.opacity = '1';
              icon.style.transform = 'translateY(0)';
            }

            // Title fades in softly after icon
            const title = card.querySelector('[data-service-title]') as HTMLElement | null;
            if (title) {
              title.style.transition = `opacity 600ms ease-out ${base + 260}ms, transform 600ms ease-out ${base + 260}ms`;
              title.style.opacity = '1';
              title.style.transform = 'translateY(0)';
            }

            // Desc fades in last
            const desc = card.querySelector('[data-service-desc]') as HTMLElement | null;
            if (desc) {
              desc.style.transition = `opacity 600ms ease-out ${base + 360}ms, transform 600ms ease-out ${base + 360}ms`;
              desc.style.opacity = '1';
              desc.style.transform = 'translateY(0)';
            }

            observer.unobserve(card);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px 180px 0px' }
    );

    cards.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="hidden md:grid"
      style={{
        marginTop: '48px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'clamp(16px, 2vw, 48px)',
      }}
    >
      {services.map((service, i) => (
        <div
          key={service.title}
          data-gold="service-card"
          data-service-card
          data-index={`${i}`}
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
              filter: 'drop-shadow(0 0 0 rgba(212,175,55,0))',
              transition: 'filter 520ms ease-out, transform 250ms ease-out',
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
            data-gold="section-title"
            data-service-title
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 2.2vw, 36px)',
              fontWeight: 400,
              color: '#FAFAFA',
              marginBottom: 'clamp(8px, 1vw, 20px)',
            }}
          >
            {service.title}
          </h3>
          <p
            data-service-desc
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(12px, 1.1vw, 16px)',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.65)',
              flex: 1,
            }}
          >
            {service.description}
          </p>
        </div>
      ))}
    </div>
  );
}
