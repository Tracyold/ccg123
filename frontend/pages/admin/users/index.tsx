// beginning of pages/account/users/index.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/admin/AdminLayout';
import { supabase } from '../../../lib/supabase';
import { fmtDate, fmtTime } from '../../../lib/utils';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [guestUser, setGuestUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [archivedUsers, setArchivedUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [restoring, setRestoring] = useState<string | null>(null);
  const [restoreMsg, setRestoreMsg] = useState('');

  useEffect(() => {
    async function load() {
      const guestId = process.env.NEXT_PUBLIC_GUEST_ACCOUNT_USER_ID;
      if (guestId) {
        const { data: g } = await supabase.from('account_users').select('*').eq('account_user_id', guestId).single();
        setGuestUser(g);
      }
      const { data } = await supabase.from('account_users').select('*')
        .neq('account_user_id', guestId || '').is('deleted_at', null).order('created_at', { ascending: false });
      setUsers(data || []);

      const { data: archived } = await supabase.from('account_users').select('*')
        .neq('account_user_id', guestId || '').not('deleted_at', 'is', null).order('deleted_at', { ascending: false });
      setArchivedUsers(archived || []);

      // Notification bubbles
      const { data: notifs } = await supabase.from('admin_notifications').select('user_id').eq('read', false);
      if (notifs) {
        const counts: Record<string, number> = {};
        notifs.forEach(n => { if (n.user_id) counts[n.user_id] = (counts[n.user_id] || 0) + 1; });
        setUnreadCounts(counts);
      }

      setLoading(false);

      // Realtime for notification bubbles
      supabase.channel('user-list-notifs')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
          (payload: any) => {
            const uid = payload.new?.user_id;
            if (uid) setUnreadCounts(prev => ({ ...prev, [uid]: (prev[uid] || 0) + 1 }));
          })
        .subscribe();
    }
    load();
  }, []);

  async function restoreAccount(userId: string) {
    setRestoring(userId);
    setRestoreMsg('');
    const { error } = await supabase.rpc('restore_account', { user_id: userId });
    if (error) {
      setRestoreMsg('Restore failed: ' + error.message);
    } else {
      setRestoreMsg('Account restored successfully.');
      const guestId = process.env.NEXT_PUBLIC_GUEST_ACCOUNT_USER_ID || '';
      const { data: active } = await supabase.from('account_users').select('*').neq('account_user_id', guestId).is('deleted_at', null).order('created_at', { ascending: false });
      setUsers(active || []);
      const { data: archived } = await supabase.from('account_users').select('*').neq('account_user_id', guestId).not('deleted_at', 'is', null).order('deleted_at', { ascending: false });
      setArchivedUsers(archived || []);
    }
    setRestoring(null);
  }

  function handleSort(field: string) {
    if (sortField === field) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortField('created_at'); setSortDir('desc'); }
    } else { setSortField(field); setSortDir('asc'); }
  }

  const sourceList = activeTab === 'active' ? users : archivedUsers;
  const filtered = sourceList.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.phone || '').toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortField] || ''; const bv = b[sortField] || '';
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const guestId = process.env.NEXT_PUBLIC_GUEST_ACCOUNT_USER_ID || '';
  const guestUnread = unreadCounts[guestId] || 0;

  return (
    <AdminLayout activeNav="users">
      <div className="ph">
        <div className="ph-title">User List</div>
        <div style={{ fontSize: '17px', color: 'var(--d1)' }}>{users.length} active · {archivedUsers.length} archived</div>
      </div>
      <div style={{ display: 'flex', gap: '2px', padding: '0 32px', borderBottom: '1px solid var(--ln)' }}>
        {(['active', 'archived'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding: '12px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === t ? 'var(--g)' : 'transparent'}`, color: activeTab === t ? 'var(--wh)' : 'var(--d2)', fontFamily: 'var(--sans)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
            {t === 'active' ? `Active (${users.length})` : `Archived (${archivedUsers.length})`}
          </button>
        ))}
      </div>
      {restoreMsg && (
        <div style={{ padding: '10px 32px', background: 'rgba(100,200,120,0.08)', borderBottom: '1px solid rgba(100,200,120,0.2)', fontFamily: 'var(--sans)', fontSize: '13px', color: 'rgba(100,200,120,0.9)' }}>
          {restoreMsg}
        </div>
      )}
      <div style={{ padding: '12px 32px', borderBottom: '1px solid var(--ln)' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          style={{ width: '100%', background: 'var(--k2)', border: '1px solid var(--ln)', padding: '8px 12px', color: 'var(--tx)', fontFamily: 'var(--sans)', fontSize: '12px', outline: 'none' }}
          onFocus={e => { e.target.style.borderColor = 'var(--g)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--ln)'; }} />
      </div>
      <div className="pb">
        {guestUser && (
          <div onClick={() => router.push(`/admin/users/${guestUser.account_user_id}`)}
            style={{ margin: '20px 0', padding: '14px 16px', background: 'var(--k1)', borderLeft: '2px solid rgba(207,176,64,0.3)', cursor: 'pointer', transition: 'background .1s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--k2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--k1)')}>
            <div>
              <div style={{ fontSize: '13px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d2)', marginBottom: '6px' }}>Guest Account</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--wh)' }}>{guestUser.name || 'Guest User'}</div>
              <div style={{ fontSize: '9px', color: 'var(--d2)', fontStyle: 'italic', marginTop: '4px' }}>This account receives all non-logged-in inquiries and product invoices</div>
            </div>
            {guestUnread > 0 && (
              <div style={{ background: 'var(--gold)', color: 'var(--bg)', fontSize: '19px', fontWeight: 700, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {guestUnread > 9 ? '9+' : guestUnread}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : sorted.length === 0 ? (
          <div className="empty"><div className="empty-ic">○</div><div className="empty-tx">{search ? `No results for '${search}'` : 'No accounts yet'}</div></div>
        ) : activeTab === 'active' ? (
          <table className="tbl">
            <thead><tr>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Name {sortField === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
              <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>Email</th>
              <th>Phone</th><th>Address</th>
              <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>Date</th>
              <th>Time</th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status</th>
              <th>Notifs</th><th></th>
            </tr></thead>
            <tbody>
              {sorted.map(u => {
                const uCount = unreadCounts[u.account_user_id] || 0;
                return (
                  <tr key={u.account_user_id} onClick={() => router.push(`/admin/users/${u.account_user_id}`)}>
                    <td><div className="td-name">{u.name || '—'}</div></td>
                    <td style={{ fontSize: 17, color: 'var(--d1)' }}>{u.email || '—'}</td>
                    <td style={{ fontSize: 15 }}>{u.phone || '—'}</td>
                    <td style={{ fontSize: 13, color: 'var(--d1)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.shipping_address || '—'}</td>
                    <td style={{ fontSize: 13, color: 'var(--d1)' }}>{fmtDate(u.created_at)}</td>
                    <td style={{ fontSize: 13, color: 'var(--d1)' }}>{fmtTime(u.created_at)}</td>
                    <td><span className={`pill ${u.status === 'ACTIVE' ? 'pill-A' : 'pill-I'}`}>{u.status}</span></td>
                    <td>
                      {uCount > 0 && (
                        <div style={{ background: 'var(--gold)', color: 'var(--bg)', fontSize: '13px', fontWeight: 700, width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          {uCount > 9 ? '9+' : uCount}
                        </div>
                      )}
                    </td>
                    <td><div className="ra"><button className="ab">View</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="tbl">
            <thead><tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>Deleted On</th><th>Reason</th><th></th>
            </tr></thead>
            <tbody>
              {sorted.map(u => (
                <tr key={u.account_user_id}>
                  <td><div className="td-name" style={{ opacity: 0.6 }}>{u.name || '—'}</div></td>
                  <td style={{ fontSize: 17, color: 'var(--d1)' }}>{u.email || '—'}</td>
                  <td style={{ fontSize: 15 }}>{u.phone || '—'}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{fmtDate(u.deleted_at)} {fmtTime(u.deleted_at)}</td>
                  <td style={{ fontSize: 13, color: 'var(--d1)' }}>{u.deleted_reason || '—'}</td>
                  <td>
                    <div className="ra">
                      <button className="ab" disabled={restoring === u.account_user_id}
                        onClick={e => { e.stopPropagation(); restoreAccount(u.account_user_id); }}
                        style={{ background: 'rgba(100,200,120,0.15)', color: 'rgba(100,200,120,0.9)', borderColor: 'rgba(100,200,120,0.3)' }}>
                        {restoring === u.account_user_id ? 'Restoring...' : 'Restore'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

// end of pages/account/users/index.tsx