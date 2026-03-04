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

interface GoldItem { el: HTMLElement; type: string; t: number; }

function applyGold({ el, type }: GoldItem, t: number) {
  if (type === 'hero-word') {
    el.style.textShadow = t > 0.02 ? [
      `0 0 ${t*6}px rgba(255,230,120,${t*0.9})`,
      `0 0 ${t*18}px rgba(212,175,55,${t*0.7})`,
      `0 0 ${t*45}px rgba(212,175,55,${t*0.4})`,
      `0 0 ${t*100}px rgba(180,140,30,${t*0.18})`,
    ].join(', ') : 'none';
  }

  if (type === 'hero-card') {
    el.style.borderColor = `rgba(212,175,55,${lerp(0.10, 0.65, t)})`;
    el.style.boxShadow = t > 0.05 ? [
      `0 0 ${t*25}px rgba(212,175,55,${t*0.22})`,
      `inset 0 0 ${t*12}px rgba(212,175,55,${t*0.07})`,
    ].join(', ') : '';
  }

  if (type === 'philo-title') {
    el.style.textShadow = t > 0.05 ? [
      `0 0 ${t*14}px rgba(212,175,55,${t*0.35})`,
      `0 0 ${t*40}px rgba(212,175,55,${t*0.12})`,
    ].join(', ') : 'none';
  }

  if (type === 'section-title') {
    el.style.textShadow = t > 0.05 ? [
      `0 0 ${t*16}px rgba(212,175,55,${t*0.4})`,
      `0 0 ${t*50}px rgba(212,175,55,${t*0.15})`,
      `0 0 ${t*100}px rgba(180,140,30,${t*0.07})`,
    ].join(', ') : 'none';
  }

  if (type === 'service-card') {
    el.style.background = t > 0.03
      ? `linear-gradient(135deg, rgba(212,175,55,${t*0.07}) 0%, rgba(10,10,10,1) 55%)`
      : '';
  }

  if (type === 'name') {
    el.style.color = t > 0.05
      ? `rgb(${Math.round(lerp(250,212,t))},${Math.round(lerp(250,175,t))},${Math.round(lerp(250,55,t))})`
      : '';
    el.style.textShadow = t > 0.08 ? [
      `0 0 ${t*6}px rgba(255,230,120,${t*0.9})`,
      `0 0 ${t*25}px rgba(212,175,55,${t*0.7})`,
      `0 0 ${t*70}px rgba(212,175,55,${t*0.35})`,
      `0 0 ${t*140}px rgba(180,140,30,${t*0.15})`,
    ].join(', ') : 'none';
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
        items.push({ el: el as HTMLElement, type: (el as HTMLElement).dataset.gold!, t: 0 });
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
        if (type === 'service-card') {
          target = clamp(viewportCenteredness(el) * 1.2);
        }
        if (type === 'name') {
          target = clamp(viewportCenteredness(el) * 1.1);
        }

        item.t = lerp(item.t, target, 0.055);
        applyGold(item, easeInOut(clamp(item.t)));
      });
      rafId = requestAnimationFrame(tick);
    };

    const timeout = setTimeout(() => { init(); rafId = requestAnimationFrame(tick); }, 150);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      cancelAnimationFrame(rafId);
      items.forEach(({ el, type }) => {
        el.style.textShadow = '';
        if (type === 'hero-card') { el.style.borderColor = ''; el.style.boxShadow = ''; }
        if (type === 'service-card') el.style.background = '';
        if (type === 'name') el.style.color = '';
      });
    };
  }, []);

  return null;
}
