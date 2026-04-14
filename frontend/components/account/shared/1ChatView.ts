import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { fmtTime } from '../../../lib/utils';


// ── Types ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  chat_message_id: string;
  chat_thread_id: string;
  actor: 'ACCOUNT' | 'ADMIN';
  actor_id: string;
  body: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  created_at: string;
}

export interface ChatViewProps {
  messages: ChatMessage[];
  chatInput: string;
  chatSending: boolean;
  chatUploading: boolean;
  chatOpen: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
  chatFileRef: React.RefObject<HTMLInputElement>;
  setChatInput: (v: string) => void;
  setChatOpen: (v: boolean) => void;
  openChatDrawer: () => void;
  sendChat: () => void;
  handleChatFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// ── Pure helpers (no design) ───────────────────────────────────────────────

export function getAttachmentUrl(url: string): string {
  return url.startsWith('http')
    ? url
    : supabase.storage.from('ChatUploads').getPublicUrl(url).data.publicUrl;
}

export function formatMessageDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatMessageTime(iso: string): string {
  return fmtTime(iso);
}

export function isMyMessage(message: ChatMessage): boolean {
  return message.actor === 'ACCOUNT';
}

export function isImageAttachment(message: ChatMessage): boolean {
  return !!message.attachment_url && !!message.attachment_type?.startsWith('image/');
}

export function isPdfAttachment(message: ChatMessage): boolean {
  return !!message.attachment_url && message.attachment_type === 'application/pdf';
}

/** Groups messages by date label for rendering date dividers */
export function groupMessagesByDate(messages: ChatMessage[]): Array<{
  dateLabel: string;
  showDivider: boolean;
  message: ChatMessage;
}> {
  let lastDate = '';
  return messages.map(m => {
    const dateLabel = formatMessageDate(m.created_at);
    const showDivider = dateLabel !== lastDate;
    lastDate = dateLabel;
    return { dateLabel, showDivider, message: m };
  });
}

// ── Logic hook ─────────────────────────────────────────────────────────────

export interface UseChatView {
  animating: boolean;
  handleOpen: () => void;
  handleClose: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  triggerFileInput: () => void;
  ACCEPTED_FILE_TYPES: string;
}

export function useChatView({
  chatOpen,
  chatEndRef,
  chatFileRef,
  messages,
  setChatOpen,
  openChatDrawer,
  sendChat,
}: Pick<
  ChatViewProps,
  'chatOpen' | 'chatEndRef' | 'chatFileRef' | 'messages' | 'setChatOpen' | 'openChatDrawer' | 'sendChat'
>): UseChatView {
  const [animating, setAnimating] = useState(false);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-scroll when chat opens
  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 120);
    }
  }, [chatOpen]);

  const handleOpen = () => {
    setAnimating(true);
    openChatDrawer();
    setTimeout(() => setAnimating(false), 420);
  };

  const handleClose = () => {
    setAnimating(true);
    setTimeout(() => {
      setChatOpen(false);
      setAnimating(false);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  };

  const triggerFileInput = () => {
    chatFileRef.current?.click();
  };

  return {
    animating,
    handleOpen,
    handleClose,
    handleKeyDown,
    triggerFileInput,
    ACCEPTED_FILE_TYPES: '.jpg,.jpeg,.png,.tiff,.tif,.dng,.heic,.pdf',
  };
}

/** Desktop-only: scales font size with panel width via ResizeObserver */
export function useDesktopChatFontScale(ref: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        el.style.fontSize = Math.max(14, Math.min(18, w / 28)) + 'px';
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
}
