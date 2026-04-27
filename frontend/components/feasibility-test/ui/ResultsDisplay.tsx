import { useState, useEffect } from 'react'
import ScoreBox from './ScoreBox'
import SaveToAccountButton from './SaveToAccountButton'
import { supabase } from '../../../lib/supabase'
import type { ScoreBreakdown } from '../logic/calculator'

interface StoneInfo {
  species:    string
  variety:    string
  weightCt:   string
  dimensions: string
  cut:        string
}

interface ResultsDisplayProps {
  results:               ScoreBreakdown
  weightCt:              number
  stoneInfo:             StoneInfo
  positiveSelections:    string[]
  limitingSelections:    string[]
  structuralSelections:  string[]
  correctableSelections: Record<string, string | null>
  onStartOver:           () => void
  onRequestQuote:        () => void
}

export default function ResultsDisplay({ results, weightCt, stoneInfo, positiveSelections, limitingSelections, structuralSelections, correctableSelections, onStartOver, onRequestQuote }: ResultsDisplayProps) {

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user && data.user.email !== process.env.NEXT_PUBLIC_GUEST_ACCOUNT_EMAIL)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user && session.user.email !== process.env.NEXT_PUBLIC_GUEST_ACCOUNT_EMAIL)
    })
    return () => subscription.unsubscribe()
  }, [])

  const savePayload = {
    stoneInfo,
    positiveSelections,
    limitingSelections,
    structuralSelections,
    correctableSelections,
    results,
  }

  const handleExport = () => window.print()

  const stoneFields = [
    { label: 'Species',     value: stoneInfo.species    },
    { label: 'Variety',     value: stoneInfo.variety    },
    { label: 'Weight',      value: stoneInfo.weightCt ? `${stoneInfo.weightCt} ct` : '' },
    { label: 'Dimensions',  value: stoneInfo.dimensions },
    { label: 'Cut / Shape', value: stoneInfo.cut        },
  ].filter(f => f.value)

  return (
    <div className="results-wrap ccg-results">

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

      <ScoreBox results={results} />

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

      <div className="results-actions ccg-no-print">
        <SaveToAccountButton payload={savePayload} isLoggedIn={isLoggedIn} />
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
  )
}
