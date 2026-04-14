import { useEffect } from 'react'
import {
  groupMessagesByDate,
  getAttachmentUrl,
  isImageAttachment,
  isPdfAttachment,
  useChatView,
  type ChatMessage,
} from '../shared/1ChatView'

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  isOpen:         boolean
  onClose:        () => void
  messages:       ChatMessage[]
  chatInput:      string
  chatSending:    boolean
  chatUploading:  boolean
  chatEndRef:     React.RefObject<HTMLDivElement>
  chatFileRef:    React.RefObject<HTMLInputElement>
  setChatInput:   (v: string) => void
  sendChat:       () => void
  handleChatFile: (e: React.ChangeEvent<HTMLInputElement>) => void
}

// ── Component ──────────────────────────────────────────────────────────────

export default function MobileChatPanel({
  isOpen, onClose, messages,
  chatInput, chatSending, chatUploading,
  chatEndRef, chatFileRef,
  setChatInput, sendChat, handleChatFile,
}: Props) {

  const { handleKeyDown, triggerFileInput, ACCEPTED_FILE_TYPES } = useChatView({
    chatOpen:       isOpen,
    chatEndRef,
    chatFileRef,
    messages,
    setChatOpen:    () => {},
    openChatDrawer: () => {},
    sendChat,
  })

  // Auto-scroll when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 420)
  }, [isOpen])

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const grouped = groupMessagesByDate(messages)

  return (
    <>
      <style>{`
        .chat-body{position:fixed;left:0;right:0;max-width:430px;margin:0 auto;top:0;bottom:62px;z-index:105;background:var(--bg);display:flex;flex-direction:column;transform:translateY(100%);transition:transform 420ms cubic-bezier(0.16,1,0.3,1)}
        .chat-body.open{transform:translateY(0)}
        .chat-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--gold);flex-shrink:0}
        .chat-header-lbl{font-family:var(--font-ui);font-size:12px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:var(--bg-deep)}
        .chat-header-close{background:transparent;border:0.5px solid rgba(0,0,0,0.2);color:var(--bg-deep);width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;font-weight:700}
        .chat-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:0;justify-content:flex-end}
        .chat-empty{font-family:var(--font-ui);font-style:italic;font-size:14px;color:var(--text-muted);text-align:center;margin:auto;opacity:0.6}
        .msg-wrap{display:flex;flex-direction:column;margin-bottom:10px}
        .msg-wrap.me{align-items:flex-end}
        .msg-wrap.them{align-items:flex-start}
        .bubble{max-width:78%;padding:9px 13px;font-family:var(--font-ui);font-size:15px;line-height:1.5;word-break:break-word}
        .bubble.me{background:color-mix(in hsl,var(--gold) 40%,gray);border-radius:1.1em 1.1em 0.2em 1.1em;color:#2c1a0e}
        .bubble.them{background:var(--bubble-them);border-radius:1.1em 1.1em 1.1em 0.2em;color:#2c1a0e}
        .msg-time{font-family:var(--font-ui);font-size:10px;color:var(--text-muted);margin-top:3px;padding:0 3px}
        .date-divider{display:flex;align-items:center;gap:10px;margin:14px 0 10px}
        .date-divider-line{flex:1;height:0.5px;background:var(--bdr2)}
        .date-divider-lbl{font-family:var(--font-ui);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-muted);white-space:nowrap;opacity:0.6}
        .chat-input-bar{display:flex;gap:8px;padding:10px 14px 24px;border-top:0.5px solid var(--bdr2);background:var(--bg-card);align-items:center;flex-shrink:0}
        .chat-attach{background:transparent;border:0.5px solid var(--bdr2);color:var(--text-muted);width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;flex-shrink:0;transition:border-color 150ms ease}
        .chat-attach:hover{border-color:var(--gold)}
        .chat-attach:disabled{opacity:0.4;cursor:not-allowed}
        .chat-input{flex:1;background:var(--bg);border:0.5px solid var(--bdr2);border-radius:6px;padding:9px 13px;color:var(--text);font-family:var(--font-ui);font-size:15px;outline:none;transition:border-color 150ms ease}
        .chat-input:focus{border-color:var(--gold)}
        .chat-send{background:var(--gold);border:none;width:36px;height:36px;color:var(--bg-deep);font-weight:700;cursor:pointer;font-size:16px;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:opacity 150ms ease}
        .chat-send:disabled{opacity:0.35;cursor:not-allowed}
      `}</style>

      <div className={`chat-body ${isOpen ? 'open' : ''}`}>

        {/* Header */}
        <div className="chat-header">
          <span className="chat-header-lbl">Chat</span>
          <button className="chat-header-close" onClick={onClose}>✕</button>
        </div>

        {/* Messages */}
        <div className="chat-msgs">
          {messages.length === 0 && (
            <p className="chat-empty">No messages yet — say hello!</p>
          )}
          {grouped.map(({ dateLabel, showDivider, message: m }) => {
            const isMe = m.actor === 'ACCOUNT'
            const time = new Date(m.created_at).toLocaleTimeString('en-US', {
              hour: 'numeric', minute: '2-digit', hour12: true,
            })
            return (
              <div key={m.chat_message_id}>
                {showDivider && (
                  <div className="date-divider">
                    <div className="date-divider-line" />
                    <span className="date-divider-lbl">{dateLabel}</span>
                    <div className="date-divider-line" />
                  </div>
                )}
                <div className={`msg-wrap ${isMe ? 'me' : 'them'}`}>
                  <div className={`bubble ${isMe ? 'me' : 'them'}`}>
                    {m.body && <div>{m.body}</div>}
                    {isImageAttachment(m) && (
                      <img
                        src={getAttachmentUrl(m.attachment_url!)}
                        alt="attachment"
                        style={{ maxWidth: '100%', maxHeight: '12em', objectFit: 'cover', marginTop: m.body ? '0.4em' : 0, borderRadius: '0.6em', display: 'block' }}
                      />
                    )}
                    {isPdfAttachment(m) && (
                      <div style={{ marginTop: m.body ? '0.4em' : 0, fontSize: '0.88em' }}>
                        📄 <a href={getAttachmentUrl(m.attachment_url!)} target="_blank" rel="noopener noreferrer"
                          style={{ color: 'inherit', textDecoration: 'underline' }}>Download PDF</a>
                      </div>
                    )}
                  </div>
                  <span className="msg-time">{time}</span>
                </div>
              </div>
            )
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <div className="chat-input-bar">
          <input
            type="file"
            ref={chatFileRef}
            accept={ACCEPTED_FILE_TYPES}
            style={{ display: 'none' }}
            onChange={handleChatFile}
          />
          <button className="chat-attach" onClick={triggerFileInput} disabled={chatUploading} title="Attach file">
            {chatUploading ? '…' : '⊕'}
          </button>
          <input
            className="chat-input"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
          />
          <button className="chat-send" onClick={sendChat} disabled={chatSending || !chatInput.trim()}>
            {chatSending ? '…' : '↑'}
          </button>
        </div>

      </div>
    </>
  )
}