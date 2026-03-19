import ServicesShowcase from '../components/ServicesShowcase';
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
  background: var(--bg-gradient);
  color: var(--text-rgba);
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-subtitle);
}

.hero-glow {
  background: none;
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
  border-color: var(--border);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.05);
}

@media (max-width: 767px) {
  .gem-card:active {
    border-color: var(--accent);
  }
}

.hover-lift {
  transition: transform 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-6px);
}

.btn-gold {
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

.btn-primary {
  background: transparent;
  color: var(--text);
  padding: 0.75rem 2rem;
  font-family: var(--font-ui);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.875rem;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  cursor: pointer;
}

.btn-secondary:hover {
  border-color: var(--text);
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



function MachineShowcase() {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    const obs = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  return (
    <section style={{ padding: '80px 0 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '100%', margin: '0 auto', padding: '0 24px' }}>

        {/* Machine images */}
        <div className="machine-showcase-img-wrap">
          <img src="https://ik.imagekit.io/postvibe/IMG_4384.png"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', mixBlendMode: 'multiply', opacity: dark ? 0 : 1, transition: 'opacity 150ms ease' }} alt="" />
          <img src="https://ik.imagekit.io/postvibe/IMG_4383.png"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply', opacity: dark ? 1 : 0, transition: 'opacity 2800ms cubic-bezier(0.05, 0.9, 0.1, 1)' }} alt="" />
        </div>

        {/* Nameplate */}
        <div style={{ textAlign: 'center', marginTop: '8px', zIndex: 1, position: 'relative' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
            
          </p>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 400, color: 'var(--text)', letterSpacing: '0.04em', margin: '0 0 4px' }}>
            Fac-ette GemMaster II
          </h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 28px' }}>
           
          </p>
        </div>
      </div>
    </section>
  );
}


export default function Home() {

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollY / maxScroll, 1);
      const angle = 187 + progress * 45;
      document.documentElement.style.setProperty('--scroll-angle', `${angle}deg`);
      const blur = Math.min(progress * 8, 8);
      document.documentElement.style.setProperty('--bg-blur', `${blur}px`);
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
      <div className="bg-blueprint-overlay" aria-hidden="true"><img src="/assets/hand.webp" alt="" /></div>
      <main>
        <TopNav />

        {/* ── Hero Section ── */}
        <section style={{ height: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>


          <div style={{ position: 'relative', zIndex: 10, padding: '0 24px', maxWidth: '600px', margin: '0 auto' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '24px' }}>
              Tempe, Arizona
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(31px, 12vw, 71px)', color: 'var(--text)', lineHeight: 1.05, marginBottom: '28px', fontWeight: 400 }}>
              <span style={{ color: 'var(--accent)' }}>Cutting</span> Corners —{' '}
              Not the <span style={{ color: 'var(--accent)' }}>Quality</span>
            </h1>
            <p style={{ fontFamily: 'var(--font-title)', fontSize: 'clamp(17px, 2.5vw, 21px)', color: 'var(--text)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px' }}>
              Professional gemstone cutter focused on color, yield, and stone potential for jewelry professionals nationwide.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/get-estimate/instant" style={{ display: 'inline-block', padding: '17px 40px', background: 'var(--accent)', color: 'var(--bg)', fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', textDecoration: 'none' }}>
                Get an Estimate
              </a>
              <a href="/shop" style={{ display: 'inline-block', padding: '17px 40px', background: 'none', border: '1px solid var(--text-muted)', color: 'var(--text)', fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.25em', textTransform: 'uppercase', textDecoration: 'none' }}>
                View Shop
              </a>
            </div>
          </div>

          {/* Stat card — desktop only */}
          <div className="hidden md:flex" style={{ position: 'absolute', bottom: '32px', right: '32px', flexDirection: 'column', justifyContent: 'center', width: '11rem', height: '11rem', background: 'var(--bg-deep)', border: '1px solid rgba(255,211,105,0.3)', padding: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Industry for</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--accent)', lineHeight: 1 }}>13 Yrs</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>Cutting for Seven</p>
          </div>

          {/* Scroll indicator */}
          <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)' }} className="hidden md:block">
            <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, transparent, rgba(255,211,105,0.6))' }} />
          </div>
        </section>

        {/* ── Mobile Industry Section ── */}




        {/* ── Machine Showcase Section ── */}
        <MachineShowcase />

        {/* ── Services Section ── */}
        <ServicesShowcase />

        {/* ── About Section ("The Cutter") ── */}
        <section data-reveal-group style={{ minHeight: "100svh", display: "flex", alignItems: "center", paddingTop: "6rem", paddingBottom: "6rem" }}>
          <div className="container-custom">
            <p
              className="uppercase text-gray-500 mb-4 text-center"
              style={{ fontSize: '15px', letterSpacing: '0.20em' }}
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
                      filter: 'grayscale(1) sepia(0.3) brightness(0.65)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      boxShadow: 'inset 0 0 27px 15px var(--border)',
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
                    fontSize: '19px',
                    lineHeight: 1.75,
                    color: 'var(--text-rgba)',
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
                    color: 'var(--text-rgba)',
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
                fontFamily: 'var(--font-ui)',
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
