import { useState, useEffect } from 'react'
import { getUserWizardResults, deleteWizardResult } from '../../../lib/wizardResultsService'
import type { WizardResult } from '../../../lib/wizardResultsService'

// ── Types ────────────────────────────────────────────────────────────

export interface WizardResultsTabProps {
  onCreateServiceRequest: (result: WizardResult) => void
}

// ── Derived Data Helpers ─────────────────────────────────────────────

export function formatRowDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  })
}

export function getStoneLabel(result: WizardResult): string {
  return [result.stone_variety, result.stone_species].filter(Boolean).join(' ') || 'Unnamed stone'
}

// ── Hook ─────────────────────────────────────────────────────────────

export interface UseWizardResultsTab {
  results:      WizardResult[]
  loading:      boolean
  selected:     WizardResult | null
  setSelected:  (r: WizardResult | null) => void
  handleDelete: (id: string) => Promise<void>
}

export function useWizardResultsTab(): UseWizardResultsTab {
  const [results,  setResults]  = useState<WizardResult[]>([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState<WizardResult | null>(null)

  useEffect(() => {
    getUserWizardResults().then(data => {
      setResults(data)
      setLoading(false)
    })
  }, [])

  const handleDelete = async (id: string) => {
    const ok = await deleteWizardResult(id)
    if (ok) {
      setResults(prev => prev.filter(r => r.id !== id))
      setSelected(null)
    }
  }

  return { results, loading, selected, setSelected, handleDelete }
}
