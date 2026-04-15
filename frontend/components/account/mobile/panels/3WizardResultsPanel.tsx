import { useState } from 'react';
import WizardResultDrawer3 from '../drawers/3WizardResultDrawer';

// components/account/mobile/panels/3WizardResultsPanel.tsx
// Converted from <!-- WIZARD RESULTS PANEL --> in account-dashboard-v3.html
//
// This panel loads real wizard results from Supabase using
// getUserWizardResults() -- same hook used by the existing WizardResultsTab.tsx
//
// HTML → JSX changes:
//   class=      → className=
//   onclick=    → onClick=
//   style="..." → style={{ camelCase }}

import { useState, useEffect } from 'react';
import { getUserWizardResults, deleteWizardResult } from '../../../../lib/wizardResultsService';
import type { WizardResult } from '../../../../lib/wizardResultsService';

interface WizardResultsPanelProps {
  open:                    boolean;
  onClose:                 () => void;
  onCreateServiceRequest?: (result: WizardResult) => void;
}

// Band colors -- each score range has a color
// These match the colors used in the HTML mockup score rings
const BAND_COLOR: Record<string, string> = {
  '80-100': '#38bdf8',  // blue -- Polish Only
  '60-79':  '#4ec994',  // green -- Stone Repair
  '40-59':  '#a3e635',  // lime -- Partial Recut
  '18-39':  '#67e8f9',  // cyan -- Full Recut
  '0-17':   '#f87171',  // red -- No Recut Recommended
};

const BAND_LABEL: Record<string, string> = {
  '80-100': 'Polish Only',
  '60-79':  'Stone Repair',
  '40-59':  'Partial Recut',
  '18-39':  'Full Recut',
  '0-17':   'No Recut Recommended',
};

// Score ring SVG -- converted from the SVG in each wiz-thumb in the HTML
// The HTML used fixed stroke-dashoffset values for mock data.
// Here we calculate it from the real percentage.
function ScoreRing({ pct, color }: { pct: number; color: string }) {
  const r      = 19;
  const circ   = 2 * Math.PI * r;           // ≈ 119
  const offset = circ * (1 - pct / 100);
  return (
    // wiz-score-ring: the wrapper with relative positioning for the number overlay
    <div className="wiz-score-ring">
      <svg width="48" height="48" viewBox="0 0 48 48">
        {/* Background track circle */}
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--bdr2)" strokeWidth="2.5" />
        {/* Filled progress arc */}
        <circle
          cx="24" cy="24" r={r}
          fill="none" stroke={color} strokeWidth="2.5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
        />
      </svg>
      {/* wiz-score-num: percentage number centered over the ring */}
      <div className="wiz-score-num" style={{ color }}>{pct}</div>
    </div>
  );
}

export default function WizardResultsPanel3({
  open, onClose, onCreateServiceRequest,
}: WizardResultsPanelProps) {

  const [results,  setResults]  = useState<WizardResult[]>([]);
  const [loading,  setLoading]  = useState(true);


  // Load wizard results from Supabase when panel opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getUserWizardResults().then(data => {
      setResults(data);
      setLoading(false);
    });
  }, [open]);

  const handleDelete = async (id: string) => {
    const ok = await deleteWizardResult(id);
    if (ok) setResults(prev => prev.filter(r => r.id !== id));
  };
  
  const [selectedResult, setSelectedResult] = useState<WizardResult | null>(null);

  return (
    <div className={`slide-panel${open ? ' open' : ''}`}>

      {/* Panel header */}
      <div className="panel-header">
        <span className="panel-title">Wizard Results</span>
        <button className="panel-close" onClick={onClose}>✕</button>
      </div>

      {loading ? (
        // Loading state
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-muted)' }}>
            Loading...
          </p>
        </div>
      ) : results.length === 0 ? (
        // wiz-empty: shown when there are no saved results
        <div className="wiz-empty">
          <div className="wiz-empty-title">No saved results yet.</div>
          <div className="wiz-empty-sub">
            Complete the Cut Feasibility Wizard and save your results to see them here.
          </div>
          <a href="/feasibility-check" className="wiz-empty-link">
            Open Wizard →
          </a>
        </div>
      ) : (
        // wiz-grid: 2-column grid of result thumbnails
        <div className="wiz-grid">
          {results.map(r => {
            const color = BAND_COLOR[r.band] ?? '#e7e5e4';
            const label = BAND_LABEL[r.band] ?? r.recommendation;
            const pct   = Math.round(r.feasibility_percent);
            const stone = [r.stone_variety, r.stone_species].filter(Boolean).join(' ') || 'Unnamed stone';
            const date  = new Date(r.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            });
            const weightStr = r.stone_weight_ct ? `${r.stone_weight_ct}ct` : '--ct';
            const cutStr    = r.stone_cut || 'Unknown';

            return (
              // wiz-thumb: each result card
              // border-color matches the band color (e.g. rgba(56,189,248,0.5) for blue)
              <div
                key={r.id}
                className="wiz-thumb"
                style={{ borderColor: color + '80' }}  // 80 = 50% opacity in hex
              >
                <ScoreRing pct={pct} color={color} />

                {/* wiz-band-label: the recommendation label (Polish Only, Stone Repair, etc.) */}
                <div className="wiz-band-label" style={{ color }}>{label}</div>

                {/* wiz-stone: stone name, weight, cut */}
                <div className="wiz-stone">
                  {stone} · {weightStr}<br />{cutStr}
                </div>

                {/* wiz-date: when the result was created */}
                <div className="wiz-date">{date}</div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {onCreateServiceRequest && (
                    <button
                      onClick={() => onCreateServiceRequest(r)}
                      style={{
                        flex: 1, background: 'transparent',
                        border: '0.5px solid rgba(255,211,105,0.4)',
                        color: 'var(--gold)', padding: '6px 8px',
                        fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 600,
                        letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                      }}
                    >
                      + Request
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    style={{
                      background: 'transparent', border: '0.5px solid var(--bdr2)',
                      color: 'var(--text-muted)', padding: '6px 8px',
                      fontFamily: 'var(--font-ui)', fontSize: 9,
                      letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}