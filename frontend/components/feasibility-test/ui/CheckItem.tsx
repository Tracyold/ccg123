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
        padding: '18px 20px',
        background: checked ? 'rgba(255,211,105,0.04)' : 'rgba(255,255,255,0.015)',
        border: `0.5px solid ${checked ? 'rgba(255,211,105,0.28)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 6,
        cursor: 'pointer',
        marginBottom: 8,
        transition: 'all 200ms ease',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        boxShadow: checked
          ? '0 4px 20px rgba(0,0,0,0.14), 0 0 16px rgba(255,211,105,0.04)'
          : '0 2px 10px rgba(0,0,0,0.1)',
        transform: checked ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      <div style={{
        flexShrink: 0,
        width: 7, height: 7,
        borderRadius: '50%',
        border: `0.5px solid ${checked ? 'var(--accent)' : 'rgba(255,255,255,0.2)'}`,
        background: checked ? 'var(--accent)' : 'transparent',
        transition: 'all 200ms ease',
      }} />

      <span style={{
        flex: 1,
        fontFamily: 'var(--font-body)',
        fontSize: '1.0625rem',
        fontWeight: checked ? 400 : 300,
        color: checked ? 'var(--text)' : 'var(--text-muted)',
        transition: 'color 200ms ease',
        lineHeight: 1.4,
      }}>
        {item.label}
      </span>

      {item.info && (
        <div style={{ opacity: 0.25, flexShrink: 0 }}>
          <InfoDrawer item={item} />
        </div>
      )}
    </div>
  )
}
