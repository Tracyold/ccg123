import type { StepKind } from '../logic/feasibility-types'

// Add this SectionIntroCard component inside WizardScreen.tsx
// Replace the category-complete JSX block with this:


{currentStep.type === 'category-complete' && !currentStep.isLastBeforeResults && (
  <div key={`cc-${stepIndex}`} style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    paddingTop: 20,
    animation: 'wizFlyIn 300ms cubic-bezier(0.16,1,0.3,1) both',
  }}>
    {/* Glowing intro card */}
    <div style={{
      border: '0.5px solid rgba(255,211,105,0.25)',
      borderRadius: 6,
      padding: '20px 24px 22px',
      background: 'rgba(255,211,105,0.02)',
      boxShadow: '0 0 28px rgba(255,211,105,0.05), 0 2px 16px rgba(0,0,0,0.2)',
      marginBottom: 28,
    }}>
      {/* Line 1 — Category label */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--accent)',
        margin: '0 0 6px',
        paddingTop: 0,
      }}>
        {(currentStep as any).title ?? ''}
      </p>

      {/* Line 2 — Section name */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 400,
        fontSize: 'clamp(17px, 2.2vw, 20px)',
        color: 'var(--text)',
        margin: '0 0 10px',
        paddingLeft: 12,
        lineHeight: 1.3,
      }}>
        {(currentStep as any).sectionName ?? currentStep.nextTitle}
      </p>

      {/* Line 3 — Description */}
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
        {(currentStep as any).description ?? currentStep.nextDescription}
      </p>
    </div>

    <button
      type="button"
      onClick={handleNext}
      style={{
        alignSelf: 'flex-end',
        background: 'transparent',
        color: 'var(--accent)',
        border: '0.5px solid rgba(255,211,105,0.4)',
        padding: '12px 32px',
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        borderRadius: 4,
        transition: 'all 200ms ease',
        boxShadow: '0 2px 16px rgba(0,0,0,0.18), 0 0 16px rgba(255,211,105,0.03)',
      }}
    >
      Begin Section →
    </button>
  </div>
)}

{/* "Almost done" screen — keep original */}
{currentStep.type === 'category-complete' && currentStep.isLastBeforeResults && (
  <div key={`cc-last-${stepIndex}`} style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 20,
    paddingTop: 40,
    animation: 'wizFlyIn 300ms cubic-bezier(0.16,1,0.3,1) both',
  }}>
    <div style={{ fontSize: 28, color: 'var(--text-muted)', opacity: 0.2 }}>✦</div>
    <p style={{
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontSize: 'clamp(24px, 4vw, 34px)',
      fontWeight: 400,
      color: 'var(--text)',
      margin: 0,
      lineHeight: 1.3,
    }}>
      {currentStep.title}
    </p>
    <p style={{
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: 'clamp(13px, 1.6vw, 15px)',
      color: 'var(--accent)',
      margin: 0,
      maxWidth: 380,
      lineHeight: 1.7,
    }}>
      {currentStep.message}
    </p>
    <button
      type="button"
      onClick={handleNext}
      style={{
        marginTop: 12,
        background: 'transparent',
        color: 'var(--accent)',
        border: '0.5px solid rgba(255,211,105,0.4)',
        padding: '13px 40px',
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        borderRadius: 4,
        transition: 'all 200ms ease',
      }}
    >
      Begin Final Section
    </button>
  </div>
)}
