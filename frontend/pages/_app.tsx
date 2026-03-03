import { useEffect } from 'react';
import Lenis from 'lenis';
import { supabase } from '../lib/supabase';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 768) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return <Component {...pageProps} />;
}
