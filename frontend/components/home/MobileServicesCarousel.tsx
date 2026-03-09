import { useEffect, useRef } from 'react';
import { services } from './homeData';

function computeSectionTopBottom(section: HTMLElement) {
  const top = section.getBoundingClientRect().top + window.scrollY;
  const bottom = top + section.offsetHeight;
  return { top, bottom };
}

export default function MobileServicesCarousel() {
  const lockedRef = useRef(false);
  const unlockCooldownRef = useRef(false);
  const currentFocusIndexRef = useRef(-1);

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 768) return;

    const section = document.getElementById('services-section') as HTMLElement | null;
    const scroller = document.getElementById('mobile-services-scroll') as HTMLElement | null;
    const cards = document.querySelectorAll('[data-service-card-mobile]');
    const arrowEl = document.getElementById('mobile-scroll-arrow') as HTMLElement | null;

    if (!section || !scroller || cards.length === 0) return;

    const defocus = (card: Element) => {
      const el = card as HTMLElement;
      el.style.transition = 'opacity 400ms ease-out, filter 400ms ease-out, transform 400ms ease-out';
      el.style.opacity = '0.20';
      el.style.filter = 'blur(3px)';
      el.style.transform = 'scale(0.98)';
      el.style.pointerEvents = 'none';
      const icon = el.querySelector('[data-service-icon]') as HTMLElement | null;
      if (icon) {
        icon.style.transition = 'transform 520ms ease-out, filter 520ms ease-out, opacity 520ms ease-out';
        icon.style.transitionDelay = '60ms';
        icon.style.opacity = '0.75';
        icon.style.transform = 'scale(0.96) translateY(2px)';
        icon.style.filter = 'drop-shadow(0 0 0 rgba(212,175,55,0))';
      }
    };

    const focus = (card: Element) => {
      const el = card as HTMLElement;
      el.style.transition = 'opacity 500ms ease-out, filter 500ms ease-out, transform 500ms ease-out';
      el.style.opacity = '1';
      el.style.filter = 'blur(0px)';
      el.style.transform = 'scale(1)';
      el.style.pointerEvents = 'auto';
      const icon = el.querySelector('[data-service-icon]') as HTMLElement | null;
      if (icon) {
        icon.style.transition = 'transform 640ms ease-out, filter 640ms ease-out, opacity 640ms ease-out';
        icon.style.transitionDelay = '110ms';
        icon.style.opacity = '1';
        icon.style.transform = 'scale(1.02) translateY(0px)';
        icon.style.filter = 'drop-shadow(0 0 10px rgba(212,175,55,0.18)) drop-shadow(0 0 22px rgba(212,175,55,0.10))';
      }
    };

    cards.forEach(defocus);

    const handleFocus = () => {
      const headerEl = document.getElementById('services-sticky-header');
      const headerH = headerEl ? headerEl.getBoundingClientRect().height : 0;
      const viewportMidpoint = headerH + (scroller.clientHeight - headerH) / 2;
      let closestIndex = -1;
      let closestDistance = Infinity;
      cards.forEach((card, i) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const scrollerRect = scroller.getBoundingClientRect();
        const cardCenter = rect.top - scrollerRect.top + rect.height / 2;
        const distance = Math.abs(cardCenter - viewportMidpoint);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      });
      if (closestIndex !== currentFocusIndexRef.current) {
        cards.forEach((card, i) => {
          if (i === closestIndex) focus(card);
          else defocus(card);
        });
        currentFocusIndexRef.current = closestIndex;
      }
      if (arrowEl) {
        const isLast = closestIndex === cards.length - 1;
        arrowEl.style.opacity = isLast ? '0' : '1';
        arrowEl.style.pointerEvents = 'none';
      }
    };

    const inSection = () => {
      const r = section.getBoundingClientRect();
      return r.top <= 8 && r.bottom >= window.innerHeight * 0.65;
    };

    const lock = () => {
      if (lockedRef.current || unlockCooldownRef.current) return;
      lockedRef.current = true;
      document.body.style.overflow = 'hidden';
      const { top } = computeSectionTopBottom(section);
      window.scrollTo({ top, behavior: 'auto' });
      scroller.style.scrollSnapType = 'none';
      scroller.scrollTop = 0;
      requestAnimationFrame(() => {
        scroller.style.scrollSnapType = 'y mandatory';
        scroller.dispatchEvent(new Event('scroll'));
      });
    };

    const unlock = (direction: 'down' | 'up') => {
      if (!lockedRef.current) return;
      lockedRef.current = false;
      unlockCooldownRef.current = true;
      document.body.style.overflow = '';
      const { top, bottom } = computeSectionTopBottom(section);
      const target = direction === 'down' ? bottom + 1 : top - 1;
      window.scrollTo({ top: target, behavior: 'auto' });
      window.setTimeout(() => { unlockCooldownRef.current = false; }, 250);
    };

    const atTop = () => scroller.scrollTop <= 2;
    const atBottom = () => scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;

    const handleWindowScroll = () => { if (inSection()) lock(); };

    const onWheel = (e: WheelEvent) => {
      if (!lockedRef.current) return;
      const dy = e.deltaY;
      if (dy > 0 && atBottom()) { e.preventDefault(); unlock('down'); return; }
      if (dy < 0 && atTop()) { e.preventDefault(); unlock('up'); return; }
    };

    let lastTouchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      if (!lockedRef.current) return;
      lastTouchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!lockedRef.current) return;
      if (lastTouchY == null) return;
      const y = e.touches[0]?.clientY ?? lastTouchY;
      const dy = lastTouchY - y;
      if (dy > 0 && atBottom()) { e.preventDefault(); unlock('down'); lastTouchY = null; return; }
      if (dy < 0) { e.preventDefault(); unlock('up'); lastTouchY = null; return; }
      lastTouchY = y;
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    scroller.addEventListener('scroll', handleFocus, { passive: true });
    scroller.addEventListener('wheel', onWheel, { passive: false });
    scroller.addEventListener('touchstart', onTouchStart, { passive: true });
    scroller.addEventListener('touchmove', onTouchMove, { passive: false });
    handleFocus();
    handleWindowScroll();

    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
      scroller.removeEventListener('scroll', handleFocus as any);
      scroller.removeEventListener('wheel', onWheel as any);
      scroller.removeEventListener('touchstart', onTouchStart as any);
      scroller.removeEventListener('touchmove', onTouchMove as any);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="md:hidden flex flex-col relative"
      style={{
        height: 'calc(100vh - 90px)',
        marginTop: '8px',
        overflow: 'hidden',
      }}
    >
      <div
        className="pointer-events-none"
        style={{
          height: '80px',
          background: 'linear-gradient(to bottom, var(--bg) 0%, transparent 100%)',
          position: 'absolute',
          left: 0, right: 0,
          zIndex: 10,
        }}
      />
      <div
        className="pointer-events-none"
        style={{
          height: '80px',
          background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)',
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          zIndex: 10,
        }}
      />
      <div
        id="mobile-services-scroll"
        className="flex flex-col"
        style={{
          gap: '32px',
          flex: 1,
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingTop: '8px',
          paddingBottom: '120px',
          scrollbarWidth: 'none',
          scrollPaddingTop: '0px',
        }}
      >
        {services.map((service, i) => (
          <div
            key={service.title}
            data-service-card-mobile
            style={{
              scrollSnapAlign: 'center',
              scrollSnapStop: 'always',
              minHeight: 'calc(100vh - 110px)',
              padding: '32px',
              paddingTop: '48px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg)',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              opacity: 0.55,
              filter: 'blur(3px)',
              transform: 'scale(0.98)',
              willChange: 'opacity, filter, transform',
            }}
          >
            <div
              data-service-icon
              style={{
                marginBottom: '24px',
                transition: 'transform 520ms ease-out, filter 520ms ease-out, opacity 520ms ease-out',
                transitionDelay: `${35 + i * 18}ms`,
                transform: 'scale(0.98)',
                opacity: 0.9,
                filter: 'drop-shadow(0 0 0 rgba(212,175,55,0))',
              }}
            >
              <service.Icon size={36} color="#d4af37" strokeWidth={1.5} />
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(22px, 6vw, 26px)',
                fontWeight: 400,
                color: 'var(--text)',
                marginBottom: '16px',
                textAlign: 'left',
              }}
            >
              {service.title}
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                lineHeight: 1.7,
                color: 'var(--text)',
                textAlign: 'left',
              }}
            >
              {service.description}
            </p>
          </div>
        ))}
      </div>

      <div
        id="mobile-scroll-arrow"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          opacity: 1,
          transition: 'opacity 400ms ease',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '10px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: '1px',
            height: '32px',
            background: 'linear-gradient(to bottom, #d4af37, rgba(212,175,55,0))',
            animation: 'scrollPulse 1.6s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}
