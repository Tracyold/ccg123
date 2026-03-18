export type IntroPhase =
  | 'welcome'
  | 'line1' | 'line1exit'
  | 'line2' | 'line2exit'
  | 'line3' | 'line3exit'
  | 'disc1' | 'disc1exit'
  | 'disc2' | 'disc2exit'
  | 'begin' | 'wizard'

export type StepKind =
  | { type: 'stone-info' }
  | { type: 'positive-group';    group: string }
  | { type: 'limiting-group';    group: string }
  | { type: 'structural-group';  group: string }
  | { type: 'correctable-row';   rowId: 'external' | 'light' | 'geometry' | 'structural' }
  | { type: 'category-complete'; phase: number; title: string; message: string; nextTitle: string; nextDescription: string; isLastBeforeResults?: boolean }
  | { type: 'results' }

export interface StoneInfo {
  species:    string
  variety:    string
  weightCt:   string
  dimensions: string
  cut:        string
}

export const PHASES = [
  'Stone Information',
  'Positive Characteristics',
  'Limiting Characteristics',
  'Structural Condition',
  'Correctable Likelihood',
]
