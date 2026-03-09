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

export default function ChatPanel({
  messages, chatInput, chatSending, chatUploading, chatOpen,
  chatEndRef, chatFileRef,
  setChatInput, setChatOpen, openChatDrawer, sendChat, handleChatFile,
}: Props) {
  return (
    <>
      {/* Right panel — Chat (desktop) */}
      <div className="acc-right">
        <div className="acc-chat-header">
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)' }}>Chat</span>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', marginTop: '5px' }}>We're here to help — don't hesitate to reach out</p>
        </div>
        <div className="acc-chat-messages">
          {messages.map(m => (
            <div key={m.chat_message_id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.actor === 'ACCOUNT' ? 'flex-end' : 'flex-start', marginBottom: '13px' }}>
              <div style={{
                maxWidth: '80%', padding: '11px 15px', borderRadius: '14px',
                background: m.actor === 'ACCOUNT' ? 'rgba(45,212,191,1)' : '#d4af37',
                color: 'var(--bg)', fontFamily: 'var(--font-body)', fontSize: '15.9px', lineHeight: 1.7,
              }}>
                {m.body && <div>{m.body}</div>}
                {m.attachment_url && m.attachment_type?.startsWith('image/') && (
                  <img src={m.attachment_url.startsWith('http') ? m.attachment_url : supabase.storage.from('ChatUploads').getPublicUrl(m.attachment_url).data.publicUrl} alt="attachment" style={{ maxWidth: '180px', maxHeight: '180px', objectFit: 'cover', marginTop: m.body ? '6px' : '0', borderRadius: '6px' }} />
                )}
                {m.attachment_url && m.attachment_type === 'application/pdf' && (
                  <div style={{ marginTop: m.body ? '7px' : '0', fontSize: '15.9px' }}>📄 <a href={m.attachment_url.startsWith('http') ? m.attachment_url : supabase.storage.from('ChatUploads').getPublicUrl(m.attachment_url).data.publicUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bg)', textDecoration: 'underline' }}>Download PDF</a></div>
                )}
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px', fontFamily: 'var(--font-body)' }}>{fmtTime(m.created_at)}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="acc-chat-input-bar">
          <input type="file" ref={chatFileRef} accept=".jpg,.jpeg,.png,.tiff,.tif,.dng,.heic,.pdf" style={{ display: 'none' }} onChange={handleChatFile} />
          <button onClick={() => chatFileRef.current?.click()} disabled={chatUploading} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '11px', cursor: 'pointer', fontSize: '17px', flexShrink: 0 }} title="Attach file">{chatUploading ? '...' : '📎'}</button>
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
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3em', color: 'var(--gold)' }}>Chat</span>
            <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '19px' }}>↓</button>
          </div>
          <div className="acc-chat-messages" style={{ flex: 1 }}>
            {messages.map(m => (
              <div key={m.chat_message_id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.actor === 'ACCOUNT' ? 'flex-end' : 'flex-start', marginBottom: '13px' }}>
                <div style={{
                  maxWidth: '80%', padding: '11px 15px', borderRadius: '1.7px',
                  background: m.actor === 'ACCOUNT' ? 'rgba(45,212,191,1)' : '#d4af37',
                  color: 'var(--bg)', fontFamily: 'var(--font-body)', fontSize: '17px',
                }}>
                  {m.body && <div>{m.body}</div>}
                  {m.attachment_url && m.attachment_type?.startsWith('image/') && (
                    <img src={m.attachment_url.startsWith('http') ? m.attachment_url : supabase.storage.from('ChatUploads').getPublicUrl(m.attachment_url).data.publicUrl} alt="attachment" style={{ maxWidth: '180px', maxHeight: '180px', objectFit: 'cover', marginTop: m.body ? '6px' : '0', borderRadius: '6px' }} />
                  )}
                  {m.attachment_url && m.attachment_type === 'application/pdf' && (
                    <div style={{ marginTop: m.body ? '6px' : '0', fontSize: '12px' }}>📄 <a href={m.attachment_url.startsWith('http') ? m.attachment_url : supabase.storage.from('ChatUploads').getPublicUrl(m.attachment_url).data.publicUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bg)', textDecoration: 'underline' }}>Download PDF</a></div>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{fmtTime(m.created_at)}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="acc-chat-input-bar">
            <button onClick={() => chatFileRef.current?.click()} disabled={chatUploading} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '10px', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}>{chatUploading ? '...' : '📎'}</button>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." className="acc-chat-input"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }} />
            <button onClick={sendChat} disabled={chatSending || !chatInput.trim()} className="acc-chat-send">{chatSending ? '...' : '→'}</button>
          </div>
        </div>
      )}
    </>
  );
}
