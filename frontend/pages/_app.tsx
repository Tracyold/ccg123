import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { supabase } from '../lib/supabase';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {



  return <>
    <Component {...pageProps} />
    <Analytics />
  </>;
}
