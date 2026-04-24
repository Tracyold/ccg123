import Head from 'next/head';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '../components/theme-provider';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/shopCardEffect.css';
import '../styles/home.css';
import '../styles/wizard.css';
import '../components/account/mobile/MobileShell.css';
import { useAuth } from '../components/account/shared/hooks/useAuth';
import '../components/account/desktop/DesktopShell.css';
import { useEffect, useState } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return { isMobile };
}


export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover"
        />
      </Head>
      <ThemeProvider attribute={["data-theme", "class"]} defaultTheme="dark" enableSystem={false}>
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'var(--bg-gradient)' }} />
        <Component {...pageProps} />
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </>
  );
}
