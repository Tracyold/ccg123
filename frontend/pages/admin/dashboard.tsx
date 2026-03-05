import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { formatMoney, fmtDate, fmtTime, relativeTime } from '../../lib/utils';

export default function AdminDashboard() {
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [editing, setEditing] = useState<Record<string,boolean>>({});
  const [editValues, setEditValues] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(false);

  // Stats
  const [itemsSold, setItemsSold] = useState(0);
  const [shopRevenue, setShopRevenue] = useState(0);
  const [woCompleted, setWoCompleted] = useState(0);
  const [woRevenue, setWoRevenue] = useState(0);

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);

  // SMS config
  const [smsConfig, setSmsConfig] = useState<any>(null);
  const [smsPhone, setSmsPhone] = useState('');
  const [smsSaving, setSmsSaving] = useState(false);
  const [smsFlash, setSmsFlash] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function saveSmsToggle(field: string, value: boolean) {
    if (!smsConfig) return;
    await supabase.from('admin_notification_config').update({ [field]: value }).eq('id', smsConfig.id);
    setSmsConfig((prev: any) => ({ ...prev, [field]: value }));
  }

  async function saveSmsPhone() {
    if (!smsConfig) return;
    setSmsSaving(true);
    await supabase.from('admin_notification_config').update({ phone: smsPhone }).eq('id', smsConfig.id);
    setSmsSaving(false);
    setSmsFlash(true);
    setTimeout(() => setSmsFlash(false), 2000);
  }

  async function loadAll() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Admin info
    const { data: admin } = await supabase.from('admin_users').select('*').eq('admin_user_id', session.user.id).single();
    if (admin) setAdminInfo(admin);

    // Stats
    const { data: invoices } = await supabase.from('invoices').select('total_amount');
    if (invoices) {
      setItemsSold(invoices.length);
      setShopRevenue(invoices.reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0));
    }
    const { data: wos } = await supabase.from('work_orders').select('estimated_price').eq('status', 'COMPLETED');
    if (wos) {
      setWoCompleted(wos.length);
      setWoRevenue(wos.reduce((s: number, w: any) => s + Number(w.estimated_price || 0), 0));
    }

    // Notifications
    const { data: notifs } = await supabase
      .from('admin_notifications')
      .select('*, account_users(name)')
      .eq('read', false)
      .order('created_at', { ascending: false });
    setNotifications(notifs || []);

    // SMS config
    const { data: smsData } = await supabase
      .from('admin_notification_config')
      .select('*')
      .limit(1)
      .single();
    if (smsData) { setSmsConfig(smsData); setSmsPhone(smsData.phone || ''); }

    // Realtime subscription
    supabase.channel('admin-notifs-dash')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_notifications' }, (payload) => {
        setNotifications(prev => [payload.new as any, ...prev]);
      })
      .subscribe();
  }

  const startEdit = (field: string) => {
    setEditing(p => ({ ...p, [field]: true }));
    setEditValues(p => ({ ...p, [field]: adminInfo?.[field] || '' }));
  };

  const cancelEdit = (field: string) => {
    setEditing(p => ({ ...p, [field]: false }));
  };

  const hasDirty = Object.keys(editing).some(k => editing[k]);

  const saveAll = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setSaving(true);
    const updates: Record<string,string> = {};
    for (const [k, v] of Object.entries(editing)) {
      if (v) updates[k] = editValues[k] || '';
    }
    await supabase.from('admin_users').update(updates).eq('admin_user_id', session.user.id);
    setAdminInfo((prev: any) => ({ ...prev, ...updates }));
    setEditing({});
    setSaving(false);
    setFlash(true);
    setTimeout(() => setFlash(false), 2000);
  };

  const markAllRead = async () => {
    await supabase.from('admin_notifications').update({ read: true }).eq('read', false);
    setNotifications([]);
  };

  const markOneRead = async (id: string, userId: string | null, type: string) => {
    await supabase.from('admin_notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Navigate to user
    if (type === 'guest_inquiries') {
      window.location.href = `/admin/users/${process.env.NEXT_PUBLIC_GUEST_ACCOUNT_USER_ID}`;
    } else if (userId) {
      window.location.href = `/admin/users/${userId}`;
    }
  };

  const ICON_MAP: Record<string,string> = {
    account_inquiries: '✉',
    guest_inquiries: '✉',
    service_requests: '◈',
    chat_messages: '◻',
    work_orders: '◇',
  };

  const fields = [
    { key: 'business_name', label: 'Business Name' },
    { key: 'full_name', label: 'Full Name' },
    { key: 'address', label: 'Address' },
    { key: 'phone', label: 'Phone' },
    { key: 'contact_email', label: 'Contact Email' },
  ];

  return (
    <AdminLayout activeNav="dashboard">
      <div className="ph">
        <div className="ph-title">Dashboard</div>
        {flash && <span className="sf on">✓ Saved</span>}
      </div>
      <div className="pb" style={{ padding: '32px 40px' }}>
        <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Left - Business Info */}
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--wh)', marginBottom: '4px' }}>Business Info</div>
            <div style={{ fontSize: '12px', color: 'var(--d1)', marginBottom: '24px' }}>Used on work order and invoice PDFs</div>

            {adminInfo && fields.map(f => (
              <div key={f.key} style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', marginBottom: '6px' }}>{f.label}</div>
                {editing[f.key] ? (
                  <input
                    value={editValues[f.key] || ''}
                    onChange={e => setEditValues(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ background: 'var(--k2)', border: '1px solid var(--g)', color: 'var(--tx)', padding: '10px 12px', fontFamily: 'var(--sans)', fontSize: '14px', width: '100%', outline: 'none', height: '38px' }}
                    autoFocus
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px', color: 'var(--tx)' }}>{adminInfo[f.key] || '—'}</span>
                    <button onClick={() => startEdit(f.key)} style={{ background: 'none', border: 'none', color: 'var(--d2)', cursor: 'pointer', fontSize: '12px' }} title="Edit">✎</button>
                  </div>
                )}
              </div>
            ))}

            {/* Login email - read only */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', marginBottom: '6px' }}>Login Email</div>
              <span style={{ fontSize: '16px', color: 'var(--d2)' }}>{adminInfo?.email || '—'}</span>
              <span style={{ fontSize: '10px', color: 'var(--d2)', marginLeft: '8px' }}>(read-only)</span>
            </div>

            {hasDirty && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button className="bp" onClick={saveAll} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                <button className="bg" onClick={() => setEditing({})}>Cancel</button>
              </div>
            )}

            <p style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', marginTop: '24px' }}>
              This information appears on all work order and invoice PDFs generated for customers.
            </p>
          </div>

          {/* Right - Stats + Notifications */}
          <div>
            {/* Stats 2x2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <div className="stat-card"><div className="stat-val">{itemsSold}</div><div className="stat-label">Items Sold</div></div>
              <div className="stat-card"><div className="stat-val">{formatMoney(shopRevenue)}</div><div className="stat-label">Shop Revenue</div></div>
              <div className="stat-card"><div className="stat-val">{woCompleted}</div><div className="stat-label">Work Orders Completed</div></div>
              <div className="stat-card"><div className="stat-val">{formatMoney(woRevenue)}</div><div className="stat-label">Work Order Revenue</div></div>
            </div>

            {/* Notifications */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--wh)' }}>Notifications</span>
                {notifications.length > 0 && (
                  <span style={{ background: 'var(--gl)', color: '#000', fontSize: '8px', fontWeight: 700, padding: '2px 6px', borderRadius: '8px' }}>{notifications.length}</span>
                )}
              </div>
              {notifications.length > 0 && (
                <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--d1)', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer' }}>Mark all read</button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '10px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d2)' }}>No new notifications</div>
            ) : (
              notifications.slice(0, 20).map(n => (
                <div key={n.id} className="notif-row" onClick={() => markOneRead(n.id, n.user_id, n.type)}>
                  <div className="notif-dot" />
                  <div className="notif-icon">{ICON_MAP[n.type] || '○'}</div>
                  <div className="notif-body">
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-meta">{n.account_users?.name || (n.type === 'guest_inquiries' ? 'Guest' : '—')}</div>
                  </div>
                  <div className="notif-time">{relativeTime(n.created_at)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SMS Notification Settings */}
        {smsConfig && (
          <div style={{ marginTop: '40px', padding: '32px 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--wh)', marginBottom: '4px' }}>SMS Notifications</div>
            <div style={{ fontSize: '12px', color: 'var(--d1)', marginBottom: '24px' }}>Receive text alerts when events occur</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <input
                value={smsPhone}
                onChange={e => setSmsPhone(e.target.value)}
                placeholder="+1 480 000 0000"
                style={{ background: 'var(--c2)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--wh)', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', width: '220px' }}
              />
              <button onClick={saveSmsPhone} style={{ background: 'var(--gl)', color: '#000', border: 'none', padding: '8px 16px', fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '4px' }}>
                {smsSaving ? 'Saving...' : 'Save'}
              </button>
              {smsFlash && <span style={{ fontSize: '11px', color: 'var(--gl)' }}>✓ Saved</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {[
                { key: 'notify_purchase', label: 'Shop Purchase' },
                { key: 'notify_chat', label: 'New Chat Message' },
                { key: 'notify_inquiry', label: 'New Inquiry' },
                { key: 'notify_work_order', label: 'Work Order Update' },
                { key: 'notify_service_request', label: 'Service Request' },
              ].map(({ key, label }) => (
                <div key={key} onClick={() => saveSmsToggle(key, !smsConfig[key])}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--c2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '12px', color: 'var(--wh)', letterSpacing: '.05em' }}>{label}</span>
                  <div style={{
                    width: '36px', height: '20px', borderRadius: '10px', position: 'relative',
                    background: smsConfig[key] ? 'var(--gl)' : 'rgba(255,255,255,0.12)',
                    transition: 'background 300ms ease',
                  }}>
                    <div style={{
                      position: 'absolute', top: '3px',
                      left: smsConfig[key] ? '19px' : '3px',
                      width: '14px', height: '14px', borderRadius: '50%',
                      background: '#fff', transition: 'left 300ms ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
