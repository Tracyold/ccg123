import { calculateEstimate } from '../logic/estimate'
import type { EstimateInput } from '../logic/estimate'

export default function EstimateDisplay({ input }: { input: EstimateInput }) {
  const result = calculateEstimate(input)

  return (
    <div style={{
      border: '1px solid var(--border)',
      padding: 'clamp(16px, 3vw, 22px)',
    }}>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '17px',
        color: 'var(--text-muted)',
        margin: '0 0 10px',
      }}>
        Estimate
      </p>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '19px',
        color: 'var(--text)',
        margin: '0 0 8px',
        fontWeight: 500,
      }}>
        {result.label}
      </p>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '19px',
        color: 'var(--text-muted)',
        lineHeight: 1.7,
        margin: 0,
      }}>
        {result.note}
      </p>
    </div>
  )
}
