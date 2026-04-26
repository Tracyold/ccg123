import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { fmtTime } from '../../../lib/utils';

interface ChatWidgetProps {
  chatThread: any;
  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  user: any;
  id: string;
  session: any;
}

export default function ChatWidget({ chatThread, messages, setMessages, user, id, session }: ChatWidgetProps) {
  // Const block — lines 33–38 of [id].tsx
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);
  const [chatUploading, setChatUploading] = useState(false);

  // Scroll effect — line 130 of [id].tsx
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, chatExpanded]);

  // Mark chat read on expand — lines 275–280 of [id].tsx
  const expandChat = async () => {
    setChatExpanded(true);
    if (chatThread) {
      await supabase.from('chat_threads').update({ admin_has_unread: false }).eq('chat_thread_id', chatThread.chat_thread_id);
    }
  };

  // Send chat (admin) — lines 230–272 of [id].tsx
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

  // Chat file upload (admin) — lines 283–303 of [id].tsx
  const handleChatFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatThread || !session) return;
    setChatUploading(true);
    const path = `admin/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadErr } = await supabase.storage.from('ChatUploads').upload(path, file, { contentType: file.type });
    if (uploadErr) { console.error('Upload error:', uploadErr.message); setChatUploading(false); return; }
    const uploadedUrl = uploadData?.path || path;
    const uploadedType = file.type;
    await supabase.from('chat_messages').insert({
      chat_thread_id: chatThread.chat_thread_id,
      actor: 'ADMIN', actor_id: session.user.id,
      body: null, attachment_url: uploadedUrl, attachment_type: uploadedType,
    });
    await supabase.functions.invoke('send-user-notification', {
      body: { event_type: 'chat', user_id: id as string },
    }).catch(() => {});
    await supabase.from('chat_threads').update({ admin_has_unread: false, account_has_unread: true }).eq('chat_thread_id', chatThread.chat_thread_id);
    setChatUploading(false);
    if (chatFileRef.current) chatFileRef.current.value = '';
  };

  // JSX block — lines 489–529 of [id].tsx (the <div> inside the chatThread && !isGuest conditional)
  return (
    <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '479px', zIndex: 100 }}>
      {!chatExpanded ? (
        <div onClick={expandChat} style={{ height: '79px', background: 'var(--k1)', borderTop: '1px solid var(--ln)', border: '1px solid var(--ln)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 21px', cursor: 'pointer' }}>
          <span style={{ fontFamily: 'var(--sans)', fontSize: '0.9375rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gl)' }}>Chat · {user?.name || 'User'}</span>
          <span style={{ color: 'var(--d1)', fontSize: '1.0625rem' }}>↑</span>
        </div>
      ) : (
        <div style={{ height: '799px', background: 'var(--k1)', borderTop: '1px solid var(--ln)', border: '1px solid var(--ln)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 21px', borderBottom: '1px solid var(--ln)', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--sans)', fontSize: '1.0625rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gl)' }}>Chat · {user?.name || 'User'}</span>
            <button onClick={() => setChatExpanded(false)} style={{ background: 'none', border: 'none', color: 'var(--d1)', cursor: 'pointer', fontSize: '1.1875rem' }}>↓</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '13px 21px' }}>
            {messages.map(m => (
              <div key={m.chat_message_id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.actor === 'ADMIN' ? 'flex-end' : 'flex-start', marginBottom: '11px' }}>
                <div style={{ maxWidth: '70%', padding: '11px 15px', borderRadius: '11px', background: m.actor === 'ADMIN' ? 'var(--gold)' : 'rgba(45,212,191,1)', color: 'var(--bg)', fontFamily: 'var(--font-body)', fontSize: '0.9375rem' }}>
                  {m.body && <div>{m.body}</div>}
                  {m.attachment_url && m.attachment_type?.startsWith('image/') && (
                    <img src={m.attachment_url.startsWith('http') ? m.attachment_url : supabase.storage.from('ChatUploads').getPublicUrl(m.attachment_url).data.publicUrl} alt="attachment" style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', marginTop: m.body ? '6px' : '0', borderRadius: '6px' }} />
                  )}
                  {m.attachment_url && m.attachment_type === 'application/pdf' && (
                    <div style={{ marginTop: m.body ? '7px' : '0', fontSize: '1.0625rem' }}>📄 <a href={m.attachment_url.startsWith('http') ? m.attachment_url : supabase.storage.from('ChatUploads').getPublicUrl(m.attachment_url).data.publicUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bg)', textDecoration: 'underline' }}>Download PDF</a></div>
                  )}
                </div>
                <span style={{ fontSize: '0.625rem', color: 'var(--d2)', marginTop: '5px' }}>{fmtTime(m.created_at)}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: 'flex', gap: '9px', padding: '13px 21px', borderTop: '.5px solid var(--ln)', flexShrink: 0 }}>
            <input type="file" ref={chatFileRef} accept=".jpg,.jpeg,.png,.tiff,.tif,.dng,.heic,.pdf" style={{ display: 'none' }} onChange={handleChatFile} />
            <button onClick={() => chatFileRef.current?.click()} disabled={chatUploading} style={{ background: 'none', border: '1px solid var(--ln)', color: 'var(--d1)', padding: '10px', cursor: 'pointer', fontSize: '0.875rem', flexShrink: 0 }} title="Attach file">{chatUploading ? '...' : '📎'}</button>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..."
              style={{ flex: 1, background: 'var(--k2)', border: '1px solid var(--ln)', padding: '11px 13px', color: 'var(--tx)', fontFamily: 'var(--sans)', fontSize: '0.9375rem', outline: 'none', height: '44px' }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }} />
            <button onClick={sendChat} disabled={chatSending || !chatInput.trim()}
              style={{ background: 'var(--gl)', border: 'none', color: 'var(--bg)', padding: '11px 17px', cursor: 'pointer', fontWeight: 700, fontSize: '1.0rem' }}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}
