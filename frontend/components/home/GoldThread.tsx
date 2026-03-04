import { useEffect } from 'react';

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function easeInOut(t: number) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
function clamp(v: number, min=0, max=1) { return Math.max(min, Math.min(max, v)); }

function viewportCenteredness(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const dist = Math.abs((rect.top + rect.height/2) - vh/2) / (vh * 0.7);
  return clamp(1 - dist);
}

function scrolledAway(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  return clamp(-rect.top / window.innerHeight);
}

interface GoldItem { el: HTMLElement; type: string; t: number; t2: number; t3: number; }

function applyGold({ el, type }: GoldItem, t: number, t2: number, t3: number) {
  if (type === 'hero-word') {
    el.style.filter = t > 0.02
      ? `brightness(${1 + t*0.2}) drop-shadow(0 0 ${t*8}px rgba(212,175,55,${t*0.5})) drop-shadow(0 0 ${t2*20}px rgba(255,255,255,${t2*0.15}))`
      : 'none';
  }

  if (type === 'hero-card') {
    el.style.borderColor = `rgba(212,175,55,${lerp(0.10, 0.65, t)})`;
    el.style.boxShadow = t > 0.05 ? [
      `0 0 ${t*25}px rgba(212,175,55,${t*0.22})`,
      `inset 0 0 ${t*12}px rgba(212,175,55,${t*0.07})`,
    ].join(', ') : '';
  }

  if (type === 'philo-title') {
    el.style.filter = t > 0.05
      ? `brightness(${1 + t*0.18}) drop-shadow(0 0 ${t*8}px rgba(212,175,55,${t*0.45})) drop-shadow(0 0 ${t2*22}px rgba(255,255,255,${t2*0.12}))`
      : 'none';
  }

  if (type === 'section-title') {
    el.style.filter = t > 0.05
      ? `brightness(${1 + t*0.15}) drop-shadow(0 0 ${t*7}px rgba(212,175,55,${t*0.4})) drop-shadow(0 0 ${t2*18}px rgba(255,255,255,${t2*0.1}))`
      : 'none';
  }

  if (type === 'name') {
    el.style.color = t > 0.05
      ? `rgb(${Math.round(lerp(250,212,t))},${Math.round(lerp(250,175,t))},${Math.round(lerp(250,55,t))})`
      : '';
    el.style.filter = t > 0.08
      ? `brightness(${1 + t*0.2}) drop-shadow(0 0 ${t*8}px rgba(212,175,55,${t*0.5})) drop-shadow(0 0 ${t2*22}px rgba(255,255,255,${t2*0.15}))`
      : 'none';
  }
}

export default function GoldThread() {
  useEffect(() => {
    let items: GoldItem[] = [];
    let rafId: number;
    let mounted = true;

    const init = () => {
      items = [];
      document.querySelectorAll('[data-gold]').forEach((el) => {
        items.push({ el: el as HTMLElement, type: (el as HTMLElement).dataset.gold!, t: 0, t2: 0, t3: 0 });
      });
    };

    const tick = () => {
      if (!mounted) return;
      items.forEach((item) => {
        const { el, type } = item;
        let target = 0;

        if (type === 'hero-word') {
          target = clamp(viewportCenteredness(el) - scrolledAway(el) * 1.5);
        }
        if (type === 'hero-card') {
          const rect = el.getBoundingClientRect();
          const vh = window.innerHeight;
          const fromBottom = clamp(1 - rect.top / vh);
          const notGone = clamp(1 - Math.max(0, -rect.bottom / vh));
          target = clamp(fromBottom * notGone * 1.2);
        }
        if (type === 'philo-title' || type === 'section-title') {
          target = clamp(viewportCenteredness(el) * 1.3);
        }

        if (type === 'name') {
          target = clamp(viewportCenteredness(el) * 1.1);
        }

        item.t  = lerp(item.t,  target,    0.09);
        item.t2 = lerp(item.t2, item.t,   0.065);
        item.t3 = item.t2;
        applyGold(item, easeInOut(clamp(item.t)), easeInOut(clamp(item.t2)), easeInOut(clamp(item.t3)));
      });
      rafId = requestAnimationFrame(tick);
    };

    const timeout = setTimeout(() => { init(); rafId = requestAnimationFrame(tick); }, 800);

    // Re-init on first scroll to catch late-mounted elements
    let reinited = false;
    const onFirstScroll = () => {
      if (!reinited) { reinited = true; init(); }
    };
    window.addEventListener('scroll', onFirstScroll, { passive: true });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      window.removeEventListener('scroll', onFirstScroll);
      cancelAnimationFrame(rafId);
      items.forEach(({ el, type }) => {
        el.style.textShadow = '';
        if (type === 'hero-card') { el.style.borderColor = ''; el.style.boxShadow = ''; }

        if (type === 'name') el.style.color = '';
      });
    };
  }, []);

  return null;
}
