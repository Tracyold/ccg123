// components/account/mobile/tiles/3FeasibilityTile.tsx
// Shows the 3 most recent wizard results with score rings.

export interface WizardResult {
  id:                  string;
  feasibility_percent: number;
  recommendation:      string;
  stone_variety?:      string;
  stone_species?:      string;
  created_at:          string;
}

export interface FeasibilityTileProps {
  results: WizardResult[];
  onClick: () => void;
}

function getBandColor(pct: number): string {
  if (pct >= 80) return '#38bdf8';
  if (pct >= 60) return '#4ec994';
  if (pct >= 40) return '#a3e635';
  if (pct >= 18) return '#67e8f9';
  return '#f87171';
}

export function ScoreRing({ pct }: { pct: number }) {
  const color = getBandColor(pct);
  const r     = 16;
  const circ  = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 22 22)" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 0.6875rem, fontWeight: 700, color,
        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
      }}>
        {pct}
      </div>
    </div>
  );
}

export default function FeasibilityTile3({ results, onClick }: FeasibilityTileProps) {
  const recent = results.slice(0, 3);

  return (
    <div
      className="tile dim"
      style={{ minHeight: 'auto', cursor: 'pointer', padding: '22px 20px', flexDirection: 'column', gap: 16 } as React.CSSProperties}
      onClick={onClick}
    >
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 0.6875rem, letterSpacing: '0.25em',
        textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, opacity: 0.9
      }}>
        Recent Wizard Results
      </div>

      {recent.length === 0 ? (
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 0.9375rem, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No results yet -- run the wizard to get started
        </div>
      ) : recent.map(r => {
        const pct   = Math.round(r.feasibility_percent);
        const stone = [r.stone_variety, r.stone_species].filter(Boolean).join(' ') || 'Unknown stone';
        const date  = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ScoreRing pct={pct} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 1.0rem, color: 'var(--text)', fontWeight: 500 }}>
                {r.recommendation}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 0.8125rem, color: 'var(--text-muted)', marginTop: 2 }}>
                {stone} · {date}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
