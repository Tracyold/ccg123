import React, { useState, useEffect } from 'react';
import Link from 'next/link';

function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    const obs = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

interface SlotProps {
  darkSrc: string;
  lightSrc: string;
  href: string;
  label: string;
  dark: boolean;
  size?: 'normal' | 'large';
}

function ServiceSlot({ darkSrc, lightSrc, href, label, dark, size = 'normal' }: SlotProps) {
  return (
    <Link href={href} className={`svc-slot svc-slot--${size}`}>
      <div className="svc-slot__img-wrap">
        <img
          src={lightSrc}
          className="svc-slot__img"
          style={{ opacity: dark ? 0 : 1, transition: 'opacity 150ms ease', mixBlendMode: 'multiply' }}
          alt=""
        />
        <img
          src={darkSrc}
          className="svc-slot__img"
          style={{ opacity: dark ? 1 : 0, transition: 'opacity 2800ms cubic-bezier(0.05, 0.9, 0.1, 1)' }}
          alt=""
        />
      </div>
      <p className="svc-slot__label">{label}</p>
    </Link>
  );
}

export default function ServicesShowcase() {
  const dark = useIsDark();

  return (
    <section className="svc-showcase" id="services-section">
      <div className="container-custom">
        <p className="svc-showcase__eyebrow">What I Do</p>
        <h2 className="svc-showcase__title">Services</h2>
        <div className="svc-showcase__divider" />

        <div className="svc-showcase__grid">
          <ServiceSlot
            dark={dark}
            darkSrc="https://ik.imagekit.io/postvibe/report-dark.png"
            lightSrc="https://ik.imagekit.io/postvibe/report-light.png"
            href="/estimates"
            label="Detailed Breakdowns"
            size="normal"
          />
          <ServiceSlot
            dark={dark}
            darkSrc="https://ik.imagekit.io/postvibe/dark-mode.png"
            lightSrc="https://ik.imagekit.io/postvibe/light-mode.png"
            href="/estimates"
            label="Service Estimates"
            size="large"
          />
          <ServiceSlot
            dark={dark}
            darkSrc="https://ik.imagekit.io/postvibe/gem-dark.png"
            lightSrc="https://ik.imagekit.io/postvibe/gem-light.png"
            href="/shop"
            label="Finished Gemstones"
            size="normal"
          />
        </div>
      </div>
    </section>
  );
}
