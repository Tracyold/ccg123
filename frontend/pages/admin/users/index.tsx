import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { fmtDate, fmtTime } from '../../lib/utils';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [guestUser, setGuestUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  useEffect(() => {
    async function load() {
      const guestId = process.env.NEXT_PUBLIC_GUEST_ACCOUNT_USER_ID;
      // Guest user
      if (guestId) {
        const { data: g } = await supabase.from('account_users').select('*').eq('account_user_id', guestId).single();
        setGuestUser(g);
      }
      // Regular users
      const { data } = await supabase.from('account_users').select('*')
        .neq('account_user_id', guestId || '')
        .order('created_at', { ascending: false });
      setUsers(data || []);
      setLoading(false);
    }
    load();
  }, []);

  function handleSort(field: string) {
    if (sortField === field) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortField('created_at'); setSortDir('desc'); }
    } else { setSortField(field); setSortDir('asc'); }
  }

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.phone || '').toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortField] || ''; const bv = b[sortField] || '';
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <AdminLayout activeNav="users">
      <div className="ph">
        <div className="ph-title">User List</div>
        <div style={{ fontSize: '10px', color: 'var(--d1)' }}>{users.length} accounts</div>
      </div>
      <div style={{ padding: '12px 32px', borderBottom: '1px solid var(--ln)' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          style={{ width: '100%', background: 'var(--k2)', border: '1px solid var(--ln)', padding: '8px 12px', color: 'var(--tx)', fontFamily: 'var(--sans)', fontSize: '12px', outline: 'none' }}
          onFocus={e => { e.target.style.borderColor = 'var(--g)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--ln)'; }}
        />
      </div>
      <div className="pb">
        {/* Guest banner */}
        {guestUser && (
          <div
            onClick={() => router.push(`/admin/users/${guestUser.account_user_id}`)}
            style={{ margin: '20px 0', padding: '14px 16px', background: 'var(--k1)', borderLeft: '2px solid rgba(207,176,64,0.3)', cursor: 'pointer', transition: 'background .1s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--k2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--k1)')}
          >
            <div style={{ fontSize: '8.5px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d2)', marginBottom: '6px' }}>Guest Account</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--wh)' }}>{guestUser.name || 'Guest'}</div>
            <div style={{ fontSize: '9px', color: 'var(--d2)', fontStyle: 'italic', marginTop: '4px' }}>This account receives all non-logged-in inquiries and product invoices</div>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : sorted.length === 0 ? (
          <div className="empty"><div className="empty-ic">\u25CB</div><div className="empty-tx">{search ? `No results for '${search}'` : 'No accounts yet'}</div></div>
        ) : (
          <table className="tbl">
            <thead><tr>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Name {sortField === 'name' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}</th>
              <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>Email</th>
              <th onClick={() => handleSort('phone')} style={{ cursor: 'pointer' }}>Phone</th>
              <th>Address</th>
              <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>Date</th>
              <th>Time</th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status</th>
              <th>Notifs</th>
              <th></th>
            </tr></thead>
            <tbody>
              {sorted.map(u => (
                <tr key={u.account_user_id} onClick={() => router.push(`/admin/users/${u.account_user_id}`)}>
                  <td><div className="td-name">{u.name || '\u2014'}</div></td>
                  <td style={{ fontSize: 12, color: 'var(--d1)' }}>{u.email || '\u2014'}</td>
                  <td style={{ fontSize: 12 }}>{u.phone || '\u2014'}</td>
                  <td style={{ fontSize: 11, color: 'var(--d1)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.shipping_address || '\u2014'}</td>
                  <td style={{ fontSize: 11, color: 'var(--d1)' }}>{fmtDate(u.created_at)}</td>
                  <td style={{ fontSize: 11, color: 'var(--d1)' }}>{fmtTime(u.created_at)}</td>
                  <td><span className={`pill ${u.status === 'ACTIVE' ? 'pill-A' : 'pill-I'}`}>{u.status}</span></td>
                  <td>{/* TODO: notification bubble - render 0 for now */}</td>
                  <td><div className="ra"><button className="ab">View</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
