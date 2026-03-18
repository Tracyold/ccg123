import type { CorrectableOption } from '../data/questions'
import { correctableOptions } from '../data/questions'

// ── Which item IDs belong to each correctable category ────────
const CATEGORY_ITEMS: Record<string, string[]> = {
  external:   ['light_surface_wear', 'shallow_abrasions'],
  light:      ['opaque_translucent', 'color_zoning', 'extinction', 'lack_luster', 'window'],
  geometry:   ['off_center_culet', 'excessive_depth', 'asymmetry'],
  structural: ['surface_reaching_inclusion', 'deep_abrasions', 'internal_fissure', 'internal_external_void', 'cleavage_plane_risk'],
}

// ── All items flat so we can look up labels by id ────────────
import { limitingItems, structuralItems } from '../data/questions'
const ALL_ITEMS = [...limitingItems, ...structuralItems]
const LABEL_MAP: Record<string, string> = ALL_ITEMS.reduce((acc, item) => {
  acc[item.id] = item.label
  return acc
}, {} as Record<string, string>)

interface SelectionReferenceProps {
  rowId:             'external' | 'light' | 'geometry' | 'structural'
  limitingChecked:   Set<string>
  structuralChecked: Set<string>
}

export function SelectionReference({ rowId, limitingChecked, structuralChecked }: SelectionReferenceProps) {
  const relevantIds = CATEGORY_ITEMS[rowId] ?? []

  const selected = relevantIds.filter(id =>
    limitingChecked.has(id) || structuralChecked.has(id)
  )

  if (selected.length === 0) return (
    <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px', marginBottom: 24 }}>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 10px' }}>
        Relevant Selections
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-muted)', opacity: 0.5, margin: 0, fontStyle: 'italic' }}>
        None of your selections apply to this category.
      </p>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px', marginBottom: 24 }}>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 14px' }}>
        Relevant Selections
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {selected.map(id => (
          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', opacity: 0.6, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text)', lineHeight: 1.4 }}>
              {LABEL_MAP[id] ?? id}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── CorrectableRow ────────────────────────────────────────────
interface CorrectableRowProps {
  label:             string
  required?:         boolean
  rowId:             'external' | 'light' | 'geometry' | 'structural'
  selected:          CorrectableOption | null
  onChange:          (value: CorrectableOption) => void
  limitingChecked:   Set<string>
  structuralChecked: Set<string>
}

export default function CorrectableRow({
  label, required, rowId, selected, onChange, limitingChecked, structuralChecked
}: CorrectableRowProps) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {label}
        </span>
        {required && (
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,211,105,0.7)', border: '1px solid rgba(255,211,105,0.35)', borderRadius: 4, padding: '2px 7px' }}>
            Required
          </span>
        )}
      </div>

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
                fontSize: isSelected ? 12 : 11,
                fontWeight: isSelected ? 600 : 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '20px 14px',
                background: isSelected ? 'rgba(255,211,105,0.1)' : 'var(--bg-card)',
                color: isSelected ? 'var(--text)' : 'var(--text-muted)',
                border: isSelected ? '1.5px solid rgba(255,211,105,0.45)' : '1.5px solid transparent',
                borderRadius: 16,
                cursor: 'pointer',
                transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                boxShadow: isSelected ? '0 4px 20px rgba(255,211,105,0.08)' : '0 2px 12px rgba(0,0,0,0.1)',
                transition: 'all 240ms cubic-bezier(0.34,1.56,0.64,1)',
                WebkitTapHighlightColor: 'transparent',
                lineHeight: 1.4,
                minHeight: 72,
                textAlign: 'center',
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
