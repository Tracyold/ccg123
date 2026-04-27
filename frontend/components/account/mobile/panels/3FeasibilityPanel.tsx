import { useState, useEffect, useMemo } from 'react'
import '../../../../styles/wizard.css'
import IntroScreen from '../../../feasibility-test/ui/IntroScreen'
import WizardScreen from '../../../feasibility-test/ui/WizardScreen'
import type { IntroPhase, StepKind, StoneInfo } from '../../../feasibility-test/logic/feasibility-types'
import { positiveItems, limitingItems, structuralItems, correctableRows } from '../../../feasibility-test/data/questions'
import { calculateAll } from '../../../feasibility-test/logic/calculator'
import type { CorrectableSelections, ScoreBreakdown } from '../../../feasibility-test/logic/calculator'
import { autoSelectAll } from '../../../feasibility-test/logic/autoSelect'
import { trackWizardAnalytics } from '../../../../lib/wizardResultsService'

interface FeasibilityPanelProps {
  open: boolean
  onClose: () => void
}

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
  s.push({ type: 'category-complete', phase: 1, title: 'Category 1', sectionName: 'Positive Characteristics', description: 'Only select the characteristics that your stone currently exhibits — not what it used to exhibit or what it could exhibit. What it does exhibit now. Select ALL that apply, even if it seems redundant.', message: '', nextTitle: 'Positive Characteristics', nextDescription: '' })
  Object.keys(positiveGroups).forEach(g => s.push({ type: 'positive-group', group: g }))
  s.push({ type: 'category-complete', phase: 2, title: 'Category 2', sectionName: 'Limiting Characteristics', description: 'Select ALL characteristics that currently limit your stone. These are factors that reduce value or complicate cutting. Accurate limiting selections are just as important as the positive ones.', message: '', nextTitle: 'Limiting Characteristics', nextDescription: '' })
  Object.keys(limitingGroups).forEach(g => s.push({ type: 'limiting-group', group: g }))
  s.push({ type: 'category-complete', phase: 3, title: 'Category 3', sectionName: 'Structural Condition', description: 'This section addresses physical damage and internal features. Select anything that currently applies. These factors directly affect whether the stone can safely be worked on.', message: '', nextTitle: 'Structural Condition', nextDescription: '' })
  Object.keys(structuralGroup).forEach(g => s.push({ type: 'structural-group', group: g }))
  s.push({ type: 'category-complete', phase: 4, title: "You're almost done.", message: 'The next section answers are auto selected based on your answers, but can still be manually changed.', nextTitle: 'Correctable Likelihood', nextDescription: "For each category you'll see your selections so far as a reference. One answer per row — this is the final step.", isLastBeforeResults: true })
  correctableRows.forEach(r => s.push({ type: 'correctable-row', rowId: r.id }))
  s.push({ type: 'results' })
  return s
}

function getOrCreateSessionId(): string {
  const existing = sessionStorage.getItem('wiz_session')
  if (existing) return existing
  const id = Math.random().toString(36).slice(2)
  sessionStorage.setItem('wiz_session', id)
  return id
}

export default function FeasibilityPanel({ open, onClose }: FeasibilityPanelProps) {
  const [introPhase, setIntroPhase] = useState<IntroPhase>('line1')
  const [check1, setCheck1] = useState(false)
  const [check2, setCheck2] = useState(false)
  const [disc1ConfirmedAt, setDisc1ConfirmedAt] = useState<string | null>(null)
  const [disc2ConfirmedAt, setDisc2ConfirmedAt] = useState<string | null>(null)

  const STEPS = useMemo(() => buildSteps(), [])
  const [stepIndex, setStepIndex] = useState(0)
  const [stoneInfo, setStoneInfo] = useState<StoneInfo>({ species: '', variety: '', weightCt: '', dimensions: '', cut: '' })
  const [positiveChecked, setPositiveChecked] = useState<Set<string>>(new Set())
  const [limitingChecked, setLimitingChecked] = useState<Set<string>>(new Set())
  const [structuralChecked, setStructuralChecked] = useState<Set<string>>(new Set())
  const [correctableSelections, setCorrectableSelections] = useState<CorrectableSelections>({ external: null, light: null, geometry: null, structural: null })
  const [results, setResults] = useState<ScoreBreakdown | null>(null)

  // Reset when panel closes
  useEffect(() => {
    if (!open) {
      setStepIndex(0)
      setIntroPhase('line1')
      setStoneInfo({ species: '', variety: '', weightCt: '', dimensions: '', cut: '' })
      setPositiveChecked(new Set())
      setLimitingChecked(new Set())
      setStructuralChecked(new Set())
      setCorrectableSelections({ external: null, light: null, geometry: null, structural: null })
      setResults(null)
      setDisc1ConfirmedAt(null)
      setDisc2ConfirmedAt(null)
      sessionStorage.removeItem('wiz_session')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    if (introPhase === 'line1')     { const t = setTimeout(() => setIntroPhase('line1exit'), 3500); return () => clearTimeout(t) }
    if (introPhase === 'line1exit') { const t = setTimeout(() => setIntroPhase('line2'),     700);  return () => clearTimeout(t) }
    if (introPhase === 'line2')     { const t = setTimeout(() => setIntroPhase('line2exit'), 3500); return () => clearTimeout(t) }
    if (introPhase === 'line2exit') { const t = setTimeout(() => setIntroPhase('disc1'),     700);  return () => clearTimeout(t) }
    if (introPhase === 'disc1exit') { const t = setTimeout(() => setIntroPhase('disc2'),     700);  return () => clearTimeout(t) }
    if (introPhase === 'disc2exit') { const t = setTimeout(() => setIntroPhase('begin'),     700);  return () => clearTimeout(t) }
  }, [introPhase, open])

  const scrollTop = () => {
    const el = document.querySelector('.feasibility-panel-scroll')
    if (el) el.scrollTop = 0
  }

  const handleNext = () => {
    const nextStep = STEPS[stepIndex + 1]
    if (nextStep?.type === 'correctable-row' && STEPS[stepIndex]?.type === 'category-complete') {
      setCorrectableSelections({ ...autoSelectAll(limitingChecked, structuralChecked) })
    }
    if (nextStep?.type === 'results') {
      const r = calculateAll(positiveChecked, limitingChecked, structuralChecked, correctableSelections)
      setResults(r)
      const sessionId = getOrCreateSessionId()
      trackWizardAnalytics({
        stoneInfo,
        positiveSelections:    Array.from(positiveChecked),
        limitingSelections:    Array.from(limitingChecked),
        structuralSelections:  Array.from(structuralChecked),
        correctableSelections: correctableSelections as unknown as Record<string, string | null>,
        results: r,
        disclaimer1ConfirmedAt: disc1ConfirmedAt,
        disclaimer2ConfirmedAt: disc2ConfirmedAt,
      }, sessionId, true, 'results')
    }
    setStepIndex(i => Math.min(i + 1, STEPS.length - 1))
    scrollTop()
  }

  const handleBack = () => { setStepIndex(i => Math.max(i - 1, 0)); scrollTop() }

  const handleStartOver = () => {
    if (stepIndex > 0) {
      const sessionId = getOrCreateSessionId()
      trackWizardAnalytics({
        stoneInfo,
        positiveSelections:    Array.from(positiveChecked),
        limitingSelections:    Array.from(limitingChecked),
        structuralSelections:  Array.from(structuralChecked),
        correctableSelections: correctableSelections as unknown as Record<string, string | null>,
        results: results ?? { feasibilityPercent: 0, band: '0-17', recommendation: 'Abandoned', weightLoss: 'N/A', netScore: 0, maxPossible: 205, positiveScore: 0, limitingScore: 0, structuralScore: 0, correctableScore: 0 },
        disclaimer1ConfirmedAt: disc1ConfirmedAt,
        disclaimer2ConfirmedAt: disc2ConfirmedAt,
      }, sessionId, false, STEPS[stepIndex]?.type ?? 'unknown')
    }
    setStepIndex(0)
    setStoneInfo({ species: '', variety: '', weightCt: '', dimensions: '', cut: '' })
    setPositiveChecked(new Set()); setLimitingChecked(new Set()); setStructuralChecked(new Set())
    setCorrectableSelections({ external: null, light: null, geometry: null, structural: null })
    setResults(null); setDisc1ConfirmedAt(null); setDisc2ConfirmedAt(null)
    sessionStorage.removeItem('wiz_session')
    setIntroPhase('begin'); scrollTop()
  }

  const inWizard = introPhase === 'wizard'

  return (
    <>
      <div className={`overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`slide-panel${open ? ' open' : ''}`}>

        {/* Header */}
        <div className="panel-header">
          <span className="panel-title">Cut Feasibility Wizard</span>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>

        {/* Scrollable content */}
        <div className="feasibility-panel-scroll" style={{ flex: 1, overflowY: 'auto' }}>
          <p className={`tool-title ${inWizard ? 'wizard-size' : 'intro-size'}`}>
            The Cut Feasibility Wizard
          </p>
          <div className={`tool-rule ${inWizard ? 'wizard-rule' : 'intro-rule'}`} />

          {!inWizard && (
            <IntroScreen
              introPhase={introPhase}
              check1={check1}
              check2={check2}
              setCheck1={setCheck1}
              setCheck2={setCheck2}
              onConfirmDisc1={(ts) => { if (check1) { setDisc1ConfirmedAt(ts); setIntroPhase('disc1exit') } }}
              onConfirmDisc2={(ts) => { if (check2) { setDisc2ConfirmedAt(ts); setIntroPhase('disc2exit') } }}
              onBegin={() => setIntroPhase('wizard')}
              onSkip={() => setIntroPhase('disc1')}
            />
          )}

          {inWizard && (
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
              handleRequestQuote={handleStartOver}
            />
          )}
        </div>

      </div>
    </>
  )
}