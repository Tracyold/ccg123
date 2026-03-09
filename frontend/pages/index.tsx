import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { services } from '../components/home/homeData';
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
  background: linear-gradient(135deg, #222831 0%, #2d3340 35%, #393E46 60%, #222831 100%);
  color: var(--text);
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
  background-color: transparent;
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
  background-color: transparent;
  color: var(--bg);
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
  background-color: transparent;
}

.btn-secondary {
  background: linear-gradient(135deg, #222831 0%, #2d3340 35%, #393E46 60%, #222831 100%);
  color: var(--text);
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
  background-color: transparent;
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
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollY / maxScroll, 1);
      const angle = 135 + progress * 45;
      document.body.style.background = `linear-gradient(${angle}deg, #222831 0%, #2d3340 35%, #393E46 60%, #222831 100%)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      { threshold: 0.05, rootMargin: '0px 0px 180px 0px' }
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
        <section style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Background image */}
          <div className="absolute inset-0" style={{ backgroundImage: 'url(/assets/handcut.jpeg)', backgroundSize: 'cover', backgroundPosition: '62% 40%', opacity: 0.35, filter: 'grayscale(1) sepia(0.4) hue-rotate(180deg) brightness(0.85)' }} />
          {/* Dark vignette overlay */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.95) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.95) 100%)' }} />

          <div style={{ position: 'relative', zIndex: 10, padding: '0 24px', maxWidth: '800px', margin: '0 auto' }}>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#FFD369', marginBottom: '24px' }}>
              Tempe, Arizona
            </p>
            <h1 style={{ fontFamily: 'Oranienbaum, serif', fontSize: 'clamp(48px, 12vw, 96px)', color: 'var(--text)', lineHeight: 1.05, marginBottom: '28px', fontWeight: 400 }}>
              <span style={{ color: '#FFD369' }}>Cutting</span> Corners —{' '}
              Not the <span style={{ color: '#FFD369' }}>Quality</span>
            </h1>
            <p style={{ fontFamily: 'Comfortaa, sans-serif', fontSize: 'clamp(17px, 2.5vw, 21px)', color: 'var(--text)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px' }}>
              Professional gemstone cutter focused on color, yield, and stone potential for jewelry professionals nationwide.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/get-estimate/instant" style={{ display: 'inline-block', padding: '17px 40px', background: '#FFD369', color: '#222831', fontFamily: 'Montserrat, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', textDecoration: 'none' }}>
                Get an Estimate
              </a>
              <a href="/shop" style={{ display: 'inline-block', padding: '17px 40px', background: 'none', border: '1px solid rgba(255,255,255,0.4)', color: 'var(--text)', fontFamily: 'Montserrat, sans-serif', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', textDecoration: 'none' }}>
                View Shop
              </a>
            </div>
          </div>

          {/* Stat card — desktop only */}
          <div className="hidden md:flex" style={{ position: 'absolute', bottom: '32px', right: '32px', flexDirection: 'column', justifyContent: 'center', width: '11rem', height: '11rem', background: 'rgba(34,40,49,0.9)', border: '1px solid rgba(255,211,105,0.3)', padding: '1.5rem' }}>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Industry for</p>
            <p style={{ fontFamily: 'Oranienbaum, serif', fontSize: '36px', color: '#FFD369', lineHeight: 1 }}>13 Yrs</p>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Cutting for Seven</p>
          </div>

          {/* Scroll indicator */}
          <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)' }} className="hidden md:block">
            <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, transparent, rgba(255,211,105,0.6))' }} />
          </div>
        </section>

        {/* ── Mobile Industry Section ── */}



        {/* ── Services Section ── */}
        <section id="services-section" data-reveal-group style={{ minHeight: "100svh", display: "flex", alignItems: "center", paddingTop: "6rem", paddingBottom: "6rem" }}>
          <div className="container-custom">
            <div
              id="services-sticky-header"
              className="text-center"
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 20,
                background: 'transparent',
                paddingTop: '28px',
                paddingBottom: '3px',
              }}
            >
              <p
                className="uppercase mb-3 text-center"
                style={{
                  fontSize: '13px',
                  letterSpacing: '0.20em',
                  color: 'var(--text-muted)',
                }}
              >
                What I Do
              </p>
              <h2
                data-gold="section-title"
                className="title-xl text-center"
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 56px)',
                  letterSpacing: '-0.01em',
                  marginBottom: '0px',
                  color: 'var(--text-muted)',
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
        <section data-reveal-group style={{ minHeight: "100svh", display: "flex", alignItems: "center", paddingTop: "6rem", paddingBottom: "6rem" }}>
          <div className="container-custom">
            <p
              className="uppercase text-gray-500 mb-4 text-center"
              style={{ fontSize: '12px', letterSpacing: '0.20em' }}
            >
              About
            </p>
            <h2 data-gold="section-title" className="title-xl tracking-tight mb-16 text-center" style={{ color: 'var(--text-muted)' }}>The Cutter</h2>

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
                      filter: 'grayscale(1) sepia(0.4) hue-rotate(180deg) brightness(0.65)',
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
                  data-gold="name"
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
                    color: 'var(--text)',
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
                    color: 'var(--text)',
                    maxWidth: '520px',
                    marginBottom: '32px',
                    animationDelay: '231ms',
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
          style={{ backgroundColor: 'transparent' }}
        >
          <div className="absolute inset-0 hero-glow pointer-events-none" style={{ opacity: 0.5 }} />

          <div className="container-custom relative z-10 text-center" style={{ maxWidth: '880px' }}>
            <h2
              data-gold="section-title"
              className="page-title title-xl mb-8 opacity-0 transition-all duration-700"
              data-scroll-reveal
              style={{ animationDelay: '30ms' }}
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
                color: 'var(--text)',
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
