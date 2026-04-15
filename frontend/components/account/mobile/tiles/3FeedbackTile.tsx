// components/account/mobile/tiles/3FeedbackTile.tsx

import { useState } from 'react';

export default function FeedbackTile3() {
  const [expanded, setExpanded] = useState(false);
  const [stars,    setStars]    = useState(0);
  const [note,     setNote]     = useState('');
  const [reviewed, setReviewed] = useState(false);

  if (reviewed) return null;

  return (
    <div className="fb-tile" style={{ marginTop: 8 }}>
      {!expanded ? (
        /* Collapsed state -- tap to expand */
        <div
          onClick={() => setExpanded(true)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text)', marginBottom: 2 }}>
              How was your experience?
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)' }}>
              Tap to leave a review
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', opacity: 0.6 }}>
            Rate →
          </div>
        </div>
      ) : (
        /* Expanded state -- star rating + text */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text)' }}>
            Rate your experience
          </div>
          <div className="fb-stars">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                className={`fb-star${n <= stars ? ' active' : ''}`}
                onClick={() => setStars(n)}
                aria-label={`${n} star${n !== 1 ? 's' : ''}`}
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
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { if (stars > 0) setReviewed(true); }}
              disabled={stars === 0}
              className="fb-send"
            >
              Submit
            </button>
            <button
              onClick={() => setExpanded(false)}
              style={{
                background: 'none', border: '0.5px solid var(--bdr2)', color: 'var(--text-muted)',
                padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 9,
                letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
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