import ServicesShowcase from '../components/ServicesShowcase';
import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { services } from '../components/home/homeData';
import MobileServicesCarousel from '../components/home/MobileServicesCarousel';
import DesktopServicesGrid from '../components/home/DesktopServicesGrid';
import TopNav from '../components/shared/TopNav';
import Footer from '../components/shared/Footer';




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
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', mixBlendMode: 'multiply', opacity: dark ? 0 : 1, transition: 'opacity 150ms fade' }} alt="" />
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
    const overlay = document.querySelector('.bg-blueprint-overlay') as HTMLElement;
    if (!overlay) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight;
      const progress = Math.min(scrollY / maxScroll, 1);
      const blur = progress * 20;
      const opacity = 1 - progress;
      overlay.style.filter = `blur(${blur}px)`;
      overlay.style.opacity = String(opacity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <>
      <div className="bg-blueprint-overlay" aria-hidden="true"><img src="/assets/hand.webp" alt="" /></div>
      <main>
        <TopNav />

        {/* ── Hero Section ── */}
        <section style={{ height: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>


          <div style={{ position: 'relative', zIndex: 10, padding: '0 24px', maxWidth: '600px', margin: '0 auto' }}>
            <p style={{ fontFamily: 'var(--font-subdisplay)', fontWeight: 600, fontSize: '13px', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '24px' }}>
              Tempe, Arizona
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(49px, 68vw, 71px)', color: 'var(--text)', lineHeight: 1.05, marginBottom: '28px', fontWeight: 200 }}>
              <span style={{ color: 'var(--accent)' }}>Cutting</span> Corners —{' '}
              Not the <span style={{ color: 'var(--accent)' }}>Quality</span>
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(17px, 2.5vw, 21px)', color: 'var(--text)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px' }}>
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
          <div className="hidden md:flex" style={{ position: 'absolute', bottom: '32px', right: '32px', flexDirection: 'column', justifyContent: 'center', width: '11rem', height: '11rem', background: 'var(--bg-deep)', border: 'var(--border)', padding: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Industry for</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--accent)', lineHeight: 1 }}>13 Yrs</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '6px' }}>Cutting for Seven</p>
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
        {/* <ServicesShowcase /> */}

        {/* ── About Section ("The Cutter") ── */}
        <section style={{ minHeight: "100svh", display: "flex", alignItems: "center", paddingTop: "6rem", paddingBottom: "6rem" }}>
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
                    src="/assets/IMG_5555.jpeg"
                    alt="A gemstone cutter peers into a loupe looking at a gemstone"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      transform: 'scale(1.1)',
                      display: 'block',
                      filter: 'grayscale(1) sepia(0.4) contrast(1.4) brightness(.5);'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      boxShadow: 'inset 0 0 27px 15px var(--border)',
                      zIndex: 10,
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <h2
                  data-gold="name"
                  className="page-title title-xl name-title mb-6"
                  style={{ animationDelay: '100ms' }}
                  
                >
                  Michael Wall
                </h2>

                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '19px',
                    lineHeight: 1.31,
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
                 
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '19px',
                    lineHeight: 1.31,
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
                 <p style={{ fontFamily: 'var(--font-sig)', fontSize: '19px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px' }}>
              Michael Wall</p>

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
              className="page-title title-xl mb-8"
            >
              Ready to Start?
            </h2>

            <p
              className="mx-auto mb-12"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '23px',
                lineHeight: 1.75,
                color: 'var(--text)',
                maxWidth: '600px',
              }}
            >
              Whether you have a rough stone waiting to be transformed or need expert advice on your next
              project, I&apos;m here to help.
            </p>

            {/* FIX: /booking → /shop */}
            <a
              href="/shop"
              className="btn-primary"
              style={{
                borderRadius: '999px',
                padding: '16px 40px',
                fontSize: '14px',
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
