export interface QuestionItem {
  id: string
  label: string
  group: string
  info?: {
    whatItMeans: string
    howToAssess: string
    whyWeAsk: string
  }
}

export type CorrectableOption = 'repair' | 'cutting' | 'not_correctable' | 'not_worth_it'

export interface CorrectableRow {
  id: 'external' | 'light' | 'geometry' | 'structural'
  label: string
  required?: boolean
}

export const positiveItems: QuestionItem[] = [
  { id: 'strong_saturation',      label: 'Strong Saturation',                group: 'Color / Material'  },
  { id: 'even_color_distribution', label: 'Even Color Distribution',          group: 'Color / Material'  },
  { id: 'desirable_hue',           label: 'Desirable Hue',                    group: 'Color / Material'  },
  { id: 'high_transparency',       label: 'High Transparency',                group: 'Color / Material'  },
  { id: 'good_brilliance',         label: 'Good Brilliance',                  group: 'Light Performance' },
  { id: 'strong_scintillation',    label: 'Strong Scintillation',             group: 'Light Performance' },
  { id: 'total_internal_reflection', label: 'Total Internal Reflection',      group: 'Light Performance' },
  { id: 'good_orientation',        label: 'Good Orientation to Color Axis',   group: 'Geometry'          },
  { id: 'balanced_proportions',    label: 'Balanced Proportions',             group: 'Geometry'          },
  { id: 'centered_culet',          label: 'Centered Culet',                   group: 'Geometry'          },
  { id: 'appears_stable',          label: 'Appears Stable',                   group: 'Structural'        },
]

export const limitingItems: QuestionItem[] = [
  { id: 'low_saturation',       label: 'Low Saturation',                    group: 'Color / Material'  },
  { id: 'color_zoning',         label: 'Color Zoning',                      group: 'Color / Material'  },
  { id: 'opaque_translucent',   label: 'Opaque or Translucent',             group: 'Color / Material'  },
  { id: 'window',               label: 'Window',                            group: 'Light Performance' },
  { id: 'extinction',           label: 'Extinction',                        group: 'Light Performance' },
  { id: 'lack_luster',          label: 'Lack Luster',                       group: 'Light Performance' },
  { id: 'off_center_culet',     label: 'Off-Center Culet',                  group: 'Geometry'          },
  { id: 'excessive_depth',      label: 'Excessive Depth / Shallow Pavilion', group: 'Geometry'         },
  { id: 'asymmetry',            label: 'Asymmetry',                         group: 'Geometry'          },
  { id: 'light_surface_wear',   label: 'Light Surface Wear Only',           group: 'Damage'            },
  { id: 'shallow_abrasions',    label: 'Shallow Abrasions',                 group: 'Damage'            },
  { id: 'girdle_chip_fissure',  label: 'Girdle Chip or Fissure',            group: 'Damage'            },
]

export const structuralItems: QuestionItem[] = [
  { id: 'surface_reaching_inclusion', label: 'Surface-Reaching Inclusion', group: 'Structural' },
  { id: 'deep_abrasions',             label: 'Deep Abrasions',             group: 'Structural' },
  { id: 'internal_fissure',           label: 'Internal Fissure',           group: 'Structural' },
  { id: 'internal_external_void',     label: 'Internal / External Void',   group: 'Structural' },
  { id: 'cleavage_plane_risk',        label: 'Cleavage Plane Risk',        group: 'Structural' },
]

export const correctableRows: CorrectableRow[] = [
  { id: 'external',   label: 'External'          },
  { id: 'light',      label: 'Light Performance' },
  { id: 'geometry',   label: 'Geometry'          },
  { id: 'structural', label: 'Structural', required: true },
]

export const correctableOptions: { value: CorrectableOption; label: string }[] = [
  { value: 'repair',          label: 'Repair Corrects'  },
  { value: 'cutting',         label: 'Cutting Corrects' },
  { value: 'not_correctable', label: 'Not Correctable'  },
  { value: 'not_worth_it',    label: 'No Issues' },
]
