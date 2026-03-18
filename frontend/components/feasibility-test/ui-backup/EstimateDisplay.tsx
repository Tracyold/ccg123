import { calculateEstimate } from '../logic/estimate'
import type { EstimateInput } from '../logic/estimate'

export default function EstimateDisplay({ input }: { input: EstimateInput }) {
  const result = calculateEstimate(input)

  return (
    <div style={{
      background: 'var(--bg-deep)',
      border: '1px solid var(--border)',
      padding: '20px 24px',
    }}>
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 15,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: 10,
        margin: '0 0 10px',
      }}>
        Estimate
      </p>

      {result.available && result.range ? (
        <div>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 34,
            fontWeight: 400,
            color: 'var(--text)',
            margin: '0 0 4px',
          }}>
            ${result.range.low.toLocaleString()} – ${result.range.high.toLocaleString()}
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>
            {result.label}
          </p>
        </div>
      ) : (
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: '0.05em',
          color: 'var(--text)',
          margin: '0 0 8px',
        }}>
          {result.label}
        </p>
      )}

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        color: 'var(--text-muted)',
        lineHeight: 1.7,
        margin: '10px 0 0',
      }}>
        {result.note}
      </p>
    </div>
  )
}
