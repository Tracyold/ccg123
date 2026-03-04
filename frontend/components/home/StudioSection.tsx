import { useEffect, useRef } from 'react';

export default function StudioSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const photo = photoRef.current;
    const title = titleRef.current;
    const label = labelRef.current;
    const desc = descRef.current;
    if (!section || !photo || !title || !label || !desc) return;

    let rafId: number;
    let snapLocked = false;
    let snapUsed = false;
    let isPressed = false;

    const unlock = () => {
      if (snapLocked) {
        document.body.style.overflow = '';
        snapLocked = false;
      }
    };

    const onPointerDown = () => { isPressed = true; unlock(); };
    const onPointerUp = () => { isPressed = false; };

    const lockScroll = () => {
      if (snapLocked || snapUsed || isPressed) return;
      snapLocked = true;
      snapUsed = true;
      document.body.style.overflow = 'hidden';
    };

    const onScrollReset = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) snapUsed = false;
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;

        const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
        const distFromCenter = Math.abs(progress - 0.5) * 2;
        const focusEased = Math.max(0, 1 - distFromCenter * 1.4);
        const eased = focusEased * focusEased * focusEased;

        if (distFromCenter < 0.04 && eased > 0.92) lockScroll();

        photo.style.opacity = String(0.04 + eased * 0.72);
        photo.style.filter = `blur(${(1 - eased) * 12}px) contrast(1.08)`;
        photo.style.transform = `scale(${1.12 - eased * 0.06})`;

        const colorProgress = eased;
        const r = Math.round(250 * (1 - colorProgress * 0.02));
        const g = Math.round(250 * (1 - colorProgress * 0.31));
        const b = Math.round(255 * (1 - colorProgress));
        title.style.color = `rgb(${r}, ${g}, ${b})`;
        title.style.textShadow = colorProgress > 0.2
          ? [
              `0 0 ${colorProgress * 8}px rgba(255,220,100,${colorProgress * 0.95})`,
              `0 0 ${colorProgress * 20}px rgba(212,175,55,${colorProgress * 0.85})`,
              `0 0 ${colorProgress * 45}px rgba(212,175,55,${colorProgress * 0.6})`,
              `0 0 ${colorProgress * 90}px rgba(180,140,30,${colorProgress * 0.35})`,
              `0 0 ${colorProgress * 140}px rgba(150,110,10,${colorProgress * 0.15})`,
            ].join(', ')
          : 'none';
        title.style.filter = colorProgress > 0.2
          ? `drop-shadow(0 0 ${colorProgress * 30}px rgba(212,175,55,${colorProgress * 0.4}))`
          : 'none';

        title.style.opacity = '1';
        label.style.opacity = '1';
        desc.style.opacity = '1';
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScrollReset, { passive: true });
    window.addEventListener('wheel', unlock, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('touchstart', onPointerDown);
    window.addEventListener('touchend', onPointerUp);
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScrollReset);
      window.removeEventListener('wheel', unlock);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchend', onPointerUp);
      cancelAnimationFrame(rafId);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      {/* Top seal */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: '#050505', zIndex: 100 }} />
      {/* Bottom seal */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px', background: '#050505', zIndex: 100 }} />
      {/* Left seal */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '8px', background: '#050505', zIndex: 100 }} />
      {/* Right seal */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '8px', background: '#050505', zIndex: 100 }} />

    <div ref={sectionRef} style={{
      position: 'relative', height: '100svh',
      overflow: 'hidden', display: 'flex',
      alignItems: 'center', justifyContent: 'flex-start',
      boxShadow: 'inset 0 0 0 8px #050505',
    }}>
      <div ref={photoRef} style={{
        position: 'absolute', inset: '-3%',
        backgroundImage: 'url(/assets/Studio.jpeg)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.04, filter: 'blur(12px) contrast(1.08)',
        transform: 'scale(1.12)', transformOrigin: 'center center',
        willChange: 'opacity, filter, transform',
        transition: 'opacity 220ms ease-out, filter 220ms ease-out, transform 700ms ease-out',
      }} />

      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to right, rgba(5,5,5,0.97) 0%, rgba(5,5,5,0.92) 22%, rgba(5,5,5,0.70) 38%, rgba(5,5,5,0.0) 55%)',
      }} />

      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to bottom, #050505 0%, rgba(5,5,5,0.0) 20%, rgba(5,5,5,0.0) 80%, #050505 100%)',
      }} />

      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 20%, rgba(5,5,5,0.4) 50%, rgba(5,5,5,0.88) 75%, rgba(5,5,5,1) 90%)',
      }} />

      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '120px', zIndex: 4, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, #050505 0%, transparent 100%)',
      }} />

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '120px', zIndex: 4, pointerEvents: 'none',
        background: 'linear-gradient(to top, #050505 0%, transparent 100%)',
      }} />

      {/* Edge border overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none',
        boxShadow: 'inset 0 0 0 10px #050505',
      }} />

      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat', backgroundSize: '180px 180px',
        opacity: 0.35, mixBlendMode: 'overlay',
      }} />

      <div className="container-custom" style={{
        position: 'relative', zIndex: 10,
        maxWidth: '380px', marginLeft: '4vw', marginRight: 'auto',
        padding: '32px 36px',
        background: 'rgba(5,5,5,0.25)',
        backdropFilter: 'blur(6px)',
        borderRadius: '12px', textAlign: 'left',
      }}>
        <p ref={labelRef} className="uppercase text-gray-400"
          style={{ fontSize: '12px', letterSpacing: '0.25em', marginBottom: '16px' }}>
          Where It Happens
        </p>
        <h2 ref={titleRef} className="title-xl"
          style={{ marginBottom: '20px', color: '#FAFAFA' }}>
          The Studio
        </h2>
        <p ref={descRef} style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(13px, 1.3vw, 17px)',
          lineHeight: 1.8, color: 'rgba(255,255,255,0.70)',
        }}>
          Every stone passes through a focused, single-cutter environment — no outsourcing, no shortcuts. Just precise handwork from rough to finished gem.
        </p>
      </div>
    </div>
    </div>
  );
}
