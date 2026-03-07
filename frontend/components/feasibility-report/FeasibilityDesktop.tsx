import { precut, postcut } from './shared-feasibility';

function SeverityBadge({ level }: { level: string }) {
  const colors: Record<string, string> = { Low: 'rgba(100,200,120,0.15)', Moderate: 'rgba(220,160,60,0.15)', High: 'rgba(220,80,80,0.15)' };
  const text: Record<string, string> = { Low: 'rgba(100,200,120,0.9)', Moderate: 'rgba(220,160,60,0.9)', High: 'rgba(220,80,80,0.9)' };
  return <span style={{ display: 'inline-block', padding: '2px 8px', background: colors[level] || 'rgba(255,255,255,0.05)', color: text[level] || 'rgba(255,255,255,0.5)', fontFamily: 'Montserrat, sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: '2px' }}>{level}</span>;
}

function ResultBadge({ result }: { result: string }) {
  const isGood = ['Resolved', 'TIR achieved', 'Improved', 'Excellent'].includes(result);
  return <span style={{ display: 'inline-block', padding: '2px 8px', background: isGood ? 'rgba(100,200,120,0.1)' : 'rgba(180,180,180,0.08)', color: isGood ? 'rgba(100,200,120,0.9)' : 'rgba(180,180,180,0.6)', fontFamily: 'Montserrat, sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: '2px' }}>{result}</span>;
}

const SL = { fontFamily: 'Montserrat, sans-serif', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: 'rgba(212,175,55,0.55)', marginBottom: '12px', marginTop: '32px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' };
const FL = { fontFamily: 'Montserrat, sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', marginBottom: '3px' };
const FV = { fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '14px' };
const TH = { fontFamily: 'Montserrat, sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'left' as const };
const TC = { fontFamily: 'Montserrat, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.6)', padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'top' as const };

const CARD: React.CSSProperties = { background: '#0D0D0D', border: '1px solid rgba(212,175,55,0.15)', padding: '48px', width: '100%' };

export default function FeasibilityDesktop() {
  return (
    <>
      <style>{`
        .fd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: flex-start; }
        .fd-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 1px solid rgba(212,175,55,0.2); margin-bottom: 8px; }
        .fd-gem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; }
        .fd-sym-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .fd-plot { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); padding: 20px; position: relative; min-height: 140px; }
        .fd-plot-label { font-family: 'Montserrat', sans-serif; font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.2); position: absolute; top: 10px; left: 12px; }
        .fd-plot-shape { display: flex; align-items: center; justify-content: center; height: 100px; }
        .fd-recovery { height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; margin: 12px 0 6px; position: relative; }
        .fd-recovery-fill { position: absolute; height: 100%; background: linear-gradient(to right, rgba(212,175,55,0.4), rgba(212,175,55,0.8)); border-radius: 3px; }
        .fd-option { padding: 16px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 8px; background: rgba(255,255,255,0.02); }
        .fd-option.rec { border-color: rgba(212,175,55,0.25); background: rgba(212,175,55,0.04); }
        .fd-disclaimer { margin-top: 32px; padding: 16px; border: 1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.02); font-family: 'Montserrat', sans-serif; font-size: 9px; color: rgba(255,255,255,0.2); line-height: 1.7; }
      `}</style>

      <div className="fd-grid">
        {/* PRE-CUT */}
        <div style={CARD}>
          <div className="fd-header">
            <div>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '8px', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '6px' }}>CCG Cut Feasibility Report</p>
              <p style={{ fontFamily: 'Oranienbaum, serif', fontSize: '22px', color: '#FAFAFA', lineHeight: 1.1, marginBottom: '4px' }}>Pre-Cut Evaluation</p>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Report #{precut.id}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={FL}>Date</p><p style={{ ...FV, marginBottom: '8px' }}>{precut.date}</p>
              <p style={FL}>Analyst</p><p style={FV}>{precut.analyst}</p>
            </div>
          </div>

          <p style={SL}>Gemstone Overview</p>
          <div className="fd-gem-grid">
            {[['Species', precut.gem.species], ['Variety', precut.gem.variety], ['Origin', precut.gem.origin], ['Weight', precut.gem.weight], ['Measurements', precut.gem.measurements], ['Color', precut.gem.color], ['Transparency', precut.gem.transparency], ['Current Cut', precut.gem.currentCut]].map(([l, v]) => (
              <div key={l}><p style={FL}>{l}</p><p style={FV}>{v}</p></div>
            ))}
          </div>

          <p style={SL}>Current Condition Summary</p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: '8px' }}>{precut.condition}</p>

          <p style={SL}>Symbol Legend</p>
          <div className="fd-sym-grid">
            {precut.symbolLegend.map(s => (
              <div key={s.symbol} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '14px', color: 'rgba(212,175,55,0.7)', minWidth: '16px' }}>{s.symbol}</span>
                <div>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '1px' }}>{s.type}</p>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.55)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p style={SL}>Structural Plots</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div className="fd-plot">
              <span className="fd-plot-label">Crown — Table Up</span>
              <div className="fd-plot-shape">
                <svg viewBox="0 0 100 100" width="90" height="90">
                  <ellipse cx="50" cy="50" rx="44" ry="36" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
                  <ellipse cx="50" cy="50" rx="20" ry="14" fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="0.5" />
                  <line x1="50" y1="14" x2="50" y2="86" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  <line x1="6" y1="50" x2="94" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  <text x="72" y="28" fontSize="7" fill="rgba(100,160,220,0.7)" fontFamily="monospace">○</text>
                  <text x="18" y="55" fontSize="7" fill="rgba(212,175,55,0.7)" fontFamily="monospace">~</text>
                  <text x="50" y="90" fontSize="7" fill="rgba(212,175,55,0.7)" fontFamily="monospace">△</text>
                  <text x="50" y="18" fontSize="7" fill="rgba(212,175,55,0.7)" fontFamily="monospace">~</text>
                  <text x="48" y="10" fontSize="5" fill="rgba(255,255,255,0.15)" fontFamily="monospace">12</text>
                  <text x="88" y="52" fontSize="5" fill="rgba(255,255,255,0.15)" fontFamily="monospace">3</text>
                  <text x="48" y="97" fontSize="5" fill="rgba(255,255,255,0.15)" fontFamily="monospace">6</text>
                  <text x="2" y="52" fontSize="5" fill="rgba(255,255,255,0.15)" fontFamily="monospace">9</text>
                </svg>
              </div>
            </div>
            <div className="fd-plot">
              <span className="fd-plot-label">Pavilion — Pav Up</span>
              <div className="fd-plot-shape">
                <svg viewBox="0 0 100 100" width="90" height="90">
                  <ellipse cx="50" cy="50" rx="44" ry="36" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
                  <ellipse cx="50" cy="50" rx="10" ry="8" fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="0.5" />
                  <line x1="50" y1="14" x2="50" y2="86" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  <line x1="6" y1="50" x2="94" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  <text x="44" y="48" fontSize="7" fill="rgba(100,160,220,0.7)" fontFamily="monospace">○○</text>
                  <text x="60" y="65" fontSize="7" fill="rgba(220,160,60,0.7)" fontFamily="monospace">≈</text>
                  <text x="48" y="10" fontSize="5" fill="rgba(255,255,255,0.15)" fontFamily="monospace">12</text>
                  <text x="88" y="52" fontSize="5" fill="rgba(255,255,255,0.15)" fontFamily="monospace">3</text>
                  <text x="48" y="97" fontSize="5" fill="rgba(255,255,255,0.15)" fontFamily="monospace">6</text>
                  <text x="2" y="52" fontSize="5" fill="rgba(255,255,255,0.15)" fontFamily="monospace">9</text>
                </svg>
              </div>
            </div>
          </div>

          <p style={SL}>Structural Observation Table</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <thead><tr>{['Feature', 'Location', 'Severity', 'View'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>{precut.structuralTable.map((r, i) => <tr key={i}><td style={TC}>{r.feature}</td><td style={TC}>{r.location}</td><td style={TC}><SeverityBadge level={r.severity} /></td><td style={TC}>{r.view}</td></tr>)}</tbody>
          </table>

          <p style={SL}>Estimated Recovery Range</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Conservative</span>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Optimal</span>
          </div>
          <div className="fd-recovery">
            <div className="fd-recovery-fill" style={{ left: `${precut.recovery.low}%`, width: `${precut.recovery.high - precut.recovery.low}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px', color: 'rgba(212,175,55,0.8)', fontWeight: 600 }}>{precut.recovery.low}%</span>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px', color: 'rgba(212,175,55,0.8)', fontWeight: 600 }}>{precut.recovery.high}%</span>
          </div>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.65 }}>{precut.recovery.basis}</p>

          <p style={SL}>Conditional Factors</p>
          {precut.conditionals.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <span style={{ color: 'rgba(212,175,55,0.5)', fontSize: '10px', marginTop: '2px', flexShrink: 0 }}>—</span>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{c}</p>
            </div>
          ))}

          <p style={SL}>Cutting Approach Options</p>
          {precut.options.map((o, i) => (
            <div key={i} className={`fd-option${i === 1 ? ' rec' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em' }}>{o.label}</p>
                {i === 1 && <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.8)' }}>Recommended</span>}
              </div>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{o.desc}</p>
            </div>
          ))}

          <p style={SL}>Summary Evaluation</p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75 }}>{precut.summary}</p>
          <div className="fd-disclaimer">This report is an analytical evaluation only and does not constitute a price quote, guarantee of outcome, or appraisal. All observations are based on visual and optical examination under standard conditions. CCG Cut Feasibility Reports are the proprietary product of Cutting Corners Gems.</div>
        </div>

        {/* POST-CUT */}
        <div style={CARD}>
          <div className="fd-header">
            <div>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '8px', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '6px' }}>CCG Cut Feasibility Report</p>
              <p style={{ fontFamily: 'Oranienbaum, serif', fontSize: '22px', color: '#FAFAFA', lineHeight: 1.1, marginBottom: '4px' }}>Post-Cut Change Report</p>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Report #{postcut.id}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={FL}>Date</p><p style={{ ...FV, marginBottom: '8px' }}>{postcut.date}</p>
              <p style={FL}>Analyst</p><p style={FV}>{postcut.analyst}</p>
            </div>
          </div>

          <p style={SL}>Before & After</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', marginBottom: '8px' }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '10px' }}>Before</p>
              {[['Weight', postcut.before.weight], ['Measurements', postcut.before.measurements], ['Cut', postcut.before.cut]].map(([l, v]) => <div key={l}><p style={FL}>{l}</p><p style={FV}>{v}</p></div>)}
            </div>
            <div style={{ padding: '16px', background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.12)' }}>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', marginBottom: '10px' }}>After</p>
              {[['Weight', postcut.after.weight], ['Measurements', postcut.after.measurements], ['Cut', postcut.after.cut]].map(([l, v]) => <div key={l}><p style={FL}>{l}</p><p style={FV}>{v}</p></div>)}
            </div>
          </div>

          <div style={{ padding: '16px 20px', background: 'rgba(100,200,120,0.05)', border: '1px solid rgba(100,200,120,0.15)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ ...FL, marginBottom: '4px' }}>Final Yield</p>
              <p style={{ fontFamily: 'Oranienbaum, serif', fontSize: '28px', color: 'rgba(100,200,120,0.9)', lineHeight: 1 }}>{postcut.yield.value}%</p>
            </div>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(100,200,120,0.7)', padding: '4px 10px', border: '1px solid rgba(100,200,120,0.2)' }}>{postcut.yield.category}</span>
          </div>

          <p style={SL}>Primary Cutting Objectives</p>
          {postcut.objectives.map((o, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <span style={{ color: 'rgba(212,175,55,0.5)', fontSize: '10px', marginTop: '2px', flexShrink: 0 }}>—</span>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{o}</p>
            </div>
          ))}

          <p style={SL}>Structural Change Table</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <thead><tr>{['Feature Observed', 'Action Taken', 'Result'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>{postcut.changeTable.map((r, i) => <tr key={i}><td style={TC}>{r.feature}</td><td style={TC}>{r.action}</td><td style={TC}><ResultBadge result={r.result} /></td></tr>)}</tbody>
          </table>

          <p style={SL}>Structural Plots — Before & After</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div className="fd-plot">
              <span className="fd-plot-label">Before — Crown</span>
              <div className="fd-plot-shape">
                <svg viewBox="0 0 100 100" width="90" height="90">
                  <ellipse cx="50" cy="50" rx="44" ry="36" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3,2" />
                  <ellipse cx="50" cy="50" rx="20" ry="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="2,2" />
                  <text x="72" y="28" fontSize="7" fill="rgba(100,160,220,0.5)" fontFamily="monospace">○</text>
                  <text x="18" y="55" fontSize="7" fill="rgba(212,175,55,0.5)" fontFamily="monospace">~</text>
                  <text x="50" y="90" fontSize="7" fill="rgba(212,175,55,0.5)" fontFamily="monospace">△</text>
                  <text x="50" y="18" fontSize="7" fill="rgba(212,175,55,0.5)" fontFamily="monospace">~</text>
                </svg>
              </div>
            </div>
            <div className="fd-plot">
              <span className="fd-plot-label">After — Crown</span>
              <div className="fd-plot-shape">
                <svg viewBox="0 0 100 100" width="90" height="90">
                  <ellipse cx="50" cy="50" rx="44" ry="36" fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="1" />
                  <ellipse cx="50" cy="50" rx="20" ry="14" fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="0.5" />
                  <text x="72" y="28" fontSize="7" fill="rgba(100,160,220,0.5)" fontFamily="monospace">○</text>
                </svg>
              </div>
            </div>
          </div>

          <p style={SL}>Optical Performance Observation</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <thead><tr>{['Aspect', 'Rating', 'Note'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>{postcut.optical.map((r, i) => <tr key={i}><td style={TC}>{r.aspect}</td><td style={TC}><span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '10px', color: 'rgba(212,175,55,0.8)', fontWeight: 600 }}>{r.rating}</span></td><td style={TC}>{r.note}</td></tr>)}</tbody>
          </table>

          <p style={SL}>Documentation Record</p>
          {postcut.documentation.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <span style={{ color: 'rgba(100,200,120,0.5)', fontSize: '10px', marginTop: '2px', flexShrink: 0 }}>✓</span>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{d}</p>
            </div>
          ))}
          <div className="fd-disclaimer">This report documents the completed cutting service and is issued as a permanent record. Observations reflect conditions at time of completion. CCG Cut Feasibility Reports are the proprietary product of Cutting Corners Gems.</div>
        </div>
      </div>
    </>
  );
}
