import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { services } from '../components/home/homeData';
import MobileIndustrySection from '../components/home/MobileIndustrySection';
import MobileServicesCarousel from '../components/home/MobileServicesCarousel';
import DesktopServicesGrid from '../components/home/DesktopServicesGrid';
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
  background-color: #101010;
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
  animation: fade-in 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
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


export default function Home() {

  useEffect(() => {
    const groups = document.querySelectorAll('[data-reveal-group]');
    groups.forEach((group) => {
      const elements = group.querySelectorAll('[data-scroll-reveal]');
      elements.forEach((el, i) => {
        const h = el as HTMLElement;
        h.style.opacity = '0';
        h.style.transform = 'translateY(80px)';
        h.dataset.revealIndex = String(i);
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const index = parseInt(el.dataset.revealIndex || '0');
            const delay = index * 100;
            setTimeout(() => {
              el.style.transition = 'opacity 1100ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -60px 0px' }
    );

    document.querySelectorAll('[data-scroll-reveal]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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
            className="absolute inset-1 bg-cover"
            style={{
              backgroundImage: 'url(/assets/Studio.jpeg); opacity: 0.9',
              backgroundPosition: '62% 40%',
              opacity: '0.4',
            }}
          />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(5,5,5,0.55) 20%, rgba(5,5,5,0.85) 90%, rgba(5,5,5,0.98) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(5,5,5,0.75) 0%, rgba(5,5,5,0.20) 30%, rgba(5,5,5,0.20) 70%, rgba(5,5,5,0.98) 100%)' }} />

          <div className="container-custom relative z-10 text-center">
            <p
              className="uppercase text-gray-400 mb-6 opacity-0 animate-fade-in transition-all duration-1000 delay-500"
              style={{ fontSize: '14px', letterSpacing: '0.37em' }}
              data-scroll-reveal
            >
              Tempe, Arizona
            </p>

            <h1 className="hero-title title-xl tracking-tight mb-9 opacity-10 animate-fade-in delay-1000 duration-2000" data-scroll-reveal style={{ animationDelay: '92000ms' }} >
              <span style={{ color: '#d4af37' }}>Cutting</span> Corners -- Not the{' '}
              <span style={{ color: '#d4af37' }}>Quality</span>
            </h1>

            <p
              className="text-gray-1000 tracking-tight max-w-3xl mx-auto mb-10 opacity-0 animate-drop-in delay-1000 duration-200"
              style={{ fontSize: '23px', lineHeight: 1.6 }}
            >
              Professional gemstone cutter focused on color, yield, and stone potential for jewelry
              professionals nationwide.
            </p>
          </div>

          <div className="absolute bottom-05 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in delay-800">
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
        <MobileIndustrySection />

        {/* ── Philosophy Section ── */}
        <section id="philosophy-section" className="section-spacing" data-reveal-group>
          <div className="container-custom">
            <p
              className="uppercase text-gray-500 mb-4 text-center"
              style={{ fontSize: '12px', letterSpacing: '0.20em' }}
            >
              Philosophy
            </p>
            <h2 className="title-xl tracking-tight mb-12 text-center">My Four C&apos;s</h2>

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
        <section id="services-section" className="section-spacing" data-reveal-group>
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

            {/* Desktop services grid */}
            <DesktopServicesGrid />

            {/* Mobile scroll carousel */}
            <MobileServicesCarousel />
          </div>
        </section>

        {/* ── About Section ("The Cutter") ── */}
        <section className="section-spacing" data-reveal-group>
          <div className="container-custom">
            <p
              className="uppercase text-gray-500 mb-4 text-center"
              style={{ fontSize: '12px', letterSpacing: '0.20em' }}
            >
              About
            </p>
            <h2 className="title-xl tracking-tight mb-16 text-center">The Cutter</h2>

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
                fontSize: '23px',
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
