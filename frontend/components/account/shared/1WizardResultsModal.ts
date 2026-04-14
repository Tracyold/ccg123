import type { WizardResult } from '../../../lib/wizardResultsService'

// ── Types ────────────────────────────────────────────────────────────

export interface WizardResultModalProps {
  result:   WizardResult
  onClose:  () => void
  onDelete: (id: string) => void
}

export interface StoneField {
  label: string
  value: string
}

// ── Derived Data Helpers ─────────────────────────────────────────────

export function getStoneFields(result: WizardResult): StoneField[] {
  return [
    { label: 'Species',     value: result.stone_species    ?? '' },
    { label: 'Variety',     value: result.stone_variety    ?? '' },
    { label: 'Weight',      value: result.stone_weight_ct ? `${result.stone_weight_ct} ct` : '' },
    { label: 'Dimensions',  value: result.stone_dimensions ?? '' },
    { label: 'Cut / Shape', value: result.stone_cut        ?? '' },
  ].filter(f => f.value)
}

export function formatResultDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString('en-US', {
    year:   'numeric',
    month:  'long',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

// ── Action Handlers ──────────────────────────────────────────────────

export function handleExportPdf(): void {
  window.print()
}

export function handleDeleteWithConfirm(id: string, onDelete: (id: string) => void): void {
  if (window.confirm('Delete this result?')) onDelete(id)
}
