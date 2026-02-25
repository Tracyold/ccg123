import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabase';
import { adminCss } from '../../../components/AdminLayout';
import { formatMoney, fmtDate, fmtTime } from '../../../lib/utils';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  CREATED: { bg: 'rgba(184,154,42,0.08)', color: '#cfb040' },
  ACCEPTED: { bg: 'rgba(90,150,90,0.1)', color: '#7ec87e' },
  COMPLETED: { bg: 'rgba(80,120,200,0.1)', color: '#88aadd' },
  CANCELLED: { bg: 'rgba(181,64,64,0.1)', color: '#c07070' },
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
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Work order form
  const [showAddWO, setShowAddWO] = useState(false);
  const [woForm, setWoForm] = useState({ title: '', description: '', service_type: '', gem_type: '', estimated_price: '', notes: '' });
  const [woSaving, setWoSaving] = useState(false);

  // Edit user
  const [showEditUser, setShowEditUser] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);

  // Stats
  const [woCount, setWoCount] = useState(0);
  const [invTotal, setInvTotal] = useState(0);
  const [inqCount, setInqCount] = useState(0);
  const [srCount, setSrCount] = useState(0);

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
      setUser(u); setEditUser(u ? { ...u } : null);

      const { data: admin } = await supabase.from('admin_users').select('*').single();
      setAdminInfo(admin);

      const { data: inq } = await supabase.from('account_inquiries').select('*').eq('account_user_id', uid).order('created_at', { ascending: false });
      setInquiries(inq || []); setInqCount(inq?.length || 0);

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

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, chatExpanded]);

  // Mark inquiry read
  const markInqRead = async (item: any) => {
    await supabase.from('account_inquiries').update({ is_read: true, read_at: new Date().toISOString() }).eq('account_inquiry_id', item.account_inquiry_id);
    setInquiries(prev => prev.map(i => i.account_inquiry_id === item.account_inquiry_id ? { ...i, is_read: true } : i));
  };

  // Mark SR read
  const markSRRead = async (item: any) => {
    await supabase.from('service_requests').update({ is_read: true, read_at: new Date().toISOString() }).eq('service_request_id', item.service_request_id);
    setSR(prev => prev.map(i => i.service_request_id === item.service_request_id ? { ...i, is_read: true } : i));
  };

  // Create work order
  const createWO = async () => {
    if (!woForm.title || !woForm.description || !session || !id) return;
    setWoSaving(true);
    await supabase.from('work_orders').insert({
      account_user_id: id as string,
      created_by_admin_id: session.user.id,
      title: woForm.title,
      description: woForm.description,
      service_type: woForm.service_type || null,
      gem_type: woForm.gem_type || null,
      estimated_price: woForm.estimated_price ? parseFloat(woForm.estimated_price) : null,
      notes: woForm.notes || null,
      status: 'CREATED',
      edit_history: [],
    });
    // DB triggers fire automatically — do NOT call edge functions
    setWoSaving(false); setShowAddWO(false);
    setWoForm({ title: '', description: '', service_type: '', gem_type: '', estimated_price: '', notes: '' });
    const { data: wo } = await supabase.from('work_orders').select('*').eq('account_user_id', id).order('created_at', { ascending: false });
    setWO(wo || []); setWoCount(wo?.length || 0);
  };

  // Complete work order
  const completeWO = async (wo: any) => {
    await supabase.from('work_orders').update({ status: 'COMPLETED', completed_at: new Date().toISOString() }).eq('work_order_id', wo.work_order_id);
    setWO(prev => prev.map(w => w.work_order_id === wo.work_order_id ? { ...w, status: 'COMPLETED', completed_at: new Date().toISOString() } : w));
  };

  // Cancel work order
  const cancelWO = async (wo: any) => {
    const reason = prompt('Cancel reason:');
    if (!reason) return;
    await supabase.from('work_orders').update({ status: 'CANCELLED', cancelled_at: new Date().toISOString(), cancel_reason: reason }).eq('work_order_id', wo.work_order_id);
    setWO(prev => prev.map(w => w.work_order_id === wo.work_order_id ? { ...w, status: 'CANCELLED' } : w));
  };

  // Save user edit
  const saveUser = async () => {
    if (!editUser || !id) return;
    await supabase.from('account_users').update({
      name: editUser.name, email: editUser.email, phone: editUser.phone,
      shipping_address: editUser.shipping_address, business_name: editUser.business_name, status: editUser.status,
    }).eq('account_user_id', id);
    setUser({ ...editUser }); setShowEditUser(false);
  };

  // Send chat (admin)
  const sendChat = async () => {
    if (!chatInput.trim() || !chatThread || !session) return;
    const msgText = chatInput;
    setChatInput('');
    setChatSending(true);

    // Optimistic update
    const optimisticMsg = {
      chat_message_id: 'opt-' + Date.now(),
      chat_thread_id: chatThread.chat_thread_id,
      actor: 'ADMIN',
      actor_id: session.user.id,
      body: msgText,
      attachment_url: null,
      attachment_type: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    const { error } = await supabase.from('chat_messages').insert({
      chat_thread_id: chatThread.chat_thread_id,
      actor: 'ADMIN',
      actor_id: session.user.id,
      body: msgText,
      attachment_url: null,
      attachment_type: null,
    });

    if (error) {
      console.error('Chat insert failed:', error.message);
      setMessages(prev => prev.filter(m => m.chat_message_id !== optimisticMsg.chat_message_id));
      setChatInput(msgText);
      setChatSending(false);
      return;
    }

    // This is the ONLY place send-user-notification is called manually
    await supabase.functions.invoke('send-user-notification', {
      body: { event_type: 'chat', user_id: id as string },
    }).catch(() => {});
    await supabase.from('chat_threads').update({ admin_has_unread: false, account_has_unread: true }).eq('chat_thread_id', chatThread.chat_thread_id);
    setChatSending(false);
  };

  // Mark chat read on expand
  const expandChat = async () => {
    setChatExpanded(true);
    if (chatThread) {
      await supabase.from('chat_threads').update({ admin_has_unread: false }).eq('chat_thread_id', chatThread.chat_thread_id);
    }
  };

  if (checking) return <div style={{ background: '#060606', height: '100vh' }} />;

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

  const inputStyle: React.CSSProperties = { background: 'var(--k2)', border: '1px solid var(--ln)', color: 'var(--tx)', padding: '8px 10px', fontFamily: 'var(--sans)', fontSize: '12px', width: '100%', outline: 'none' };

  return (
    <>
      <style>{adminCss}</style>
      <div className="shell">
        {/* Top nav bar instead of sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 24px', borderBottom: '1px solid var(--ln)', background: 'var(--k1)', flexShrink: 0 }}>
            <button onClick={() => router.push('/admin/users')} className="hidden md:inline-block" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: '11px', letterSpacing: '.18em', textTransform: 'uppercase', fontFamily: "'Montserrat', sans-serif", transition: 'color .15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>← USER LIST</button>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '16px', color: 'var(--wh)' }}>
              <span style={{ fontSize: '10px', color: 'var(--d2)', textTransform: 'uppercase', letterSpacing: '.15em', marginRight: '8px' }}>User</span>
              {isGuest ? 'Guest Account' : user?.name || 'User'}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginLeft: '24px' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{ padding: '14px 20px', fontFamily: 'var(--sans)', fontSize: '14px', letterSpacing: '.15em', textTransform: 'uppercase', background: 'none', border: 'none', borderBottom: activeTab === t.id ? '1px solid var(--gl)' : '1px solid transparent', color: activeTab === t.id ? 'var(--wh)' : 'var(--d1)', cursor: 'pointer', position: 'relative' }}>
                  {t.label}
                  {t.dot && <span style={{ position: 'absolute', top: '4px', right: '-6px', width: '5px', height: '5px', borderRadius: '50%', background: 'var(--er)' }} />}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '28px 40px' }}>
            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && user && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--wh)' }}>Account Info</span>
                    <button className="ab" onClick={() => { setEditUser({ ...user }); setShowEditUser(true); }}>Edit</button>
                  </div>
                  {[
                    { label: 'Name', val: user.name },
                    { label: 'Email', val: user.email },
                    { label: 'Phone', val: user.phone || '—' },
                    { label: 'Address', val: user.shipping_address || '—' },
                    { label: 'Business', val: user.business_name || '—' },
                    { label: 'Member Since', val: fmtDate(user.created_at) },
                  ].map(f => (
                    <div key={f.label} style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '8.5px', fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', marginBottom: '3px' }}>{f.label}</div>
                      <div style={{ fontSize: '13px', color: 'var(--tx)' }}>{f.val}</div>
                    </div>
                  ))}
                  <div style={{ marginTop: '8px' }}>
                    <span className={`pill ${user.status === 'ACTIVE' ? 'pill-A' : 'pill-I'}`}>{user.status}</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignContent: 'start' }}>
                  <div className="stat-card"><div className="stat-val">{woCount}</div><div className="stat-label">Work Orders</div></div>
                  <div className="stat-card"><div className="stat-val" style={{ color: 'rgba(45,212,191,1)', fontFamily: "'Courier New', monospace" }}>{formatMoney(invTotal)}</div><div className="stat-label">Total Invoiced</div></div>
                  <div className="stat-card"><div className="stat-val">{inqCount}</div><div className="stat-label">Inquiries</div></div>
                  <div className="stat-card"><div className="stat-val">{srCount}</div><div className="stat-label">Service Requests</div></div>
                </div>
              </div>
            )}

            {/* INQUIRIES TAB */}
            {activeTab === 'inquiries' && (
              inquiries.length === 0 ? <div className="empty"><div className="empty-tx">No inquiries</div></div> :
              inquiries.map(inq => (
                <div key={inq.account_inquiry_id} onClick={() => markInqRead(inq)}
                  style={{ background: 'var(--k1)', border: '1px solid var(--ln)', padding: '14px', marginBottom: '8px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  {!inq.is_read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gl)', marginTop: '6px', flexShrink: 0 }} />}
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--tx)', marginBottom: '4px' }}>{inq.description}</p>
                    <span style={{ fontSize: '10px', color: 'var(--d1)' }}>{fmtDate(inq.created_at)} · {fmtTime(inq.created_at)}</span>
                  </div>
                </div>
              ))
            )}

            {/* SERVICE REQUESTS TAB */}
            {activeTab === 'service' && (
              serviceRequests.length === 0 ? <div className="empty"><div className="empty-tx">No service requests</div></div> :
              serviceRequests.map(sr => (
                <div key={sr.service_request_id} onClick={() => markSRRead(sr)}
                  style={{ background: 'var(--k1)', border: '1px solid var(--ln)', padding: '14px', marginBottom: '8px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  {!sr.is_read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gl)', marginTop: '6px', flexShrink: 0 }} />}
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--gl)', marginBottom: '4px' }}>{sr.service_type}</div>
                    <p style={{ fontSize: '13px', color: 'var(--tx)', marginBottom: '4px' }}>{sr.description}</p>
                    <span style={{ fontSize: '10px', color: 'var(--d1)' }}>{fmtDate(sr.created_at)}</span>
                  </div>
                </div>
              ))
            )}

            {/* WORK ORDERS TAB */}
            {activeTab === 'workorders' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--wh)' }}>Work Orders</span>
                  {!isGuest && <button className="btn-add" onClick={() => setShowAddWO(true)}>+ Add Work Order</button>}
                </div>
                {workOrders.length === 0 ? <div className="empty"><div className="empty-tx">No work orders</div></div> :
                workOrders.map(wo => (
                  <div key={wo.work_order_id} style={{ background: 'var(--k1)', border: '1px solid var(--ln)', padding: '14px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--wh)' }}>{wo.title}</span>
                      <span style={{ fontSize: '8px', fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', padding: '3px 7px', background: STATUS_COLORS[wo.status]?.bg, color: STATUS_COLORS[wo.status]?.color }}>{wo.status}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--d1)', marginBottom: '6px' }}>{wo.description}</p>
                    {wo.estimated_price && <div style={{ fontSize: '13px', color: 'var(--gl)', fontFamily: 'var(--serif)' }}>{formatMoney(wo.estimated_price)}</div>}
                    <div style={{ fontSize: '10px', color: 'var(--d2)', marginTop: '8px' }}>{fmtDate(wo.created_at)}</div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                      {wo.status === 'ACCEPTED' && <button className="ab pub" onClick={() => completeWO(wo)}>Complete</button>}
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
                  <div key={inv.invoice_id} style={{ background: 'var(--k1)', border: '1px solid var(--ln)', padding: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--wh)' }}>{item?.title || 'Product'}</div>
                      <div style={{ fontSize: '10px', color: 'var(--d2)', marginTop: '4px', fontFamily: 'monospace' }}>{inv.stripe_session_id?.slice(0, 20)}...</div>
                      <div style={{ fontSize: '10px', color: 'var(--d1)', marginTop: '2px' }}>{fmtDate(inv.paid_at)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--gl)' }}>{formatMoney(inv.total_amount)}</div>
                      <span className="pill pill-A" style={{ marginTop: '4px' }}>PAID</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat widget — fixed bottom bar */}
          {chatThread && !isGuest && (
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50 }}>
              {!chatExpanded ? (
                <div onClick={expandChat} style={{ height: '44px', background: 'var(--k1)', borderTop: '1px solid var(--ln)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', cursor: 'pointer' }}>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gl)' }}>Chat · {user?.name || 'User'}</span>
                  <span style={{ color: 'var(--d1)', fontSize: '14px' }}>↑</span>
                </div>
              ) : (
                <div style={{ height: '440px', background: 'var(--k1)', borderTop: '1px solid var(--ln)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--ln)', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--sans)', fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gl)' }}>Chat · {user?.name || 'User'}</span>
                    <button onClick={() => setChatExpanded(false)} style={{ background: 'none', border: 'none', color: 'var(--d1)', cursor: 'pointer', fontSize: '14px' }}>↓</button>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
                    {messages.map(m => (
                      <div key={m.chat_message_id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.actor === 'ADMIN' ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                        <div style={{ maxWidth: '70%', padding: '8px 12px', borderRadius: '10px', background: m.actor === 'ADMIN' ? '#d4af37' : 'rgba(45,212,191,1)', color: '#050505', fontFamily: "'Comfortaa', sans-serif", fontSize: '12px' }}>
                          {m.body}
                        </div>
                        <span style={{ fontSize: '9px', color: 'var(--d2)', marginTop: '3px' }}>{fmtTime(m.created_at)}</span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div style={{ display: 'flex', gap: '6px', padding: '10px 20px', borderTop: '1px solid var(--ln)', flexShrink: 0 }}>
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..."
                      style={{ flex: 1, background: 'var(--k2)', border: '1px solid var(--ln)', padding: '8px 10px', color: 'var(--tx)', fontFamily: 'var(--sans)', fontSize: '12px', outline: 'none' }}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }} />
                    <button onClick={sendChat} disabled={chatSending || !chatInput.trim()}
                      style={{ background: 'var(--gl)', border: 'none', color: '#000', padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>→</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Work Order Modal */}
      {showAddWO && (
        <div className="ov" onClick={e => { if (e.target === e.currentTarget) setShowAddWO(false); }}>
          <div style={{ margin: 'auto', background: 'var(--k1)', border: '1px solid var(--ln)', padding: '28px', maxWidth: '480px', width: '90%' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '19px', color: 'var(--wh)', marginBottom: '20px' }}>New Work Order</div>
            {[
              { label: 'Title *', key: 'title', placeholder: 'Work order title' },
              { label: 'Service Type', key: 'service_type', placeholder: 'e.g. Custom Cut' },
              { label: 'Gem Type', key: 'gem_type', placeholder: 'e.g. Sapphire' },
              { label: 'Estimated Price', key: 'estimated_price', placeholder: '0.00' },
              { label: 'Notes', key: 'notes', placeholder: 'Internal notes' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '8.5px', fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', display: 'block', marginBottom: '4px' }}>{f.label}</label>
                <input value={(woForm as any)[f.key]} onChange={e => setWoForm({ ...woForm, [f.key]: e.target.value })} placeholder={f.placeholder} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '8.5px', fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', display: 'block', marginBottom: '4px' }}>Description *</label>
              <textarea value={woForm.description} onChange={e => setWoForm({ ...woForm, description: e.target.value })} placeholder="Work order description"
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="bp" onClick={createWO} disabled={woSaving || !woForm.title || !woForm.description}>{woSaving ? 'Creating...' : 'Create'}</button>
              <button className="bg" onClick={() => setShowAddWO(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && editUser && (
        <div className="ov" onClick={e => { if (e.target === e.currentTarget) setShowEditUser(false); }}>
          <div style={{ margin: 'auto', background: 'var(--k1)', border: '1px solid var(--ln)', padding: '28px', maxWidth: '480px', width: '90%' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '19px', color: 'var(--wh)', marginBottom: '20px' }}>Edit User</div>
            {[
              { label: 'Name', key: 'name' }, { label: 'Email', key: 'email' },
              { label: 'Phone', key: 'phone' }, { label: 'Business Name', key: 'business_name' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '8.5px', fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', display: 'block', marginBottom: '4px' }}>{f.label}</label>
                <input value={editUser[f.key] || ''} onChange={e => setEditUser({ ...editUser, [f.key]: e.target.value })} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '8.5px', fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', display: 'block', marginBottom: '4px' }}>Shipping Address</label>
              <textarea value={editUser.shipping_address || ''} onChange={e => setEditUser({ ...editUser, shipping_address: e.target.value })} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '8.5px', fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', display: 'block', marginBottom: '4px' }}>Status</label>
              <select value={editUser.status || 'ACTIVE'} onChange={e => setEditUser({ ...editUser, status: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="bp" onClick={saveUser}>Save</button>
              <button className="bg" onClick={() => setShowEditUser(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
