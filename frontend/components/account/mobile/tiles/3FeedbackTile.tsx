// components/account/mobile/tiles/3FeedbackTile.tsx
//
// Review tile — one review per user (for now), with edit/delete.
//
// States:
//   1. No review exists → gold tile, "Tap to leave a review"
//   2. Form open (new OR editing) → bg-card, submission form
//   3. Review exists → bg-card, shows review + edit/delete buttons
//
// Delete removes the row outright (not soft-delete for now). User can
// always leave a new review after deleting.
//
// Edit flips is_approved=false (handled DB-side by trigger) so admin
// re-moderates. The consent checkbox is locked on edit — you can't
// un-consent from an existing review (admin can remove for you if needed).

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';

interface ReviewRow {
  review_id:         string;
  account_user_id:   string;
  stars:             number;
  review_text:       string;
  consent_public:    boolean;
  use_real_name:     boolean;
  display_name:      string | null;
  is_approved:       boolean;
  is_hidden_by_user: boolean;
  created_at:        string;
  updated_at:        string;
}

interface FeedbackTileProps {
  session: any;
}

// ── Stars renderer ──────────────────────────────────────────────────────────
// Two modes:
//   interactive: tap to set rating. Filled gold for n <= stars, faded otherwise.
//   display:     gold outline, thicker borders. No interaction.
function StarsInteractive({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="fb-stars">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`fb-star${n <= value ? ' active' : ''}`}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
          style={{ fontSize: 'clamp(20px, 5.5vw, 23px)', background: 'none', border: 'none', padding: 0, lineHeight: 1 }}
        >★</button>
      ))}
    </div>
  );
}
function StarsDisplay({ value }: { value: number }) {
  return (
    <div className="fb-stars-display" style={{ display: 'flex', gap: 'clamp(0.25rem, 1.5vw, 0.5rem)' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className={n <= value ? 'fb-star-outline filled' : 'fb-star-outline empty'}
          aria-hidden
        >★</span>
      ))}
    </div>
  );
}

export default function FeedbackTile3({ session }: FeedbackTileProps) {
  // ── Data state ──
  const [review,  setReview]  = useState<ReviewRow | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Form state (used for new and edit) ──
  const [formOpen,       setFormOpen]       = useState(false);
  const [editingId,      setEditingId]      = useState<string | null>(null);
  const [fStars,         setFStars]         = useState(0);
  const [fText,          setFText]          = useState('');
  const [fConsent,       setFConsent]       = useState(false);
  const [fUseReal,       setFUseReal]       = useState(true);
  const [fDisplayName,   setFDisplayName]   = useState('');
  const [submitting,     setSubmitting]     = useState(false);
  const [submitError,    setSubmitError]    = useState<string | null>(null);

  // ── Fetch the user's existing review on mount ──
  useEffect(() => {
    if (!session?.user?.id) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('account_user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (error) console.warn('Review fetch failed:', error);
      setReview(data ?? null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  // ── Helpers ──
  const openForNew = () => {
    setEditingId(null);
    setFStars(0);
    setFText('');
    setFConsent(false);
    setFUseReal(true);
    setFDisplayName('');
    setSubmitError(null);
    setFormOpen(true);
  };
  const openForEdit = (r: ReviewRow) => {
    setEditingId(r.review_id);
    setFStars(r.stars);
    setFText(r.review_text);
    setFConsent(r.consent_public);     // locked in UI but kept for display
    setFUseReal(r.use_real_name);
    setFDisplayName(r.display_name ?? '');
    setSubmitError(null);
    setFormOpen(true);
  };
  const cancelForm = () => {
    setFormOpen(false);
    setSubmitError(null);
  };

  // ── Submit ──
  const canSubmit =
    !submitting &&
    fStars >= 1 &&
    fText.trim().length > 0 &&
    (editingId ? true : fConsent) &&
    (fUseReal ? true : fDisplayName.trim().length > 0);

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!session?.user?.id) {
      setSubmitError('Session missing. Please log in again.');
      return;
    }
    if (fStars < 1) { setSubmitError('Please pick a star rating.'); return; }
    if (!fText.trim()) { setSubmitError('Please write a short review.'); return; }
    if (!editingId && !fConsent) {
      setSubmitError('Please check the consent box to submit.');
      return;
    }
    if (!fUseReal && !fDisplayName.trim()) {
      setSubmitError('Please enter the display name you want to use.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // UPDATE (is_approved flips to false via trigger)
        const { data, error } = await supabase
          .from('reviews')
          .update({
            stars:         fStars,
            review_text:   fText.trim(),
            use_real_name: fUseReal,
            display_name:  fUseReal ? null : fDisplayName.trim(),
          })
          .eq('review_id', editingId)
          .select('*')
          .maybeSingle();
        if (error || !data) {
          setSubmitError(error?.message || 'Could not save changes. Please try again.');
          return;
        }
        setReview(data);
      } else {
        // INSERT
        const { data, error } = await supabase
          .from('reviews')
          .insert({
            account_user_id: session.user.id,
            stars:           fStars,
            review_text:     fText.trim(),
            consent_public:  fConsent,
            use_real_name:   fUseReal,
            display_name:    fUseReal ? null : fDisplayName.trim(),
          })
          .select('*')
          .maybeSingle();
        if (error || !data) {
          setSubmitError(error?.message || 'Could not submit review. Please try again.');
          return;
        }
        setReview(data);
      }
      setFormOpen(false);
      setEditingId(null);
    } catch (err: any) {
      setSubmitError(err?.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete (actual delete, not soft) ──
  const handleDelete = async () => {
    if (!review) return;
    if (!confirm('Delete this review? You can always leave a new one.')) return;
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('review_id', review.review_id);
    if (error) {
      alert(`Could not delete: ${error.message}`);
      return;
    }
    setReview(null);
  };

  // ── Render ──
  if (loading) return null;

  const hasReview = !!review;
  const showGoldPrompt = !hasReview && !formOpen;

  return (
    <div
      className={`fb-tile${showGoldPrompt ? ' fb-tile-gold' : ''}`}
      style={{ marginTop: 12 }}
    >
      {/* STATE 1 — gold call to action */}
      {showGoldPrompt && (
        <div
          onClick={openForNew}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-display-mob)', fontSize: 'clamp(16px, 4.2vw, 18px)', color: '#000', marginBottom: 4, fontWeight: 500 }}>
              How was your experience?
            </div>
            <div style={{ fontFamily: 'var(--font-ui-mob)', fontSize: 'clamp(13vem, 3.5vw, 14vem)', color: '#000', opacity: 0.75 }}>
              Tap to leave a review
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono-mob)', fontSize: 'clamp(11px, 2.8vw, 12px)', color: '#000',
            fontWeight: 600, letterSpacing: '0.1em',
          }}>
            RATE →
          </div>
        </div>
      )}

      {/* STATE 2 — form (new OR edit) */}
      {formOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: 'var(--font-display-mob)', fontSize: 'clamp(16px, 4.2vw, 18px)', color: 'var(--text)', fontWeight: 500 }}>
            {editingId ? 'Edit your review' : 'Leave a review'}
          </div>

          <StarsInteractive value={fStars} onChange={setFStars} />

          <textarea
            className="fb-input"
            value={fText}
            onChange={e => setFText(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            style={{
              fontSize: 'clamp(14px, 3.8vw, 15px)',
              padding: 12, borderRadius: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '0.5px solid var(--bdr2)',
              color: 'var(--text)',
              fontFamily: 'var(--font-ui-mob)',
              resize: 'vertical',
            }}
          />

          {/* Consent block — locked on edit */}
          <div className="srf-consent-block" style={{ padding: 'clamp(0.625rem, 3vw, 0.875rem)' }}>
            {editingId ? (
              <div style={{ fontFamily: 'var(--font-ui-mob)', fontSize: 'clamp(13px, 3.4vw, 14px)', color: 'var(--text-muted)' }}>
                ✓ You consented to public display when you first submitted this review.
              </div>
            ) : (
              <label className="srf-consent-check">
                <input
                  type="checkbox"
                  checked={fConsent}
                  onChange={e => setFConsent(e.target.checked)}
                />
                <span>
                  I understand Cutting Corners Gems may display this review
                  publicly on their website.
                </span>
              </label>
            )}
          </div>

          {/* Name preference */}
          <div className="fb-name-pref">
            <div style={{ fontFamily: 'var(--font-mono-mob)', fontSize: 'clamp(10px, 2.6vw, 11px)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
              Display name
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, cursor: 'pointer', fontFamily: 'var(--font-ui-mob)', fontSize: 'clamp(13px, 3.4vw, 14px)', color: 'var(--text)' }}>
              <input
                type="radio"
                checked={fUseReal}
                onChange={() => setFUseReal(true)}
                style={{ accentColor: 'var(--gold)' }}
              />
              Use my real name
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'var(--font-ui-mob)', fontSize: 'clamp(13px, 3.4vw, 14px)', color: 'var(--text)' }}>
              <input
                type="radio"
                checked={!fUseReal}
                onChange={() => setFUseReal(false)}
                style={{ accentColor: 'var(--gold)' }}
              />
              Use a different display name
            </label>
            {!fUseReal && (
              <input
                className="fb-input"
                value={fDisplayName}
                onChange={e => setFDisplayName(e.target.value)}
                placeholder="Display name for this review"
                style={{
                  marginTop: 8,
                  fontSize: 'clamp(14px, 3.8vw, 15px)',
                  padding: 10, borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)',
                  border: '0.5px solid var(--bdr2)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-ui-mob)',
                  width: '100%',
                }}
              />
            )}
          </div>

          {submitError && (
            <div className="srf-submit-error" style={{ margin: 0 }}>{submitError}</div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                flex: 1, padding: '12px',
                fontSize: 'clamp(13px, 3.5vw, 14px)',
                fontFamily: 'var(--font-ui-mob)',
                fontWeight: 600,
                background: 'var(--gold)',
                color: 'var(--bg-deep)',
                borderRadius: 999, border: 'none',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                opacity: canSubmit ? 1 : 0.5,
                letterSpacing: '0.06em',
              }}
            >
              {submitting ? 'Saving…' : (editingId ? 'Save changes' : 'Submit review')}
            </button>
            <button
              onClick={cancelForm}
              style={{
                background: 'transparent',
                border: '0.5px solid var(--bdr2)',
                color: 'var(--text-muted)',
                padding: '12px 18px',
                fontFamily: 'var(--font-mono-mob)',
                fontSize: 'clamp(10px, 2.6vw, 11px)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                borderRadius: 999,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* STATE 3 — review exists, no form open */}
      {hasReview && !formOpen && review && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <StarsDisplay value={review.stars} />
            <span style={{
              fontFamily: 'var(--font-mono-mob)',
              fontSize: 'clamp(9px, 2.4vw, 10px)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '3px 10px',
              borderRadius: 999,
              background: review.is_approved ? 'rgba(73, 233, 163, 0.1)' : 'rgba(207,221,78,0.1)',
              color:      review.is_approved ? 'var(--ok, #49e9a3)' : 'var(--gold)',
              flexShrink: 0,
            }}>
              {review.is_approved ? 'Public' : 'Pending'}
            </span>
          </div>

          <div
            className="fb-review-text"
            style={{
              fontFamily: 'var(--font-display-mob)',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 'clamp(14px, 3.8vw, 16px)',
              color: 'var(--text)',
              lineHeight: 1.55,
              paddingTop: 4,
            }}
          >
            "{review.review_text}"
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <div style={{ fontFamily: 'var(--font-mono-mob)', fontSize: 'clamp(9px, 2.4vw, 10px)', color: 'var(--text-muted)', opacity: 0.7, letterSpacing: '0.08em' }}>
              — {review.use_real_name ? 'You' : review.display_name} · {new Date(review.created_at).toLocaleDateString()}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => openForEdit(review)}
                title="Edit review"
                style={{
                  background: 'transparent',
                  border: '0.5px solid var(--bdr2)',
                  color: 'var(--text-muted)',
                  padding: '4px 10px',
                  fontFamily: 'var(--font-mono-mob)',
                  fontSize: 'clamp(9px, 2.4vw, 10px)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: 999,
                }}
              >Edit</button>
              <button
                onClick={handleDelete}
                title="Delete review"
                style={{
                  background: 'transparent',
                  border: '0.5px solid var(--bdr2)',
                  color: 'var(--text-muted)',
                  padding: '4px 10px',
                  fontFamily: 'var(--font-mono-mob)',
                  fontSize: 'clamp(9px, 2.4vw, 10px)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: 999,
                }}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}