import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { formatMoney, fmtDate, fmtTime } from '../lib/utils';
import InvoiceList from '../components/account/InvoiceList';
import WorkOrderList from '@/components/account/WorkOrderList';
import InquiryList from '../components/account/InquiryList';



const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  CREATED: { bg: 'rgba(212,175,55,0.12)', color: '#d4af37' },
  ACCEPTED: { bg: 'rgba(45,212,191,0.12)', color: 'rgba(45,212,191,1)' },
  COMPLETED: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' },
  CONFIRMED: { bg: 'rgba(120,80,200,0.12)', color: '#b388ff' },
  CANCELLED: { bg: 'rgba(181,64,64,0.1)', color: '#c07070' },
};

export default function AccountPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  // Profile
  const [profile, setProfile] = useState<any>(null);
  const [editProfile, setEditProfile] = useState<any>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFlash, setProfileFlash] = useState(false);

  // SMS prefs
  const [smsPrefs, setSmsPrefs] = useState<any>(null);

  // Purchase stats
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [invoiceTotal, setInvoiceTotal] = useState(0);

  // Work orders
  const [workOrders, setWorkOrders] = useState<any[]>([]);

  // Inquiries
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [inquiryTab, setInquiryTab] = useState<'inquiries' | 'service'>('inquiries');
  const [showSRForm, setShowSRForm] = useState(false);
  const [srType, setSrType] = useState('');
  const [srDesc, setSrDesc] = useState('');
  const [srSubmitting, setSrSubmitting] = useState(false);
  const [srGateMsg, setSrGateMsg] = useState('');

  // Invoices
  const [invoices, setInvoices] = useState<any[]>([]);

  // Chat
  const [chatThread, setChatThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);
  const [chatUploading, setChatUploading] = useState(false);

  // Work order detail modal
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [showAddressEdit, setShowAddressEdit] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [adminInfo, setAdminInfo] = useState<any>(null);

  // Auth
  useEffect(() => {
    const guestId = process.env.NEXT_PUBLIC_GUEST_ACCOUNT_USER_ID;
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      const { data: adminCheck } = await supabase.from('admin_users').select('admin_user_id').eq('admin_user_id', s.user.id).single();
      if (!s || s.user.id === guestId || adminCheck) { router.replace('/login'); return; }
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

  // Load all data
  useEffect(() => {
    if (!session) return;
    const uid = session.user.id;
    async function loadAll() {
      // Profile
      const { data: p } = await supabase.from('account_users').select('*').eq('account_user_id', uid).single();
      setProfile(p); setEditProfile(p ? { ...p } : null);

      // SMS prefs
      const { data: prefs } = await supabase.from('user_sms_preferences').select('*').eq('user_id', uid).single();
      setSmsPrefs(prefs);

      // Purchase stats
      const { data: invs } = await supabase.from('invoices').select('invoice_id, total_amount').eq('account_user_id', uid);
      if (invs) { setInvoiceCount(invs.length); setInvoiceTotal(invs.reduce((s, i) => s + Number(i.total_amount || 0), 0)); }

      // Work orders
      const { data: wo } = await supabase.from('work_orders').select('*').eq('account_user_id', uid).order('created_at', { ascending: false });
      setWorkOrders(wo || []);

      // Realtime work order updates
      supabase.channel('user-wo-' + uid)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders', filter: `account_user_id=eq.${uid}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setWorkOrders(prev => [payload.new as any, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setWorkOrders(prev => prev.map(w => w.work_order_id === (payload.new as any).work_order_id ? payload.new as any : w));
            }
          })
        .subscribe();

      // Admin info (for WO modal)
      const { data: admin } = await supabase.from('admin_users').select('business_name, full_name, address, phone, contact_email').single();
      setAdminInfo(admin);

      // Inquiries
      const { data: inq } = await supabase.from('account_inquiries').select('*').eq('account_user_id', uid).order('created_at', { ascending: false });
      setInquiries(inq || []);

      // Service requests
      const { data: sr } = await supabase.from('service_requests').select('*').eq('account_user_id', uid).order('created_at', { ascending: false });
      setServiceRequests(sr || []);

      // Invoices
      const { data: inv } = await supabase.from('invoices').select('*').eq('account_user_id', uid).order('paid_at', { ascending: false });
      setInvoices(inv || []);

      // Chat thread
      const { data: thread } = await supabase.from('chat_threads').select('*').eq('account_user_id', uid).single();
      setChatThread(thread);
      if (thread) {
        const { data: msgs } = await supabase.from('chat_messages').select('*').eq('chat_thread_id', thread.chat_thread_id).order('created_at', { ascending: true });
        setMessages(msgs || []);
        // Mark as read on desktop
        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
          await supabase.from('chat_threads').update({ account_has_unread: false }).eq('chat_thread_id', thread.chat_thread_id);
        }
        // Realtime — dedup against optimistic messages
        supabase.channel('user-chat-' + thread.chat_thread_id)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_thread_id=eq.${thread.chat_thread_id}` },
            (payload) => {
              const newMsg = payload.new as any;
              setMessages(prev => {
                // Remove optimistic version if present, add real one
                const filtered = prev.filter(m => !m.chat_message_id.startsWith('opt-') || m.body !== newMsg.body);
                // Avoid exact duplicates by real ID
                if (filtered.some(m => m.chat_message_id === newMsg.chat_message_id)) return filtered;
                return [...filtered, newMsg];
              });
            })
          .subscribe();
      }

      setLoading(false);
    }
    loadAll();
  }, [session]);

  // Scroll chat to bottom
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, chatOpen]);

  // Profile save
  const saveProfile = async () => {
    if (!editProfile || !session) return;
    setProfileSaving(true);
    const updates: any = {};
    if (editProfile.name !== profile.name) updates.name = editProfile.name;
    if (editProfile.email !== profile.email) updates.email = editProfile.email;
    if (editProfile.phone !== profile.phone) updates.phone = editProfile.phone;
    if (editProfile.shipping_address !== profile.shipping_address) updates.shipping_address = editProfile.shipping_address;
    if (editProfile.business_name !== profile.business_name) updates.business_name = editProfile.business_name;

    await supabase.from('account_users').update(updates).eq('account_user_id', session.user.id);

    // Phone sync: update user_sms_preferences too
    if (updates.phone) {
      await supabase.from('user_sms_preferences').update({ phone: updates.phone }).eq('user_id', session.user.id);
    }

    setProfile({ ...profile, ...updates });
    setProfileSaving(false);
    setProfileFlash(true);
    setTimeout(() => setProfileFlash(false), 2000);
  };

  const hasProfileChanges = editProfile && profile && (
    editProfile.name !== profile.name || editProfile.email !== profile.email ||
    editProfile.phone !== profile.phone || editProfile.shipping_address !== profile.shipping_address ||
    editProfile.business_name !== profile.business_name
  );

  // SMS toggle
  const toggleSms = async (col: string, val: boolean) => {
    if (!session) return;
    await supabase.from('user_sms_preferences').upsert({
      user_id: session.user.id, phone: profile?.phone || '', [col]: val,
    }, { onConflict: 'user_id' });
    setSmsPrefs((prev: any) => ({ ...prev, [col]: val }));
  };

  // Accept work order
  const acceptWO = async (wo: any) => {
    const log = [...(Array.isArray(wo.edit_history) ? wo.edit_history : []), { action: 'ACCEPTED by user', by: 'user', at: new Date().toISOString() }];
    await supabase.from('work_orders').update({ status: 'ACCEPTED', accepted_at: new Date().toISOString(), edit_history: log })
      .eq('work_order_id', wo.work_order_id).eq('account_user_id', session.user.id);
    await supabase.functions.invoke('send-admin-notification', {
      body: { event_type: 'work_orders', work_order_id: wo.work_order_id },
    });
    setWorkOrders(prev => prev.map(w => w.work_order_id === wo.work_order_id ? { ...w, status: 'ACCEPTED', accepted_at: new Date().toISOString(), edit_history: log } : w));
    setSelectedWO((prev: any) => prev ? { ...prev, status: 'ACCEPTED', accepted_at: new Date().toISOString(), edit_history: log } : prev);
  };

  // Service request gate check
  const openSRForm = async () => {
    const { data: prefs } = await supabase.from('user_sms_preferences').select('opt_in_work_orders').eq('user_id', session.user.id).single();
    const { data: p } = await supabase.from('account_users').select('phone').eq('account_user_id', session.user.id).single();
    if (!p?.phone || !prefs?.opt_in_work_orders) {
      setSrGateMsg('To submit a service request you must have a phone number on file and work order SMS notifications enabled. This keeps you informed every step of the way. Update your preferences in your profile.');
      return;
    }
    setSrGateMsg('');
    setShowSRForm(true);
  };

  // Submit service request
  const submitSR = async () => {
    if (!srType || !srDesc.trim()) return;
    setSrSubmitting(true);
    await supabase.from('service_requests').insert({
      account_user_id: session.user.id,
      service_type: srType,
      description: srDesc,
      photo_url: null,
    });
    await supabase.functions.invoke('send-admin-notification', {
      body: { event_type: 'service_requests', user_id: session.user.id },
    });
    setSrSubmitting(false); setShowSRForm(false); setSrType(''); setSrDesc('');
    // Reload
    const { data: sr } = await supabase.from('service_requests').select('*').eq('account_user_id', session.user.id).order('created_at', { ascending: false });
    setServiceRequests(sr || []);
  };

  // Send chat message
  const sendChat = async () => {
    if (!chatInput.trim() || !chatThread || !session) return;
    const msgText = chatInput;
    setChatInput('');
    setChatSending(true);

    // Optimistic update — show message immediately
    const optimisticMsg = {
      chat_message_id: 'opt-' + Date.now(),
      chat_thread_id: chatThread.chat_thread_id,
      actor: 'ACCOUNT',
      actor_id: session.user.id,
      body: msgText,
      attachment_url: null,
      attachment_type: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    const { error } = await supabase.from('chat_messages').insert({
      chat_thread_id: chatThread.chat_thread_id,
      actor: 'ACCOUNT',
      actor_id: session.user.id,
      body: msgText,
      attachment_url: null,
      attachment_type: null,
    });

    if (error) {
      console.error('Chat insert failed:', error.message);
      // Remove optimistic message on failure, restore input
      setMessages(prev => prev.filter(m => m.chat_message_id !== optimisticMsg.chat_message_id));
      setChatInput(msgText);
      setChatSending(false);
      return;
    }

    await supabase.functions.invoke('send-admin-notification', {
      body: { event_type: 'chat', thread_id: chatThread.chat_thread_id },
    }).catch(() => {});
    await supabase.from('chat_threads').update({ account_has_unread: false, admin_has_unread: true }).eq('chat_thread_id', chatThread.chat_thread_id);
    setChatSending(false);
  };

  // Mark chat read on mobile drawer open
  const openChatDrawer = async () => {
    setChatOpen(true);
    if (chatThread) {
      await supabase.from('chat_threads').update({ account_has_unread: false }).eq('chat_thread_id', chatThread.chat_thread_id);
    }
  };

  // Chat file upload (account user)
  const handleChatFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatThread || !session) return;
    setChatUploading(true);
    const path = `user/${session.user.id}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadErr } = await supabase.storage.from('ChatUploads').upload(path, file, { contentType: file.type });
    if (uploadErr) { console.error('Upload error:', uploadErr.message); setChatUploading(false); return; }
    const uploadedUrl = uploadData?.path || path;
    const uploadedType = file.type;
    await supabase.from('chat_messages').insert({
      chat_thread_id: chatThread.chat_thread_id,
      actor: 'ACCOUNT', actor_id: session.user.id,
      body: null, attachment_url: uploadedUrl, attachment_type: uploadedType,
    });
    await supabase.functions.invoke('send-admin-notification', {
      body: { event_type: 'chat', thread_id: chatThread.chat_thread_id },
    }).catch(() => {});
    await supabase.from('chat_threads').update({ account_has_unread: false, admin_has_unread: true }).eq('chat_thread_id', chatThread.chat_thread_id);
    setChatUploading(false);
    if (chatFileRef.current) chatFileRef.current.value = '';
  };

  // Open WO detail
  const openWODetail = (wo: any) => { setSelectedWO(wo); };

  if (loading) return <div style={{ background: '#1a1919', minHeight: '100vh' }} />;

  const NAV = [
    { id: 'home', label: 'Home' },
    { id: 'workorders', label: 'Work Orders' },
    { id: 'inquiries', label: 'Inquiries' },
    { id: 'invoices', label: 'Invoices' },
  ];

  const smToggles = [
    { label: 'Work Order Updates', col: 'opt_in_work_orders' },
    { label: 'Tracking Updates', col: 'opt_in_tracking' },
    { label: 'Chat Message Alerts', col: 'opt_in_chat' },
    { label: 'Purchase Confirmations', col: 'opt_in_purchases' },
    { label: 'New Gem Listings', col: 'opt_in_new_listings' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: accountCss }} />
      <div className="acc-shell">
        {/* Left panel */}
        <div className="acc-left">
          {/* Nav */}
          <div className="acc-nav">
            {NAV.map(n => (
              <button key={n.id} className={`acc-nav-item ${activeTab === n.id ? 'on' : ''}`} onClick={() => setActiveTab(n.id)}>
                {n.label}
              </button>
            ))}
            <Link href="/shop" className="acc-nav-item" style={{ textDecoration: 'none', marginTop: 'auto' }}>
              Browse Shop
            </Link>
            <Link href="/portfolio" className="acc-nav-item" style={{ textDecoration: 'none' }}>
              See Portfolio
            </Link>
            <button className="acc-nav-item" style={{ color: 'var(--er, #b54040)' }}
              onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}>
              Sign Out
            </button>
          </div>

          {/* Content */}
          <div className="acc-content">
            {/* HOME TAB */}
            {activeTab === 'home' && (
              <div style={{ padding: '28px' }}>
                <h2 style={{ fontFamily: "'comfortaa', serif", fontSize: '24px', color: '#FAFAFA', marginBottom: '24px' }}>Profile</h2>
                {editProfile && (
                  <div style={{ display: 'grid', gap: '12px', maxWidth: '500px' }}>
                    {[
                      { label: 'Name', key: 'name', placeholder: 'Full name' },
                      { label: 'Email', key: 'email', placeholder: 'Email' },
                      { label: 'Phone', key: 'phone', placeholder: 'Phone' },
                      { label: 'Shipping Address', key: 'shipping_address', placeholder: 'Address' },
                      { label: 'Business Name', key: 'business_name', placeholder: 'Add business name' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="acc-label">{f.label}</label>
                        <input className="acc-input" value={editProfile[f.key] || ''} placeholder={f.placeholder}
                          onChange={e => setEditProfile({ ...editProfile, [f.key]: e.target.value })} />
                      </div>
                    ))}
                    {hasProfileChanges && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button className="acc-btn-gold" onClick={saveProfile} disabled={profileSaving}>
                          {profileSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button className="acc-btn-ghost" onClick={() => setEditProfile({ ...profile })}>Cancel</button>
                      </div>
                    )}
                    {profileFlash && <span style={{ color: '#d4af37', fontSize: '11px' }}>✓ Saved</span>}
                  </div>
                )}

                {/* Purchase stats */}
                <div style={{ marginTop: '32px', padding: '20px', background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontFamily: "'Courier New', monospace", fontSize: '19px', color: 'rgb(48, 177, 98)' }}>{invoiceCount}</span>
                  <span style={{ fontSize: '17px', color: 'rgba(255,255,255,0.55)', marginLeft: '8px' }}>items purchased</span>
                  <span style={{ margin: '0 12px', color: 'rgba(255,255,255,0.15)' }}>|</span>
                  <span style={{ fontFamily: "'Courier New', monospace", fontSize: '18px', color: 'rgb(48, 177, 98)' }}>{formatMoney(invoiceTotal)}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginLeft: '8px' }}>total spent</span>
                </div>

                {/* SMS Preferences */}
                <div style={{ marginTop: '32px' }}>
                  <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.55)', marginBottom: '16px' }}>Notification Preferences</h3>
                  {smToggles.map(t => (
                    <div key={t.col} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{t.label}</span>
                      <button
                        onClick={() => toggleSms(t.col, !smsPrefs?.[t.col])}
                        style={{
                          width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer', position: 'relative',
                          background: smsPrefs?.[t.col] ? '#d4af37' : 'rgba(255,255,255,0.12)', transition: 'background 200ms',
                        }}
                      >
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px',
                          left: smsPrefs?.[t.col] ? '21px' : '3px', transition: 'left 200ms',
                        }} />
                      </button>
                    </div>
                  ))}
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '12px', fontStyle: 'italic' }}>
                    We'll send SMS alerts to your phone number on file
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'workorders' && (
              <WorkOrderList workOrders={workOrders} onSelect={openWODetail} onAccept={acceptWO} />
            )}

            {/* INQUIRIES TAB */}
            {activeTab === 'inquiries' && (
              <InquiryList
                inquiries={inquiries}
                serviceRequests={serviceRequests}
                inquiryTab={inquiryTab}
                setInquiryTab={setInquiryTab}
                showSRForm={showSRForm}
                srType={srType}
                srDesc={srDesc}
                srSubmitting={srSubmitting}
                srGateMsg={srGateMsg}
                setSrType={setSrType}
                setSrDesc={setSrDesc}
                setShowSRForm={setShowSRForm}
                onOpenSRForm={openSRForm}
                onSubmitSR={submitSR}
              />
            )}


                        {activeTab === 'invoices' && <InvoiceList invoices={invoices} />}

          </div>
        </div>

        {/* Right panel — Chat (desktop) */}

        <div className="acc-right">
          <div className="acc-chat-header">
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#d4af37' }}>Chat</span>
            <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '5px' }}>We're here to help — don't hesitate to reach out</p>
          </div>
          <div className="acc-chat-messages">
            {messages.map(m => (
              <div key={m.chat_message_id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.actor === 'ACCOUNT' ? 'flex-end' : 'flex-start', marginBottom: '13px' }}>
                <div style={{
                  maxWidth: '80%', padding: '11px 15px', borderRadius: '14px',
                  background: m.actor === 'ACCOUNT' ? 'rgba(45,212,191,1)' : '#d4af37',
                  color: '#050505', fontFamily: "'Comfortaa', sans-serif", fontSize: '15.9px', lineHeight: 1.7,
                }}>
                  {m.body && <div>{m.body}</div>}
                  {m.attachment_url && m.attachment_type?.startsWith('image/') && (
                    <img src={m.attachment_url.startsWith('http') ? m.attachment_url : supabase.storage.from('ChatUploads').getPublicUrl(m.attachment_url).data.publicUrl} alt="attachment" style={{ maxWidth: '180px', maxHeight: '180px', objectFit: 'cover', marginTop: m.body ? '6px' : '0', borderRadius: '6px' }} />
                  )}
                  {m.attachment_url && m.attachment_type === 'application/pdf' && (
                    <div style={{ marginTop: m.body ? '7px' : '0', fontSize: '15.9px' }}>📄 <a href={m.attachment_url.startsWith('http') ? m.attachment_url : supabase.storage.from('ChatUploads').getPublicUrl(m.attachment_url).data.publicUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#050505', textDecoration: 'underline' }}>Download PDF</a></div>
                  )}
                </div>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', marginTop: '3px', fontFamily: "'Montserrat', sans-serif" }}>{fmtTime(m.created_at)}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="acc-chat-input-bar">
            <input type="file" ref={chatFileRef} accept=".jpg,.jpeg,.png,.tiff,.tif,.dng,.heic,.pdf" style={{ display: 'none' }} onChange={handleChatFile} />
            <button onClick={() => chatFileRef.current?.click()} disabled={chatUploading} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.45)', padding: '11px', cursor: 'pointer', fontSize: '17px', flexShrink: 0 }} title="Attach file">{chatUploading ? '...' : '📎'}</button>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
              placeholder="Type a message..." className="acc-chat-input"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }} />
            <button onClick={sendChat} disabled={chatSending || !chatInput.trim()} className="acc-chat-send">
              {chatSending ? '...' : '→'}
            </button>
          </div>
        </div>

        {/* Mobile chat drawer */}
        <div className={`acc-chat-mobile-bar ${chatOpen ? 'hidden' : ''}`} onClick={openChatDrawer}>
          Chat with Admin
        </div>
        {chatOpen && (
          <div className="acc-chat-mobile-drawer">
            <div className="acc-chat-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#d4af37' }}>Chat</span>
              <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '19px' }}>↓</button>
            </div>
            <div className="acc-chat-messages" style={{ flex: 1 }}>
              {messages.map(m => (
                <div key={m.chat_message_id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.actor === 'ACCOUNT' ? 'flex-end' : 'flex-start', marginBottom: '13px' }}>
                  <div style={{
                    maxWidth: '80%', padding: '11px 15px', borderRadius: '1.7px',
                    background: m.actor === 'ACCOUNT' ? 'rgba(45,212,191,1)' : '#d4af37',
                    color: '#050505', fontFamily: "'Comfortaa', sans-serif", fontSize: '17px',
                  }}>
                    {m.body && <div>{m.body}</div>}
                    {m.attachment_url && m.attachment_type?.startsWith('image/') && (
                      <img src={m.attachment_url.startsWith('http') ? m.attachment_url : supabase.storage.from('ChatUploads').getPublicUrl(m.attachment_url).data.publicUrl} alt="attachment" style={{ maxWidth: '180px', maxHeight: '180px', objectFit: 'cover', marginTop: m.body ? '6px' : '0', borderRadius: '6px' }} />
                    )}
                    {m.attachment_url && m.attachment_type === 'application/pdf' && (
                      <div style={{ marginTop: m.body ? '6px' : '0', fontSize: '12px' }}>📄 <a href={m.attachment_url.startsWith('http') ? m.attachment_url : supabase.storage.from('ChatUploads').getPublicUrl(m.attachment_url).data.publicUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#050505', textDecoration: 'underline' }}>Download PDF</a></div>
                    )}
                  </div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.38)', marginTop: '4px' }}>{fmtTime(m.created_at)}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="acc-chat-input-bar">
              <button onClick={() => chatFileRef.current?.click()} disabled={chatUploading} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.45)', padding: '10px', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}>{chatUploading ? '...' : '📎'}</button>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." className="acc-chat-input"
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }} />
              <button onClick={sendChat} disabled={chatSending || !chatInput.trim()} className="acc-chat-send">{chatSending ? '...' : '→'}</button>
            </div>
          </div>
        )}
      </div>

      {/* Work Order Detail Modal */}
      {selectedWO && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) { setSelectedWO(null); setShowAddressEdit(false); setAddressConfirmed(false); } }}>
          <div style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.10)', padding: '40px', maxWidth: '680px', width: '100%', maxHeight: '92vh', overflowY: 'auto', borderRadius: '2px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>Work Order</div>
                <div style={{ fontFamily: "'Oranienbaum', serif", fontSize: '23px', color: 'rgba(255,255,255,0.88)' }}>{selectedWO.title}</div>
              </div>
              <span style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '4px 9px', background: STATUS_COLORS[selectedWO.status]?.bg, color: STATUS_COLORS[selectedWO.status]?.color }}>{selectedWO.status}</span>
            </div>

            {/* Admin address — SEND TO THIS ADDRESS */}
            {adminInfo && (
              <div style={{ marginBottom: '16px', padding: '17px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Send To</div>
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ffd700' }}>← SEND TO THIS ADDRESS</div>
                </div>
                <div style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 2 }}>
                  <div style={{ color: '#d4af37', fontWeight: 600, fontSize: '16px' }}>{adminInfo.business_name}</div>
                  <div>{adminInfo.full_name}</div>
                  <div>{adminInfo.address}</div>
                  <div>{adminInfo.contact_email}</div>
                  <div>{adminInfo.phone}</div>
                </div>
              </div>
            )}

            {/* User address — RETURN TO THIS ADDRESS */}
            {profile && (
              <div style={{ marginBottom: '21px', padding: '17px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Return To</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ffd700' }}>RETURN TO THIS ADDRESS →</div>
                    {selectedWO.status === 'CREATED' && (
                      <button onClick={() => { setTempAddress(selectedWO.wo_shipping_address || profile.shipping_address || ''); setShowAddressEdit(true); }}
                        style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', padding: '4px 8px', cursor: 'pointer' }}>
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 2 }}>
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px' }}>{profile.name}</div>
                  <div>{profile.email}</div>
                  {profile.phone && <div>{profile.phone}</div>}
                  <div style={{ color: '#FAFAFA' }}>{selectedWO.wo_shipping_address || profile.shipping_address || 'No address on file'}</div>
                  {selectedWO.wo_shipping_address && selectedWO.wo_shipping_address !== profile.shipping_address && (
                    <div style={{ fontSize: '10px', color: '#ffd700', marginTop: '4px', fontStyle: 'italic' }}>* Custom address for this work order only</div>
                  )}
                </div>
              </div>
            )}

            {/* Address edit confirmation modal */}
            {showAddressEdit && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', padding: '16px', marginBottom: '16px', borderRadius: '4px' }}>
                {!addressConfirmed ? (
                  <>
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ffd700', marginBottom: '8px' }}>Update Return Address</p>
                    <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginBottom: '12px', lineHeight: 1.6 }}>
                      This change applies to this work order only and does not update your profile. By confirming, you agree this is the address we will ship your item to upon completion.
                    </p>
                    <input value={tempAddress} onChange={e => setTempAddress(e.target.value)}
                      placeholder="Enter address for this work order..."
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', padding: '10px 12px', color: '#FAFAFA', fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', outline: 'none', marginBottom: '10px' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={async () => {
                        if (!tempAddress.trim()) return;
                        const log = [...(Array.isArray(selectedWO.edit_history) ? selectedWO.edit_history : []), { action: 'Return address updated by user', by: 'user', at: new Date().toISOString() }];
                        await supabase.from('work_orders').update({ wo_shipping_address: tempAddress.trim(), edit_history: log }).eq('work_order_id', selectedWO.work_order_id);
                        setSelectedWO((prev: any) => ({ ...prev, wo_shipping_address: tempAddress.trim(), edit_history: log }));
                        setWorkOrders(prev => prev.map(w => w.work_order_id === selectedWO.work_order_id ? { ...w, wo_shipping_address: tempAddress.trim(), edit_history: log } : w));
                        setAddressConfirmed(true);
                      }}
                        style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', background: '#d4af37', color: '#050505', border: 'none', padding: '10px 16px', cursor: 'pointer' }}>
                        Confirm Address
                      </button>
                      <button onClick={() => setShowAddressEdit(false)}
                        style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'none', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.4)', padding: '10px 16px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', color: 'rgba(45,212,191,1)' }}>✓ Address updated for this work order.</p>
                )}
              </div>
            )}

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />

            {/* WO details */}
            {[
              { label: 'Service Type', val: selectedWO.service_type },
              { label: 'Gem Type', val: selectedWO.gem_type },
              { label: 'Est. Turnaround', val: selectedWO.estimated_turnaround },
              { label: 'Created', val: fmtDate(selectedWO.created_at) + ' · ' + fmtTime(selectedWO.created_at) },
              { label: 'Accepted', val: selectedWO.accepted_at ? fmtDate(selectedWO.accepted_at) + ' · ' + fmtTime(selectedWO.accepted_at) : null },
              { label: 'Confirmed', val: selectedWO.confirmed_at ? fmtDate(selectedWO.confirmed_at) + ' · ' + fmtTime(selectedWO.confirmed_at) : null },
              { label: 'Completed', val: selectedWO.completed_at ? fmtDate(selectedWO.completed_at) + ' · ' + fmtTime(selectedWO.completed_at) : null },
            ].filter(r => r.val).map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)' }}>{r.label}</span>
                <span style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.72)' }}>{r.val}</span>
              </div>
            ))}

            <div style={{ marginTop: '16px' }}>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>Description</div>
              <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.8 }}>{selectedWO.description}</p>
            </div>

            {selectedWO.notes && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>Notes</div>
                <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{selectedWO.notes}</p>
              </div>
            )}

            {selectedWO.estimated_price && (
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Quoted Price</span>
                <span style={{ fontFamily: "'Courier New', monospace", fontSize: '22px', color: 'rgba(45,212,191,1)' }}>{formatMoney(selectedWO.estimated_price)}</span>
              </div>
            )}

            {/* Payment — show stripe link if completed */}
            {selectedWO.status === 'COMPLETED' && selectedWO.stripe_payment_link && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '10px' }}>Payment</div>
                <a href={selectedWO.stripe_payment_link} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', background: '#d4af37', color: '#050505', padding: '12px 20px', textDecoration: 'none', display: 'inline-block' }}>
                  Pay Now
                </a>
              </div>
            )}
            {selectedWO.status === 'COMPLETED' && selectedWO.paid_outside_site && (
              <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)' }}>
                <span style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', color: 'rgba(45,212,191,1)' }}>✓ Payment received — thank you!</span>
              </div>
            )}

            {/* CONFIRMED status notice */}
            {selectedWO.status === 'CONFIRMED' && (
              <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(179,136,255,0.06)', border: '1px solid rgba(179,136,255,0.2)' }}>
                <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', color: '#b388ff', lineHeight: 1.6 }}>
                  Your work order has been confirmed! Please send your item to the address above. We'll notify you when we receive it.
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
              {selectedWO.status === 'CREATED' && (
                <button className="acc-btn-gold" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => { acceptWO(selectedWO); }}>
                  Accept Work Order
                </button>
              )}
              <button className="acc-btn-ghost" onClick={() => { setSelectedWO(null); setShowAddressEdit(false); setAddressConfirmed(false); }} style={{ marginLeft: 'auto' }}>Close</button>
            </div>

            {/* Activity Log */}
            {selectedWO.edit_history && selectedWO.edit_history.length > 0 && (
              <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '10px' }}>Activity Log</div>
                {[...selectedWO.edit_history].reverse().map((entry: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '2px 6px', background: entry.by === 'admin' ? 'rgba(212,175,55,0.12)' : 'rgba(45,212,191,0.1)', color: entry.by === 'admin' ? '#d4af37' : 'rgba(45,212,191,0.9)' }}>{entry.by}</span>
                      <span style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{entry.action}</span>
                    </div>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', flexShrink: 0 }}>{fmtDate(entry.at)} · {fmtTime(entry.at)}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

    </>
  );
}

const accountCss = `
.acc-shell { display: flex; height: 100vh; background: #050505; overflow: hidden; }
.acc-left { flex: 1; display: flex; min-height: 0; min-width: 0; }
.acc-nav { width: 180px; flex-shrink: 0; background: #0A0A0A; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; padding: 20px 0; overflow-y: auto; }
.acc-nav-item { display: block; width: 100%; text-align: left; padding: 10px 20px; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 400; letter-spacing: 0.20em; text-transform: uppercase; color: rgba(255,255,255,0.45); background: none; border: none; border-left: 2px solid transparent; cursor: pointer; transition: color 0.15s; }
.acc-nav-item.on { color: #d4af37; border-left-color: #d4af37; }
.acc-nav-item:hover:not(.on) { color: rgba(255,255,255,0.75); }
.acc-content { flex: 1; overflow-y: auto; min-height: 0; min-width: 0; }
.acc-right { width: 35%; min-width: 300px; max-width: 420px; border-left: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; background: #0A0A0A; }
.acc-chat-header { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.acc-chat-messages { flex: 1; overflow-y: auto; padding: 16px 20px; }
.acc-chat-input-bar { display: flex; gap: 8px; padding: 12px 20px; border-top: 1px solid rgba(255,255,255,0.06); }
.acc-chat-input { flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10); padding: 10px 12px; color: #FAFAFA; font-family: 'Comfortaa', sans-serif; font-size: 13px; outline: none; }
.acc-chat-input:focus { border-color: rgba(214,180,70,0.55); }
.acc-chat-send { background: #d4af37; border: none; color: #050505; padding: 10px 16px; font-size: 14px; cursor: pointer; font-weight: 700; }
.acc-chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
.acc-label { font-family: 'Montserrat', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.38); display: block; margin-bottom: 5px; }
.acc-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10); padding: 10px 12px; color: #FAFAFA; font-family: 'Comfortaa', sans-serif; font-size: 13px; outline: none; }
.acc-input:focus { border-color: rgba(214,180,70,0.55); }
.acc-btn-gold { background: #d4af37; color: #050505; border: none; padding: 12px 20px; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; width: 100%; }
.acc-btn-gold:disabled { opacity: 0.4; cursor: not-allowed; }
.acc-btn-ghost { background: none; border: 1px solid rgba(255,255,255,0.10); color: rgba(255,255,255,0.45); padding: 10px 16px; font-family: 'Montserrat', sans-serif; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; }
.acc-tab { padding: 10px 0; font-family: 'Montserrat', sans-serif; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.45); background: none; border: none; border-bottom: 1px solid transparent; cursor: pointer; }
.acc-tab.on { color: #FAFAFA; border-bottom-color: #d4af37; }
.acc-empty { font-size: 11px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.2em; }
.acc-chat-mobile-bar { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: #d4af37; color: #050505; text-align: center; padding: 14px; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; z-index: 50; }
.acc-chat-mobile-bar.hidden { display: none !important; }
.acc-chat-mobile-drawer { display: none; position: fixed; inset: 0; background: #050505; z-index: 100; flex-direction: column; }
@media (max-width: 767px) {
  .acc-right { display: none; }
  .acc-chat-mobile-bar { display: block; }
  .acc-chat-mobile-drawer { display: flex; }
  .acc-nav { width: 100%; flex-direction: row; overflow-x: auto; padding: 0; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .acc-nav-item { border-left: none; border-bottom: 2px solid transparent; white-space: nowrap; padding: 12px 16px; }
  .acc-nav-item.on { border-bottom-color: #d4af37; }
  .acc-left { flex-direction: column; }
}
`;
