import { useState } from 'react'
import type { QuestionItem } from '../data/questions'

export default function InfoDrawer({ item }: { item: QuestionItem }) {
  const [open, setOpen] = useState(false)
  if (!item.info) return null

  return (
    <div style={{ flexShrink: 0 }}>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); setOpen(!open) }}
        aria-expanded={open}
        aria-label={`More info about ${item.label}`}
        style={{
          width: 20, height: 20,
          border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
          background: open ? 'var(--accent)' : 'transparent',
          color: open ? 'var(--bg)' : 'var(--text-muted)',
          fontSize: 13, fontWeight: 700,
          fontFamily: 'var(--font-ui)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 200ms ease',
          flexShrink: 0,
          borderRadius: 0,
        }}
      >
        i
      </button>

      {open && (
        <div style={{
          marginTop: 10,
          background: 'var(--bg-deep)',
          border: '1px solid var(--border)',
          padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {item.info.whatItMeans && (
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 5 }}>What it means</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{item.info.whatItMeans}</p>
            </div>
          )}
          {item.info.howToAssess && (
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 5 }}>How to assess it</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{item.info.howToAssess}</p>
            </div>
          )}
          {item.info.whyWeAsk && (
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 5 }}>Why we ask</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{item.info.whyWeAsk}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
