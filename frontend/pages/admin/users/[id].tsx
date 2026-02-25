import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import { supabase } from '../../../lib/supabase';

export default function AdminUserDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const { data } = await supabase.from('account_users').select('*').eq('account_user_id', id).single();
      setUser(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <AdminLayout activeNav="users"><div className="loading">Loading...</div></AdminLayout>;

  const isGuest = id === process.env.NEXT_PUBLIC_GUEST_ACCOUNT_USER_ID;

  return (
    <AdminLayout activeNav="users">
      <div className="ph">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.push('/admin/users')} style={{ background: 'none', border: 'none', color: 'var(--d1)', cursor: 'pointer', fontSize: '9.5px', letterSpacing: '.15em', textTransform: 'uppercase' }}>\u2190 Back</button>
          <div className="ph-title">{isGuest ? 'Guest Account' : (user?.name || 'User')}</div>
        </div>
      </div>
      <div className="pb" style={{ padding: '40px 32px' }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--wh)', marginBottom: '8px' }}>{user?.name || 'Unknown'}</div>
          <div style={{ fontSize: '12px', color: 'var(--d1)', marginBottom: '4px' }}>{user?.email}</div>
          <div style={{ fontSize: '12px', color: 'var(--d1)', marginBottom: '4px' }}>{user?.phone || 'No phone'}</div>
          <div style={{ fontSize: '12px', color: 'var(--d1)', marginBottom: '20px' }}>{user?.shipping_address || 'No address'}</div>
          <div style={{ padding: '20px', background: 'var(--k1)', border: '1px solid var(--ln)', fontSize: '11px', color: 'var(--d2)', letterSpacing: '.1em' }}>
            Full user dashboard coming in next phase. This will include: inquiries, service requests, work orders, invoices, and chat.
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
