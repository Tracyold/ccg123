// components/account/mobile/panels/3ChatPanel.tsx

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { fmtTime } from '../../../../lib/utils';
import { useSwipeDownToClose } from '../../shared/hooks/useSwipeDownToClose';
import FirstTimeTips from '../ui/FirstTimeTips';
import type { PendingUpload } from '../../shared/hooks/useChat';
import ChatImageModal from '../modals/ChatImageModal';

interface ChatPanelProps {
  open:                 boolean;
  messages:             any[];
  chatInput:            string;
  chatSending:          boolean;
  chatUploading:        boolean;
  chatError?:           string | null;
  clearChatError?:      () => void;
  pendingUploads?:      PendingUpload[];
  dismissPendingUpload?: (tempId: string) => void;
  chatEndRef:           React.RefObject<HTMLDivElement>;
  chatFileRef:          React.RefObject<HTMLInputElement>;
  setChatInput:         (v: string) => void;
  sendChat:             () => void;
  handleChatFile:       (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose:              () => void;
  onOpen:               () => void;
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
  chatError, clearChatError,
  pendingUploads = [], dismissPendingUpload,
  chatEndRef, chatFileRef, setChatInput, sendChat, handleChatFile,
  onClose, onOpen,
}: ChatPanelProps) {

  const { elementRef, touchHandlers } = useSwipeDownToClose({ onClose });

  // ── Image modal state ──
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const openImageModal  = (url: string) => setModalImageUrl(url);
  const closeImageModal = () => setModalImageUrl(null);

  useEffect(() => {
    if (open) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingUploads, open]);

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

      <div className="chat-msgs" style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
        {messages.length === 0 && pendingUploads.length === 0 && (
          <p style={{
            fontFamily: 'var(--font-ui)', fontStyle: 'italic', fontSize: 1.1875rem,
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
                      onClick={() => openImageModal(getAttachmentUrl(m.attachment_url))}
                      style={{
                        maxWidth: '100%', maxHeight: 180, objectFit: 'cover',
                        marginTop: m.body ? 6 : 0, display: 'block', borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    />
                  )}
                  {m.attachment_url && m.attachment_type === 'application/pdf' && (
                    <div style={{ marginTop: m.body ? 6 : 0, fontSize: 0.8125rem }}>
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

        {/* ── PENDING UPLOADS ── */}
        {pendingUploads.map(p => {
          const isImage = p.fileType.startsWith('image/');
          const isPdf   = p.fileType === 'application/pdf';
          return (
            <div key={p.tempId} className="msg-wrap me">
              <div className={`bubble me${p.error ? ' upload-failed' : ''}`} style={{ position: 'relative' }}>
                {isImage && (
                  <img
                    src={p.objectUrl}
                    alt="uploading"
                    onClick={() => {
                      if (!p.uploading && !p.error) openImageModal(p.objectUrl);
                    }}
                    style={{
                      maxWidth: '100%', maxHeight: 180, objectFit: 'cover',
                      display: 'block', borderRadius: 8,
                      opacity: p.error ? 0.4 : (p.uploading ? 0.55 : 1),
                      filter: p.error ? 'grayscale(1)' : undefined,
                      cursor: (!p.uploading && !p.error) ? 'pointer' : 'default',
                    }}
                  />
                )}
                {isPdf && (
                  <div style={{ fontSize: 0.8125rem, opacity: p.error ? 0.5 : 0.85 }}>
                    📄 {p.error ? 'PDF failed to upload' : 'Uploading PDF…'}
                  </div>
                )}
                {(p.uploading || p.error) && (
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0.25)',
                      borderRadius: 8,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'clamp(10px, 2.8vw, 12px)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#fff',
                      textAlign: 'center',
                      pointerEvents: p.error ? 'auto' : 'none',
                      padding: '0 12px',
                    }}
                  >
                    {p.error ? (
                      <div>
                        <div style={{ marginBottom: 6 }}>Upload failed</div>
                        <div style={{ fontSize: 'clamp(9px, 2.4vw, 10px)', opacity: 0.8, textTransform: 'none', letterSpacing: 'normal', marginBottom: 8 }}>
                          {p.error}
                        </div>
                        <button
                          onClick={() => dismissPendingUpload?.(p.tempId)}
                          style={{
                            background: 'transparent',
                            border: '0.5px solid #fff',
                            color: '#fff',
                            borderRadius: 999,
                            padding: '4px 12px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'clamp(9px, 2.4vw, 10px)',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                          }}
                        >
                          Dismiss
                        </button>
                      </div>
                    ) : (
                      'Uploading…'
                    )}
                  </div>
                )}
              </div>
              <div className="msg-time">now</div>
            </div>
          );
        })}

        <div ref={chatEndRef} />
      </div>

      {/* ── ERROR BANNER ── */}
      {chatError && (
        <div style={{
          margin: '0 clamp(0.75rem, 3.5vw, 1rem) clamp(0.5rem, 2.5vw, 0.75rem)',
          padding: 'clamp(0.625rem, 3vw, 0.875rem) clamp(0.75rem, 3.5vw, 1rem)',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '0.5px solid rgba(239, 68, 68, 0.35)',
          color: '#ef4444',
          borderRadius: 10,
          fontFamily: 'var(--font-ui)',
          fontSize: 'clamp(13px, 3.4vw, 14px)',
          lineHeight: 1.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
        }}>
          <span style={{ flex: 1 }}>{chatError}</span>
          <button
            onClick={clearChatError}
            style={{
              background: 'transparent', border: 'none', color: 'inherit',
              fontSize: 1.0rem, cursor: 'pointer', padding: 0, marginLeft: 4,
              lineHeight: 1,
            }}
            aria-label="Dismiss error"
          >✕</button>
        </div>
      )}

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

      {/* ── IMAGE MODAL ── full-screen viewer with pinch-to-zoom ── */}
      <ChatImageModal
        open={modalImageUrl !== null}
        imageUrl={modalImageUrl}
        onClose={closeImageModal}
      />
    </div>
  );
}
