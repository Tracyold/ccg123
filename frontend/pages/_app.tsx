import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '../components/theme-provider';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/shopCardEffect.css';
import '../styles/home.css';
import '../styles/wizard.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute={["data-theme", "class"]} defaultTheme="dark" enableSystem={false}>
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'var(--bg-gradient)' }} />
      <div style={{ position: 'relative', minHeight: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
        <Component {...pageProps} />
        <Analytics />
        <SpeedInsights />
      </div>
    </ThemeProvider>
  );
}
