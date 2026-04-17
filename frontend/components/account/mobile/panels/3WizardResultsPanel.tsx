// components/account/mobile/panels/3WizardResultsPanel.tsx

import { useState, useEffect } from 'react';
import { getUserWizardResults, deleteWizardResult } from '../../../../lib/wizardResultsService';
import type { WizardResult } from '../../../../lib/wizardResultsService';
// FIX 4: import the drawer
import WizardResultDrawer3 from '../drawers/3WizardResultDrawer';
import { useSwipeDownToClose } from '../../shared/hooks/useSwipeDownToClose';

interface WizardResultsPanelProps {
  open:                    boolean;
  onClose:                 () => void;
  onCreateServiceRequest?: (result: WizardResult) => void;
}

const BAND_COLOR: Record<string, string> = {
  '80-100': '#38bdf8',
  '60-79':  '#4ec994',
  '40-59':  '#a3e635',
  '18-39':  '#67e8f9',
  '0-17':   '#f87171',
};

const BAND_LABEL: Record<string, string> = {
  '80-100': 'Polish Only',
  '60-79':  'Stone Repair',
  '40-59':  'Partial Recut',
  '18-39':  'Full Recut',
  '0-17':   'No Recut Recommended',
};

function ScoreRing({ pct, color }: { pct: number; color: string }) {
  const r      = 40;
  const circ   = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="wiz-score-ring">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--bdr2)" strokeWidth="5" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 50 50)" />
      </svg>
      <div className="wiz-score-num" style={{ color, fontSize: '28px' }}>{pct}</div>
    </div>
  );
}

export default function WizardResultsPanel3({
  open, onClose, onCreateServiceRequest,
}: WizardResultsPanelProps) {
  const { elementRef, touchHandlers } = useSwipeDownToClose({ onClose });

  const [results,        setResults]        = useState<WizardResult[]>([]);
  const [loading,        setLoading]        = useState(true);
  // FIX 4: track which result is selected for the drawer
  const [selectedResult, setSelectedResult] = useState<WizardResult | null>(null);

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
    if (ok) {
      setResults(prev => prev.filter(r => r.id !== id));
      setSelectedResult(null);
    }
  };

  return (
    <>
      <div ref={elementRef} className={`slide-panel${open ? ' open' : ''}`}>
        <div className="panel-header" {...touchHandlers}>
          <span className="panel-title">Wizard Results</span>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-muted)' }}>Loading...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="wiz-empty">
            <div className="wiz-empty-title">No saved results yet.</div>
            <div className="wiz-empty-sub">
              Complete the Cut Feasibility Wizard and save your results to see them here.
            </div>
            <a href="/feasibility-check" className="wiz-empty-link">Open Wizard →</a>
          </div>
        ) : (
          <div className="wiz-grid">
            {results.map(r => {
              const color = BAND_COLOR[r.band] ?? '#e7e5e4';
              const label = BAND_LABEL[r.band] ?? r.recommendation;
              const pct   = Math.round(r.feasibility_percent);
              const stone = [r.stone_variety, r.stone_species].filter(Boolean).join(' ') || 'Unnamed stone';
              const date  = new Date(r.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              });
              const weight = r.stone_weight_ct ? `${r.stone_weight_ct}ct` : '—ct';
              return (
                // FIX 4: onClick opens the drawer instead of doing nothing
                <div
                  key={r.id}
                  className="wiz-thumb"
                  style={{ borderColor: color + '80', cursor: 'pointer' }}
                  onClick={() => setSelectedResult(r)}
                >
                  <ScoreRing pct={pct} color={color} />
                  <div className="wiz-band-label" style={{ color }}>{label}</div>
                  <div className="wiz-stone">
                    {stone} · {weight}<br />{r.stone_cut || 'Unknown'}
                  </div>
                  <div className="wiz-date">{date}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FIX 4: The wizard result drawer — slides in from the right */}
      <WizardResultDrawer3
        open={selectedResult !== null}
        result={selectedResult}
        onClose={() => setSelectedResult(null)}
        onCreateServiceRequest={onCreateServiceRequest}
      />
    </>
  );
}
