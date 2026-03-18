import { useState, useEffect, useMemo } from 'react'
import TopNav from '../components/shared/TopNav'
import IntroScreen from '../components/feasibility-test/ui/IntroScreen'
import WizardScreen from '../components/feasibility-test/ui/WizardScreen'
import type { IntroPhase, StepKind, StoneInfo } from '../components/feasibility-test/logic/feasibility-types'
import { positiveItems, limitingItems, structuralItems, correctableRows } from '../components/feasibility-test/data/questions'
import { calculateAll } from '../components/feasibility-test/logic/calculator'
import type { CorrectableSelections, ScoreBreakdown } from '../components/feasibility-test/logic/calculator'
import { autoSelectAll } from '../components/feasibility-test/logic/autoSelect'

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

export default function FeasibilityCheckPage() {

  const [introPhase, setIntroPhase] = useState<IntroPhase>('line1')
  const [check1,     setCheck1]     = useState(false)
  const [check2,     setCheck2]     = useState(false)

  const STEPS = useMemo(() => buildSteps(), [])
  const [stepIndex,             setStepIndex]             = useState(0)
  const [stoneInfo,             setStoneInfo]             = useState<StoneInfo>({ species: '', variety: '', weightCt: '', dimensions: '', cut: '' })
  const [positiveChecked,       setPositiveChecked]       = useState<Set<string>>(new Set())
  const [limitingChecked,       setLimitingChecked]       = useState<Set<string>>(new Set())
  const [structuralChecked,     setStructuralChecked]     = useState<Set<string>>(new Set())
  const [correctableSelections, setCorrectableSelections] = useState<CorrectableSelections>({ external: null, light: null, geometry: null, structural: null })
  const [results,               setResults]               = useState<ScoreBreakdown | null>(null)

  useEffect(() => {
    if (introPhase === 'line1')     { const t = setTimeout(() => setIntroPhase('line1exit'), 3500); return () => clearTimeout(t) }
    if (introPhase === 'line1exit') { const t = setTimeout(() => setIntroPhase('line2'),     700);  return () => clearTimeout(t) }
    if (introPhase === 'line2')     { const t = setTimeout(() => setIntroPhase('line2exit'), 3500); return () => clearTimeout(t) }
    if (introPhase === 'line2exit') { const t = setTimeout(() => setIntroPhase('disc1'),     700);  return () => clearTimeout(t) }
    if (introPhase === 'disc1exit') { const t = setTimeout(() => setIntroPhase('disc2'),     700);  return () => clearTimeout(t) }
    if (introPhase === 'disc2exit') { const t = setTimeout(() => setIntroPhase('begin'),     700);  return () => clearTimeout(t) }
  }, [introPhase])

  const scrollTop = () => { const el = document.querySelector('.full-screen'); if (el) el.scrollTop = 0 }

  const handleNext = () => {
    const nextStep = STEPS[stepIndex + 1]
    if (nextStep?.type === 'correctable-row' && STEPS[stepIndex]?.type === 'category-complete') {
      setCorrectableSelections({ ...autoSelectAll(limitingChecked, structuralChecked) })
    }
    if (nextStep?.type === 'results') {
      setResults(calculateAll(positiveChecked, limitingChecked, structuralChecked, correctableSelections))
    }
    setStepIndex(i => Math.min(i + 1, STEPS.length - 1))
    scrollTop()
  }

  const handleBack    = () => { setStepIndex(i => Math.max(i - 1, 0)); scrollTop() }

  const handleStartOver = () => {
    setStepIndex(0)
    setStoneInfo({ species: '', variety: '', weightCt: '', dimensions: '', cut: '' })
    setPositiveChecked(new Set()); setLimitingChecked(new Set()); setStructuralChecked(new Set())
    setCorrectableSelections({ external: null, light: null, geometry: null, structural: null })
    setResults(null); setIntroPhase('begin'); scrollTop()
  }

  const inWizard = introPhase === 'wizard'

  return (
    <>
      <TopNav />

      <style>{`
        /* ── Mobile overrides ── */
        @media (max-width: 480px) {
          .tool-title.intro-size { font-size: 28px !important; padding-top: 60px !important; }
          .intro-line { font-size: 17px !important; }
        }

        /* ── Desktop centering ── */
        @media (min-width: 768px) {
          .full-screen { justify-content: center; }
          .tool-title.intro-size { padding-top: 40px !important; }
          .tool-rule.intro-rule { margin-bottom: 48px !important; }
          .wiz-stage { flex: 0 1 auto !important; margin-top: 40px; margin-bottom: 40px; }
        }

        /* ── Keyframes ── */
        @keyframes flyInUp {
          from { opacity: 0; transform: translateY(70px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes flyOutUp {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-90px); }
        }
        @keyframes titleFadeIn {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes accordionDown {
          from { opacity: 0; transform: translateY(-24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wizFlyIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes completePop {
          0%   { opacity: 0; transform: scale(0.94) translateY(12px); }
          60%  { transform: scale(1.02) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* ── Layout ── */
        .full-screen {
          position: fixed; inset: 0; z-index: 100;
          background: var(--bg);
          display: flex; flex-direction: column;
          overflow-y: auto; -webkit-overflow-scrolling: touch;
        }
        .full-screen::-webkit-scrollbar { width: 3px; }
        .full-screen::-webkit-scrollbar-thumb { background: var(--border); }

        /* Title */
        .tool-title {
          font-family: var(--font-display);
          font-weight: 400; color: var(--text); text-align: center;
          flex-shrink: 0;
          animation: titleFadeIn 1000ms cubic-bezier(0.16,1,0.3,1) 200ms both;
          transition: font-size 700ms cubic-bezier(0.16,1,0.3,1),
                      padding  700ms cubic-bezier(0.16,1,0.3,1),
                      margin   700ms cubic-bezier(0.16,1,0.3,1);
        }
        .tool-title.intro-size {
          font-size: clamp(36px, 8vw, 64px);
          padding: clamp(80px, 14vh, 120px) 24px 0;
          margin: 0 0 16px;
        }
        .tool-title.wizard-size {
          font-size: clamp(28px, 4.5vw, 38px);
          padding: clamp(24px, 4vh, 40px) 24px 0;
          margin: 0 0 8px;
        }
        .tool-rule {
          width: 32px; height: 0.5px;
          background: var(--accent); flex-shrink: 0;
          transition: margin 700ms cubic-bezier(0.16,1,0.3,1);
          animation: titleFadeIn 1000ms 500ms both;
        }
        .tool-rule.intro-rule { margin: 0 auto clamp(40px, 8vh, 70px); }
        .tool-rule.wizard-rule { margin: 0 auto 24px; }

        /* Center stage (intro) */
        .center-stage {
          flex: 1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 0 clamp(20px, 6vw, 60px) clamp(40px, 8vh, 80px);
          text-align: center; position: relative;
        }

        /* Wizard stage */
        .wiz-stage {
          flex: 1;
          width: 100%; max-width: 520px;
          margin: 0 auto;
          padding: 0 20px 80px;
          text-align: left;
          animation: accordionDown 500ms cubic-bezier(0.16,1,0.3,1) 200ms both;
        }

        /* Intro lines */
        .intro-line {
          font-family: var(--font-display);
          font-style: italic;
          font-size: clamp(22px, 3vw, 34px);
          color: var(--text-muted); line-height: 1.75;
          max-width: 600px; margin: 0;
        }
        .fly-in  { animation: flyInUp  900ms cubic-bezier(0.16,1,0.3,1) forwards; }
        .fly-out { animation: flyOutUp 650ms cubic-bezier(0.4,0,1,1)    forwards; }
        .wiz-slide    { animation: flyInUp    240ms cubic-bezier(0.16,1,0.3,1) both; }
        .wiz-complete { animation: completePop 300ms cubic-bezier(0.16,1,0.3,1) both; }

        /* Disclaimer cards */
        .disc-card {
          width: 100%; max-width: 560px;
          background: var(--bg-card); border: 0.5px solid var(--border);
          padding: clamp(24px, 4vw, 36px); text-align: left;
        }
        .disc-card.fly-in  { animation: flyInUp  900ms cubic-bezier(0.16,1,0.3,1) forwards; }
        .disc-card.fly-out { animation: flyOutUp 650ms cubic-bezier(0.4,0,1,1)    forwards; }
        .disc-label {
          font-family: var(--font-body); font-size: clamp(14px, 2vw, 16px);
          color: var(--accent); margin: 0 0 16px;
        }
        .disc-text {
          font-family: var(--font-body); font-size: clamp(15px, 2vw, 17px);
          line-height: 1.85; color: var(--text-muted); margin: 0 0 24px;
        }
        .disc-check-row { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 24px; cursor: pointer; }
        .disc-checkbox {
          flex-shrink: 0; width: 22px; height: 22px;
          border: 0.5px solid var(--border); border-radius: 6px;
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          transition: all 200ms ease; margin-top: 2px;
        }
        .disc-checkbox.on { background: var(--accent); border-color: var(--accent); }
        .disc-check-label {
          font-family: var(--font-body); font-size: clamp(14px, 2vw, 16px);
          font-weight: 500; color: var(--text-muted); line-height: 1.5; margin: 0;
        }
        .disc-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          background: var(--bg-deep); color: var(--accent); border: 0.5px solid rgba(255,211,105,0.5);
          padding: 16px 24px; font-family: var(--font-body);
          font-size: clamp(13px, 1.6vw, 15px); font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          transition: all 220ms ease; opacity: 0.28; cursor: not-allowed;
        }
        .disc-btn.on { opacity: 1; cursor: pointer; box-shadow: 0 0 20px rgba(255,211,105,0.2); }
        .disc-btn.on:hover { background: rgba(255,211,105,0.08); box-shadow: 0 0 28px rgba(255,211,105,0.28); }
        .disc-btn.on:active { background: rgba(255,211,105,0.2); }

        /* Begin button */
        .begin-btn {
          display: inline-flex; align-items: center; gap: 14px;
          background: var(--bg-deep); color: var(--accent); border: 0.5px solid rgba(255,211,105,0.5);
          padding: clamp(16px, 3vw, 22px) clamp(40px, 8vw, 64px);
          font-family: var(--font-display); font-size: clamp(24px, 4vw, 36px);
          font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; transition: all 300ms ease;
          box-shadow: 0 0 24px rgba(255,211,105,0.15);
          animation: flyInUp 900ms cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .begin-btn:hover { background: rgba(255,211,105,0.08); box-shadow: 0 0 36px rgba(255,211,105,0.25); transform: translateY(-2px); }
        .begin-btn:active { background: rgba(255,211,105,0.2); }

        /* Wizard inputs and buttons */
        .wiz-input {
          width: 100%; background: transparent; border: none;
          border-bottom: 0.5px solid var(--border);
          color: var(--text); font-family: var(--font-body);
          font-size: clamp(15px, 2vw, 17px); font-weight: 300;
          padding: 10px 0; outline: none; border-radius: 0;
          transition: border-color 200ms ease;
        }
        .wiz-input::placeholder { color: var(--text-muted); opacity: 0.3; }
        .wiz-input:focus { border-bottom-color: rgba(255,211,105,0.5); }

        .wiz-btn-primary {
          flex: 0; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--bg-deep); color: var(--accent); border: 0.5px solid rgba(255,211,105,0.5);
          padding: 13px 32px; font-family: var(--font-body);
          font-size: 12px; font-weight: 700; min-width: 110px;
          letter-spacing: 0.18em; text-transform: uppercase;
          cursor: pointer; border-radius: 3px; transition: all 220ms ease;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }
        .wiz-btn-primary:hover:not(:disabled) { background: rgba(255,211,105,0.08); }
        .wiz-btn-primary:disabled { opacity: 0.25; cursor: not-allowed; }
        .wiz-btn-primary:active:not(:disabled) { background: rgba(255,211,105,0.2); }

        .wiz-btn-secondary {
          flex: 0; display: flex; align-items: center; justify-content: center;
          background: transparent; color: var(--text-muted);
          border: 0.5px solid var(--border);
          padding: 13px 32px; font-family: var(--font-body);
          font-size: 12px; font-weight: 500; min-width: 110px;
          letter-spacing: 0.15em; text-transform: uppercase;
          cursor: pointer; border-radius: 3px; transition: all 220ms ease;
        }
        .wiz-btn-secondary:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.25); color: var(--text); }
        .wiz-btn-secondary:active { background: rgba(255,255,255,0.12); }
      `}</style>

      <div className="full-screen">

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
            onConfirmDisc1={() => { if (check1) setIntroPhase('disc1exit') }}
            onConfirmDisc2={() => { if (check2) setIntroPhase('disc2exit') }}
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
    </>
  )
}
