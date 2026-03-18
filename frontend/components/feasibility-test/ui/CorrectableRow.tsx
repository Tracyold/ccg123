import type { CorrectableOption } from '../data/questions'
import { correctableOptions, limitingItems, structuralItems } from '../data/questions'

const CATEGORY_ITEMS: Record<string, string[]> = {
  external:   ['light_surface_wear', 'shallow_abrasions'],
  light:      ['opaque_translucent', 'color_zoning', 'extinction', 'lack_luster', 'window'],
  geometry:   ['off_center_culet', 'excessive_depth', 'asymmetry'],
  structural: ['surface_reaching_inclusion', 'deep_abrasions', 'internal_fissure', 'internal_external_void', 'cleavage_plane_risk'],
}

const ALL_ITEMS = [...limitingItems, ...structuralItems]
const LABEL_MAP: Record<string, string> = ALL_ITEMS.reduce((acc, item) => {
  acc[item.id] = item.label; return acc
}, {} as Record<string, string>)

interface CorrectableRowProps {
  label:             string
  required?:         boolean
  rowId:             'external' | 'light' | 'geometry' | 'structural'
  selected:          CorrectableOption | null
  onChange:          (value: CorrectableOption) => void
  limitingChecked:   Set<string>
  structuralChecked: Set<string>
}

export default function CorrectableRow({ label, required, rowId, selected, onChange, limitingChecked, structuralChecked }: CorrectableRowProps) {
  const relevantIds = CATEGORY_ITEMS[rowId] ?? []
  const selectedItems = relevantIds.filter(id => limitingChecked.has(id) || structuralChecked.has(id))

  return (
    <div style={{ marginBottom: 28 }}>

      {/* Row label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 'clamp(19px, 2.2vw, 21px)',
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          {label}
        </span>
        {required && (
          <span style={{
            fontFamily: 'var(--font-ui)', fontSize: 17,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--accent)', border: '1px solid var(--accent)',
            borderRadius: 4, padding: '2px 7px',
          }}>
            Required
          </span>
        )}
      </div>

      {/* Relevant selections */}
      {selectedItems.length > 0 && (
        <div style={{
          background: 'var(--bg-deep)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 14,
        }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 17, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 10px' }}>
            Relevant Selections
          </p>
          {selectedItems.map(id => (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', opacity: 0.5, flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'clamp(19px, 2.2vw, 21px)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {LABEL_MAP[id] ?? id}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Option buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {correctableOptions.map(opt => {
          const isSelected = selected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'clamp(19px, 2.2vw, 21px)',
                fontWeight: isSelected ? 600 : 400,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: isSelected ? '20px 12px' : '16px 12px',
                background: isSelected ? 'rgba(255,211,105,0.08)' : 'var(--bg-card)',
                color: isSelected ? 'var(--text)' : 'var(--text-muted)',
                border: `1.5px solid ${isSelected ? 'rgba(255,211,105,0.4)' : 'transparent'}`,
                borderRadius: 14,
                cursor: 'pointer',
                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                boxShadow: isSelected ? '0 4px 16px rgba(255,211,105,0.08)' : '0 1px 6px rgba(0,0,0,0.1)',
                transition: 'all 220ms cubic-bezier(0.34,1.56,0.64,1)',
                WebkitTapHighlightColor: 'transparent',
                minHeight: 68,
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
