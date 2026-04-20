import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../lib/supabase';

export function useAuth() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  useEffect(() => {
    // Session timeout logic (2 hours of inactivity)
    const TIMEOUT_MS = 2 * 60 * 60 * 1000;
    let timeoutId: any;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log("Session timed out due to inactivity");
        signOut();
      }, TIMEOUT_MS);
    };

    // Track activity
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimeout));
    resetTimeout();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimeout));
    };
  }, []);

   useEffect(() => {
  let mounted = true;

  const init = async () => {
    const guestId = process.env.NEXT_PUBLIC_GUEST_ACCOUNT_USER_ID;
    const { data: { session: s } } = await supabase.auth.getSession();

    if (!mounted) return;

    if (!s || s.user.id === guestId) {
      setLoading(false);
      return;
    }

    const { data: adminCheck } = await supabase
      .from('admin_users')
      .select('admin_user_id')
      .eq('admin_user_id', s.user.id)
      .single();

    if (adminCheck) {
      setLoading(false);
      return;
    }

    setSession(s);
    setLoading(false);
  };

  init();

  const { data: { subscription } } =
    supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) {
        setSession(null);
        setLoading(false);
      } else {
        setSession(s);
        setLoading(false);
      }
    });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

return { session, loading, signOut };}