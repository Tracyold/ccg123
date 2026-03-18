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
        gap: 16,
        padding: checked ? '22px 24px' : '18px 20px',
        background: checked ? 'rgba(255, 211, 105, 0.1)' : 'var(--bg-card)',
        border: checked ? '1.5px solid rgba(255, 211, 105, 0.45)' : '1.5px solid transparent',
        borderRadius: 16,
        cursor: 'pointer',
        marginBottom: 10,
        boxShadow: checked
          ? '0 4px 20px rgba(255,211,105,0.08)'
          : '0 2px 12px rgba(0,0,0,0.12)',
        transform: checked ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 240ms cubic-bezier(0.34,1.56,0.64,1)',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        minHeight: 60,
      }}
    >
      {/* Circle indicator */}
      <div style={{
        flexShrink: 0,
        width: 20,
        height: 20,
        borderRadius: '50%',
        border: `1.5px solid ${checked ? 'rgba(255,211,105,0.6)' : 'var(--border)'}`,
        background: checked ? 'rgba(255,211,105,0.2)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 240ms ease',
      }}>
        {checked && (
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--accent)',
            opacity: 0.9,
          }} />
        )}
      </div>

      {/* Label */}
      <span style={{
        flex: 1,
        fontFamily: 'var(--font-ui)',
        fontSize: 15,
        fontWeight: checked ? 600 : 400,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: checked ? 'var(--text)' : 'var(--text-muted)',
        transition: 'all 240ms ease',
        lineHeight: 1.4,
      }}>
        {item.label}
      </span>

      {/* Info icon */}
      {item.info && (
        <div style={{ opacity: 0.5, transition: 'opacity 200ms ease' }}>
          <InfoDrawer item={item} />
        </div>
      )}
    </div>
  )
}
