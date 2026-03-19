import { useState, useEffect } from 'react'
import { getUserWizardResults, deleteWizardResult } from '../../lib/wizardResultsService'
import type { WizardResult } from '../../lib/wizardResultsService'
import WizardResultModal from './WizardResultModal'

const bandColor: Record<string, string> = {
  '80-100': '#a3c4a8',
  '60-79':  '#38bdf8',
  '40-59':  '#a3e635',
  '18-39':  '#94a3b8',
  '0-17':   '#f87171',
}

interface WizardResultsTabProps {
  onCreateServiceRequest: (result: WizardResult) => void
}

export default function WizardResultsTab({ onCreateServiceRequest }: WizardResultsTabProps) {
  const [results, setResults]       = useState<WizardResult[]>([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState<WizardResult | null>(null)

  useEffect(() => {
    getUserWizardResults().then(data => {
      setResults(data)
      setLoading(false)
    })
  }, [])

  const handleDelete = async (id: string) => {
    const ok = await deleteWizardResult(id)
    if (ok) {
      setResults(prev => prev.filter(r => r.id !== id))
      setSelected(null)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(18px, 3vw, 24px)', color: 'var(--text-muted)', margin: '0 0 12px' }}>
          No saved results yet.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', opacity: 0.6, margin: 0 }}>
          Complete the Cut Feasibility Wizard and save your results to see them here.
        </p>
        <a
          href="/feasibility-check"
          style={{
            display: 'inline-block', marginTop: 24,
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--accent)', textDecoration: 'none',
            border: '0.5px solid rgba(255,211,105,0.4)',
            padding: '12px 28px', borderRadius: 3,
          }}
        >
          Open Wizard →
        </a>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 80px 60px 80px 60px',
          gap: 12, padding: '10px 16px',
          borderBottom: '0.5px solid var(--border)',
        }}>
          {['Date', 'Stone', 'Score', 'Result', ''].map(h => (
            <p key={h} style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0, opacity: 0.6 }}>
              {h}
            </p>
          ))}
        </div>

        {/* Result rows */}
        {results.map(r => {
          const color = bandColor[r.band] ?? '#e7e5e4'
          const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          const stone = [r.stone_variety, r.stone_species].filter(Boolean).join(' ') || 'Unnamed stone'

          return (
            <div
              key={r.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 80px 60px 80px 60px',
                gap: 12, padding: '14px 16px',
                borderBottom: '0.5px solid var(--border)',
                transition: 'background 180ms ease',
                cursor: 'default',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', margin: 0, alignSelf: 'center' }}>{date}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', margin: 0, alignSelf: 'center' }}>{stone}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color, margin: 0, alignSelf: 'center' }}>
                {Math.round(r.feasibility_percent)}%
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', margin: 0, alignSelf: 'center', lineHeight: 1.3 }}>
                {r.recommendation.split(' ').slice(0, 2).join(' ')}
              </p>
              <button
                type="button"
                onClick={() => onCreateServiceRequest(r)}
                style={{
                  background: 'transparent', border: '0.5px solid rgba(255,211,105,0.4)',
                  color: 'var(--accent)', padding: '6px 10px',
                  fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  cursor: 'pointer', borderRadius: 2, alignSelf: 'center',
                  transition: 'all 180ms ease', whiteSpace: 'nowrap',
                }}
              >
                + Request
              </button>
              <button
                type="button"
                onClick={() => setSelected(r)}
                style={{
                  background: 'transparent', border: '0.5px solid var(--border)',
                  color: 'var(--accent)', padding: '6px 12px',
                  fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  cursor: 'pointer', borderRadius: 2, alignSelf: 'center',
                  transition: 'all 180ms ease',
                }}
              >
                View
              </button>
            </div>
          )
        })}
      </div>

      {selected && (
        <WizardResultModal
          result={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}

