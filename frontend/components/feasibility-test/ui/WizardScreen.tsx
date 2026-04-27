// /workspaces/ccg123/frontend/components/feasibility-test/ui/WizardScreen.tsx << 'EOF'
import { Dispatch, SetStateAction, useCallback } from 'react'
import { positiveItems, limitingItems, structuralItems, correctableRows } from '../data/questions'
import type { CorrectableOption } from '../data/questions'
import type { CorrectableSelections, ScoreBreakdown } from '../logic/calculator'
import CheckItem from './CheckItem'
import CorrectableRowComponent from './CorrectableRow'
import ResultsDisplay from './ResultsDisplay'
import SectionIntroCard from './SectionIntroCard'
import type { StepKind, StoneInfo } from '../logic/feasibility-types'
import { PHASES } from '../logic/feasibility-types'
import { autoSelectAll } from '../logic/autoSelect'

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
    case 'results':           return ''
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

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
    fontWeight: 600,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    margin: 0,
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      margin: '0 auto',
      padding: 'clamp(16px, 4vw, 40px) clamp(20px, 5vw, 48px) 80px',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      boxSizing: 'border-box',
    }}>

      {/* ── Progress ── */}
      {!isResults && (
        <div style={{ marginBottom: 'clamp(24px, 4vw, 40px)' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {PHASES.map((ph, i) => {
              const filled = i < currentPhase || (i === currentPhase && !isComplete)
              return (
                <div key={ph} style={{ flex: 1 }}>
                  <div style={{
                    height: 2,
                    background: filled ? 'var(--accent)' : 'var(--border)',
                    opacity: filled ? 1 : 0.3,
                    borderRadius: 21,
                    transition: 'background 300ms ease',
                  }} />
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div />
            {phaseSteps.length > 1 && phaseIndex >= 0 && (
              <span style={{ ...labelStyle, opacity: 0.4 }}>
                {phaseIndex + 1} / {phaseSteps.length}
              </span>
            )}
          </div>
        </div>
      )}

      {/* -- Category complete -- */}
      {currentStep.type === 'category-complete' && (
        <SectionIntroCard
          step={currentStep}
          stepIndex={stepIndex}
          onContinue={handleNext}
        />
      )}

      {/* ── Stone info ── */}
      {currentStep.type === 'stone-info' && (
        <div key={`si-${stepIndex}`} style={{
          display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 3vw, 24px)',
          animation: 'wizFlyIn 300ms cubic-bezier(0.16,1,0.3,1) both',
        }}>
          {[
            { key: 'species',    label: 'Species',             placeholder: 'e.g. Corundum'       },
            { key: 'variety',    label: 'Variety',             placeholder: 'e.g. Blue Sapphire'  },
            { key: 'weightCt',   label: 'Weight (ct)',         placeholder: 'e.g. 2.4'            },
            { key: 'dimensions', label: 'Dimensions (mm)',     placeholder: 'e.g. 9 x 7 x 5'     },
            { key: 'cut',        label: 'Current Cut / Shape', placeholder: 'e.g. Oval Mixed Cut' },
          ].map(field => (
            <div key={field.key}>
              <label style={{ display: 'block', ...labelStyle, marginBottom: 10 }}>
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
        <div key={`pg-${stepIndex}`} className="wiz-checks-wrapper" style={{ animation: 'wizFlyIn 300ms cubic-bezier(0.16,1,0.3,1) both' }}>
          {positiveGroups[currentStep.group]?.map(item => (
            <CheckItem key={item.id} item={item} checked={positiveChecked.has(item.id)} onChange={toggleChecked(setPositiveChecked)} />
          ))}
        </div>
      )}

      {/* ── Limiting ── */}
      {currentStep.type === 'limiting-group' && (
        <div key={`lg-${stepIndex}`} className="wiz-checks-wrapper" style={{ animation: 'wizFlyIn 300ms cubic-bezier(0.16,1,0.3,1) both' }}>
          {limitingGroups[currentStep.group]?.map(item => (
            <CheckItem key={item.id} item={item} checked={limitingChecked.has(item.id)} onChange={toggleChecked(setLimitingChecked)} />
          ))}
        </div>
      )}

      {/* ── Structural ── */}
      {currentStep.type === 'structural-group' && (
        <div key={`sg-${stepIndex}`} className="wiz-checks-wrapper" style={{ animation: 'wizFlyIn 300ms cubic-bezier(0.16,1,0.3,1) both' }}>
          {structuralGroup[currentStep.group]?.map(item => (
            <CheckItem key={item.id} item={item} checked={structuralChecked.has(item.id)} onChange={toggleChecked(setStructuralChecked)} />
          ))}
        </div>
      )}

      {/* ── Correctable ── */}
      {currentStep.type === 'correctable-row' && (
        <div key={`cr-${stepIndex}`} style={{ animation: 'wizFlyIn 300ms cubic-bezier(0.16,1,0.3,1) both' }}>
          <CorrectableRowComponent
            label={correctableRows.find(r => r.id === currentStep.rowId)?.label ?? ''}
            required={correctableRows.find(r => r.id === currentStep.rowId)?.required}
            rowId={currentStep.rowId}
            selected={correctableSelections[currentStep.rowId]}
            autoSelected={autoSelectAll(limitingChecked, structuralChecked)[currentStep.rowId]}
            onChange={val => handleCorrectableChange(currentStep.rowId, val)}
            limitingChecked={limitingChecked}
            structuralChecked={structuralChecked}
          />
          {!canProceed && (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
              color: 'var(--accent)', opacity: 0.6, marginTop: 16, textAlign: 'center',
            }}>
              Please make a selection to continue.
            </p>
          )}
        </div>
      )}

      {/* ── Results ── */}
      {currentStep.type === 'results' && results && (
        <div key="results" style={{ animation: 'wizFlyIn 300ms cubic-bezier(0.16,1,0.3,1) both' }}>
          <ResultsDisplay
            results={results}
            weightCt={parseFloat(stoneInfo.weightCt) || 0}
            stoneInfo={stoneInfo}
            positiveSelections={Array.from(positiveChecked)}
            limitingSelections={Array.from(limitingChecked)}
            structuralSelections={Array.from(structuralChecked)}
            correctableSelections={correctableSelections as unknown as Record<string, string | null>}
            onStartOver={handleStartOver}
            onRequestQuote={handleRequestQuote}
          />
        </div>
      )}

      {/* ── Nav ── */}
      {!isResults && !isComplete && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'clamp(32px, 5vw, 56px)',
          paddingTop: 'clamp(16px, 3vw, 24px)',
          borderTop: '0.5px solid var(--border)',
          gap: 16,
        }}>
          <div style={{ display: 'flex', gap: 'clamp(16px, 3vw, 28px)', alignItems: 'center' }}>
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="wiz-nav-btn-ghost"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleStartOver}
              className="wiz-nav-btn-ghost"
            >
              Start Over
            </button>
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className={`wiz-nav-btn-next${canProceed ? '' : ' disabled'}`}
          >
            {STEPS[stepIndex + 1]?.type === 'category-complete' ? 'Done' : 'Next →'}
          </button>
        </div>
      )}

    </div>
  )
}


