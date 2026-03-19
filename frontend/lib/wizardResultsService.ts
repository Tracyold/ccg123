import { supabase } from './supabase'

export interface WizardResultPayload {
  stoneInfo: {
    species:    string
    variety:    string
    weightCt:   string
    dimensions: string
    cut:        string
  }
  positiveSelections:     string[]
  limitingSelections:     string[]
  structuralSelections:   string[]
  correctableSelections:  Record<string, string | null>
  disclaimer1ConfirmedAt?: string | null
  disclaimer2ConfirmedAt?: string | null
  results: {
    feasibilityPercent: number
    band:               string
    recommendation:     string
    weightLoss:         string
    netScore:           number
    maxPossible:        number
    positiveScore:      number
    limitingScore:      number
    structuralScore:    number
    correctableScore:   number
  }
}

export interface WizardResult {
  id:                      string
  created_at:              string
  stone_species:           string
  stone_variety:           string
  stone_weight_ct:         string
  stone_dimensions:        string
  stone_cut:               string
  feasibility_percent:     number
  band:                    string
  recommendation:          string
  weight_loss:             string
  positive_selections:     string[]
  limiting_selections:     string[]
  structural_selections:   string[]
  correctable_selections:  Record<string, string | null>
  raw_scores:              Record<string, number>
  disclaimer1_confirmed_at?: string
  disclaimer2_confirmed_at?: string
}

export async function saveWizardResult(payload: WizardResultPayload): Promise<{ id: string } | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('wizard_results')
    .insert({
      user_id:                  user.id,
      stone_species:            payload.stoneInfo.species,
      stone_variety:            payload.stoneInfo.variety,
      stone_weight_ct:          payload.stoneInfo.weightCt,
      stone_dimensions:         payload.stoneInfo.dimensions,
      stone_cut:                payload.stoneInfo.cut,
      feasibility_percent:      payload.results.feasibilityPercent,
      band:                     payload.results.band,
      recommendation:           payload.results.recommendation,
      weight_loss:              payload.results.weightLoss,
      positive_selections:      payload.positiveSelections,
      limiting_selections:      payload.limitingSelections,
      structural_selections:    payload.structuralSelections,
      correctable_selections:   payload.correctableSelections,
      raw_scores: {
        netScore:         payload.results.netScore,
        maxPossible:      payload.results.maxPossible,
        positiveScore:    payload.results.positiveScore,
        limitingScore:    payload.results.limitingScore,
        structuralScore:  payload.results.structuralScore,
        correctableScore: payload.results.correctableScore,
      },
      disclaimer1_confirmed_at: payload.disclaimer1ConfirmedAt ?? null,
      disclaimer2_confirmed_at: payload.disclaimer2ConfirmedAt ?? null,
    })
    .select('id')
    .single()

  if (error) { console.error('saveWizardResult error:', error); return null }
  return { id: data.id }
}

export async function getUserWizardResults(): Promise<WizardResult[]> {
  const { data, error } = await supabase
    .from('wizard_results')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) { console.error('getUserWizardResults error:', error); return [] }
  return data ?? []
}

export async function deleteWizardResult(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('wizard_results')
    .delete()
    .eq('id', id)

  if (error) { console.error('deleteWizardResult error:', error); return false }
  return true
}

export async function trackWizardAnalytics(
  payload:         WizardResultPayload,
  sessionId:       string,
  completed:       boolean = true,
  abandonedAtStep: string  = 'results'
): Promise<void> {
  const { error } = await supabase
    .from('wizard_analytics')
    .insert({
      session_id:               sessionId,
      stone_info:               payload.stoneInfo,
      positive_selections:      payload.positiveSelections,
      limiting_selections:      payload.limitingSelections,
      structural_selections:    payload.structuralSelections,
      correctable_selections:   payload.correctableSelections,
      feasibility_percent:      completed ? payload.results.feasibilityPercent : null,
      band:                     completed ? payload.results.band : null,
      recommendation:           completed ? payload.results.recommendation : null,
      completed,
      abandoned_at_step:        completed ? null : abandonedAtStep,
      disclaimer1_confirmed_at: payload.disclaimer1ConfirmedAt ?? null,
      disclaimer2_confirmed_at: payload.disclaimer2ConfirmedAt ?? null,
      disclaimer1_skipped:      !payload.disclaimer1ConfirmedAt,
      disclaimer2_skipped:      !payload.disclaimer2ConfirmedAt,
    })

  if (error) console.error('trackWizardAnalytics error:', error)
}

