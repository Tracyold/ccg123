// components/account/mobile/panels/3ChatPanel.tsx

import { useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { fmtTime } from '../../../../lib/utils';
import { useSwipeDownToClose } from '../../shared/hooks/useSwipeDownToClose';
import FirstTimeTips from '../ui/FirstTimeTips';

interface ChatPanelProps {
  open:           boolean;
  messages:       any[];
  chatInput:      string;
  chatSending:    boolean;
  chatUploading:  boolean;
  chatEndRef:     React.RefObject<HTMLDivElement>;
  chatFileRef:    React.RefObject<HTMLInputElement>;
  setChatInput:   (v: string) => void;
  sendChat:       () => void;
  handleChatFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose:        () => void;
  onOpen:         () => void;
}

function getAttachmentUrl(url: string): string {
  return url.startsWith('http')
    ? url
    : supabase.storage.from('ChatUploads').getPublicUrl(url).data.publicUrl;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ChatPanel3({
  open, messages, chatInput, chatSending, chatUploading,
  chatEndRef, chatFileRef, setChatInput, sendChat, handleChatFile,
  onClose, onOpen,
}: ChatPanelProps) {

  // ── Swipe down to close ──
  const { elementRef, touchHandlers } = useSwipeDownToClose({ onClose });

  // Scroll to bottom when messages change or panel opens
  useEffect(() => {
    if (open) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Mark as read when opened
  useEffect(() => {
    if (open) onOpen();
  }, [open]);

  let lastDate = '';

  return (
    <div ref={elementRef} className={`slide-panel${open ? ' open' : ''}`}>
      <FirstTimeTips type="panel-down" show={open} />

      <div className="panel-header" {...touchHandlers}>
        <span className="panel-title">Messages</span>
        <button className="panel-close" onClick={onClose}>✕</button>
      </div>

      <div className="chat-msgs" style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <p style={{
            fontFamily: 'var(--font-ui)', fontStyle: 'italic', fontSize: 19,
            color: 'var(--text-muted)', textAlign: 'center', margin: '60px auto', opacity: 0.6,
          }}>
            No messages yet -- say hello!
          </p>
        )}
        {messages.map(m => {
          const msgDate     = formatDate(m.created_at);
          const showDivider = msgDate !== lastDate;
          lastDate = msgDate;
          const isMe = m.actor === 'ACCOUNT';
          return (
            <div key={m.chat_message_id}>
              {showDivider && (
                <div className="date-divider">
                  <div className="date-divider-line" />
                  <span className="date-divider-lbl">{msgDate}</span>
                  <div className="date-divider-line" />
                </div>
              )}
              <div className={`msg-wrap ${isMe ? 'me' : 'them'}`}>
                <div className={`bubble ${isMe ? 'me' : 'them'}`}>
                  {m.body && <div>{m.body}</div>}
                  {m.attachment_url && m.attachment_type?.startsWith('image/') && (
                    <img
                      src={getAttachmentUrl(m.attachment_url)}
                      alt="attachment"
                      style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'cover', marginTop: m.body ? 6 : 0, display: 'block' }}
                    />
                  )}
                  {m.attachment_url && m.attachment_type === 'application/pdf' && (
                    <div style={{ marginTop: m.body ? 6 : 0, fontSize: 13 }}>
                      📄{' '}
                      <a
                        href={getAttachmentUrl(m.attachment_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', textDecoration: 'underline' }}
                      >
                        Download PDF
                      </a>
                    </div>
                  )}
                </div>
                <div className="msg-time">{fmtTime(m.created_at)}</div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-bar">
        <input
          type="file"
          ref={chatFileRef}
          accept=".jpg,.jpeg,.png,.tiff,.tif,.dng,.heic,.pdf"
          style={{ display: 'none' }}
          onChange={handleChatFile}
        />
        <button
          className="chat-attach"
          onClick={() => chatFileRef.current?.click()}
          disabled={chatUploading}
          title="Attach file"
        >
          {chatUploading ? '…' : '⊕'}
        </button>
        <input
          className="chat-input"
          value={chatInput}
          placeholder="Message..."
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
          }}
        />
        <button
          className="chat-send"
          onClick={sendChat}
          disabled={chatSending || !chatInput.trim()}
        >
          {chatSending ? '…' : '↑'}
        </button>
      </div>
    </div>
  );
}