interface SectionIntroCardStep {
  type: 'category-complete'
  phase: number
  title: string
  sectionName?: string
  description?: string
  message: string
  nextTitle: string
  nextDescription: string
  isLastBeforeResults?: boolean
}

interface SectionIntroCardProps {
  step:       SectionIntroCardStep
  stepIndex:  number
  onContinue: () => void
}

export default function SectionIntroCard({ step, stepIndex, onContinue }: SectionIntroCardProps) {

  if (step.isLastBeforeResults) {
    return (
      <div key={`cc-last-${stepIndex}`} className="wiz-almost-done">
        <div className="wiz-almost-done-icon">✦</div>
        <p className="wiz-almost-done-title">{step.title}</p>
        {step.message && (
          <p className="wiz-almost-done-message">{step.message}</p>
        )}
        <div className="wiz-almost-done-btn-row">
          <button type="button" onClick={onContinue} className="wiz-section-btn">
            See Results
          </button>
        </div>
      </div>
    )
  }

  return (
    <div key={`cc-${stepIndex}`} className="wiz-section-intro">
      <div className="wiz-section-card">
        <p className="wiz-section-card-phase">{step.title}</p>
        <p className="wiz-section-card-title">{step.sectionName ?? step.nextTitle}</p>
        <p className="wiz-section-card-desc">{step.description ?? step.nextDescription}</p>
      </div>
      <p className="wiz-section-select-hint">Select ALL that CURRENTLY apply</p>
      <div className="wiz-section-btn-row">
        <button type="button" onClick={onContinue} className="wiz-section-btn">
          Begin Section →
        </button>
      </div>
    </div>
  )
}
