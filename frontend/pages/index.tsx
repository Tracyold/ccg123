import React, { useEffect, useRef } from 'react';
import {
  ArrowRight,
  Gem,
  RefreshCw,
  Briefcase,
  ShoppingBag,
  Package,
  Layers,
} from 'lucide-react';
import TopNav from '../components/shared/TopNav';
import Footer from '../components/shared/Footer';

function GlobalStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
@import url('https://fonts.googleapis.com/css2?family=Oranienbaum&family=Comfortaa:wght@300;400&family=Montserrat:wght@400;500;600&display=swap');

:root {
  --font-display: 'Oranienbaum', Georgia, serif;
  --font-subtitle: 'Montserrat', sans-serif;
  --font-body: 'Comfortaa', sans-serif;
  --font-ui: 'Montserrat', sans-serif;
  --font-mono: 'Courier New', monospace;
}

html, body, #__next {
  font-family: var(--font-body);
  background-color: #050505;
  color: #FAFAFA;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-subtitle);
}

.hero-glow {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(56, 189, 248, 0.08) 0%,
    rgba(0, 0, 0, 0) 50%
  );
  pointer-events: none;
}

.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
.delay-400 { animation-delay: 400ms; }
.delay-500 { animation-delay: 500ms; }

.title-xl {
  font-family: var(--font-display);
  font-size: 3rem;
  line-height: 1.2;
  letter-spacing: 0.04em;
  font-weight: 400;
}

.hero-title {
  font-family: var(--font-display);
  font-size: 4.5rem;
  line-height: 1.1;
  letter-spacing: 0.04em;
  font-weight: 400;
}

.title-sm {
  font-family: var(--font-subtitle);
  font-weight: 500;
}

.name-title {
  font-size: 7rem;
  font-family: var(--font-display);
  font-weight: 400;
}

.spec-text {
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.page-title {
  font-family: var(--font-display);
}

.container-custom {
  max-width: 80rem;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

@media (min-width: 768px) {
  .container-custom {
    padding-left: 3rem;
    padding-right: 3rem;
  }
}

.section-spacing {
  padding-top: 6rem;
  padding-bottom: 6rem;
}

@media (min-width: 768px) {
  .section-spacing {
    padding-top: 8rem;
    padding-bottom: 8rem;
  }
}

.gem-card {
  background-color: #0A0A0A;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.5s ease;
  overflow: hidden;
  position: relative;
}

.gem-card:hover {
  border-color: rgba(255, 255, 255, 0.20);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.05);
}

@media (max-width: 767px) {
  .gem-card:active {
    border-color: rgba(245, 158, 11, 0.5);
  }
}

.hover-lift {
  transition: transform 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-6px);
}

.btn-primary {
  background-color: #ffffff;
  color: #000000;
  padding: 0.75rem 2rem;
  font-family: var(--font-ui);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #e5e5e5;
}

.btn-secondary {
  background-color: transparent;
  color: #FAFAFA;
  padding: 0.75rem 2rem;
  font-family: var(--font-ui);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.20);
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  cursor: pointer;
}

.btn-secondary:hover {
  border-color: rgba(255, 255, 255, 1);
  background-color: rgba(255, 255, 255, 0.05);
}

@media (max-width: 767px) {
  .hero-title {
    font-size: 2.4rem;
  }
  .page-title.title-xl {
    font-size: 2rem !important;
  }
  .name-title {
    font-size: 2rem !important;
  }
  .section-spacing {
    padding-top: 4rem;
    padding-bottom: 4rem;
  }
  .container-custom {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  #services-section {
    padding-top: 0 !important;
  }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}

@keyframes scrollPulse {
  0%, 100% { opacity: 0.4; transform: scaleY(1); }
  50% { opacity: 1; transform: scaleY(1.15); }
}
`,
      }}
    />
  );
}

function computeSectionTopBottom(section: HTMLElement) {
  const top = section.getBoundingClientRect().top + window.scrollY;
  const bottom = top + section.offsetHeight;
  return { top, bottom };
}

export default function Home() {
  const services = [
    {
      title: 'Custom Cutting',
      description:
        "Receive a tailored cutting experience designed to reveal each gemstone's highest potential.",
      Icon: Gem,
    },
    {
      title: 'Re-Polish & Re-Cut',
      description:
        'Breathe new life into existing gemstones through restoration focused on above-industry-standard weight retention.',
      Icon: RefreshCw,
    },
    {
      title: 'Jeweler Services',
      description:
        'Working directly with jewelers in the industry to deliver quick turn arounds and shorter lead times.',
      Icon: Briefcase,
    },
    {
      title: 'Sell Gemstones',
      description:
        'An online shop with custom and flexible purchasing features, including pay now, pay later, inquiries and negotiations directly through the site.',
      Icon: ShoppingBag,
    },
    {
      title: 'Buy Rough',
      description: 'Source quality rough gemstones for your cutting projects.',
      Icon: Package,
    },
    {
      title: 'Buy Gems In Bulk',
      description: 'Wholesale purchasing from jewelers and dealers.',
      Icon: Layers,
    },
  ];

  const lockedRef = useRef(false);
  const unlockCooldownRef = useRef(false);
  const currentFocusIndexRef = useRef(-1);

  useEffect(() => {
    const elements = document.querySelectorAll('[data-scroll-reveal]');
    elements.forEach((el) => {
      const h = el as HTMLElement;
      h.style.opacity = '0';
      h.style.transform = 'translateY(30px)';
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
            yearsEl.style.color = '#d4af37';
            yearsEl.style.textShadow =
              '0 0 10px rgba(212,175,55,0.55), 0 0 22px rgba(212,175,55,0.28), 0 0 44px rgba(212,175,55,0.14)';
            setTimeout(() => {
              sevenEl.style.transition = 'color 700ms ease-out, text-shadow 700ms ease-out';
              sevenEl.style.color = '#d4af37';
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
    <>
      <GlobalStyles />
      <main>
        <TopNav />

        {/* ── Hero Section ── */}
        <section
          style={{
            minHeight: '100svh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="absolute inset-0 hero-glow" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/assets/Studio.jpeg)',
              opacity: 0.2,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/50" />

          <div className="container-custom relative z-10 text-center">
            <p
              className="uppercase text-gray-400 mb-6 opacity-0 animate-fade-in transition-all duration-700"
              style={{ fontSize: '14px', letterSpacing: '0.30em' }}
              data-scroll-reveal
            >
              Tempe, Arizona
            </p>

            <h1 className="hero-title title-xl tracking-tight mb-6 opacity-0 animate-fade-in delay-100">
              <span style={{ color: '#d4af37' }}>Cutting</span> Corners -- Not the{' '}
              <span style={{ color: '#d4af37' }}>Quality</span>
            </h1>

            <p
              className="text-gray-400 max-w-3xl mx-auto mb-10 opacity-0 animate-fade-in delay-200"
              style={{ fontSize: '18px', lineHeight: 1.6 }}
            >
              Professional gemstone cutter focused on color, yield, and stone potential for jewelry
              professionals nationwide.
            </p>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in delay-500">
            <div className="w-px h-16 bg-gradient-to-b from-white/0 via-white/30 to-white/0" />
          </div>

          {/* Desktop stat card */}
          <div
            className="absolute bottom-8 right-8 hidden md:flex flex-col justify-center"
            style={{
              width: '12rem',
              height: '12rem',
              backgroundColor: '#0A0A0A',
              border: '1px solid rgba(255,255,255,0.10)',
              padding: '1.5rem',
            }}
          >
            <p className="spec-text text-gray-500 mb-1" style={{ fontSize: '11px' }}>
              Industry for
            </p>
            <p className="title-sm text-white" style={{ fontSize: '1.875rem' }}>
              13 Years
            </p>
            <p className="text-gray-500" style={{ fontSize: '0.875rem' }}>
              Cutting for Seven
            </p>
          </div>
        </section>

        {/* ── Mobile Industry Section ── */}
        <section
          id="mobile-industry-section"
          className="md:hidden text-center px-4 flex flex-col items-center justify-center"
          style={{
            background: '#050505',
            borderTop: '1px solid rgba(255,255,255,0.10)',
            minHeight: '100svh',
            paddingTop: '40px',
            paddingBottom: '40px',
          }}
        >
          <p
            className="uppercase mb-2"
            style={{
              fontSize: '11px',
              letterSpacing: '0.29em',
              color: 'rgba(255,255,255,0.52)',
            }}
          >
            Industry for
          </p>
          <p
            id="mobile-years"
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            13 Years
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.52)', marginTop: '4px' }}>
            Cutting for <span id="mobile-seven">Seven</span>
          </p>
        </section>

        {/* ── Philosophy Section ── */}
        <section id="philosophy-section" className="section-spacing">
          <div className="container-custom">
            <p
              className="uppercase text-gray-500 mb-4"
              style={{ fontSize: '12px', letterSpacing: '0.20em' }}
            >
              Philosophy
            </p>
            <h2 className="title-xl tracking-tight mb-12">My Four C&apos;s</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {[
                  { gold: 'Color', rest: ' is the goal.', delay: '100ms' },
                  { gold: 'Conscious', rest: ' of the weight.', delay: '200ms' },
                  { gold: 'Careful', rest: ' with my approach.', delay: '300ms' },
                  { gold: 'Cutting', rest: ' is my craft.', delay: '400ms' },
                ].map(({ gold, rest, delay }) => (
                  <p
                    key={gold}
                    className="opacity-0 transition-all duration-700"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.875rem, 4vw, 2.5rem)',
                      fontWeight: 400,
                      lineHeight: 1.25,
                      animationDelay: delay,
                    }}
                    data-scroll-reveal
                  >
                    <span style={{ color: '#d4af37', whiteSpace: 'nowrap' }}>{gold}</span>
                    {rest}
                  </p>
                ))}
              </div>

              <div className="relative group overflow-hidden rounded" data-scroll-reveal>
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/0 transition-all duration-500 z-10" />
                <div
                  className="absolute inset-0 z-20 pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 60px 20px rgba(0,0,0,0.8)' }}
                />
                <div className="absolute inset-0 z-30 flex items-center justify-center transition-all duration-500 group-hover:opacity-0">
                  <span className="title-sm text-white" style={{ fontSize: '0.875rem' }}>
                    Studio
                  </span>
                </div>
                <img
                  src="/assets/Chair.jpeg"
                  alt="Workshop"
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Services Section ── */}
        <section id="services-section" className="section-spacing">
          <div className="container-custom">
            <div
              id="services-sticky-header"
              className="text-center"
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 20,
                background: '#050505',
                paddingTop: '28px',
                paddingBottom: '0px',
              }}
            >
              <p
                className="uppercase mb-3 text-center"
                style={{
                  fontSize: '12px',
                  letterSpacing: '0.20em',
                  color: 'rgba(255,255,255,0.52)',
                }}
              >
                What I Do
              </p>
              <h2
                className="title-xl text-center"
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 56px)',
                  letterSpacing: '-0.01em',
                  marginBottom: '0px',
                }}
              >
                Services
              </h2>
            </div>

            {/* Desktop 3-col grid */}
            <div className="hidden md:grid grid-cols-3 gap-12" style={{ marginTop: '-8px' }}>
              {services.map((service, i) => (
                <div
                  key={service.title}
                  className="gem-card hover-lift opacity-0 transition-all duration-700"
                  data-scroll-reveal
                  style={{
                    padding: '56px',
                    borderRadius: '14px',
                    minHeight: '320px',
                    animationDelay: `${(i + 1) * 100}ms`,
                    border: 'none',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.55)',
                  }}
                >
                  <div
                    style={{
                      marginBottom: '32px',
                      transition: 'transform 250ms ease-out, filter 520ms ease-out',
                      transitionDelay: `${40 + i * 14}ms`,
                      filter: 'drop-shadow(0 0 0 rgba(212,175,55,0))',
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
                    className="title-sm text-white mb-5"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '28px',
                      fontWeight: 400,
                    }}
                  >
                    {service.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '16px',
                      lineHeight: 1.75,
                      color: 'rgba(255,255,255,0.65)',
                      maxWidth: '90%',
                    }}
                  >
                    {service.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Mobile scroll carousel */}
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
                  background: 'linear-gradient(to bottom, rgba(5,5,5,1) 0%, rgba(5,5,5,0) 100%)',
                  position: 'absolute',
                  left: 0, right: 0,
                  zIndex: 10,
                }}
              />
              <div
                className="pointer-events-none"
                style={{
                  height: '80px',
                  background: 'linear-gradient(to top, rgba(5,5,5,1) 0%, rgba(5,5,5,0) 100%)',
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
                      backgroundColor: '#0A0A0A',
                      border: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      opacity: 0.2,
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
                        color: '#FAFAFA',
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
                        color: 'rgba(255,255,255,0.70)',
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
                    color: 'rgba(255,255,255,0.35)',
                  }}
                >
                  Scroll
                </span>
                <div
                  style={{
                    width: '1px',
                    height: '32px',
                    background: 'linear-gradient(to bottom, rgba(212,175,55,0.6), rgba(212,175,55,0))',
                    animation: 'scrollPulse 1.6s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── About Section ("The Cutter") ── */}
        <section className="section-spacing">
          <div className="container-custom">
            <p
              className="uppercase text-gray-500 mb-4"
              style={{ fontSize: '12px', letterSpacing: '0.20em' }}
            >
              About
            </p>
            <h2 className="title-xl tracking-tight mb-16">The Cutter</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div
                className="opacity-0 transition-all duration-700"
                data-scroll-reveal
                style={{ animationDelay: '100ms' }}
              >
                <div
                  style={{
                    aspectRatio: '1 / 1',
                    overflow: 'hidden',
                    position: 'relative',
                    borderRadius: '18px',
                  }}
                >
                  <img
                    src="/assets/Cutter.jpeg"
                    alt="Michael Wall at work"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      transform: 'scale(1.1)',
                      display: 'block',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      boxShadow: 'inset 0 0 30px 15px rgba(0,0,0,0.7)',
                      zIndex: 10,
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <h2
                  className="page-title title-xl name-title mb-6 opacity-0 transition-all duration-700"
                  data-scroll-reveal
                  style={{ animationDelay: '100ms' }}
                >
                  Michael Wall
                </h2>

                <p
                  className="opacity-0 transition-all duration-700"
                  data-scroll-reveal
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '17px',
                    lineHeight: 1.75,
                    color: 'rgba(255,255,255,0.68)',
                    maxWidth: '520px',
                    marginBottom: '24px',
                    animationDelay: '200ms',
                  }}
                >
                  Based in Tempe, Arizona, I&apos;ve been part of the gemstone industry since 2013,
                  transitioning from amateur enthusiast to professional cutter in 2021. My focus is on
                  med-high weight retention cuts that maximize both value and beauty.
                </p>

                <p
                  className="opacity-0 transition-all duration-700"
                  data-scroll-reveal
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '17px',
                    lineHeight: 1.75,
                    color: 'rgba(255,255,255,0.68)',
                    maxWidth: '520px',
                    marginBottom: '32px',
                    animationDelay: '300ms',
                  }}
                >
                  I work closely with jewelers across the industry, specializing in natural colored
                  gemstones including sapphires, tourmalines, emeralds, tanzanites, and more. Whether you
                  need a custom cut, re-polish, or expert consultation, I&apos;m here to deliver results that
                  exceed expectations.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  {/* FIX: /gallery → /portfolio */}
                  <a href="/portfolio" className="btn-primary">
                    View Portfolio
                  </a>
                  {/* FIX: correct phone number */}
                  <a href="tel:4802864595" className="btn-secondary">
                    Call 480-286-4595
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section
          className="section-spacing relative overflow-hidden"
          style={{ backgroundColor: '#0A0A0A' }}
        >
          <div className="absolute inset-0 hero-glow pointer-events-none" style={{ opacity: 0.5 }} />

          <div className="container-custom relative z-10 text-center" style={{ maxWidth: '880px' }}>
            <h2
              className="page-title title-xl mb-8 opacity-0 transition-all duration-700"
              data-scroll-reveal
              style={{ animationDelay: '100ms' }}
            >
              Ready to Start?
            </h2>

            <p
              className="mx-auto mb-12 opacity-0 transition-all duration-700"
              data-scroll-reveal
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '18px',
                lineHeight: 1.75,
                color: 'rgba(255,255,255,0.70)',
                maxWidth: '600px',
                animationDelay: '200ms',
              }}
            >
              Whether you have a rough stone waiting to be transformed or need expert advice on your next
              project, I&apos;m here to help.
            </p>

            {/* FIX: /booking → /shop */}
            <a
              href="/shop"
              className="btn-primary opacity-0 transition-all duration-700"
              data-scroll-reveal
              style={{
                borderRadius: '999px',
                padding: '16px 40px',
                fontSize: '14px',
                animationDelay: '300ms',
              }}
            >
              Browse Shop
              <ArrowRight size={16} />
            </a>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
