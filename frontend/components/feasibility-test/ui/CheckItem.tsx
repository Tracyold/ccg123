import type { QuestionItem } from '../data/questions'
import InfoDrawer from './InfoDrawer'

interface CheckItemProps {
  item:     QuestionItem
  checked:  boolean
  onChange: (id: string, checked: boolean) => void
}

export default function CheckItem({ item, checked, onChange }: CheckItemProps) {
  return (
    <div
      onClick={() => onChange(item.id, !checked)}
      className={`wiz-check-item${checked ? ' checked' : ''}`}
    >
      <div className={`wiz-check-dot${checked ? ' checked' : ''}`} />
      <span className={`wiz-check-label${checked ? ' checked' : ''}`}>
        {item.label}
      </span>
      {item.info && (
        <div className="wiz-check-info">
          <InfoDrawer item={item} />
        </div>
      )}
    </div>
  )
}
