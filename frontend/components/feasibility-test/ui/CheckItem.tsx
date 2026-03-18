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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: checked ? '20px 20px' : '16px 18px',
        background: checked ? 'rgba(255,211,105,0.08)' : 'var(--bg-card)',
        border: `1.5px solid ${checked ? 'rgba(255,211,105,0.4)' : 'transparent'}`,
        borderRadius: 14,
        cursor: 'pointer',
        marginBottom: 10,
        boxShadow: checked ? '0 4px 20px rgba(255,211,105,0.08)' : '0 1px 6px rgba(0,0,0,0.12)',
        transform: checked ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 220ms cubic-bezier(0.34,1.56,0.64,1)',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        minHeight: 58,
      }}
    >
      {/* Circle indicator */}
      <div style={{
        flexShrink: 0,
        width: 20, height: 20,
        borderRadius: '50%',
        border: `1.5px solid ${checked ? 'rgba(255,211,105,0.6)' : 'var(--border)'}`,
        background: checked ? 'rgba(255,211,105,0.18)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 220ms ease',
      }}>
        {checked && (
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
        )}
      </div>

      {/* Label */}
      <span style={{
        flex: 1,
        fontFamily: 'var(--font-body)',
        fontSize: 'clamp(19px, 2.2vw, 21px)',
        fontWeight: checked ? 600 : 400,
        color: checked ? 'var(--text)' : 'var(--text-muted)',
        transition: 'color 220ms ease',
        lineHeight: 1.4,
      }}>
        {item.label}
      </span>

      {/* Info icon */}
      {item.info && (
        <div style={{ opacity: 0.4, flexShrink: 0 }}>
          <InfoDrawer item={item} />
        </div>
      )}
    </div>
  )
}
