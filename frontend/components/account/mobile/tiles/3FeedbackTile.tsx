// components/account/mobile/tiles/3FeedbackTile.tsx

import { useState } from 'react';

export default function FeedbackTile3() {
  const [expanded, setExpanded] = useState(false);
  const [stars,    setStars]    = useState(0);
  const [note,     setNote]     = useState('');
  const [reviewed, setReviewed] = useState(false);

  if (reviewed) return null;

  return (
    <div className="fb-tile" style={{ marginTop: 12 }}>
      {!expanded ? (
        /* Collapsed state -- tap to expand */
        <div
          onClick={() => setExpanded(true)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)', marginBottom: 4, fontWeight: 500 }}>
              How was your experience?
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-muted)', opacity: 0.8 }}>
              Tap to leave a review
            </div>
          </div>
          <div style={{ 
            fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gold)', 
            fontWeight: 600, letterSpacing: '0.1em' 
          }}>
            RATE →
          </div>
        </div>
      ) : (
        /* Expanded state -- star rating + text */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)', fontWeight: 500 }}>
            Rate your experience
          </div>
          <div className="fb-stars">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                className={`fb-star${n <= stars ? ' active' : ''}`}
                onClick={() => setStars(n)}
                aria-label={`${n} star${n !== 1 ? 's' : ''}`}
                style={{ fontSize: 32 }}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Tell us about your experience (optional)..."
            rows={3}
            className="fb-input"
            style={{ 
              fontSize: 15, 
              padding: 12, 
              borderRadius: 8, 
              background: 'rgba(255,255,255,0.03)',
              border: '0.5px solid var(--bdr2)',
              color: 'var(--text)'
            }}
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => { if (stars > 0) setReviewed(true); }}
              disabled={stars === 0}
              className="fb-send"
              style={{ 
                flex: 1, 
                padding: '12px', 
                fontSize: 14, 
                fontWeight: 600, 
                background: 'var(--gold)', 
                color: 'var(--bg-deep)',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Submit Review
            </button>
            <button
              onClick={() => setExpanded(false)}
              style={{
                background: 'none', border: '0.5px solid var(--bdr2)', color: 'var(--text-muted)',
                padding: '12px 20px', fontFamily: 'var(--font-mono)', fontSize: 11,
                letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
                borderRadius: 8
              }}
            >
              Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
