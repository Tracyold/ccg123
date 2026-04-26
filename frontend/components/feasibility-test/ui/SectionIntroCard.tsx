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

  // Almost done screen
  if (step.isLastBeforeResults) {
    return (
      <div key={`cc-last-${stepIndex}`} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 20,
        paddingTop: 40,
        animation: 'wizFlyIn 300ms cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <div style={{ fontSize: 1.75rem, color: 'var(--text-muted)', opacity: 0.2 }}>✦</div>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(24px, 4vw, 34px)',
          fontWeight: 400,
          color: 'var(--text)',
          margin: 0,
          lineHeight: 1.3,
        }}>
          {step.title}
        </p>
        {step.message && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 'clamp(13px, 1.6vw, 15px)',
            color: 'var(--accent)',
            margin: 0,
            maxWidth: 380,
            lineHeight: 1.7,
          }}>
            {step.message}
          </p>
        )}
        <button
          type="button"
          onClick={onContinue}
          style={{
            marginTop: 12,
            background: 'transparent',
            color: 'var(--accent)',
            border: '0.5px solid rgba(255,211,105,0.4)',
            padding: '13px 40px',
            fontFamily: 'var(--font-body)',
            fontSize: 1.0625rem,
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            borderRadius: 1.7,
            transition: 'all 200ms ease',
            boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
          }}
        >
          Begin Final Section
        </button>
      </div>
    )
  }

  // Section intro card (categories 1-3)
  return (
    <div key={`cc-${stepIndex}`} style={{
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 20,
      animation: 'wizFlyIn 300ms cubic-bezier(0.16,1,0.3,1) both',
    }}>
      <div style={{
        border: '0.5px solid rgba(255,211,105,0.25)',
        borderRadius: 6,
        padding: '20px 24px 22px',
        background: 'rgba(255,211,105,0.02)',
        boxShadow: '0 0 28px rgba(255,211,105,0.05), 0 2px 16px rgba(0,0,0,0.2)',
        marginBottom: 28,
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: 0.8125rem,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          margin: '0 0 6px',
        }}>
          {step.title}
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 400,
          fontSize: 'clamp(17px, 2.2vw, 20px)',
          color: 'var(--text)',
          margin: '0 0 10px',
          paddingLeft: 12,
          lineHeight: 1.3,
        }}>
          {step.sectionName ?? step.nextTitle}
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 300,
          fontSize: 'clamp(13px, 1.6vw, 15px)',
          color: 'var(--text-muted)',
          lineHeight: 1.8,
          margin: 0,
          paddingLeft: 24,
          textAlign: 'justify',
        }}>
          {step.description ?? step.nextDescription}
        </p>
      </div>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: 'clamp(13px, 1.6vw, 17px)',
        color: 'var(--accent)',
        margin: '0 0 20px',
        letterSpacing: '0.05em',
      }}>
        Select ALL that CURRENTLY apply
      </p>

      <button
        type="button"
        onClick={onContinue}
        style={{
          alignSelf: 'flex-end',
          background: 'transparent',
          color: 'var(--accent)',
          border: '0.5px solid rgba(255,211,105,0.4)',
          padding: '12px 32px',
          fontFamily: 'var(--font-body)',
          fontSize: 0.8125rem,
          fontWeight: 500,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          borderRadius: 4,
          transition: 'all 200ms ease',
          boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
        }}
      >
        Begin Section &#8594;
      </button>
    </div>
  )
}
