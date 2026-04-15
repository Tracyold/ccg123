// components/account/mobile/tiles/3FeasibilityTile.tsx
// Shows the 3 most recent wizard results with score rings.

interface WizardResult {
  id:                  string;
  feasibility_percent: number;
  recommendation:      string;
  stone_variety?:      string;
  stone_species?:      string;
  created_at:          string;
}

interface FeasibilityTileProps {
  results: WizardResult[];
  onClick: () => void;
}

function getBandColor(pct: number): string {
  if (pct >= 80) return '#38bdf8';
  if (pct >= 60) return '#4ec994';
  if (pct >= 40) return '#a3e635';
  if (pct >= 18) return '#94a3b8';
  return '#f87171';
}

function ScoreRing({ pct }: { pct: number }) {
  const color = getBandColor(pct);
  const r     = 14;
  const circ  = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--bdr2)" strokeWidth="2" />
        <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="2"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 18 18)" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color,
      }}>
        {pct}%
      </div>
    </div>
  );
}

export default function FeasibilityTile3({ results, onClick }: FeasibilityTileProps) {
  const recent = results.slice(0, 3);

  return (
    <div
      className="tile dim"
      style={{ minHeight: 'auto', cursor: 'pointer', padding: 16, flexDirection: 'column', gap: 12 } as React.CSSProperties}
      onClick={onClick}
    >
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 7.5,
        letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)',
      }}>
        Recent Wizard Results
      </div>

      {recent.length === 0 ? (
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No results yet -- run the wizard to get started
        </div>
      ) : recent.map(r => {
        const pct   = Math.round(r.feasibility_percent);
        const stone = [r.stone_variety, r.stone_species].filter(Boolean).join(' ') || 'Unknown stone';
        const date  = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ScoreRing pct={pct} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text)' }}>
                {r.recommendation}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-muted)' }}>
                {stone} · {date}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}