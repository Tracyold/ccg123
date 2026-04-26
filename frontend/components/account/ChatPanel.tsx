import { useRef, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { fmtTime } from '../../lib/utils';

interface Props {
  messages: any[];
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

function getAttachmentUrl(url: string) {
  return url.startsWith('http')
    ? url
    : supabase.storage.from('ChatUploads').getPublicUrl(url).data.publicUrl;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function DateDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6em', margin: '0.8em 0' }}>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
      <span style={{
        fontFamily: 'var(--font-ui)', fontSize: '0.62em',
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--text-muted)', whiteSpace: 'nowrap',
      }}>{label}</span>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
    </div>
  );
}

function MessageBubble({ m }: { m: any }) {
  const isMe = m.actor === 'ACCOUNT';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isMe ? 'flex-end' : 'flex-start',
      marginBottom: '0.75em',
    }}>
      <div style={{
        maxWidth: '78%',
        padding: '0.6em 0.9em',
        borderRadius: isMe ? '1.1em 1.1em 0.2em 1.1em' : '1.1em 1.1em 1.1em 0.2em',
        /* desaturated bubble colors — not abrasive */
        background: isMe
          ? 'var(--chat-bubble-me, rgba(80,110,135,0.65))'
          : 'var(--chat-bubble-them, rgba(120,110,75,0.5))',
        color: 'var(--text)',
        fontFamily: 'var(--font-ui)',
        fontSize: '0.95em',
        lineHeight: 1.55,
        wordBreak: 'break-word',
      }}>
        {m.body && <div>{m.body}</div>}
        {m.attachment_url && m.attachment_type?.startsWith('image/') && (
          <img
            src={getAttachmentUrl(m.attachment_url)}
            alt="attachment"
            style={{
              maxWidth: '100%', maxHeight: '12em', objectFit: 'cover',
              marginTop: m.body ? '0.4em' : 0, borderRadius: '0.6em', display: 'block',
            }}
          />
        )}
        {m.attachment_url && m.attachment_type === 'application/pdf' && (
          <div style={{ marginTop: m.body ? '0.4em' : 0, fontSize: '0.88em' }}>
            📄 <a href={getAttachmentUrl(m.attachment_url)} target="_blank" rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'underline' }}>Download PDF</a>
          </div>
        )}
      </div>
      <span style={{
        fontSize: '0.65em', color: 'var(--text-muted)', marginTop: '0.2em',
        fontFamily: 'var(--font-ui)',
        paddingLeft: isMe ? 0 : '0.4em',
        paddingRight: isMe ? '0.4em' : 0,
      }}>{fmtTime(m.created_at)}</span>
    </div>
  );
}

export default function ChatPanel({
  messages, chatInput, chatSending, chatUploading, chatOpen,
  chatEndRef, chatFileRef,
  setChatInput, setChatOpen, openChatDrawer, sendChat, handleChatFile,
}: Props) {
  const chatRef = useRef<HTMLDivElement>(null);
  const [animating, setAnimating] = useState(false);
  const BAR_H = 52;

  /* Scale desktop font with panel width */
  useEffect(() => {
    const el = chatRef.current;
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

  /* Auto-scroll */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (chatOpen) setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 120);
  }, [chatOpen]);

  /* Handle open with animation state */
  const handleOpen = () => {
    setAnimating(true);
    openChatDrawer();
    setTimeout(() => setAnimating(false), 420);
  };

  const handleClose = () => {
    setAnimating(true);
    setTimeout(() => { setChatOpen(false); setAnimating(false); }, 400);
  };

  /* ── Input bar (shared) ── */
  const inputBar = (
    <div style={{
      display: 'flex', gap: '0.5em',
      padding: '10px 14px',
      borderTop: '0.5px solid var(--border)',
      background: 'var(--bg-card)',
      alignItems: 'center',
      flexShrink: 0,
    }}>
      <input
        type="file"
        ref={chatFileRef}
        accept=".jpg,.jpeg,.png,.tiff,.tif,.dng,.heic,.pdf"
        style={{ display: 'none' }}
        onChange={handleChatFile}
      />
      {/* Photo upload button */}
      <button
        onClick={() => chatFileRef.current?.click()}
        disabled={chatUploading}
        title="Attach photo"
        style={{
          background: 'transparent',
          border: '0.5px solid var(--border)',
          color: 'var(--text-muted)',
          width: 36, height: 36,
          borderRadius: 0,
          cursor: 'pointer', fontSize: 1.0rem,
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 150ms ease',
        }}
      >{chatUploading ? '…' : '⊕'}</button>

      {/* Text input */}
      <input
        value={chatInput}
        onChange={e => setChatInput(e.target.value)}
        placeholder="Message..."
        style={{
          flex: 1,
          background: 'var(--bg)',
          border: '0.5px solid var(--border)',
          borderRadius: 6,
          padding: '9px 13px',
          color: 'var(--text)',
          fontFamily: 'var(--font-ui)',
          fontSize: 0.9375rem,
          outline: 'none',
          transition: 'border-color 150ms ease',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
      />

      {/* Send button */}
      <button
        onClick={sendChat}
        disabled={chatSending || !chatInput.trim()}
        style={{
          background: chatInput.trim() ? 'var(--gold)' : 'var(--border)',
          border: 'none',
          borderRadius: 0,
          width: 36, height: 36,
          color: chatInput.trim() ? 'var(--bg)' : 'var(--text-muted)',
          fontWeight: 700, cursor: chatSending || !chatInput.trim() ? 'not-allowed' : 'pointer',
          fontSize: 1.0rem, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 150ms ease',
        }}
      >{chatSending ? '…' : '↑'}</button>
    </div>
  );

  /* ── Message list ── */
  const messageList = (endRef: React.RefObject<HTMLDivElement>) => {
    let lastDate = '';
    return (
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '12px 14px',
        display: 'flex', flexDirection: 'column',
      }}>
        {messages.length === 0 && (
          <p style={{
            fontFamily: 'var(--font-ui)', fontStyle: 'italic',
            fontSize: 0.875rem, color: 'var(--text-muted)',
            textAlign: 'center', margin: 'auto', opacity: 0.6,
          }}>No messages yet — say hello!</p>
        )}
        {messages.map(m => {
          const msgDate = fmtDate(m.created_at);
          const showDivider = msgDate !== lastDate;
          lastDate = msgDate;
          return (
            <div key={m.chat_message_id}>
              {showDivider && <DateDivider label={msgDate} />}
              <MessageBubble m={m} />
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    );
  };

  return (
    <>
      {/* ── Desktop chat panel (right resizable pane) ── */}
      <div ref={chatRef} className="acc-right" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '14px 16px', borderBottom: '0.5px solid var(--border)', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-ui)', fontSize: 0.6875rem,
            textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)',
          }}>Chat</span>
          <p style={{
            fontFamily: 'var(--font-ui)', fontStyle: 'italic',
            fontSize: 0.75rem, color: 'var(--text-muted)', margin: '4px 0 0',
          }}>We're here to help</p>
        </div>
        {messageList(chatEndRef)}
        {inputBar}
      </div>

      {/* ── Mobile: gold chat bar + lift animation ── */}
      <>
        {/* The bar — lifts from bottom to top when open */}
        <div
          onClick={chatOpen ? undefined : handleOpen}
          style={{
            display: 'none', /* shown via CSS on mobile */
            position: 'fixed',
            left: 0, right: 0,
            height: BAR_H,
            background: 'var(--gold)',
            zIndex: 150,
            cursor: chatOpen ? 'default' : 'pointer',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px',
            transition: 'top 400ms cubic-bezier(0.16,1,0.3,1)',
            top: chatOpen ? 0 : `calc(100vh - ${BAR_H}px)`,
          }}
          className="chat-bar-mobile"
        >
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 0.75rem, fontWeight: 700,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--bg)',
          }}>Chat</span>

          {chatOpen && (
            <button
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: '0.5px solid rgba(0,0,0,0.2)',
                color: 'var(--bg)',
                width: 30, height: 30,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 0.875rem, fontWeight: 700,
                borderRadius: 0,
              }}
            >✕</button>
          )}
        </div>

        {/* Chat content — slides up behind the bar */}
        <div
          className="chat-content-mobile"
          style={{
            display: 'none', /* shown via CSS on mobile */
            position: 'fixed',
            top: BAR_H, left: 0, right: 0, bottom: 0,
            background: 'var(--bg)',
            flexDirection: 'column',
            zIndex: 149,
            transition: 'transform 400ms cubic-bezier(0.16,1,0.3,1)',
            transform: chatOpen ? 'translateY(0)' : 'translateY(100%)',
          }}
        >
          {messageList(chatEndRef)}
          {inputBar}
        </div>
      </>
    </>
  );
}
