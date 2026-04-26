import { useState } from 'react'
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
  autoSelected:      CorrectableOption | null
  onChange:          (value: CorrectableOption) => void
  limitingChecked:   Set<string>
  structuralChecked: Set<string>
}

export default function CorrectableRow({
  rowId, selected, autoSelected, onChange, limitingChecked, structuralChecked
}: CorrectableRowProps) {
  const relevantIds   = CATEGORY_ITEMS[rowId] ?? []
  const selectedItems = relevantIds.filter(id => limitingChecked.has(id) || structuralChecked.has(id))
  const [showWarning, setShowWarning] = useState(false)
  const [pendingValue, setPendingValue] = useState<CorrectableOption | null>(null)

  const handleClick = (value: CorrectableOption) => {
    if (value === selected) return
    // If this was auto-selected and user is changing it, warn them
    if (autoSelected !== null && value !== autoSelected) {
      setPendingValue(value)
      setShowWarning(true)
    } else {
      onChange(value)
    }
  }

  const confirmChange = () => {
    if (pendingValue) onChange(pendingValue)
    setShowWarning(false)
    setPendingValue(null)
  }

  const cancelChange = () => {
    setShowWarning(false)
    setPendingValue(null)
  }

  return (
    <div style={{ marginBottom: 32 }}>

      {/* Warning popup */}
      {showWarning && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '0.5px solid var(--border)',
            padding: 'clamp(24px,4vw,36px)',
            maxWidth: 400,
            width: '90%',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'clamp(18px,3vw,22px)',
              color: 'var(--text)',
              margin: '0 0 14px',
              lineHeight: 1.3,
            }}>
              Heads up
            </p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(14px,2vw,16px)',
              color: 'var(--text-muted)',
              lineHeight: 1.75,
              margin: '0 0 28px',
            }}>
              These answers are auto selected based on your previous answers. Changing them could drastically affect your results.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={cancelChange}
                style={{
                  flex: 1,
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: '0.5px solid var(--border)',
                  padding: '12px 16px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 0.75rem,
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: 2,
                  transition: 'all 180ms ease',
                }}
              >
                Keep Auto
              </button>
              <button
                type="button"
                onClick={confirmChange}
                style={{
                  flex: 1,
                  background: 'transparent',
                  color: 'var(--accent)',
                  border: '0.5px solid rgba(255,211,105,0.45)',
                  padding: '12px 16px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 0.75rem,
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: 2,
                  transition: 'all 180ms ease',
                }}
              >
                Change Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Relevant selections */}
      {selectedItems.length > 0 && (
        <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '0.5px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 0.625rem, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', opacity: 0.5, margin: '0 0 10px' }}>
            Your selections
          </p>
          {selectedItems.map(id => (
            <p key={id} style={{ fontFamily: 'var(--font-body)', fontSize: 0.8125rem, fontWeight: 300, color: 'var(--text-muted)', margin: '0 0 4px' }}>
              — {LABEL_MAP[id] ?? id}
            </p>
          ))}
        </div>
      )}

      {/* Option buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {correctableOptions.map(opt => {
          const isSelected = selected === opt.value
          const isAuto     = autoSelected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleClick(opt.value)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 0.8125rem,
                fontWeight: isSelected ? 400 : 300,
                color: isSelected ? 'var(--text)' : 'var(--text-muted)',
                padding: '18px 12px',
                background: isSelected ? 'rgba(255,211,105,0.04)' : 'rgba(255,255,255,0.015)',
                border: `0.5px solid ${isSelected ? 'rgba(255,211,105,0.28)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 200ms ease',
                WebkitTapHighlightColor: 'transparent',
                textAlign: 'center',
                lineHeight: 1.4,
                boxShadow: isSelected
                  ? '0 4px 20px rgba(0,0,0,0.14), 0 0 16px rgba(255,211,105,0.04)'
                  : '0 2px 10px rgba(0,0,0,0.1)',
                transform: isSelected ? 'translateY(-1px)' : 'translateY(0)',
                position: 'relative',
              }}
            >
              {opt.label}
              {isAuto && (
                <span style={{
                  position: 'absolute',
                  top: 6, right: 8,
                  fontFamily: 'var(--font-body)',
                  fontSize: 0.5625rem,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  opacity: 0.6,
                }}>
                  auto
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
