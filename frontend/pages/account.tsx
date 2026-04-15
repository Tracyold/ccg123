// pages/account.tsx — FULLY WIRED VERSION
// Changes from your current file are marked with ── CHANGE ──
// Everything unmarked is identical to what you already have.

// ── CHANGE 1 ── Move MobileAccount import here with the other imports
// (you already have it but it needs to be with the others at the top)
import MobileAccount from '../components/account/mobile/MobileAccount';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import InvoiceList from '../components/account/InvoiceList';
import WorkOrderList from '@/components/account/WorkOrderList';
import InquiryList from '../components/account/InquiryList';
import HomeTab from '../components/account/HomeTab';
import WizardResultsTab from '../components/account/WizardResultsTab';
import WorkOrderDetailModal from '../components/account/WorkOrderDetailModal';
import ChatPanel from '../components/account/ChatPanel';
import TopNav from '../components/shared/TopNav';

// ── CHANGE 2 ── Replace useIsMobile import with this inline hook.
// Your current import points to a file that may not exist yet.
// This puts the hook directly in the file so there is no missing dependency.
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function AccountPage() {
  const router   = useRouter();

  // ── CHANGE 3 ── Call useIsMobile here, at the top of the component.
  // Your current code has const { isMobile } = useIsMobile() which destructures
  // an object, but the hook above returns a boolean directly.
  const isMobile = useIsMobile();

  // All your existing state — UNCHANGED
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState<any>(null);
  const [editProfile, setEditProfile] = useState<any>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFlash, setProfileFlash] = useState(false);
  const [smsPrefs, setSmsPrefs] = useState<any>(null);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [inquiryTab, setInquiryTab] = useState<'inquiries' | 'service'>('inquiries');
  const [wizardPrefill, setWizardPrefill] = useState<any>(null);
  const [showSRForm, setShowSRForm] = useState(false);
  const [srType, setSrType] = useState('');
  const [srDesc, setSrDesc] = useState('');
  const [srSubmitting, setSrSubmitting] = useState(false);
  const [srGateMsg, setSrGateMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [chatThread, setChatThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const chatEndRef  = useRef<HTMLDivElement>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);
  const [chatUploading, setChatUploading] = useState(false);
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [showAddressEdit, setShowAddressEdit] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [latestWizardResult, setLatestWizardResult] = useState<any>(null);

  // ── CHANGE 4 ── Remove `if (isMobile) return` from the auth effect.
  // Your current file skips auth on mobile, which means session is never set,
  // which means data never loads, which means MobileAccount gets no real data.
  // Both mobile and desktop need auth to run so data is available for both.
  useEffect(() => {
    const guestId = process.env.NEXT_PUBLIC_GUEST_ACCOUNT_USER_ID;
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!s) { router.replace('/login'); return; }
      const { data: adminCheck } = await supabase
        .from('admin_users').select('admin_user_id')
        .eq('admin_user_id', s.user.id).single();
      if (s.user.id === guestId || adminCheck) { router.replace('/login'); return; }
      setSession(s);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, s) => {
      if (!s || s.user.id === guestId) { router.replace('/login'); return; }
      const { data: adminCheck } = await supabase
        .from('admin_users').select('admin_user_id')
        .eq('admin_user_id', s.user.id).single();
      if (adminCheck) router.replace('/admin/dashboard');
      else setSession(s);
    });
    return () => subscription.unsubscribe();
  }, [router]);
  // ── END CHANGE 4 ── (removed isMobile from deps and removed the guard)

  // ── CHANGE 5 ── Remove `if (isMobile || !session) return` from data effect.
  // Same reason — mobile needs this data too.
  useEffect(() => {
    if (!session) return; // keep only the session guard
    const uid = session.user.id;
    let woChannel:   any = null;
    let chatChannel: any = null;

    async function loadAll() {
      const [
        { data: p },
        { data: prefs },
        { data: invs },
        { data: wo },
        { data: admin },
        { data: inq },
        { data: sr },
        { data: inv },
        { data: thread },
      ] = await Promise.all([
        supabase.from('account_users').select('*').eq('account_user_id', uid).single(),
        supabase.from('user_sms_preferences').select('*').eq('user_id', uid).single(),
        supabase.from('invoices').select('invoice_id, total_amount').eq('account_user_id', uid),
        supabase.from('work_orders').select('*').eq('account_user_id', uid).order('created_at', { ascending: false }),
        supabase.from('admin_users').select('business_name, full_name, address, phone, contact_email').single(),
        supabase.from('account_inquiries').select('*').eq('account_user_id', uid).order('created_at', { ascending: false }),
        supabase.from('service_requests').select('*').eq('account_user_id', uid).order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').eq('account_user_id', uid).order('paid_at', { ascending: false }),
        supabase.from('chat_threads').select('*').eq('account_user_id', uid).single(),
      ]);

      setProfile(p); setEditProfile(p ? { ...p } : null);
      setSmsPrefs(prefs);
      if (invs) {
        setInvoiceCount(invs.length);
        setInvoiceTotal(invs.reduce((s, i) => s + Number(i.total_amount || 0), 0));
      }
      setWorkOrders(wo || []);
      woChannel = supabase.channel('user-wo-' + uid)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'work_orders',
          filter: `account_user_id=eq.${uid}`,
        }, payload => {
          if (payload.eventType === 'INSERT')
            setWorkOrders(prev => [payload.new as any, ...prev]);
          else if (payload.eventType === 'UPDATE')
            setWorkOrders(prev => prev.map(w =>
              w.work_order_id === (payload.new as any).work_order_id ? payload.new as any : w
            ));
        }).subscribe();
      setAdminInfo(admin);
      setInquiries(inq || []);
      setServiceRequests(sr || []);
      setInvoices(inv || []);
      setChatThread(thread);
      if (thread) {
        const { data: msgs } = await supabase
          .from('chat_messages').select('*')
          .eq('chat_thread_id', thread.chat_thread_id)
          .order('created_at', { ascending: true });
        setMessages(msgs || []);

        // ── CHANGE 6 ── Only mark desktop chat as read on desktop.
        // On mobile the chat panel handles this itself via onOpen prop.
        if (!isMobile && typeof window !== 'undefined') {
          await supabase.from('chat_threads')
            .update({ account_has_unread: false })
            .eq('chat_thread_id', thread.chat_thread_id);
        }

        chatChannel = supabase.channel('user-chat-' + thread.chat_thread_id)
          .on('postgres_changes', {
            event: 'INSERT', schema: 'public', table: 'chat_messages',
            filter: `chat_thread_id=eq.${thread.chat_thread_id}`,
          }, payload => {
            const newMsg = payload.new as any;
            setMessages(prev => {
              const filtered = prev.filter(
                m => !m.chat_message_id.startsWith('opt-') || m.body !== newMsg.body
              );
              if (filtered.some(m => m.chat_message_id === newMsg.chat_message_id)) return filtered;
              return [...filtered, newMsg];
            });
          }).subscribe();
      }
      const { data: wiz } = await supabase
        .from('wizard_results').select('*')
        .order('created_at', { ascending: false }).limit(1).single();
      if (wiz) setLatestWizardResult(wiz);
      setLoading(false);
    }
    loadAll();

    return () => {
      if (woChannel)   supabase.removeChannel(woChannel);
      if (chatChannel) supabase.removeChannel(chatChannel);
    };
  }, [session]); // ── removed isMobile from deps ──
  // ── END CHANGE 5 ──

  // All your existing action functions — UNCHANGED
  const deleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') { setDeleteError('Type DELETE to confirm.'); return; }
    setDeleting(true); setDeleteError('');
    try {
      const { error } = await supabase.rpc('delete_account', { user_id: session.user.id });
      if (error) throw error;
      await supabase.auth.signOut();
      router.push('/');
    } catch (err: any) {
      setDeleteError(err.message || 'Something went wrong.');
      setDeleting(false);
    }
  };

  const saveProfile = async () => {
    if (!editProfile || !session) return;
    setProfileSaving(true);
    const updates: any = {};
    if (editProfile.name             !== profile.name)             updates.name             = editProfile.name;
    if (editProfile.email            !== profile.email)            updates.email            = editProfile.email;
    if (editProfile.phone            !== profile.phone)            updates.phone            = editProfile.phone;
    if (editProfile.shipping_address !== profile.shipping_address) updates.shipping_address = editProfile.shipping_address;
    if (editProfile.business_name    !== profile.business_name)    updates.business_name    = editProfile.business_name;
    await supabase.from('account_users').update(updates).eq('account_user_id', session.user.id);
    if (updates.phone) {
      await supabase.from('user_sms_preferences')
        .update({ phone: updates.phone }).eq('user_id', session.user.id);
    }
    setProfile({ ...profile, ...updates });
    setProfileSaving(false); setProfileFlash(true);
    setTimeout(() => setProfileFlash(false), 2000);
  };

  const hasProfileChanges = editProfile && profile && (
    editProfile.name             !== profile.name ||
    editProfile.email            !== profile.email ||
    editProfile.phone            !== profile.phone ||
    editProfile.shipping_address !== profile.shipping_address ||
    editProfile.business_name    !== profile.business_name
  );

  const toggleSms = async (col: string, val: boolean) => {
    if (!session) return;
    await supabase.from('user_sms_preferences').upsert(
      { user_id: session.user.id, phone: profile?.phone || '', [col]: val },
      { onConflict: 'user_id' }
    );
    setSmsPrefs((prev: any) => ({ ...prev, [col]: val }));
  };

  const acceptWO = async (wo: any) => {
    const log = [
      ...(Array.isArray(wo.edit_history) ? wo.edit_history : []),
      { action: 'ACCEPTED by user', by: 'user', at: new Date().toISOString() },
    ];
    await supabase.from('work_orders')
      .update({ status: 'ACCEPTED', accepted_at: new Date().toISOString(), edit_history: log })
      .eq('work_order_id', wo.work_order_id).eq('account_user_id', session.user.id);
    await supabase.functions.invoke('send-admin-notification', {
      body: { event_type: 'work_orders', work_order_id: wo.work_order_id },
    });
    setWorkOrders(prev => prev.map(w =>
      w.work_order_id === wo.work_order_id
        ? { ...w, status: 'ACCEPTED', accepted_at: new Date().toISOString(), edit_history: log }
        : w
    ));
    setSelectedWO((prev: any) =>
      prev ? { ...prev, status: 'ACCEPTED', accepted_at: new Date().toISOString(), edit_history: log } : prev
    );
  };

  const handleWizardServiceRequest = (result: any) => {
    setWizardPrefill(result);
    setActiveTab('inquiries');
    setInquiryTab('service');
    setShowSRForm(true);
    setSrType(result.recommendation ?? '');
    const stone = [result.stone_variety, result.stone_species].filter(Boolean).join(' ');
    setSrDesc(
      'Stone: ' + stone +
      '\nWizard Score: ' + Math.round(result.feasibility_percent) + '%' +
      '\nRecommendation: ' + result.recommendation +
      '\nWeight Loss Estimate: ' + result.weight_loss
    );
  };

  const openSRForm = async () => {
    const { data: prefs } = await supabase
      .from('user_sms_preferences').select('opt_in_work_orders')
      .eq('user_id', session.user.id).single();
    const { data: p } = await supabase
      .from('account_users').select('phone')
      .eq('account_user_id', session.user.id).single();
    if (!p?.phone || !prefs?.opt_in_work_orders) {
      setSrGateMsg('To submit a service request you must have a phone number on file and work order SMS notifications enabled.');
      return;
    }
    setSrGateMsg(''); setShowSRForm(true);
  };

  const submitSR = async () => {
    if (!srType || !srDesc.trim()) return;
    setSrSubmitting(true);
    await supabase.from('service_requests').insert({
      account_user_id: session.user.id,
      service_type:    srType,
      description:     srDesc,
      photo_url:       null,
      wizard_result_id: wizardPrefill?.id ?? null,
    });
    await supabase.functions.invoke('send-admin-notification', {
      body: { event_type: 'service_requests', user_id: session.user.id },
    });
    setSrSubmitting(false); setShowSRForm(false); setSrType(''); setSrDesc(''); setWizardPrefill(null);
    const { data: sr } = await supabase
      .from('service_requests').select('*')
      .eq('account_user_id', session.user.id).order('created_at', { ascending: false });
    setServiceRequests(sr || []);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !chatThread || !session) return;
    const msgText = chatInput;
    setChatInput(''); setChatSending(true);
    const optimisticMsg = {
      chat_message_id: 'opt-' + Date.now(),
      chat_thread_id:  chatThread.chat_thread_id,
      actor: 'ACCOUNT', actor_id: session.user.id,
      body: msgText, attachment_url: null, attachment_type: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    const { error } = await supabase.from('chat_messages').insert({
      chat_thread_id: chatThread.chat_thread_id,
      actor: 'ACCOUNT', actor_id: session.user.id,
      body: msgText, attachment_url: null, attachment_type: null,
    });
    if (error) {
      setMessages(prev => prev.filter(m => m.chat_message_id !== optimisticMsg.chat_message_id));
      setChatInput(msgText); setChatSending(false); return;
    }
    await supabase.functions.invoke('send-admin-notification', {
      body: { event_type: 'chat', thread_id: chatThread.chat_thread_id },
    }).catch(() => {});
    await supabase.from('chat_threads')
      .update({ account_has_unread: false, admin_has_unread: true })
      .eq('chat_thread_id', chatThread.chat_thread_id);
    setChatSending(false);
  };

  const openChatDrawer = async () => {
    setChatOpen(true);
    if (chatThread) {
      await supabase.from('chat_threads')
        .update({ account_has_unread: false })
        .eq('chat_thread_id', chatThread.chat_thread_id);
    }
  };

  const handleChatFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatThread || !session) return;
    setChatUploading(true);
    const path = `user/${session.user.id}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('ChatUploads').upload(path, file, { contentType: file.type });
    if (uploadErr) { setChatUploading(false); return; }
    await supabase.from('chat_messages').insert({
      chat_thread_id: chatThread.chat_thread_id,
      actor: 'ACCOUNT', actor_id: session.user.id,
      body: null, attachment_url: uploadData?.path || path, attachment_type: file.type,
    });
    await supabase.functions.invoke('send-admin-notification', {
      body: { event_type: 'chat', thread_id: chatThread.chat_thread_id },
    }).catch(() => {});
    await supabase.from('chat_threads')
      .update({ account_has_unread: false, admin_has_unread: true })
      .eq('chat_thread_id', chatThread.chat_thread_id);
    setChatUploading(false);
    if (chatFileRef.current) chatFileRef.current.value = '';
  };

  const openWODetail = (wo: any) => setSelectedWO(wo);

  // ── CHANGE 7 ── The loading guard now covers BOTH mobile and desktop.
  // Previously the mobile render happened before this, so MobileAccount
  // was rendered before any data was loaded (empty arrays, null profile etc).
  // Now we wait for loading to finish first, then branch by device.
  if (loading) return <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }} />;

  // ── CHANGE 8 ── Mobile branch with ALL props passed in.
  // This replaces your current `if (isMobile)` block which was passing no props.
  // Every prop in MobileAccountProps must be listed here.
  if (isMobile) {
    return (
      <>
        <TopNav />
        <MobileAccount
          session={session}
          profile={profile}
          editProfile={editProfile}
          smsPrefs={smsPrefs}
          adminInfo={adminInfo}
          profileSaving={profileSaving}
          profileFlash={profileFlash}
          hasProfileChanges={hasProfileChanges}
          invoiceCount={invoiceCount}
          invoiceTotal={invoiceTotal}
          workOrders={workOrders}
          invoices={invoices}
          inquiries={inquiries}
          serviceRequests={serviceRequests}
          chatThread={chatThread}
          messages={messages}
          chatInput={chatInput}
          chatSending={chatSending}
          chatUploading={chatUploading}
          chatEndRef={chatEndRef}
          chatFileRef={chatFileRef}
          latestWizardResult={latestWizardResult}
          setEditProfile={setEditProfile}
          setChatInput={setChatInput}
          saveProfile={saveProfile}
          toggleSms={toggleSms}
          acceptWO={acceptWO}
          sendChat={sendChat}
          openChatDrawer={openChatDrawer}
          handleChatFile={handleChatFile}
          submitSR={submitSR}
          openSRForm={openSRForm}
          deleteAccount={async (confirmText: string) => {
            setDeleteConfirmText(confirmText);
            await deleteAccount();
            return {};
          }}
        />
      </>
    );
  }
  // ── END CHANGE 8 ──

  // Everything below this line is the existing desktop layout — UNCHANGED

  const NAV = [
    { id: 'home',       label: 'Home'           },
    { id: 'workorders', label: 'Work Orders'    },
    { id: 'inquiries',  label: 'Inquiries'      },
    { id: 'wizard',     label: 'Wizard Results' },
    { id: 'invoices',   label: 'Invoices'       },
  ];

  const navContent = (
    <>
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '20px' }}>
        {NAV.map(n => (
          <button
            key={n.id}
            className={`acc-nav-item ${activeTab === n.id ? 'on' : ''}`}
            onClick={() => setActiveTab(n.id)}
          >
            {n.label}
          </button>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', paddingBottom: '12px', flexShrink: 0 }}>
        <Link href="/shop"      className="acc-nav-item" style={{ textDecoration: 'none' }}>Browse Shop</Link>
        <Link href="/portfolio" className="acc-nav-item" style={{ textDecoration: 'none' }}>See Portfolio</Link>
        <button className="acc-nav-item" style={{ color: 'var(--er, #b54040)' }}
          onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}>
          Sign Out
        </button>
        <button className="acc-nav-item" style={{ color: 'var(--text-muted)', fontSize: '13px' }}
          onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); setDeleteError(''); }}>
          Delete Account
        </button>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', opacity: 0.5, lineHeight: 1.6 }}>
            © 2025 Cutting Corners Gems
          </p>
        </div>
      </div>
    </>
  );

  const tabContent = (
    <div className="acc-content">
      {activeTab === 'home' && (
        <HomeTab
          hasOpenWorkOrder={workOrders.some(w => w.status === 'ACCEPTED' || w.status === 'Created')}
          editProfile={editProfile} profile={profile} profileSaving={profileSaving}
          profileFlash={profileFlash} hasProfileChanges={hasProfileChanges}
          invoiceCount={invoiceCount} invoiceTotal={invoiceTotal} smsPrefs={smsPrefs}
          setEditProfile={setEditProfile} saveProfile={saveProfile} toggleSms={toggleSms}
        />
      )}
      {activeTab === 'workorders' && (
        <WorkOrderList workOrders={workOrders} onSelect={openWODetail} onAccept={acceptWO} />
      )}
      {activeTab === 'inquiries' && (
        <InquiryList
          inquiries={inquiries} serviceRequests={serviceRequests} inquiryTab={inquiryTab}
          setInquiryTab={setInquiryTab} showSRForm={showSRForm} srType={srType} srDesc={srDesc}
          srSubmitting={srSubmitting} srGateMsg={srGateMsg} setSrType={setSrType} setSrDesc={setSrDesc}
          setShowSRForm={setShowSRForm} onOpenSRForm={openSRForm} onSubmitSR={submitSR}
        />
      )}
      {activeTab === 'invoices' && <InvoiceList invoices={invoices} />}
      {activeTab === 'wizard'   && <WizardResultsTab onCreateServiceRequest={handleWizardServiceRequest} />}
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: accountCss }} />
      <TopNav />

      <div className="acc-shell">
        <ResizablePanelGroup style={{ flex: 1, height: '100%' }}>
          <ResizablePanel defaultSize={65} minSize={40}>
            <div className="acc-left">
              <div className="acc-nav">{navContent}</div>
              {tabContent}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={35} minSize={20}>
            <ChatPanel
              messages={messages} chatInput={chatInput} chatSending={chatSending}
              chatUploading={chatUploading} chatOpen={chatOpen} chatEndRef={chatEndRef}
              chatFileRef={chatFileRef} setChatInput={setChatInput} setChatOpen={setChatOpen}
              openChatDrawer={openChatDrawer} sendChat={sendChat} handleChatFile={handleChatFile}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <WorkOrderDetailModal
        selectedWO={selectedWO} adminInfo={adminInfo} profile={profile}
        showAddressEdit={showAddressEdit} tempAddress={tempAddress} addressConfirmed={addressConfirmed}
        setSelectedWO={setSelectedWO} setShowAddressEdit={setShowAddressEdit} setTempAddress={setTempAddress}
        setAddressConfirmed={setAddressConfirmed} setWorkOrders={setWorkOrders} acceptWO={acceptWO}
      />

      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-deep)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--bg-button)', padding: '40px', maxWidth: '440px', width: '100%' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(180,60,60,0.8)', marginBottom: '16px' }}>Permanent Action</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '25px', color: 'var(--text)', marginBottom: '16px', lineHeight: 1.2 }}>Delete Account</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '28px' }}>This will permanently delete your account. Any open work orders or invoices will remain on file. This cannot be undone.</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Type DELETE to confirm</p>
            <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid rgba(180,60,60,0.3)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '13px', padding: '12px 14px', marginBottom: '12px', boxSizing: 'border-box', outline: 'none' }} />
            {deleteError && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'rgba(220,80,80,0.9)', marginBottom: '12px' }}>
                {deleteError}
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={deleteAccount} disabled={deleting}
                style={{ flex: 1, background: 'rgba(180,60,60,0.8)', border: 'none', color: 'var(--text)', fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '13px', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.5 : 1 }}>
                {deleting ? 'Deleting...' : 'Delete My Account'}
              </button>
              <button onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '13px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const accountCss = `
.acc-shell {
  display: flex;
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  overflow: hidden;
}
.acc-left {
  display: flex;
  flex: 1;
  height: 100%;
  min-height: 0;
  min-width: 0;
}
.acc-nav {
  width: 180px;
  flex-shrink: 0;
  background: var(--bg);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.acc-nav-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 20px;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  background: none;
  border: none;
  border-left: 2px solid transparent;
  cursor: pointer;
  transition: color 0.15s;
}
.acc-nav-item.on { color: var(--bg-button); border-left-color: var(--border); }
.acc-nav-item:hover:not(.on) { color: var(--text); }
.acc-content { flex: 1; overflow-y: auto; min-height: 0; min-width: 0; max-height: 100%; }
.acc-right { width: 100%; height: 100%; border-left: 1px solid var(--border); display: flex; flex-direction: column; background: var(--bg-deep); overflow: hidden; }
.acc-label { font-family: var(--font-ui); font-size: 9px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 5px; }
.acc-input { width: 100%; background: var(--border); border: 1px solid var(--border); padding: 10px 12px; color: var(--text); font-family: var(--font-body); font-size: 13px; outline: none; }
.acc-input:focus { border-color: var(--gold); }
.acc-btn-gold { background: var(--gold); color: #050505; border: none; padding: 12px 20px; font-family: var(--font-ui); font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; width: 100%; }
.acc-btn-gold:disabled { opacity: 0.4; cursor: not-allowed; }
.acc-btn-ghost { background: var(--bg); border: 1px solid var(--border); color: var(--accent); padding: 10px 16px; font-family: var(--font-ui); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; }
.acc-tab { padding: 10px 0; font-family: var(--font-ui); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.45); background: none; border: none; border-bottom: 1px solid transparent; cursor: pointer; }
.acc-tab.on { color: var(--text); border-bottom-color: var(--bg-deep); }
.acc-empty { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.2em; }
.pill-toggle { border-radius: 860px !important; }
`;
