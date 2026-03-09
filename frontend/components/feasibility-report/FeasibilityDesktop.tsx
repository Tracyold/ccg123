import { precut, postcut } from './shared-feasibility';

function SeverityBadge({ level }: { level: string }) {
  const colors: Record<string, string> = { Low: 'rgba(100,200,120,0.15)', Moderate: 'rgba(220,160,60,0.15)', High: 'rgba(220,80,80,0.15)' };
  const text: Record<string, string> = { Low: 'rgba(100,200,120,0.9)', Moderate: 'rgba(220,160,60,0.9)', High: 'rgba(220,80,80,0.9)' };
  return <span style={{ display: 'inline-block', padding: '2px 8px', background: colors[level] || 'var(--border)', color: text[level] || 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: '2px' }}>{level}</span>;
}

function ResultBadge({ result }: { result: string }) {
  const isGood = ['Resolved', 'Improved', 'Excellent'].includes(result);
  return <span style={{ display: 'inline-block', padding: '2px 8px', background: isGood ? 'rgba(100,200,120,0.1)' : 'rgba(180,180,180,0.08)', color: isGood ? 'rgba(100,200,120,0.9)' : 'rgba(180,180,180,0.6)', fontFamily: 'var(--font-ui)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: '2px' }}>{result}</span>;
}

const SL = { fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: 'rgba(212,175,55,0.9)', marginBottom: '12px', marginTop: '32px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' };
const FL = { fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'rgba(100,160,220,0.9)', marginBottom: '4px' };
const FV = { fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text)', marginBottom: '17px' };
const TH = { fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(100,160,220,0.9)', padding: '8px 10px', borderBottom: '1px solid var(--border)', textAlign: 'left' as const };
const TC = { fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text)', padding: '10px', borderBottom: '1px solid var(--border)', verticalAlign: 'top' as const };

const CARD: React.CSSProperties = { background: 'var(--bg-deep)', border: '1px solid #d4af37', padding: '48px', width: '100%' };

export default function FeasibilityDesktop() {
  return (
    <>
      <style>{`
        .fd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: flex-start; }
        .fd-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 1px solid #d4af37; margin-bottom: 8px; }
        .fd-gem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; }
        .fd-sym-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .fd-plot { background: rgba(0,0,0,0.4); border: 1px solid var(--border); padding: 20px; position: relative; min-height: 140px; }
        .fd-plot-label { font-family: 'Montserrat', sans-serif; font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(100,160,220,0.85); position: absolute; top: 10px; left: 12px; }
        .fd-plot-shape { display: flex; align-items: center; justify-content: center; height: 100px; }
        .fd-option { padding: 16px; border: 1px solid var(--border); margin-bottom: 8px; background: rgba(255,255,255,0.02); }
        .fd-option.rec { border-color: #d4af37; background: rgba(212,175,55,0.04); }
        .fd-disclaimer { margin-top: 32px; padding: 16px; border: 1px solid var(--border); background: rgba(255,255,255,0.02); font-family: 'Comfortaa', sans-serif; font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.7; }
      `}</style>

      <div className="fd-grid">
        {/* PRE-CUT */}
        <div style={CARD}>
          <div className="fd-header">
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.9)', marginBottom: '6px' }}>CCG Cut Feasibility Report</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '21px', color: 'var(--text)', lineHeight: 1.1, marginBottom: '4px' }}>Pre-Cut Evaluation</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text)' }}>Report #{precut.id}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={FL}>Date</p><p style={{ ...FV, marginBottom: '8px' }}>{precut.date}</p>
              <p style={FL}>Analyst</p><p style={FV}>{precut.analyst}</p>
            </div>
          </div>

          <p style={SL}>Gemstone Overview</p>
          <div className="fd-gem-grid">
            {[['Current Weight', precut.stone.currentWeight], ['Measurements', precut.stone.measurements], ['Current Shape / Style', precut.stone.currentShapeStyle]].map(([l, v]) => (
              <div key={l}><p style={FL}>{l}</p><p style={FV}>{v}</p></div>
            ))}
          </div>

          <p style={SL}>Current Condition Summary</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginBottom: '12px' }}><div><p style={FL}>Surface Condition</p><p style={FV}>{precut.condition.surfaceCondition}</p></div><div><p style={FL}>Structural Stability</p><p style={FV}>{precut.condition.structuralStability}</p></div></div><p style={FL}>Intake Notes</p><p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text)', lineHeight: 1.75, marginTop: '6px' }}>{precut.condition.intakeNotes}</p>

          <p style={SL}>Symbol Legend</p>
          <div className="fd-sym-grid">
            {precut.symbolLegend.map(s => (
              <div key={s.symbol} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '14px', color: 'rgba(212,175,55,0.7)', minWidth: '17px' }}>{s.symbol}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(100,160,220,0.9)', marginBottom: '1px' }}>{s.type}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text)' }}>{s.desc}</p>
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
                  <line x1="50" y1="14" x2="50" y2="86" stroke="var(--border)" strokeWidth="0.5" />
                  <line x1="6" y1="50" x2="94" y2="50" stroke="var(--border)" strokeWidth="0.5" />
                  <text x="72" y="28" fontSize="7" fill="rgba(100,160,220,0.7)" fontFamily="monospace">○</text>
                  <text x="18" y="55" fontSize="7" fill="rgba(212,175,55,0.7)" fontFamily="monospace">~</text>
                  <text x="50" y="90" fontSize="7" fill="rgba(212,175,55,0.7)" fontFamily="monospace">△</text>
                  <text x="50" y="18" fontSize="7" fill="rgba(212,175,55,0.7)" fontFamily="monospace">~</text>
                  <text x="48" y="10" fontSize="5" fill="var(--border)" fontFamily="monospace">12</text>
                  <text x="88" y="52" fontSize="5" fill="var(--border)" fontFamily="monospace">3</text>
                  <text x="48" y="97" fontSize="5" fill="var(--border)" fontFamily="monospace">6</text>
                  <text x="2" y="52" fontSize="5" fill="var(--border)" fontFamily="monospace">9</text>
                </svg>
              </div>
            </div>
            <div className="fd-plot">
              <span className="fd-plot-label">Pavilion — Pav Up</span>
              <div className="fd-plot-shape">
                <svg viewBox="0 0 100 100" width="90" height="90">
                  <ellipse cx="50" cy="50" rx="44" ry="36" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
                  <ellipse cx="50" cy="50" rx="10" ry="8" fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="0.5" />
                  <line x1="50" y1="14" x2="50" y2="86" stroke="var(--border)" strokeWidth="0.5" />
                  <line x1="6" y1="50" x2="94" y2="50" stroke="var(--border)" strokeWidth="0.5" />
                  <text x="44" y="48" fontSize="7" fill="rgba(100,160,220,0.7)" fontFamily="monospace">○○</text>
                  <text x="60" y="65" fontSize="7" fill="rgba(220,160,60,0.7)" fontFamily="monospace">≈</text>
                  <text x="48" y="10" fontSize="5" fill="var(--border)" fontFamily="monospace">12</text>
                  <text x="88" y="52" fontSize="5" fill="var(--border)" fontFamily="monospace">3</text>
                  <text x="48" y="97" fontSize="5" fill="var(--border)" fontFamily="monospace">6</text>
                  <text x="2" y="52" fontSize="5" fill="var(--border)" fontFamily="monospace">9</text>
                </svg>
              </div>
            </div>
          </div>

          <p style={SL}>Structural Observation Table</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <thead><tr>{['Feature', 'Location', 'Severity', 'View'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>{precut.structuralTable.map((r, i) => <tr key={i}><td style={TC}>{r.feature}</td><td style={TC}>{r.location}</td><td style={TC}><SeverityBadge level={r.severity} /></td><td style={TC}>{r.view}</td></tr>)}</tbody>
          </table>

          <p style={SL}>Conditional Factors</p>
          {precut.conditionals.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <span style={{ color: 'var(--gold)', fontSize: '15px', marginTop: '2px', flexShrink: 0 }}>—</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text)', lineHeight: 1.7 }}>{c}</p>
            </div>
          ))}

          <p style={SL}>Cutting Approach Options</p>
          {precut.options.map((o, i) => (
            <div key={i} className={`fd-option${i === 1 ? ' rec' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.1em' }}>{o.label}</p>
                {i === 1 && <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>Recommended</span>}
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text)', lineHeight: 1.7 }}>{o.desc}</p>
            </div>
          ))}

          <p style={SL}>Summary Evaluation</p>
          <p style={FL}>Overall Assessment</p><p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text)', lineHeight: 1.75, marginTop: '6px', marginBottom: '16px' }}>{precut.summary.assessment}</p><p style={FL}>Recommended Direction</p><p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text)', lineHeight: 1.75, marginTop: '6px' }}>{precut.summary.recommendation}</p>
          <div className="fd-disclaimer">This report is an analytical evaluation only and does not constitute a price quote, guarantee of outcome, or appraisal. All observations are based on visual and optical examination under standard conditions. CCG Cut Feasibility Reports are the proprietary product of Cutting Corners Gems.</div>
        </div>

        {/* POST-CUT */}
        <div style={CARD}>
          <div className="fd-header">
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px' }}>CCG Cut Feasibility Report</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '21px', color: 'var(--text)', lineHeight: 1.1, marginBottom: '4px' }}>Post-Cut Change Report</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text)' }}>Report #{postcut.id}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={FL}>Date</p><p style={{ ...FV, marginBottom: '8px' }}>{postcut.date}</p>
              <p style={FL}>Analyst</p><p style={FV}>{postcut.analyst}</p>
            </div>
          </div>

          <p style={SL}>Before & After</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', marginBottom: '8px' }}>
            <div style={{ padding: '17px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '10px' }}>Before</p>
              {[['Weight', postcut.overview.originalWeight], ['Measurements', postcut.overview.originalMeasurements], ['Cut', postcut.overview.originalShapeStyle]].map(([l, v]) => <div key={l}><p style={FL}>{l}</p><p style={FV}>{v}</p></div>)}
            </div>
            <div style={{ padding: '17px', background: '#d4af37', border: '1px solid #d4af37' }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '10px' }}>After</p>
              {[['Weight', postcut.overview.finalWeight], ['Measurements', postcut.overview.finalMeasurements], ['Cut', postcut.overview.finalShapeStyle]].map(([l, v]) => <div key={l}><p style={FL}>{l}</p><p style={FV}>{v}</p></div>)}
            </div>
          </div>

          <div style={{ padding: '16px 20px', background: 'rgba(100,200,120,0.05)', border: '1px solid rgba(100,200,120,0.15)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ ...FL, marginBottom: '4px' }}>Final Yield</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'rgba(100,200,120,0.9)', lineHeight: 1 }}>{postcut.weightChange.yieldPercent}</p>
            </div>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(100,200,120,0.7)', padding: '4px 10px', border: '1px solid rgba(100,200,120,0.2)' }}>{postcut.weightChange.category}</span>
          </div>

          <p style={SL}>Primary Cutting Objectives</p>
          {postcut.beforeAfter.objectives.map((o, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <span style={{ color: 'var(--gold)', fontSize: '15px', marginTop: '2px', flexShrink: 0 }}>—</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text)', lineHeight: 1.65 }}>{o}</p>
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
                  <ellipse cx="50" cy="50" rx="44" ry="36" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="3,2" />
                  <ellipse cx="50" cy="50" rx="20" ry="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="2,2" />
                  <text x="72" y="28" fontSize="7" fill="rgba(100,160,220,0.5)" fontFamily="monospace">○</text>
                  <text x="18" y="55" fontSize="7" fill="#d4af37" fontFamily="monospace">~</text>
                  <text x="50" y="90" fontSize="7" fill="#d4af37" fontFamily="monospace">△</text>
                  <text x="50" y="18" fontSize="7" fill="#d4af37" fontFamily="monospace">~</text>
                </svg>
              </div>
            </div>
            <div className="fd-plot">
              <span className="fd-plot-label">After — Crown</span>
              <div className="fd-plot-shape">
                <svg viewBox="0 0 100 100" width="90" height="90">
                  <ellipse cx="50" cy="50" rx="44" ry="36" fill="none" stroke="#d4af37" strokeWidth="1" />
                  <ellipse cx="50" cy="50" rx="20" ry="14" fill="none" stroke="#d4af37" strokeWidth="0.5" />
                  <text x="72" y="28" fontSize="7" fill="rgba(100,160,220,0.5)" fontFamily="monospace">○</text>
                </svg>
              </div>
            </div>
          </div>

          <p style={SL}>Optical Performance Observation</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <thead><tr>{['Aspect', 'Rating', 'Note'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>{postcut.optical.map((r, i) => <tr key={i}><td style={TC}>{r.aspect}</td><td style={TC}><span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--gold)', fontWeight: 600 }}>{r.rating}</span></td><td style={TC}>{r.note}</td></tr>)}</tbody>
          </table>

          <p style={SL}>Documentation Record</p>
          {[['Before Photos', postcut.documentation.beforePhotos], ['After Photos', postcut.documentation.afterPhotos], ['Plot Maps', postcut.documentation.plotMaps], ['Client Approval', postcut.documentation.clientApproval]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(100,160,220,0.9)' }}>{l}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: v === 'Yes' ? 'rgba(100,200,120,0.9)' : 'rgba(220,80,80,0.9)' }}>{v}</p>
            </div>
          ))}
          <div className="fd-disclaimer">This report documents the completed cutting service and is issued as a permanent record. Observations reflect conditions at time of completion. CCG Cut Feasibility Reports are the proprietary product of Cutting Corners Gems.</div>
        </div>
      </div>
    </>
  );
}
