import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import WizardScreen from '../feasibility-test/ui/WizardScreen'
import type { StepKind, StoneInfo } from '../feasibility-test/logic/feasibility-types'
import { positiveItems, limitingItems, structuralItems, correctableRows } from '../feasibility-test/data/questions'
import { calculateAll } from '../feasibility-test/logic/calculator'
import type { CorrectableSelections, ScoreBreakdown } from '../feasibility-test/logic/calculator'
import { autoSelectAll } from '../feasibility-test/logic/autoSelect'

// ── Rebuild steps (same as FeasibilityCheckPage, no intro) ─────────
function groupBy<T extends { group: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {} as Record<string, T[]>)
}
const positiveGroups  = groupBy(positiveItems)
const limitingGroups  = groupBy(limitingItems)
const structuralGroup = groupBy(structuralItems)

function buildSteps(): StepKind[] {
  const s: StepKind[] = []
  s.push({ type: 'stone-info' })
  s.push({ type: 'category-complete', phase: 1, title: 'Category 1', sectionName: 'Positive Characteristics', description: 'Only select the characteristics that your stone currently exhibits. Select ALL that apply.', message: '', nextTitle: 'Positive Characteristics', nextDescription: '' })
  Object.keys(positiveGroups).forEach(g => s.push({ type: 'positive-group', group: g }))
  s.push({ type: 'category-complete', phase: 2, title: 'Category 2', sectionName: 'Limiting Characteristics', description: 'Select ALL characteristics that currently limit your stone.', message: '', nextTitle: 'Limiting Characteristics', nextDescription: '' })
  Object.keys(limitingGroups).forEach(g => s.push({ type: 'limiting-group', group: g }))
  s.push({ type: 'category-complete', phase: 3, title: 'Category 3', sectionName: 'Structural Condition', description: 'This section addresses physical damage and internal features.', message: '', nextTitle: 'Structural Condition', nextDescription: '' })
  Object.keys(structuralGroup).forEach(g => s.push({ type: 'structural-group', group: g }))
  s.push({ type: 'category-complete', phase: 4, title: "You're almost done.", message: 'The next section answers are auto selected based on your answers, but can still be manually changed.', nextTitle: 'Correctable Likelihood', nextDescription: "One answer per row — this is the final step.", isLastBeforeResults: true })
  correctableRows.forEach(r => s.push({ type: 'correctable-row', rowId: r.id }))
  s.push({ type: 'results' })
  return s
}

// ── Terms screen ────────────────────────────────────────────────────
interface TermsProps {
  onAccept: (savePreference: boolean) => void
}

function TermsScreen({ onAccept }: TermsProps) {
  const [checked, setChecked] = useState(false)
  const [savePreference, setSavePreference] = useState(false)

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 20px', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--text)', marginBottom: 8, lineHeight: 1.2 }}>
        Before you begin
      </h2>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
        The Cut Feasibility Wizard provides an estimate based on the information you provide. Results are for reference only and do not constitute a professional assessment or guarantee of outcome.
      </p>

      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', padding: '20px', marginBottom: 20 }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>
          By proceeding you acknowledge that:<br/><br/>
          · Results depend entirely on the accuracy of your inputs<br/>
          · A high feasibility score does not guarantee a successful cut<br/>
          · Cutting Corners Gems is not liable for decisions made based on wizard output<br/>
          · A professional in-person evaluation is always recommended before cutting
        </p>
      </div>

      {/* Accept terms */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 16 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => setChecked(e.target.checked)}
          style={{ marginTop: 3, flexShrink: 0, accentColor: 'var(--gold)', width: 16, height: 16 }}
        />
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--text)', lineHeight: 1.5 }}>
          I understand and agree to the above terms
        </span>
      </label>

      {/* Save preference */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 32 }}>
        <input
          type="checkbox"
          checked={savePreference}
          onChange={e => setSavePreference(e.target.checked)}
          style={{ marginTop: 3, flexShrink: 0, accentColor: 'var(--gold)', width: 16, height: 16 }}
        />
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Don't show this again — skip directly to the wizard next time
        </span>
      </label>

      <button
        disabled={!checked}
        onClick={() => onAccept(savePreference)}
        style={{
          width: '100%', background: checked ? 'var(--gold)' : 'var(--border)',
          color: checked ? 'var(--bg-deep)' : 'var(--text-muted)',
          border: 'none', padding: '14px',
          fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
          letterSpacing: '0.22em', textTransform: 'uppercase',
          cursor: checked ? 'pointer' : 'not-allowed',
          transition: 'all 200ms ease',
        }}
      >
        Begin Wizard →
      </button>
    </div>
  )
}

// ── Props ────────────────────────────────────────────────────────────
interface Props {
  session: any
  onClose?: () => void
}

// ── Main component ───────────────────────────────────────────────────
export default function WizardLauncher({ session, onClose }: Props) {
  const [status, setStatus] = useState<'loading' | 'terms' | 'wizard'>('loading')
  const STEPS = useMemo(() => buildSteps(), [])

  // Wizard state — mirrors FeasibilityCheckPage without intro
  const [stepIndex,             setStepIndex]             = useState(0)
  const [stoneInfo,             setStoneInfo]             = useState<StoneInfo>({ species: '', variety: '', weightCt: '', dimensions: '', cut: '' })
  const [positiveChecked,       setPositiveChecked]       = useState<Set<string>>(new Set())
  const [limitingChecked,       setLimitingChecked]       = useState<Set<string>>(new Set())
  const [structuralChecked,     setStructuralChecked]     = useState<Set<string>>(new Set())
  const [correctableSelections, setCorrectableSelections] = useState<CorrectableSelections>({ external: null, light: null, geometry: null, structural: null })
  const [results,               setResults]               = useState<ScoreBreakdown | null>(null)

  // Check if user has already accepted terms
  useEffect(() => {
    if (!session) return
    supabase
      .from('account_users')
      .select('wizard_terms_accepted')
      .eq('account_user_id', session.user.id)
      .single()
      .then(({ data }) => {
        setStatus(data?.wizard_terms_accepted ? 'wizard' : 'terms')
      })
  }, [session])

  const handleAcceptTerms = async (savePreference: boolean) => {
    if (savePreference && session) {
      await supabase
        .from('account_users')
        .update({ wizard_terms_accepted: true })
        .eq('account_user_id', session.user.id)
    }
    setStatus('wizard')
  }

  // Navigation handlers — same logic as FeasibilityCheckPage
  const handleNext = () => {
    const step = STEPS[stepIndex]
    if (step.type === 'structural-group') {
      const auto = autoSelectAll(limitingChecked, structuralChecked)
      setCorrectableSelections(auto)
    }
    if (stepIndex === STEPS.length - 2) {
      const r = calculateAll(positiveChecked, limitingChecked, structuralChecked, correctableSelections)
      setResults(r)
      // ResultsDisplay inside WizardScreen handles saving — no analytics call needed here
    }
    setStepIndex(i => Math.min(i + 1, STEPS.length - 1))
  }

  const handleBack = () => setStepIndex(i => Math.max(i - 1, 0))

  const handleStartOver = () => {
    setStepIndex(0)
    setStoneInfo({ species: '', variety: '', weightCt: '', dimensions: '', cut: '' })
    setPositiveChecked(new Set())
    setLimitingChecked(new Set())
    setStructuralChecked(new Set())
    setCorrectableSelections({ external: null, light: null, geometry: null, structural: null })
    setResults(null)
  }

  const handleRequestQuote = () => {
    if (onClose) onClose()
    // Navigate to inquiries tab
  }

  if (status === 'loading') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    )
  }

  if (status === 'terms') {
    return <TermsScreen onAccept={handleAcceptTerms} />
  }

  return (
    <WizardScreen
      STEPS={STEPS}
      stepIndex={stepIndex}
      stoneInfo={stoneInfo}
      positiveChecked={positiveChecked}
      limitingChecked={limitingChecked}
      structuralChecked={structuralChecked}
      correctableSelections={correctableSelections}
      results={results}
      setStoneInfo={setStoneInfo}
      setPositiveChecked={setPositiveChecked}
      setLimitingChecked={setLimitingChecked}
      setStructuralChecked={setStructuralChecked}
      setCorrectableSelections={setCorrectableSelections}
      handleNext={handleNext}
      handleBack={handleBack}
      handleStartOver={handleStartOver}
      handleRequestQuote={handleRequestQuote}
    />
  )
}
