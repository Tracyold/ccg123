import type { ScoreBreakdown } from '../logic/calculator'

interface ScoreBoxProps {
  results: ScoreBreakdown
}

const bandColor: Record<string, string> = {
  '80-100': '#1565e7',
  '60-79':  '#5cc9f8',
  '40-59':  '#32f1bb',
  '18-39':  '#429d3d',
  '0-17':   '#f87171',
}

export default function ScoreBox({ results }: ScoreBoxProps) {
  const pct   = Math.max(0, Math.min(100, results.feasibilityPercent))
  const color = bandColor[results.band] ?? '#f5f5f5'

  return (
    <div style={{
      width: '100%',
      border: `2px solid ${color}`,
      padding: 'clamp(28px, 6vw, 48px) clamp(20px, 5vw, 40px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 'clamp(12px, 2.5vw, 20px)',
      boxShadow: `0 0 48px ${color}28`,
      borderRadius: 0,
    }}>

      {/* Eyebrow */}
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 'clamp(12px, 1.5vw, 14px)',
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        margin: 0,
      }}>
        Feasibility Score
      </p>

      {/* Score number */}
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(74px, 18vw, 122px)',
        fontWeight: 400,
        lineHeight: 1,
        color,
        margin: 0,
      }}>
        {pct}
      </p>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: 3,
        background: `${color}22`,
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 2,
          transition: 'width 900ms cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>

      {/* Divider */}
      <div style={{ width: 40, height: 1, background: color, opacity: 0.5 }} />

      {/* Recommended service */}
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 'clamp(12px, 1.5vw, 13px)',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        margin: 0,
      }}>
        Recommended Service
      </p>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(24px, 5vw, 38px)',
        fontWeight: 400,
        color: 'var(--text)',
        margin: 0,
        lineHeight: 1.2,
      }}>
        {results.recommendation}
      </p>

      {/* Weight loss */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'clamp(16px, 2vw, 18px)',
        color: 'var(--text-muted)',
        margin: 0,
      }}>
        Estimated material loss:&nbsp;
        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{results.weightLoss}</span>
      </p>

    </div>
  )
}
