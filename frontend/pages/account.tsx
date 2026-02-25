import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function AccountPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s) { router.replace('/login'); return; }
      setSession(s);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) router.replace('/login');
      else setSession(s);
    });
    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) return <div style={{ background: '#050505', minHeight: '100vh' }} />;

  return (
    <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Oranienbaum', serif", fontSize: '36px', color: '#d4af37', marginBottom: '16px' }}>
          Account Dashboard
        </h1>
        <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>
          Welcome back. Full dashboard coming soon.
        </p>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
          style={{ marginTop: '24px', background: 'transparent', border: '1px solid rgba(214,180,70,0.5)', color: '#d4af37', fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '10px 20px', cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
