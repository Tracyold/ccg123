import ScoreBox from './ScoreBox'
import EstimateDisplay from './EstimateDisplay'
import type { ScoreBreakdown } from '../logic/calculator'

interface StoneInfo {
  species:    string
  variety:    string
  weightCt:   string
  dimensions: string
  cut:        string
}

interface ResultsDisplayProps {
  results:        ScoreBreakdown
  weightCt:       number
  stoneInfo:      StoneInfo
  onStartOver:    () => void
  onRequestQuote: () => void
}

export default function ResultsDisplay({ results, weightCt, stoneInfo, onStartOver, onRequestQuote }: ResultsDisplayProps) {

  const handleExport = () => window.print()

  const stoneFields = [
    { label: 'Species',     value: stoneInfo.species    },
    { label: 'Variety',     value: stoneInfo.variety    },
    { label: 'Weight',      value: stoneInfo.weightCt ? `${stoneInfo.weightCt} ct` : '' },
    { label: 'Dimensions',  value: stoneInfo.dimensions },
    { label: 'Cut / Shape', value: stoneInfo.cut        },
  ].filter(f => f.value)

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .ccg-results, .ccg-results * { visibility: visible; }
          .ccg-results {
            position: fixed; inset: 0;
            padding: 40px 48px;
            background: #0c0a09 !important;
            color: #e7e5e4 !important;
            display: flex; flex-direction: column; gap: 24px;
          }
          .ccg-no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }

        .results-wrap {
          display: flex; flex-direction: column;
          gap: clamp(18px, 3vw, 26px);
          padding: clamp(16px, 4vw, 32px) 0;
          width: 100%;
        }

        /* Stone info */
        .stone-block {
          border: 1px solid var(--border);
          padding: clamp(18px, 3vw, 26px);
        }
        .stone-eyebrow {
          font-family: var(--font-ui);
          font-size: clamp(11px, 1.4vw, 12px);
          letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--accent); margin: 0 0 16px;
        }
        .stone-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px;
        }
        @media (max-width: 400px) { .stone-grid { grid-template-columns: 1fr; } }
        .stone-field-label {
          font-family: var(--font-ui);
          font-size: clamp(10px, 1.2vw, 11px);
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--text-muted); margin: 0 0 4px;
        }
        .stone-field-value {
          font-family: var(--font-body);
          font-size: clamp(16px, 2vw, 17px);
          color: var(--text); margin: 0;
        }

        /* Disclaimer */
        .disclaimer {
          border-left: 2px solid rgba(255,255,255,0.1);
          padding: clamp(14px, 2vw, 20px) clamp(16px, 2.5vw, 22px);
        }
        .disclaimer p {
          font-family: var(--font-body);
          font-size: clamp(15px, 1.8vw, 17px);
          line-height: 1.8; color: var(--text-muted); margin: 0 0 14px;
        }
        .disclaimer p:last-child { margin: 0; }

        /* Buttons */
        .results-actions {
          display: flex; flex-direction: column;
          gap: clamp(10px, 1.5vw, 14px); width: 100%;
        }
        .btn-export {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          background: transparent; color: var(--accent);
          border: 1px solid rgba(255,211,105,0.35);
          padding: clamp(16px, 2.5vw, 20px) 20px;
          font-family: var(--font-ui); font-size: clamp(13px, 1.6vw, 15px);
          font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase;
          cursor: pointer; border-radius: 14px; transition: all 220ms ease;
        }
        .btn-export:hover { background: rgba(255,211,105,0.06); border-color: rgba(255,211,105,0.6); }
        .btn-quote {
          width: 100%; display: flex; align-items: center; justify-content: center;
          background: var(--accent); color: var(--bg); border: none;
          padding: clamp(18px, 2.5vw, 22px) 20px;
          font-family: var(--font-ui); font-size: clamp(13px, 1.6vw, 15px);
          font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          cursor: pointer; border-radius: 14px; transition: all 220ms ease;
          box-shadow: 0 4px 16px rgba(255,211,105,0.18);
        }
        .btn-quote:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,211,105,0.28); }
        .btn-restart {
          width: 100%; display: flex; align-items: center; justify-content: center;
          background: transparent; color: var(--text-muted);
          border: 1px solid var(--border);
          padding: clamp(16px, 2.5vw, 20px) 20px;
          font-family: var(--font-ui); font-size: clamp(13px, 1.6vw, 15px);
          font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase;
          cursor: pointer; border-radius: 14px; transition: all 220ms ease;
        }
        .btn-restart:hover { border-color: var(--text-muted); color: var(--text); }
      `}</style>

      <div className="results-wrap ccg-results">

        {/* Stone info */}
        {stoneFields.length > 0 && (
          <div className="stone-block">
            <p className="stone-eyebrow">Stone Information</p>
            <div className="stone-grid">
              {stoneFields.map(f => (
                <div key={f.label}>
                  <p className="stone-field-label">{f.label}</p>
                  <p className="stone-field-value">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score box — color lives here */}
        <ScoreBox results={results} />

        {/* Estimate */}
        <EstimateDisplay input={{
          weightCt,
          recommendation: results.recommendation,
          feasibilityPercent: results.feasibilityPercent,
        }} />

        {/* Disclaimer */}
        <div className="disclaimer">
          <p>
            All results should be followed by an in-person evaluation by a qualified gemstone cutter —
            including a no-cut recommendation. Result accuracy is entirely dependent on selection accuracy.
          </p>
          <p>
            This is an educational tool. There are many evaluation categories not included here — this
            represents only one type of assessment amongst many a cutter considers before making a decision.
          </p>
        </div>

        {/* Buttons */}
        <div className="results-actions ccg-no-print">
          <button type="button" onClick={handleExport} className="btn-export">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3M2 10v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export as PDF
          </button>
          <button type="button" onClick={onRequestQuote} className="btn-quote">Request a Quote</button>
          <button type="button" onClick={onStartOver} className="btn-restart">Start Over</button>
        </div>

      </div>
    </>
  )
}

