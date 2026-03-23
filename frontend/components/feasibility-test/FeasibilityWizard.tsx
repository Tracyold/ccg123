import { useState, useCallback, Dispatch, SetStateAction, useMemo } from 'react'
import type { CorrectableOption } from './data/questions'
import { positiveItems, limitingItems, structuralItems, correctableRows } from './data/questions'
import { calculateAll } from './logic/calculator'
import type { CorrectableSelections, ScoreBreakdown } from './logic/calculator'
import CheckItem from './ui/CheckItem'
import CorrectableRowComponent from './ui/CorrectableRow'
import ResultsDisplay from './ui/ResultsDisplay'

interface StoneInfo {
  species: string; variety: string; weightCt: string; dimensions: string; cut: string
}

interface FeasibilityWizardProps {
  onRequestQuote?: () => void
}

type StepKind =
  | { type: 'stone-info' }
  | { type: 'positive-group';    group: string }
  | { type: 'limiting-group';    group: string }
  | { type: 'structural-group';  group: string }
  | { type: 'correctable-row';   rowId: 'external' | 'light' | 'geometry' | 'structural' }
  | { type: 'category-complete'; phase: number; title: string; message: string; nextTitle: string; nextDescription: string; isLastBeforeResults?: boolean }
  | { type: 'results' }

const PHASES = [
  'Stone Information',
  'Positive Characteristics',
  'Limiting Characteristics',
  'Structural Condition',
  'Correctable Likelihood',
]

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

const allItems = [
  ...positiveItems.map(i => ({ ...i, section: 'Positive' })),
  ...limitingItems.map(i => ({ ...i, section: 'Limiting' })),
  ...structuralItems.map(i => ({ ...i, section: 'Structural' })),
]

function buildSteps(): StepKind[] {
  const steps: StepKind[] = []

  steps.push({ type: 'stone-info' })
  steps.push({
    type: 'category-complete', phase: 1,
    title: 'Stone details saved.',
    message: "Now let's look at what your stone does well.",
    nextTitle: 'Positive Characteristics',
    nextDescription: "Select everything that currently applies — even if it feels obvious.",
  })
  Object.keys(positiveGroups).forEach(g => steps.push({ type: 'positive-group', group: g }))
  steps.push({
    type: 'category-complete', phase: 2,
    title: 'Positives recorded.',
    message: "Now we look at what may be holding the stone back.",
    nextTitle: 'Limiting Characteristics',
    nextDescription: "Select everything that currently applies — being accurate here is just as important as the positives.",
  })
  Object.keys(limitingGroups).forEach(g => steps.push({ type: 'limiting-group', group: g }))
  steps.push({
    type: 'category-complete', phase: 3,
    title: 'Limitations noted.',
    message: "One more section before the final step.",
    nextTitle: 'Structural Condition',
    nextDescription: "This section looks at physical damage and internal features that affect whether the stone can safely be worked on.",
  })
  Object.keys(structuralGroup).forEach(g => steps.push({ type: 'structural-group', group: g }))
  steps.push({
    type: 'category-complete', phase: 4,
    title: "You're almost done.",
    message: "Only one more section to go!",
    nextTitle: 'Correctable Likelihood',
    nextDescription: "For each category you'll see your selections so far as a reference. One answer per row — this is the final step before your results.",
    isLastBeforeResults: true,
  })
  correctableRows.forEach(r => steps.push({ type: 'correctable-row', rowId: r.id }))
  steps.push({ type: 'results' })

  return steps
}

function phaseOfStep(step: StepKind): number {
  switch (step.type) {
    case 'stone-info':        return 0
    case 'category-complete': return step.phase
    case 'positive-group':    return 1
    case 'limiting-group':    return 2
    case 'structural-group':  return 3
    case 'correctable-row':   return 4
    case 'results':           return 5
  }
}

function stepLabel(step: StepKind): string {
  switch (step.type) {
    case 'stone-info':        return 'Stone Information'
    case 'positive-group':    return step.group
    case 'limiting-group':    return step.group
    case 'structural-group':  return 'Structural Condition'
    case 'correctable-row':   return correctableRows.find(r => r.id === step.rowId)?.label ?? step.rowId
    case 'category-complete': return ''
    case 'results':           return 'Results'
  }
}

function stepInstruction(step: StepKind): string {
  switch (step.type) {
    case 'stone-info':        return 'Fill in what you know. Leave anything blank that you are unsure of.'
    case 'positive-group':    return 'Select ALL that currently apply to your stone. Leave the rest unmarked.'
    case 'limiting-group':    return 'Select ALL that currently apply to your stone. Leave the rest unmarked.'
    case 'structural-group':  return 'Select ALL that currently apply to your stone. Leave the rest unmarked.'
    case 'correctable-row':   return 'Select the ONE option that best describes this category.'
    case 'category-complete': return ''
    case 'results':           return ''
  }
}

function SelectionReference({ positiveChecked, limitingChecked, structuralChecked }: {
  positiveChecked: Set<string>; limitingChecked: Set<string>; structuralChecked: Set<string>
}) {
  const checked = allItems.filter(item => {
    if (item.section === 'Positive')   return positiveChecked.has(item.id)
    if (item.section === 'Limiting')   return limitingChecked.has(item.id)
    if (item.section === 'Structural') return structuralChecked.has(item.id)
    return false
  })
  const grouped = checked.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = []
    acc[item.section].push(item.label)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px', marginBottom: 24 }}>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 14px' }}>
        Your Selections
      </p>
      {checked.length === 0 && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', opacity: 0.5, margin: 0, fontStyle: 'italic' }}>
          No items selected in previous sections.
        </p>
      )}
      {Object.entries(grouped).map(([section, labels]) => (
        <div key={section} style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 8px' }}>
            {section}
          </p>
          {labels.map(label => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', opacity: 0.6, flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)', lineHeight: 1.4 }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function FeasibilityWizard({ onRequestQuote }: FeasibilityWizardProps) {
  const STEPS = useMemo(() => buildSteps(), [])

  const [stepIndex,             setStepIndex]             = useState(0)
  const [stoneInfo,             setStoneInfo]             = useState<StoneInfo>({ species: '', variety: '', weightCt: '', dimensions: '', cut: '' })
  const [positiveChecked,       setPositiveChecked]       = useState<Set<string>>(new Set())
  const [limitingChecked,       setLimitingChecked]       = useState<Set<string>>(new Set())
  const [structuralChecked,     setStructuralChecked]     = useState<Set<string>>(new Set())
  const [correctableSelections, setCorrectableSelections] = useState<CorrectableSelections>({ external: null, light: null, geometry: null, structural: null })
  const [results,               setResults]               = useState<ScoreBreakdown | null>(null)

  const currentStep  = STEPS[stepIndex]
  const isResults    = currentStep.type === 'results'
  const isComplete   = currentStep.type === 'category-complete'
  const currentPhase = phaseOfStep(currentStep)

  const scrollTop = () => {
    const body = document.querySelector('.modal-body')
    if (body) body.scrollTop = 0
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNext = () => {
    const nextStep = STEPS[stepIndex + 1]
    if (nextStep?.type === 'results') {
      setResults(calculateAll(positiveChecked, limitingChecked, structuralChecked, correctableSelections))
    }
    setStepIndex(i => Math.min(i + 1, STEPS.length - 1))
    scrollTop()
  }

  const handleBack = () => {
    setStepIndex(i => Math.max(i - 1, 0))
    scrollTop()
  }

  const handleStartOver = () => {
    setStepIndex(0)
    setStoneInfo({ species: '', variety: '', weightCt: '', dimensions: '', cut: '' })
    setPositiveChecked(new Set()); setLimitingChecked(new Set()); setStructuralChecked(new Set())
    setCorrectableSelections({ external: null, light: null, geometry: null, structural: null })
    setResults(null)
    scrollTop()
  }

  const toggleChecked = useCallback(
    (setter: Dispatch<SetStateAction<Set<string>>>) =>
      (id: string, checked: boolean) => {
        setter((prev: Set<string>) => {
          const next = new Set(prev)
          checked ? next.add(id) : next.delete(id)
          return next
        })
      }, []
  )

  const handleCorrectableChange = (row: keyof CorrectableSelections, value: CorrectableOption) => {
    setCorrectableSelections(prev => ({ ...prev, [row]: value }))
  }

  const canProceed = (() => {
    if (currentStep.type === 'correctable-row') return correctableSelections[currentStep.rowId] !== null
    return true
  })()

  const label       = stepLabel(currentStep)
  const instruction = stepInstruction(currentStep)
  const phaseSteps  = STEPS.filter(s => phaseOfStep(s) === currentPhase && s.type !== 'category-complete')
  const phaseIndex  = phaseSteps.findIndex(s => s === currentStep)

  return (
    <>
      <style>{`
        @keyframes wizFlyIn {
          from { opacity: 0; transform: translateY(70px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes completePop {
          0%   { opacity: 0; transform: scale(0.94) translateY(12px); }
          60%  { transform: scale(1.02) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .wiz-slide    { animation: wizFlyIn    320ms cubic-bezier(0.16,1,0.3,1) both; }
        .wiz-complete { animation: completePop 420ms cubic-bezier(0.16,1,0.3,1) both; }

        .wiz-input {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text);
          font-family: var(--font-body);
          font-size: 17px;
          padding: 15px 18px;
          border-radius: 32px;
          transition: border-color 200ms ease;
          outline: none;
        }
        .wiz-input::placeholder { color: var(--text-muted); opacity: 0.4; }
        .wiz-input:focus { border-color: var(--accent); }

        .wiz-btn-primary {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--accent); color: var(--bg); border: none;
          padding: 18px 20px; font-family: var(--font-ui); font-size: 13px;
          font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          cursor: pointer; border-radius: 32px; transition: all 220ms ease;
          box-shadow: 0 4px 16px rgba(255,211,105,0.18);
        }
        .wiz-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(255,211,105,0.28);
        }
        .wiz-btn-primary:disabled { opacity: 0.25; cursor: not-allowed; }

        .wiz-btn-secondary {
          flex: 1; display: flex; align-items: center; justify-content: center;
          background: transparent; color: var(--text-muted);
          border: 1px solid var(--border); padding: 18px 20px;
          font-family: var(--font-ui); font-size: 13px; font-weight: 500;
          letter-spacing: 0.15em; text-transform: uppercase;
          cursor: pointer; border-radius: 32px; transition: all 220ms ease;
        }
        .wiz-btn-secondary:hover { border-color: var(--text-muted); color: var(--text); }

        /* Tool title inside modal */
        .wiz-tool-title {
          font-family: var(--font-display);
          font-size: clamp(18px, 4vw, 28px);
          font-weight: 400;
          color: var(--text);
          letter-spacing: 0.04em;
          text-align: center;
          margin: 0 0 6px;
          padding-top: 28px;
        }
        .wiz-tool-rule {
          width: 32px;
          height: 1px;
          background: var(--accent);
          margin: 0 auto 28px;
        }
      `}</style>

      <div style={{ padding: '0 0 56px' }}>

        {/* ── Tool title (persistent, top of modal) ── */}
        {!isResults && (
          <>
            <p className="wiz-tool-title">The Cut Feasibility Tool</p>
            <div className="wiz-tool-rule" />
          </>
        )}

        {/* ── Phase progress bar ── */}
        {!isResults && (
          <div style={{ marginBottom: 32, padding: '0 20px' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {PHASES.map((phase, i) => {
                const filled = i < currentPhase || (i === currentPhase && !isComplete)
                const active = i === currentPhase
                return (
                  <div key={phase} style={{ flex: 1 }}>
                    <div style={{
                      height: 4, borderRadius: 3,
                      background: filled ? 'var(--accent)' : active ? 'rgba(255,211,105,0.25)' : 'var(--border)',
                      transition: 'background 400ms ease',
                      opacity: filled ? 1 : active ? 1 : 0.35,
                    }} />
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                {PHASES[currentPhase] ?? 'Results'}
              </span>
              {phaseSteps.length > 1 && phaseIndex >= 0 && (
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)' }}>
                  {phaseIndex + 1} / {phaseSteps.length}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Content area ── */}
        <div style={{ padding: '0 20px' }}>

          {/* Section label + instruction */}
          {!isResults && !isComplete && label && (
            <div className="wiz-slide" key={`header-${stepIndex}`}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 400, color: 'var(--text)', margin: '0 0 16px', letterSpacing: '0.02em', lineHeight: 1.2 }}>
                {label}
              </p>
              {instruction && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(14px, 2vw, 16px)', color: 'var(--text-muted)', lineHeight: 1.75, margin: '0 0 28px', paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                  {instruction}
                </p>
              )}
            </div>
          )}

          {/* Category complete */}
          {currentStep.type === 'category-complete' && (
            <div className="wiz-complete" key={`complete-${stepIndex}`} style={{ paddingTop: 16 }}>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{ fontSize: 44, marginBottom: 18 }}>✦</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 400, color: 'var(--text)', margin: '0 0 14px', letterSpacing: '0.02em' }}>
                  {currentStep.title}
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(15px, 2vw, 17px)', color: currentStep.isLastBeforeResults ? 'var(--accent)' : 'var(--text-muted)', lineHeight: 1.7, margin: 0, fontStyle: currentStep.isLastBeforeResults ? 'normal' : 'italic', fontWeight: currentStep.isLastBeforeResults ? 600 : 400 }}>
                  {currentStep.message}
                </p>
              </div>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', padding: '22px 24px', marginBottom: 32 }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 10px' }}>Up Next</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', margin: '0 0 10px' }}>{currentStep.nextTitle}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{currentStep.nextDescription}</p>
              </div>
              <button type="button" onClick={handleNext} className="wiz-btn-primary" style={{ width: '100%' }}>
                {currentStep.isLastBeforeResults ? 'Begin Final Section' : 'Continue'}
              </button>
            </div>
          )}

          {/* Stone info */}
          {currentStep.type === 'stone-info' && (
            <div className="wiz-slide" key={`stoneinf-${stepIndex}`} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { key: 'species',    label: 'Species',             placeholder: 'e.g. Corundum'       },
                { key: 'variety',    label: 'Variety',             placeholder: 'e.g. Blue Sapphire'  },
                { key: 'weightCt',   label: 'Weight (ct)',         placeholder: 'e.g. 2.4'            },
                { key: 'dimensions', label: 'Dimensions (mm)',     placeholder: 'e.g. 9 x 7 x 5'     },
                { key: 'cut',        label: 'Current Cut / Shape', placeholder: 'e.g. Oval Mixed Cut' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                    {field.label}
                  </label>
                  <input type="text" className="wiz-input" value={stoneInfo[field.key as keyof StoneInfo]} onChange={e => setStoneInfo(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder={field.placeholder} />
                </div>
              ))}
            </div>
          )}

          {/* Positive */}
          {currentStep.type === 'positive-group' && (
            <div className="wiz-slide" key={`pos-${stepIndex}`}>
              {positiveGroups[currentStep.group]?.map(item => (
                <CheckItem key={item.id} item={item} checked={positiveChecked.has(item.id)} onChange={toggleChecked(setPositiveChecked)} />
              ))}
            </div>
          )}

          {/* Limiting */}
          {currentStep.type === 'limiting-group' && (
            <div className="wiz-slide" key={`lim-${stepIndex}`}>
              {limitingGroups[currentStep.group]?.map(item => (
                <CheckItem key={item.id} item={item} checked={limitingChecked.has(item.id)} onChange={toggleChecked(setLimitingChecked)} />
              ))}
            </div>
          )}

          {/* Structural */}
          {currentStep.type === 'structural-group' && (
            <div className="wiz-slide" key={`str-${stepIndex}`}>
              {structuralGroup[currentStep.group]?.map(item => (
                <CheckItem key={item.id} item={item} checked={structuralChecked.has(item.id)} onChange={toggleChecked(setStructuralChecked)} />
              ))}
            </div>
          )}

          {/* Correctable */}
          {currentStep.type === 'correctable-row' && (
            <div className="wiz-slide" key={`corr-${stepIndex}`}>
              <CorrectableRowComponent
                label={correctableRows.find(r => r.id === currentStep.rowId)?.label ?? ''}
                required={correctableRows.find(r => r.id === currentStep.rowId)?.required}
                rowId={currentStep.rowId}
                selected={correctableSelections[currentStep.rowId]}
                autoSelected={null}
                onChange={val => handleCorrectableChange(currentStep.rowId, val)}
                limitingChecked={limitingChecked}
                structuralChecked={structuralChecked}
              />
              {!canProceed && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--accent)', opacity: 0.8, marginTop: 12 }}>
                  Please make a selection to continue.
                </p>
              )}
            </div>
          )}

          {/* Results */}
          {currentStep.type === 'results' && results && (
            <div className="wiz-slide" key="results">
              <ResultsDisplay results={results} weightCt={parseFloat(stoneInfo.weightCt) || 0} stoneInfo={stoneInfo} positiveSelections={Array.from(positiveChecked)} limitingSelections={Array.from(limitingChecked)} structuralSelections={Array.from(structuralChecked)} correctableSelections={correctableSelections as unknown as Record<string, string | null>} onStartOver={handleStartOver} onRequestQuote={onRequestQuote ?? (() => {})} />
            </div>
          )}

          {/* Nav */}
          {!isResults && !isComplete && (
            <div style={{ display: 'flex', gap: 10, marginTop: 36 }}>
              {stepIndex > 0 && (
                <button type="button" onClick={handleBack} className="wiz-btn-secondary">Back</button>
              )}
              <button type="button" onClick={handleNext} disabled={!canProceed} className="wiz-btn-primary">
                {STEPS[stepIndex + 1]?.type === 'category-complete' ? 'Done' : 'Next'}
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
