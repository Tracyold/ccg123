import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../lib/supabase';

export function useAuth() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  useEffect(() => {
    const guestId = process.env.NEXT_PUBLIC_GUEST_ACCOUNT_USER_ID;
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!s) { router.replace('/login'); return; }
      const { data: adminCheck } = await supabase.from('admin_users').select('admin_user_id').eq('admin_user_id', s.user.id).single();
      if (s.user.id === guestId || adminCheck) { router.replace('/login'); return; }
      setSession(s);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, s) => {
      if (!s || s.user.id === guestId) { router.replace('/login'); return; }
      const { data: adminCheck } = await supabase.from('admin_users').select('admin_user_id').eq('admin_user_id', s.user.id).single();
      if (adminCheck) router.replace('/admin/dashboard');
      else setSession(s);
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return { session, signOut };
}