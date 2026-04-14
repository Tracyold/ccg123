import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../../lib/supabase'
import type { StepKind, StoneInfo } from '../../feasibility-test/logic/feasibility-types'
import { positiveItems, limitingItems, structuralItems, correctableRows } from '../../feasibility-test/data/questions'
import { calculateAll } from '../../feasibility-test/logic/calculator'
import type { CorrectableSelections, ScoreBreakdown } from '../../feasibility-test/logic/calculator'
import { autoSelectAll } from '../../feasibility-test/logic/autoSelect'

// ── Types ────────────────────────────────────────────────────────────

export interface WizardLauncherProps {
  session: any
  onClose?: () => void
}

export type LauncherStatus = 'loading' | 'terms' | 'wizard'

// ── Utilities ────────────────────────────────────────────────────────

export function groupBy<T extends { group: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export const positiveGroups  = groupBy(positiveItems)
export const limitingGroups  = groupBy(limitingItems)
export const structuralGroup = groupBy(structuralItems)

// ── Step Builder ─────────────────────────────────────────────────────

export function buildSteps(): StepKind[] {
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

// ── Terms Screen Hook ────────────────────────────────────────────────

export interface UseTermsScreen {
  checked: boolean
  savePreference: boolean
  setChecked: (v: boolean) => void
  setSavePreference: (v: boolean) => void
}

export function useTermsScreen(): UseTermsScreen {
  const [checked, setChecked] = useState(false)
  const [savePreference, setSavePreference] = useState(false)
  return { checked, savePreference, setChecked, setSavePreference }
}

// ── Wizard Launcher Hook ─────────────────────────────────────────────

export interface UseWizardLauncher {
  status: LauncherStatus
  STEPS: StepKind[]
  stepIndex: number
  stoneInfo: StoneInfo
  positiveChecked: Set<string>
  limitingChecked: Set<string>
  structuralChecked: Set<string>
  correctableSelections: CorrectableSelections
  results: ScoreBreakdown | null
  setStoneInfo: (v: StoneInfo) => void
  setPositiveChecked: (v: Set<string>) => void
  setLimitingChecked: (v: Set<string>) => void
  setStructuralChecked: (v: Set<string>) => void
  setCorrectableSelections: (v: CorrectableSelections) => void
  handleAcceptTerms: (savePreference: boolean) => Promise<void>
  handleNext: () => void
  handleBack: () => void
  handleStartOver: () => void
  handleRequestQuote: () => void
}

export function useWizardLauncher(session: any, onClose?: () => void): UseWizardLauncher {
  const [status, setStatus]                               = useState<LauncherStatus>('loading')
  const STEPS                                             = useMemo(() => buildSteps(), [])
  const [stepIndex, setStepIndex]                         = useState(0)
  const [stoneInfo, setStoneInfo]                         = useState<StoneInfo>({ species: '', variety: '', weightCt: '', dimensions: '', cut: '' })
  const [positiveChecked, setPositiveChecked]             = useState<Set<string>>(new Set())
  const [limitingChecked, setLimitingChecked]             = useState<Set<string>>(new Set())
  const [structuralChecked, setStructuralChecked]         = useState<Set<string>>(new Set())
  const [correctableSelections, setCorrectableSelections] = useState<CorrectableSelections>({ external: null, light: null, geometry: null, structural: null })
  const [results, setResults]                             = useState<ScoreBreakdown | null>(null)

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

  const handleNext = () => {
    const step = STEPS[stepIndex]
    if (step.type === 'structural-group') {
      const auto = autoSelectAll(limitingChecked, structuralChecked)
      setCorrectableSelections(auto)
    }
    if (stepIndex === STEPS.length - 2) {
      const r = calculateAll(positiveChecked, limitingChecked, structuralChecked, correctableSelections)
      setResults(r)
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
  }

  return {
    status,
    STEPS,
    stepIndex,
    stoneInfo,
    positiveChecked,
    limitingChecked,
    structuralChecked,
    correctableSelections,
    results,
    setStoneInfo,
    setPositiveChecked,
    setLimitingChecked,
    setStructuralChecked,
    setCorrectableSelections,
    handleAcceptTerms,
    handleNext,
    handleBack,
    handleStartOver,
    handleRequestQuote,
  }
}
