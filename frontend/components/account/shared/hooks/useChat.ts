import { useState, useRef } from 'react';
import { supabase } from '../../../../lib/supabase';

export function useChat(
  session: any,
  chatThread: any,
  setMessages: (fn: any) => void
) {
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUploading, setChatUploading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);

  const sendChat = async () => {
    if (!chatInput.trim() || !chatThread || !session) return;
    const msgText = chatInput;
    setChatInput('');
    setChatSending(true);
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
    setMessages((prev: any[]) => [...prev, optimisticMsg]);
    const { error } = await supabase.from('chat_messages').insert({
      chat_thread_id: chatThread.chat_thread_id,
      actor: 'ACCOUNT',
      actor_id: session.user.id,
      body: msgText,
      attachment_url: null,
      attachment_type: null,
    });
    if (error) {
      setMessages((prev: any[]) => prev.filter(m => m.chat_message_id !== optimisticMsg.chat_message_id));
      setChatInput(msgText);
      setChatSending(false);
      return;
    }
    await supabase.functions.invoke('send-admin-notification', { body: { event_type: 'chat', thread_id: chatThread.chat_thread_id } }).catch(() => {});
    await supabase.from('chat_threads').update({ account_has_unread: false, admin_has_unread: true }).eq('chat_thread_id', chatThread.chat_thread_id);
    setChatSending(false);
  };

  const openChatDrawer = async () => {
    setChatOpen(true);
    if (chatThread) {
      await supabase.from('chat_threads').update({ account_has_unread: false }).eq('chat_thread_id', chatThread.chat_thread_id);
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
      actor: 'ACCOUNT',
      actor_id: session.user.id,
      body: null,
      attachment_url: uploadData?.path || path,
      attachment_type: file.type,
    });
    await supabase.functions.invoke('send-admin-notification', { body: { event_type: 'chat', thread_id: chatThread.chat_thread_id } }).catch(() => {});
    await supabase.from('chat_threads').update({ account_has_unread: false, admin_has_unread: true }).eq('chat_thread_id', chatThread.chat_thread_id);
    setChatUploading(false);
    if (chatFileRef.current) chatFileRef.current.value = '';
  };

  return {
    chatInput, setChatInput,
    chatSending, chatOpen, setChatOpen,
    chatUploading,
    chatEndRef, chatFileRef,
    sendChat, openChatDrawer, handleChatFile,
  };
}