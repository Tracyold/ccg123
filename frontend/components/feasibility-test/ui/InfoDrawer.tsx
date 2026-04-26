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
        aria-label={`More info about ${item.label}`}
        style={{
          width: 24, height: 24,
          border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
          background: open ? 'var(--accent)' : 'transparent',
          color: open ? 'var(--bg)' : 'var(--text-muted)',
          fontSize: '1.0625rem', fontWeight: 700,
          fontFamily: 'var(--font-body)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 200ms ease',
          borderRadius: '50%',
          flexShrink: 0,
        }}
      >
        i
      </button>

      {open && (
        <div style={{
          marginTop: 10,
          background: 'var(--bg-deep)',
          border: '0.5px solid var(--border)',
          borderRadius: 10,
          padding: '16px 18px',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {item.info.whatItMeans && (
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', color: 'var(--accent)', margin: '0 0 6px' }}>
                What it means
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(19px, 2.2vw, 21px)', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                {item.info.whatItMeans}
              </p>
            </div>
          )}
          {item.info.howToAssess && (
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', color: 'var(--accent)', margin: '0 0 6px' }}>
                How to assess it
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(19px, 2.2vw, 21px)', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                {item.info.howToAssess}
              </p>
            </div>
          )}
          {item.info.whyWeAsk && (
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', color: 'var(--accent)', margin: '0 0 6px' }}>
                Why we ask
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(19px, 2.2vw, 21px)', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                {item.info.whyWeAsk}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
