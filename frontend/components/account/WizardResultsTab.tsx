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
  const [results, setResults]   = useState<WizardResult[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<WizardResult | null>(null)

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

  if (loading) return (
    <div style={{ padding: '40px 28px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading...</p>
    </div>
  )

  if (results.length === 0) return (
    <div style={{ padding: '48px 28px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(18px, 3vw, 24px)', color: 'var(--text-muted)', margin: '0 0 12px' }}>
        No saved results yet.
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-muted)', opacity: 0.6, margin: '0 0 24px' }}>
        Complete the Cut Feasibility Wizard and save your results to see them here.
      </p>
      <a
        href="/feasibility-check"
        style={{
          display: 'inline-block',
          fontFamily: 'var(--font-body)', fontSize: '0.6875rem', fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--accent)', textDecoration: 'none',
          border: '0.5px solid rgba(var(--gold-rgb), 0.4)',
          padding: '12px 28px', borderRadius: 3,
        }}
      >
        Open Wizard →
      </a>
    </div>
  )

  return (
    <>
      <div style={{ padding: '28px' }}>
        <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '1.5rem', color: 'var(--text)', marginBottom: 8 }}>
          Wizard Results
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 24 }}>
          Save your cut feasibility results and create service requests directly from your results.
        </p>

        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 70px 110px 60px',
          gap: 12, padding: '8px 0',
          borderBottom: '0.5px solid var(--border)',
          marginBottom: 4,
        }}>
          {['Date', 'Stone', 'Score', '', ''].map((h, i) => (
            <p key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '0.625rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0, opacity: 0.5 }}>
              {h}
            </p>
          ))}
        </div>

        {/* Result rows */}
        {results.map(r => {
          const color = bandColor[r.band] ?? '#e7e5e4'
          const date  = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          const stone = [r.stone_variety, r.stone_species].filter(Boolean).join(' ') || 'Unnamed stone'

          return (
            <div
              key={r.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 70px 110px 60px',
                gap: 12, padding: '14px 0',
                borderBottom: '0.5px solid var(--border)',
                alignItems: 'center',
                transition: 'background 180ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>{date}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text)', margin: 0 }}>{stone}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', fontWeight: 600, color, margin: 0 }}>
                {Math.round(r.feasibility_percent)}%
              </p>
              <button
                type="button"
                onClick={() => onCreateServiceRequest(r)}
                style={{
                  background: 'transparent',
                  border: '0.5px solid rgba(var(--gold-rgb), 0.4)',
                  color: 'var(--accent)',
                  padding: '7px 10px',
                  fontFamily: 'var(--font-body)', fontSize: '0.625rem', fontWeight: 600,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  cursor: 'pointer', borderRadius: 2,
                  transition: 'all 180ms ease', whiteSpace: 'nowrap',
                }}
              >
                + Request
              </button>
              <button
                type="button"
                onClick={() => setSelected(r)}
                style={{
                  background: 'transparent',
                  border: '0.5px solid var(--border)',
                  color: 'var(--text-muted)',
                  padding: '7px 10px',
                  fontFamily: 'var(--font-body)', fontSize: '0.625rem', fontWeight: 500,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  cursor: 'pointer', borderRadius: 2,
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
