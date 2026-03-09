import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabase';
import { adminCss } from '../../../components/admin/AdminLayout';
import { formatMoney, fmtDate, fmtTime } from '../../../lib/utils';
import ChatWidget from '../../../components/admin/users/ChatWidget';
import AddWorkOrderModal from '../../../components/admin/users/AddWorkOrderModal';
import EditUserModal from '../../../components/admin/users/EditUserModal';
import InquiryDetailModal from '../../../components/admin/users/InquiryDetailModal';
import WorkOrderDetailModal from '../../../components/admin/users/WorkOrderDetailModal';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  CREATED: { bg: 'rgba(184,154,42,0.08)', color: 'var(--gold)' },
  ACCEPTED: { bg: 'rgba(90,150,90,0.1)', color: 'var(--accent)' },
  COMPLETED: { bg: 'rgba(80,120,200,0.1)', color: 'var(--text-muted)' },
  CONFIRMED: { bg: 'rgba(120,80,200,0.12)', color: 'var(--text-muted)' },
  CANCELLED: { bg: 'rgba(181,64,64,0.1)', color: 'var(--text-muted)' },
};

export default function AdminUserDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [session, setSession] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  // Data
  const [user, setUser] = useState<any>(null);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [serviceRequests, setSR] = useState<any[]>([]);
  const [workOrders, setWO] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  // Chat
  const [chatThread, setChatThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  // Work order detail modal
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [selectedInq, setSelectedInq] = useState<any>(null);
  const [selectedInqProduct, setSelectedInqProduct] = useState<any>(null);

  const [showAddWO, setShowAddWO] = useState(false);

  // Edit user
  const [showEditUser, setShowEditUser] = useState(false);

  // Stats
  const [woCount, setWoCount] = useState(0);
  const [invTotal, setInvTotal] = useState(0);
  const [inqCount, setInqCount] = useState(0);
  const [srCount, setSrCount] = useState(0);
  const [guestInquiries, setGuestInquiries] = useState<any[]>([]);

  // Auth guard
  useEffect(() => {
    async function check() {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!s) { router.replace('/admin/login'); return; }
      const { data: adminCheck } = await supabase.from('admin_users').select('admin_user_id').eq('admin_user_id', s.user.id).single();
      if (!adminCheck) { await supabase.auth.signOut(); router.replace('/admin/login'); return; }
      setSession(s);
      setChecking(false);
    }
    check();
  }, [router]);

  // Load all data
  useEffect(() => {
    if (!id || !session) return;
    async function loadAll() {
      const uid = id as string;
      const { data: u } = await supabase.from('account_users').select('*').eq('account_user_id', uid).single();
      setUser(u);

      const { data: admin } = await supabase.from('admin_users').select('*').single();
      setAdminInfo(admin);

      const { data: inq } = await supabase.from('account_inquiries').select('*').eq('account_user_id', uid).order('created_at', { ascending: false });
      setInquiries(inq || []); setInqCount(inq?.length || 0);

      const guestId = process.env.NEXT_PUBLIC_GUEST_ACCOUNT_USER_ID;
      if (uid === guestId) {
        const { data: gInq } = await supabase.from('guest_inquiries').select('*').order('created_at', { ascending: false });
        setGuestInquiries(gInq || []);
        setInqCount((gInq?.length || 0) + (inq?.length || 0));
      }

      const { data: sr } = await supabase.from('service_requests').select('*').eq('account_user_id', uid).order('created_at', { ascending: false });
      setSR(sr || []); setSrCount(sr?.length || 0);

      const { data: wo } = await supabase.from('work_orders').select('*').eq('account_user_id', uid).order('created_at', { ascending: false });
      setWO(wo || []); setWoCount(wo?.length || 0);

      const { data: inv } = await supabase.from('invoices').select('*').eq('account_user_id', uid).order('paid_at', { ascending: false });
      setInvoices(inv || []);
      setInvTotal(inv?.reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0) || 0);

      // Chat
      const { data: thread } = await supabase.from('chat_threads').select('*').eq('account_user_id', uid).single();
      setChatThread(thread);
      if (thread) {
        const { data: msgs } = await supabase.from('chat_messages').select('*').eq('chat_thread_id', thread.chat_thread_id).order('created_at', { ascending: true });
        setMessages(msgs || []);
        supabase.channel('admin-chat-' + thread.chat_thread_id)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_thread_id=eq.${thread.chat_thread_id}` },
            (payload) => {
              const newMsg = payload.new as any;
              setMessages(prev => {
                const filtered = prev.filter(m => !m.chat_message_id.startsWith('opt-') || m.body !== newMsg.body);
                if (filtered.some(m => m.chat_message_id === newMsg.chat_message_id)) return filtered;
                return [...filtered, newMsg];
              });
            })
          .subscribe();
      }
    }
    loadAll();
  }, [id, session]);


  // Mark inquiry read
  const openInquiry = async (item: any) => {
    setSelectedInq(item);
    const productId = item.product_id || item.guest_inquiry_id && null;
    if (item.product_id) {
      const { data } = await supabase.from('products').select('*').eq('product_id', item.product_id).single();
      setSelectedInqProduct(data || null);
    } else {
      setSelectedInqProduct(null);
    }
  };

  const markInqRead = async (item: any) => {
    await supabase.from('account_inquiries').update({ is_read: true, read_at: new Date().toISOString() }).eq('account_inquiry_id', item.account_inquiry_id);
    setInquiries(prev => prev.map(i => i.account_inquiry_id === item.account_inquiry_id ? { ...i, is_read: true } : i));
  };

  // Mark SR read
  const markSRRead = async (item: any) => {
    await supabase.from('service_requests').update({ is_read: true, read_at: new Date().toISOString() }).eq('service_request_id', item.service_request_id);
    setSR(prev => prev.map(i => i.service_request_id === item.service_request_id ? { ...i, is_read: true } : i));
  };

  // List-level WO actions (also called from WorkOrderDetailModal via props)
  const appendLog = (wo: any, action: string, by: string) => {
    const prev = Array.isArray(wo.edit_history) ? wo.edit_history : [];
    return [...prev, { action, by, at: new Date().toISOString() }];
  };
  const completeWO = async (wo: any) => {
    console.log('completeWO fired, status:', wo.status, 'id:', wo.work_order_id);
    const log = appendLog(wo, 'COMPLETE by admin', 'admin');
    const now = new Date().toISOString();
    const { error } = await supabase.from('work_orders').update({ status: 'COMPLETE', completed_at: now, edit_history: log }).eq('work_order_id', wo.work_order_id);
    if (error) { console.error('Complete WO error:', error.message); alert('Error: ' + error.message); return; }
    setWO(prev => prev.map(w => w.work_order_id === wo.work_order_id ? { ...w, status: 'COMPLETE', completed_at: now, edit_history: log } : w));
    setSelectedWO((prev: any) => prev ? { ...prev, status: 'COMPLETE', completed_at: now, edit_history: log } : prev);
  };
  const cancelWO = async (wo: any) => {
    const reason = prompt('Cancel reason:');
    if (!reason) return;
    const log = appendLog(wo, 'CANCELLED by admin: ' + reason, 'admin');
    const { error } = await supabase.from('work_orders').update({ status: 'CANCELLED', cancelled_at: new Date().toISOString(), cancel_reason: reason, edit_history: log }).eq('work_order_id', wo.work_order_id);
    if (error) { console.error('Cancel WO error:', error.message); return; }
    setWO(prev => prev.map(w => w.work_order_id === wo.work_order_id ? { ...w, status: 'CANCELLED', edit_history: log } : w));
    setSelectedWO((prev: any) => prev ? { ...prev, status: 'CANCELLED', edit_history: log } : prev);
  };

  if (checking) return <div style={{ background: 'var(--bg-deep)', height: '100vh' }} />;

  const isGuest = id === process.env.NEXT_PUBLIC_GUEST_ACCOUNT_USER_ID;
  const unreadInq = inquiries.some(i => !i.is_read);
  const unreadSR = serviceRequests.some(i => !i.is_read);
  const unreadWO = workOrders.some(w => w.status === 'CREATED');

  const TABS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'inquiries', label: 'Inquiries', dot: unreadInq },
    { id: 'service', label: 'Service Requests', dot: unreadSR },
    { id: 'workorders', label: 'Work Orders', dot: unreadWO },
    { id: 'invoices', label: 'Invoices' },
  ];

  const inputStyle: React.CSSProperties = { background: 'var(--k2)', border: '1px solid var(--ln)', color: 'var(--tx)', padding: '10px 12px', fontFamily: 'var(--sans)', fontSize: '15px', width: '100%', outline: 'none', height: '39px' };

  return (
    <>
      <style>{adminCss}</style>
      <div className="shell">
        {/* Top nav bar instead of sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '19px', padding: '13px 25px', borderBottom: '1px solid var(--ln)', background: 'var(--k1)', flexShrink: 0 }}>
            <button onClick={() => router.push('/admin/users')} className="hidden md:inline-block" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', letterSpacing: '.09em', textTransform: 'uppercase', fontFamily: "'Montserrat'", transition: 'color .15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>← USER LIST</button>
            <div style={{ fontFamily: 'Montserrat', fontSize: '17px', textTransform: 'uppercase', color: 'var(--accent)' }}>
              <span style={{ fontSize: '5px', color: 'var(--d2)', textTransform: 'uppercase', letterSpacing: '.15em', marginRight: '11px' }}></span>
              {isGuest ? 'Guest Account' : user?.name || 'User'}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginLeft: '24px' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{ padding: '13px 17px', fontFamily: 'var(--sans)', fontSize: '13px', letterSpacing: '.15em', textTransform: 'uppercase', background: 'none', border: 'none', borderBottom: activeTab === t.id ? '.5px solid var(--gl)' : '1px solid transparent', color: activeTab === t.id ? 'var(--wh)' : 'var(--d1)', cursor: 'pointer', position: 'relative' }}>
                  {t.label}
                  {t.dot && <span style={{ position: 'absolute', top: '5px', right: '-7px', width: '7px', height: '7px', borderRadius: '20%', background: 'var(--er)' }} />}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '29px 41px' }}>
            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && user && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '45px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '19px' }}>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: '25px', color: 'rgb(224, 187, 50)' }}>Account Info</span>
                    <button className="ab" onClick={() => setShowEditUser(true)}>Edit</button>
                  </div>
                  {[
                    { label: 'Name', val: user.name },
                    { label: 'Email', val: user.email },
                    { label: 'Phone', val: user.phone || '—' },
                    { label: 'Address', val: user.shipping_address || '—' },
                    { label: 'Business', val: user.business_name || '—' },
                    { label: 'Member Since', val: fmtDate(user.created_at) },
                  ].map(f => (
                    <div key={f.label} style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', marginBottom: '7px' }}>{f.label}</div>
                      <div style={{ fontSize: '17px', color: f.label === 'Phone' ? '#377da2' : 'var(--tx)' }}>{f.val}</div>
                    </div>
                  ))}
                  <div style={{ marginTop: '9px' }}>
                    <span className={`pill ${user.status === 'ACTIVE' ? 'pill-A' : 'pill-I'}`}>{user.status}</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '17px', alignContent: 'start' }}>
                  <div className="stat-card"><div className="stat-val" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{woCount}</div><div className="stat-label">Work Orders</div></div>
                  <div className="stat-card"><div className="stat-val" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{formatMoney(invTotal)}</div><div className="stat-label">Total Invoiced</div></div>
                  <div className="stat-card"><div className="stat-val" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{inqCount}</div><div className="stat-label">Inquiries</div></div>
                  <div className="stat-card"><div className="stat-val" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{srCount}</div><div className="stat-label">Service Requests</div></div>
                </div>
              </div>
            )}

            {/* INQUIRIES TAB */}
            {activeTab === 'inquiries' && (
              <>
                {isGuest && (
                  <>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', marginBottom: '12px' }}>Anonymous Visitor Inquiries</div>
                    {guestInquiries.length === 0
                      ? <div className="empty" style={{ marginBottom: '24px' }}><div className="empty-tx">No guest inquiries</div></div>
                      : guestInquiries.map(inq => (
                        <div key={inq.guest_inquiry_id} onClick={() => openInquiry(inq)} style={{ background: 'var(--k1)', border: '1px solid var(--ln)', padding: '17px', marginBottom: '9px', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div>
                              <div style={{ fontSize: '15px', color: 'var(--wh)', marginBottom: '3px' }}>{inq.name}</div>
                              <div style={{ fontSize: '13px', color: 'var(--d1)' }}>{inq.email}</div>
                              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{inq.phone}</div>
                            </div>
                            {!inq.is_read && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--gl)', marginTop: '4px' }} />}
                          </div>
                          <p style={{ fontSize: '15px', color: 'var(--tx)', marginBottom: '7px', lineHeight: 1.6 }}>{inq.description}</p>
                          <span style={{ fontSize: '13px', color: 'var(--d1)' }}>{fmtDate(inq.created_at)} · {fmtTime(inq.created_at)}</span>
                        </div>
                      ))
                    }
                    <div style={{ height: '1px', background: 'var(--ln)', margin: '20px 0 16px' }} />
                    <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', marginBottom: '12px' }}>Account Inquiries</div>
                  </>
                )}
                {inquiries.length === 0
                  ? <div className="empty"><div className="empty-tx">No inquiries</div></div>
                  : inquiries.map(inq => (
                    <div key={inq.account_inquiry_id} onClick={() => { markInqRead(inq); openInquiry(inq); }}
                      style={{ background: 'var(--k1)', border: '1px solid var(--ln)', padding: '17px', marginBottom: '9px', cursor: 'pointer', display: 'flex', gap: '13px', alignItems: 'flex-start' }}>
                      {!inq.is_read && <div style={{ width: '7px', height: '9px', borderRadius: '50%', background: 'var(--gl)', marginTop: '7px', flexShrink: 0 }} />}
                      <div>
                        <p style={{ fontSize: '19px', color: 'var(--tx)', marginBottom: '7px' }}>{inq.description}</p>
                        <span style={{ fontSize: '17px', color: 'var(--d1)' }}>{fmtDate(inq.created_at)} · {fmtTime(inq.created_at)}</span>
                      </div>
                    </div>
                  ))
                }
              </>
            )}

            {/* SERVICE REQUESTS TAB */}
            {activeTab === 'service' && (
              serviceRequests.length === 0 ? <div className="empty"><div className="empty-tx">No service requests</div></div> :
              serviceRequests.map(sr => (
                <div key={sr.service_request_id} onClick={() => markSRRead(sr)}
                  style={{ background: 'var(--k1)', border: '1px solid var(--ln)', padding: '17px', marginBottom: '9px', cursor: 'pointer', display: 'flex', gap: '11px', alignItems: 'flex-start' }}>
                  {!sr.is_read && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--gl)', marginTop: '7px', flexShrink: 0 }} />}
                  <div>
                    <div style={{ fontSize: '17px', color: 'var(--gl)', marginBottom: '7px' }}>{sr.service_type}</div>
                    <p style={{ fontSize: '17px', color: 'var(--tx)', marginBottom: '7px' }}>{sr.description}</p>
                    <span style={{ fontSize: '17px', color: 'var(--d1)' }}>{fmtDate(sr.created_at)}</span>
                  </div>
                </div>
              ))
            )}

            {/* WORK ORDERS TAB */}
            {activeTab === 'workorders' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '17px' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--wh)' }}>Work Orders</span>
                  {!isGuest && <button className="btn-add" onClick={() => setShowAddWO(true)}>+ Add Work Order</button>}
                </div>
                {workOrders.length === 0 ? <div className="empty"><div className="empty-tx">No work orders</div></div> :
                workOrders.map(wo => (
                  <div key={wo.work_order_id} style={{ background: 'var(--k1)', border: '1px solid var(--ln)', padding: '11px', marginBottom: '9px', cursor: 'pointer' }} onClick={() => setSelectedWO(wo)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: '17px', color: 'var(--wh)' }}>{wo.title}</span>
                      <span style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', padding: '4px 9px', background: STATUS_COLORS[wo.status]?.bg, color: STATUS_COLORS[wo.status]?.color }}>{wo.status}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--d1)', marginBottom: '6px' }}>{wo.description}</p>
                    {wo.estimated_price && <div style={{ fontSize: '15px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{formatMoney(wo.estimated_price)}</div>}
                    <div style={{ fontSize: '12px', color: 'var(--d2)', marginTop: '8px' }}>{fmtDate(wo.created_at)}</div>
                    <div style={{ display: 'flex', gap: '9px', marginTop: '11px' }} onClick={e => e.stopPropagation()}>
                      {(wo.status === 'ACCEPTED' || wo.status === 'CONFIRMED') && <button className="ab pub" onClick={() => completeWO(wo)}>Complete</button>}
                      {(wo.status === 'CREATED' || wo.status === 'ACCEPTED') && <button className="ab rem" onClick={() => cancelWO(wo)}>Cancel</button>}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* INVOICES TAB */}
            {activeTab === 'invoices' && (
              invoices.length === 0 ? <div className="empty"><div className="empty-tx">No invoices</div></div> :
              invoices.map(inv => {
                const item = inv.line_items?.[0];
                return (
                  <div key={inv.invoice_id} style={{ background: 'var(--k1)', border: '1px solid var(--ln)', padding: '15px', marginBottom: '9px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: '25px', color: 'var(--wh)' }}>{item?.title || 'Product'}</div>
                      <div style={{ fontSize: '17px', color: 'var(--d2)', marginTop: '7px', fontFamily: 'monospace' }}>{inv.stripe_session_id?.slice(0, 20)}...</div>
                      <div style={{ fontSize: '21px', color: 'var(--d1)', marginTop: '5px' }}>{fmtDate(inv.paid_at)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: '17px', color: 'var(--gl)' }}>{formatMoney(inv.total_amount)}</div>
                      <span className="pill pill-A" style={{ marginTop: '5px' }}>PAID</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat widget — fixed bottom bar */}
          {chatThread && !isGuest && (
            <ChatWidget chatThread={chatThread} messages={messages} setMessages={setMessages} user={user} id={id as string} session={session} />
          )}
        </div>
      </div>

      {/* Add Work Order Modal */}
      <AddWorkOrderModal showAddWO={showAddWO} setShowAddWO={setShowAddWO} user={user} id={id as string} session={session} setWO={setWO} setWoCount={setWoCount} />

      {/* Edit User Modal */}
      <EditUserModal showEditUser={showEditUser} setShowEditUser={setShowEditUser} user={user} id={id as string} setUser={setUser} />

      {/* Inquiry Detail Modal */}
      <InquiryDetailModal selectedInq={selectedInq} setSelectedInq={setSelectedInq} selectedInqProduct={selectedInqProduct} setSelectedInqProduct={setSelectedInqProduct} user={user} />

      {/* Work Order Detail Modal */}
      <WorkOrderDetailModal selectedWO={selectedWO} setSelectedWO={setSelectedWO} user={user} session={session} adminInfo={adminInfo} setWO={setWO} />
    </>
  );
}
