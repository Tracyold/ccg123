import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<any>(null);

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/admin/login'); return; }
      const { data: adminCheck } = await supabase
        .from('admin_users')
        .select('*')
        .eq('admin_user_id', session.user.id)
        .single();
      if (!adminCheck) {
        await supabase.auth.signOut();
        router.replace('/admin/login');
        return;
      }
      setAdminInfo(adminCheck);
      setLoading(false);
    }
    check();
  }, [router]);

  if (loading) return <div style={{ background: '#060606', minHeight: '100vh' }} />;

  return (
    <div style={{ background: '#060606', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Oranienbaum', serif", fontSize: '36px', color: '#d4af37', marginBottom: '16px' }}>
          Admin Dashboard
        </h1>
        <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>
          Welcome, {adminInfo?.full_name || adminInfo?.name || 'Admin'}.
        </p>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }}
          style={{ marginTop: '24px', background: 'transparent', border: '1px solid rgba(214,180,70,0.5)', color: '#d4af37', fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '10px 20px', cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
