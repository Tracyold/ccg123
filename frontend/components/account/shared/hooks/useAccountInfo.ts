import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

export function useAccountData(session: any) {
  const [profile, setProfile] = useState<any>(null);
  const [smsPrefs, setSmsPrefs] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [chatThread, setChatThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [latestWizardResult, setLatestWizardResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const uid = session.user.id;
    let woChannel: any = null;
    let chatChannel: any = null;
    let srChannel: any = null;

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
        // ── Join products so inquiry cards show product name, weight, shape, price ──
        supabase
          .from('account_inquiries')
          .select(`
            *,
            products (
              title,
              weight,
              shape,
              total_price
            )
          `)
          .eq('account_user_id', uid)
          .neq('is_archived', true)
          .order('created_at', { ascending: false }),
        supabase.from('service_requests').select('*').eq('account_user_id', uid).neq('is_archived', true).order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').eq('account_user_id', uid).order('paid_at', { ascending: false }),
        supabase.from('chat_threads').select('*').eq('account_user_id', uid).single(),
      ]);

      setProfile(p);
      setSmsPrefs(prefs);
      if (invs) {
        setInvoiceCount(invs.length);
        setInvoiceTotal(invs.reduce((s, i) => s + Number(i.total_amount || 0), 0));
      }
      setWorkOrders(wo || []);
      setAdminInfo(admin);
      setInquiries(inq || []);
      setServiceRequests(sr || []);
      setInvoices(inv || []);

      srChannel = supabase.channel('user-sr-' + uid)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'service_requests',
          filter: `account_user_id=eq.\${uid}`,
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setServiceRequests(prev => [payload.new as any, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            if (updated.is_archived) {
              setServiceRequests(prev => prev.filter(s => s.service_request_id !== updated.service_request_id));
            } else {
              setServiceRequests(prev => prev.map(s =>
                s.service_request_id === updated.service_request_id ? updated : s
              ));
            }
          } else if (payload.eventType === 'DELETE') {
            setServiceRequests(prev => prev.filter(s => s.service_request_id !== (payload.old as any).service_request_id));
          }
        }).subscribe();

      setChatThread(thread);

      woChannel = supabase.channel('user-wo-' + uid)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders', filter: `account_user_id=eq.${uid}` },
          (payload) => {
            if (payload.eventType === 'INSERT') setWorkOrders(prev => [payload.new as any, ...prev]);
            else if (payload.eventType === 'UPDATE') setWorkOrders(prev => prev.map(w =>
              w.work_order_id === (payload.new as any).work_order_id ? payload.new as any : w));
          }).subscribe();

      // ── Realtime inquiries — new submissions + admin replies ──
      const inqChannel = supabase.channel('user-inq-' + uid)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'account_inquiries',
          filter: `account_user_id=eq.${uid}`,
        }, async () => {
          // Re-fetch with product join so new inquiry has full product info
          const { data: fresh } = await supabase
            .from('account_inquiries')
            .select(`*, products(title, weight, shape, total_price)`)
            .eq('account_user_id', uid)
            .neq('is_archived', true)
            .order('created_at', { ascending: false });
          if (fresh) setInquiries(fresh);
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'account_inquiries',
          filter: `account_user_id=eq.${uid}`,
        }, (payload) => {
          // Admin replied — update that inquiry in place with reply + status
          setInquiries(prev => prev.map(inq =>
            inq.account_inquiry_id === (payload.new as any).account_inquiry_id
              ? { ...inq, ...payload.new }
              : inq
          ));
        })
        .subscribe();

      if (thread) {
        const { data: msgs } = await supabase.from('chat_messages').select('*')
          .eq('chat_thread_id', thread.chat_thread_id).order('created_at', { ascending: true });
        setMessages(msgs || []);
        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
          await supabase.from('chat_threads').update({ account_has_unread: false }).eq('chat_thread_id', thread.chat_thread_id);
        }
        chatChannel = supabase.channel('user-chat-' + thread.chat_thread_id)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_thread_id=eq.${thread.chat_thread_id}` },
            (payload) => {
              const newMsg = payload.new as any;
              setMessages(prev => {
                const filtered = prev.filter(m => !m.chat_message_id.startsWith('opt-') || m.body !== newMsg.body);
                if (filtered.some(m => m.chat_message_id === newMsg.chat_message_id)) return filtered;
                return [...filtered, newMsg];
              });
            }).subscribe();
      }

      const { data: wiz } = await supabase.from('wizard_results').select('*')
        .order('created_at', { ascending: false }).limit(1).single();
      if (wiz) setLatestWizardResult(wiz);
      setLoading(false);
    }

    loadAll();
    return () => {
      if (woChannel) supabase.removeChannel(woChannel);
      if (chatChannel) supabase.removeChannel(chatChannel);
      if (srChannel) supabase.removeChannel(srChannel);
      supabase.removeChannel(supabase.channel('user-inq-' + uid));
    };
  }, [session]);

  return {
    profile, setProfile,
    smsPrefs, setSmsPrefs,
    invoices, setInvoices,
    invoiceCount, invoiceTotal,
    workOrders, setWorkOrders,
    inquiries, setInquiries,
    serviceRequests, setServiceRequests,
    adminInfo,
    chatThread,
    messages, setMessages,
    latestWizardResult,
    loading,
  };
}