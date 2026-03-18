import { Dispatch, SetStateAction, useCallback } from 'react'
import { positiveItems, limitingItems, structuralItems, correctableRows } from '../data/questions'
import type { CorrectableOption } from '../data/questions'
import type { CorrectableSelections, ScoreBreakdown } from '../logic/calculator'
import CheckItem from './CheckItem'
import CorrectableRowComponent from './CorrectableRow'
import ResultsDisplay from './ResultsDisplay'
import type { StepKind, StoneInfo } from '../logic/feasibility-types'
import { PHASES } from '../logic/feasibility-types'

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

// ── Strict type system ────────────────────────────────────────
const T = {
  large: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(28px, 4.5vw, 34px)',
    fontWeight: 400,
    color: 'var(--text)',
    lineHeight: 1.2,
    margin: 0,
  } as React.CSSProperties,
  body: {
    fontFamily: 'var(--font-body)',
    fontSize: 'clamp(19px, 2.2vw, 21px)',
    color: 'var(--text-muted)',
    lineHeight: 1.75,
    margin: 0,
  } as React.CSSProperties,
  label: {
    fontFamily: 'var(--font-body)',
    fontSize: 'clamp(19px, 2.2vw, 21px)',
    fontWeight: 600,
    color: 'var(--accent)',
    margin: 0,
  } as React.CSSProperties,
}

interface WizardScreenProps {
  STEPS:                    StepKind[]
  stepIndex:                number
  stoneInfo:                StoneInfo
  positiveChecked:          Set<string>
  limitingChecked:          Set<string>
  structuralChecked:        Set<string>
  correctableSelections:    CorrectableSelections
  results:                  ScoreBreakdown | null
  setStoneInfo:             Dispatch<SetStateAction<StoneInfo>>
  setPositiveChecked:       Dispatch<SetStateAction<Set<string>>>
  setLimitingChecked:       Dispatch<SetStateAction<Set<string>>>
  setStructuralChecked:     Dispatch<SetStateAction<Set<string>>>
  setCorrectableSelections: Dispatch<SetStateAction<CorrectableSelections>>
  handleNext:               () => void
  handleBack:               () => void
  handleStartOver:          () => void
  handleRequestQuote:       () => void
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
    case 'positive-group':
    case 'limiting-group':
    case 'structural-group':  return 'Select ALL that currently apply. Leave the rest unmarked.'
    case 'correctable-row':   return 'Select the ONE option that best describes this category.'
    default:                  return ''
  }
}

export default function WizardScreen({
  STEPS, stepIndex, stoneInfo, positiveChecked, limitingChecked, structuralChecked,
  correctableSelections, results,
  setStoneInfo, setPositiveChecked, setLimitingChecked, setStructuralChecked, setCorrectableSelections,
  handleNext, handleBack, handleStartOver, handleRequestQuote,
}: WizardScreenProps) {

  const currentStep  = STEPS[stepIndex]
  const isResults    = currentStep.type === 'results'
  const isComplete   = currentStep.type === 'category-complete'
  const currentPhase = phaseOfStep(currentStep)
  const label        = stepLabel(currentStep)
  const instruction  = stepInstruction(currentStep)
  const phaseSteps   = STEPS.filter(s => phaseOfStep(s) === currentPhase && s.type !== 'category-complete')
  const phaseIndex   = phaseSteps.findIndex(s => s === currentStep)
  const canProceed   = currentStep.type !== 'correctable-row' || correctableSelections[currentStep.rowId] !== null

  const toggleChecked = useCallback(
    (setter: Dispatch<SetStateAction<Set<string>>>) => (id: string, checked: boolean) => {
      setter((prev: Set<string>) => {
        const next = new Set(prev)
        checked ? next.add(id) : next.delete(id)
        return next
      })
    }, []
  )

  const handleCorrectableChange = (row: keyof CorrectableSelections, value: CorrectableOption) =>
    setCorrectableSelections(prev => ({ ...prev, [row]: value }))

  return (
    <div className="wiz-stage">

      {/* ── Phase bar ── */}
      {!isResults && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
            {PHASES.map((ph, i) => {
              const filled = i < currentPhase || (i === currentPhase && !isComplete)
              return (
                <div key={ph} style={{ flex: 1 }}>
                  <div style={{
                    height: 3, borderRadius: 2,
                    background: filled ? 'var(--accent)' : 'var(--border)',
                    opacity: filled ? 1 : 0.3,
                    transition: 'background 300ms ease',
                  }} />
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ ...T.label, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: '11px' }}>{PHASES[currentPhase] ?? ''}</span>
            {phaseSteps.length > 1 && phaseIndex >= 0 && (
              <span style={{ ...T.body, fontSize: 'clamp(19px, 2.2vw, 21px)' }}>
                {phaseIndex + 1} / {phaseSteps.length}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Step header ── */}
      {!isResults && !isComplete && label && (
        <div className="wiz-slide" key={`hdr-${stepIndex}`} style={{ marginBottom: 24 }}>
          <p style={{ ...T.body, fontSize: 'clamp(24px,4vw,28px)', color: 'var(--text)', fontWeight: 600, marginBottom: 12 }}>{label}</p>
          {instruction && (
            <p style={{ ...T.body, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
              {instruction}
            </p>
          )}
        </div>
      )}

      {/* ── Category complete ── */}
      {currentStep.type === 'category-complete' && (
        <div className="wiz-complete" key={`cc-${stepIndex}`}>
          <div style={{ textAlign: 'center', padding: '24px 0 32px' }}>
            <div style={{ fontSize: 36, marginBottom: 20, color: 'var(--text-muted)', opacity: 0.4 }}>✦</div>
            <p style={{ ...T.body, fontSize: 'clamp(24px,4vw,28px)', color: 'var(--text)', fontWeight: 600, marginBottom: 12 }}>
              {currentStep.title}
            </p>
            <p style={{
              ...T.body,
              color: currentStep.isLastBeforeResults ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: currentStep.isLastBeforeResults ? 600 : 400,
            }}>
              {currentStep.message}
            </p>
          </div>

          <div style={{
            border: '1px solid var(--border)',
            borderLeft: '2px solid var(--accent)',
            padding: '20px 22px',
            marginBottom: 28,
          }}>
            <p style={{ ...T.label, marginBottom: 10 }}>Up Next</p>
            <p style={{ ...T.body, fontSize: 'clamp(20px,3vw,24px)', color: 'var(--text)', fontWeight: 600, marginBottom: 10 }}>
              {currentStep.nextTitle}
            </p>
            <p style={T.body}>{currentStep.nextDescription}</p>
          </div>

          <button type="button" onClick={handleNext} className="wiz-btn-primary" style={{ width: '100%' }}>
            {currentStep.isLastBeforeResults ? 'Begin Final Section' : 'Continue'}
          </button>
        </div>
      )}

      {/* ── Stone info ── */}
      {currentStep.type === 'stone-info' && (
        <div className="wiz-slide" key={`si-${stepIndex}`} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'species',    label: 'Species',             placeholder: 'e.g. Corundum'       },
            { key: 'variety',    label: 'Variety',             placeholder: 'e.g. Blue Sapphire'  },
            { key: 'weightCt',   label: 'Weight (ct)',         placeholder: 'e.g. 2.4'            },
            { key: 'dimensions', label: 'Dimensions (mm)',     placeholder: 'e.g. 9 x 7 x 5'     },
            { key: 'cut',        label: 'Current Cut / Shape', placeholder: 'e.g. Oval Mixed Cut' },
          ].map(field => (
            <div key={field.key}>
              <label style={{ display: 'block', ...T.body, fontSize: 'clamp(19px, 2.2vw, 21px)', marginBottom: 7 }}>
                {field.label}
              </label>
              <input
                type="text"
                className="wiz-input"
                value={stoneInfo[field.key as keyof StoneInfo]}
                onChange={e => setStoneInfo(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Positive ── */}
      {currentStep.type === 'positive-group' && (
        <div className="wiz-slide" key={`pg-${stepIndex}`}>
          {positiveGroups[currentStep.group]?.map(item => (
            <CheckItem key={item.id} item={item} checked={positiveChecked.has(item.id)} onChange={toggleChecked(setPositiveChecked)} />
          ))}
        </div>
      )}

      {/* ── Limiting ── */}
      {currentStep.type === 'limiting-group' && (
        <div className="wiz-slide" key={`lg-${stepIndex}`}>
          {limitingGroups[currentStep.group]?.map(item => (
            <CheckItem key={item.id} item={item} checked={limitingChecked.has(item.id)} onChange={toggleChecked(setLimitingChecked)} />
          ))}
        </div>
      )}

      {/* ── Structural ── */}
      {currentStep.type === 'structural-group' && (
        <div className="wiz-slide" key={`sg-${stepIndex}`}>
          {structuralGroup[currentStep.group]?.map(item => (
            <CheckItem key={item.id} item={item} checked={structuralChecked.has(item.id)} onChange={toggleChecked(setStructuralChecked)} />
          ))}
        </div>
      )}

      {/* ── Correctable ── */}
      {currentStep.type === 'correctable-row' && (
        <div className="wiz-slide" key={`cr-${stepIndex}`}>
          <CorrectableRowComponent
            label={correctableRows.find(r => r.id === currentStep.rowId)?.label ?? ''}
            required={correctableRows.find(r => r.id === currentStep.rowId)?.required}
            rowId={currentStep.rowId}
            selected={correctableSelections[currentStep.rowId]}
            onChange={val => handleCorrectableChange(currentStep.rowId, val)}
            limitingChecked={limitingChecked}
            structuralChecked={structuralChecked}
          />
          {!canProceed && (
            <p style={{ ...T.body, color: 'var(--accent)', marginTop: 12 }}>
              Please make a selection to continue.
            </p>
          )}
        </div>
      )}

      {/* ── Results ── */}
      {currentStep.type === 'results' && results && (
        <div className="wiz-slide" key="results">
          <ResultsDisplay
            results={results}
            weightCt={parseFloat(stoneInfo.weightCt) || 0}
            stoneInfo={stoneInfo}
            onStartOver={handleStartOver}
            onRequestQuote={handleRequestQuote}
          />
        </div>
      )}

      {/* ── Start over link ── */}
      {!isResults && (
        <div style={{ textAlign: 'right', marginTop: 20 }}>
          <button
            type="button"
            onClick={handleStartOver}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              ...T.body,
              fontSize: 'clamp(19px, 2.2vw, 21px)',
              color: 'var(--text-muted)',
              opacity: 0.5,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              padding: 0,
              transition: 'opacity 180ms ease',
            }}
          >
            Start Over
          </button>
        </div>
      )}

      {/* ── Nav ── */}
      {!isResults && !isComplete && (
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          {stepIndex > 0 && (
            <button type="button" onClick={handleBack} className="wiz-btn-secondary">Back</button>
          )}
          <button type="button" onClick={handleNext} disabled={!canProceed} className="wiz-btn-primary">
            {STEPS[stepIndex + 1]?.type === 'category-complete' ? 'Done' : 'Next'}
          </button>
        </div>
      )}

    </div>
  )
}
