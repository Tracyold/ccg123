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
    <div className="wiz-correctable">

      {/* Warning popup */}
      {showWarning && (
        <div className="wiz-warning-overlay">
          <div className="wiz-warning-card">
            <p className="wiz-warning-title">Heads up</p>
            <p className="wiz-warning-body">
              These answers are auto selected based on your previous answers. Changing them could drastically affect your results.
            </p>
            <div className="wiz-warning-actions">
              <button type="button" onClick={cancelChange} className="wiz-warning-btn-cancel">
                Keep Auto
              </button>
              <button type="button" onClick={confirmChange} className="wiz-warning-btn-confirm">
                Change Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Relevant selections */}
      {selectedItems.length > 0 && (
        <div className="wiz-correctable-selections">
          <p className="wiz-correctable-selections-label">Your selections</p>
          {selectedItems.map(id => (
            <p key={id} className="wiz-correctable-selection-item">
              — {LABEL_MAP[id] ?? id}
            </p>
          ))}
        </div>
      )}

      {/* Option buttons */}
      <div className="wiz-correctable-grid">
        {correctableOptions.map(opt => {
          const isSelected = selected === opt.value
          const isAuto     = autoSelected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleClick(opt.value)}
              className={`wiz-correctable-btn${isSelected ? ' selected' : ''}`}
            >
              {opt.label}
              {isAuto && <span className="wiz-correctable-auto">auto</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
