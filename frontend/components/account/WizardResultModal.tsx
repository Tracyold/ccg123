import type { WizardResult } from '../../lib/wizardResultsService'

interface WizardResultModalProps {
  result:   WizardResult
  onClose:  () => void
  onDelete: (id: string) => void
}

const bandColor: Record<string, string> = {
  '80-100': '#a3c4a8',
  '60-79':  '#38bdf8',
  '40-59':  '#a3e635',
  '18-39':  '#94a3b8',
  '0-17':   '#f87171',
}

export default function WizardResultModal({ result, onClose, onDelete }: WizardResultModalProps) {
  const color = bandColor[result.band] ?? '#e7e5e4'

  const stoneFields = [
    { label: 'Species',     value: result.stone_species    },
    { label: 'Variety',     value: result.stone_variety    },
    { label: 'Weight',      value: result.stone_weight_ct ? `${result.stone_weight_ct} ct` : '' },
    { label: 'Dimensions',  value: result.stone_dimensions },
    { label: 'Cut / Shape', value: result.stone_cut        },
  ].filter(f => f.value)

  const date = new Date(result.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          .wiz-modal-print { display: flex !important; position: fixed; inset: 0; background: #0c0a09; color: #e7e5e4; padding: 40px; z-index: 99999; flex-direction: column; gap: 24px; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        .wiz-modal-print { display: none; }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-card)',
            border: '0.5px solid var(--border)',
            width: '100%', maxWidth: 560,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 'clamp(24px, 4vw, 40px)',
            display: 'flex', flexDirection: 'column', gap: 24,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6875rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 4px' }}>
                Wizard Result
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                {date}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: 4 }}
            >
              ✕
            </button>
          </div>

          {/* Stone info */}
          {stoneFields.length > 0 && (
            <div style={{ border: '0.5px solid var(--border)', padding: '16px 20px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.625rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 12px' }}>
                Stone Information
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
                {stoneFields.map(f => (
                  <div key={f.label}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.625rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 3px' }}>{f.label}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--text)', margin: 0 }}>{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score */}
          <div style={{
            border: `0.5px solid ${color}`,
            padding: '24px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', gap: 12,
            boxShadow: `0 0 24px ${color}18`,
          }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6875rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>
              Feasibility Score
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(56px, 14vw, 96px)', fontWeight: 400, color, margin: 0, lineHeight: 1 }}>
              {Math.round(result.feasibility_percent)}
            </p>
            <div style={{ height: 2, background: `${color}30`, borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${result.feasibility_percent}%`, background: color }} />
            </div>
            <div style={{ width: 32, height: 0.5, background: color, margin: '0 auto', opacity: 0.5 }} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.625rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>
              Recommended Service
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 4vw, 28px)', color: 'var(--text)', margin: 0 }}>
              {result.recommendation}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
              Estimated material loss: <span style={{ color: 'var(--text)', fontWeight: 500 }}>{result.weight_loss}</span>
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                width: '100%', background: 'transparent', color: 'var(--accent)',
                border: '0.5px solid rgba(var(--gold-rgb), 0.4)', padding: '13px 20px',
                fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                cursor: 'pointer', borderRadius: 3, transition: 'all 200ms ease',
              }}
            >
              Export as PDF
            </button>
            <button
              type="button"
              onClick={() => { if (window.confirm('Delete this result?')) onDelete(result.id) }}
              style={{
                width: '100%', background: 'transparent', color: 'var(--text-muted)',
                border: '0.5px solid var(--border)', padding: '13px 20px',
                fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 400,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                cursor: 'pointer', borderRadius: 3, transition: 'all 200ms ease', opacity: 0.5,
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
