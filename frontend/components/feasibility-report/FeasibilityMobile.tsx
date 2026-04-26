import { useState } from 'react';
import { precut, postcut } from './shared-feasibility';

function SeverityBadge({ level }: { level: string }) {
  const colors: Record<string, string> = { Minor: 'rgba(100,200,120,0.15)', Moderate: 'rgba(220,160,60,0.15)', Significant: 'rgba(220,100,60,0.15)', Critical: 'rgba(220,80,80,0.15)' };
  const text: Record<string, string> = { Minor: 'rgba(100,200,120,0.9)', Moderate: 'rgba(220,160,60,0.9)', Significant: 'rgba(220,100,60,0.9)', Critical: 'rgba(220,80,80,0.9)' };
  return <span style={{ display: 'inline-block', padding: '3px 10px', background: colors[level] || 'var(--border)', color: text[level] || 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: '2px' }}>{level}</span>;
}

function ResultBadge({ result }: { result: string }) {
  const isGood = ['Resolved', 'Improved', 'Left Intact'].includes(result);
  return <span style={{ display: 'inline-block', padding: '3px 10px', background: isGood ? 'rgba(100,200,120,0.1)' : 'rgba(180,180,180,0.08)', color: isGood ? 'rgba(100,200,120,0.9)' : 'rgba(180,180,180,0.75)', fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: '2px' }}>{result}</span>;
}

const SL = { fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: 'rgba(212,175,55,0.9)', marginBottom: '14px', marginTop: '28px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.07)' };
const FL = { fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--accent)', marginBottom: '4px' };
const FV = { fontFamily: 'var(--font-body)', fontSize: '1.0625rem', color: 'var(--text)', marginBottom: '17px' };
const TH = { fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--accent)', padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.07)', textAlign: 'left' as const };
const TC = { fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--text)', padding: '9px 8px', borderBottom: '1px solid rgba(30,60,120,0.4)', verticalAlign: 'top' as const };
const BODY = { fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--text)', lineHeight: 1.8 };

export default function FeasibilityMobile() {
  const [activeTab, setActiveTab] = useState<'precut' | 'postcut'>('precut');

  return (
    <>
      <style>{`
        .fm-tabs { display: flex; gap: 2px; margin-bottom: 28px; }
        .fm-tab { flex: 1; padding: 15px 0; text-align: center; font-family: var(--font-ui); font-size: 0.9375rem; letter-spacing: 0.15em; text-transform: uppercase; border: 1px solid var(--border); background: transparent; color: var(--text); cursor: pointer; transition: all 200ms; }
        .fm-tab.active { border-color: #d4af37; color: rgba(212,175,55,0.9); background: rgba(212,175,55,0.04); }
        .fm-card { background: var(--bg-deep); border: 1px solid var(--border); padding: 28px 22px; }
        .fm-plot { background: rgba(0,0,0,0.4); border: 1px solid var(--border); padding: 18px; position: relative; min-height: 160px; margin-bottom: 8px; }
        .fm-plot-label { font-family: var(--font-ui); font-size: 0.8125rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; display: block; }
        .fm-plot-shape { display: flex; align-items: center; justify-content: center; }
        .fm-option { padding: 15px; border: 1px solid var(--border); margin-bottom: 9px; background: var(--bg-card); }
        .fm-option.rec { border-color: #d4af37; background: rgba(212,175,55,0.04); }
        .fm-disclaimer { margin-top: 25px; padding: 15px; border: 1px solid var(--border); background: var(--bg-card); font-family: var(--font-body); font-size: 0.8125rem; color: var(--text-muted); line-height: 1.75; }
      `}</style>

      <div className="fm-tabs">
        <button className={`fm-tab${activeTab === 'precut' ? ' active' : ''}`} onClick={() => setActiveTab('precut')}>Pre-Cut</button>
        <button className={`fm-tab${activeTab === 'postcut' ? ' active' : ''}`} onClick={() => setActiveTab('postcut')}>Post-Cut</button>
      </div>

      {activeTab === 'precut' && (
        <div className="fm-card">
          {/* Header */}
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.9)', marginBottom: '6px' }}>CCG Cut Feasibility Report</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3125rem, 6vw, 1.6875rem)', color: 'var(--text)', lineHeight: 1.1, marginBottom: '6px' }}>Pre-Cut Evaluation</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Report #{precut.id} · {precut.date} · {precut.analyst}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', marginBottom: '8px' }}>
            <div><p style={FL}>Client</p><p style={FV}>{precut.clientName}</p></div>
            <div><p style={FL}>Stone ID</p><p style={FV}>{precut.stoneId}</p></div>
          </div>

          {/* 1. Gemstone Overview */}
          <p style={SL}>1 — Gemstone Overview</p>
          {[
            ['Current Weight', precut.stone.currentWeight],
            ['Measurements', precut.stone.measurements],
            ['Current Shape / Style', precut.stone.currentShapeStyle],
          ].map(([l, v]) => <div key={l}><p style={FL}>{l}</p><p style={FV}>{v}</p></div>)}
          <p style={FL}>Orientation Reference</p>
          <p style={{ ...FV, marginBottom: '0' }}>{precut.stone.orientationReference}</p>

          {/* 2. Condition */}
          <p style={SL}>2 — Current Condition Summary</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', marginBottom: '16px' }}>
            <div><p style={FL}>Surface Condition</p><p style={FV}>{precut.condition.surfaceCondition}</p></div>
            <div><p style={FL}>Structural Stability</p><p style={FV}>{precut.condition.structuralStability}</p></div>
          </div>
          <p style={FL}>General Intake Notes</p>
          <p style={{ ...BODY, marginTop: '6px' }}>{precut.condition.intakeNotes}</p>

          {/* 3. Symbol Legend */}
          <p style={SL}>3 — Symbol Legend</p>
          {precut.symbolLegend.map(s => (
            <div key={s.symbol} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '1.0625rem', color: 'var(--gold)', minWidth: '21px' }}>{s.symbol}</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--text)' }}>
                <span style={{ color: 'var(--accent)', marginRight: '8px', fontSize: '0.8125rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.type}</span>
                {s.desc}
              </p>
            </div>
          ))}

          {/* 4 + 5. Plots */}
          <p style={SL}>4 — Crown Plot</p>
          <div className="fm-plot">
            <span className="fm-plot-label">Crown — Table Up</span>
            <div className="fm-plot-shape">
              <svg viewBox="0 0 100 100" width="100%" height="180">
                <ellipse cx="50" cy="50" rx="44" ry="36" fill="none" stroke="rgba(212,175,55,0.7)" strokeWidth="1.5" />
                <ellipse cx="50" cy="50" rx="20" ry="14" fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="1" />
                <line x1="50" y1="14" x2="50" y2="86" stroke="var(--border)" strokeWidth="0.5" />
                <line x1="6" y1="50" x2="94" y2="50" stroke="var(--border)" strokeWidth="0.5" />
                <text x="72" y="28" fontSize="9" fill="rgba(100,160,220,0.95)" fontFamily="monospace">○</text>
                <text x="18" y="55" fontSize="9" fill="rgba(212,175,55,0.95)" fontFamily="monospace">~</text>
                <text x="50" y="90" fontSize="9" fill="rgba(212,175,55,0.95)" fontFamily="monospace">△</text>
                <text x="50" y="18" fontSize="9" fill="rgba(212,175,55,0.95)" fontFamily="monospace">~</text>
                <text x="47" y="9" fontSize="6" fill="var(--text-muted)" fontFamily="monospace">12</text>
                <text x="87" y="52" fontSize="6" fill="var(--text-muted)" fontFamily="monospace">3</text>
                <text x="47" y="98" fontSize="6" fill="var(--text-muted)" fontFamily="monospace">6</text>
                <text x="1" y="52" fontSize="6" fill="var(--text-muted)" fontFamily="monospace">9</text>
              </svg>
            </div>
          </div>

          <p style={SL}>5 — Pavilion Plot</p>
          <div className="fm-plot">
            <span className="fm-plot-label">Pavilion — Pav Up</span>
            <div className="fm-plot-shape">
              <svg viewBox="0 0 100 100" width="100%" height="180">
                <ellipse cx="50" cy="50" rx="44" ry="36" fill="none" stroke="rgba(212,175,55,0.7)" strokeWidth="1.5" />
                <ellipse cx="50" cy="50" rx="10" ry="8" fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="1" />
                <line x1="50" y1="14" x2="50" y2="86" stroke="var(--border)" strokeWidth="0.5" />
                <line x1="6" y1="50" x2="94" y2="50" stroke="var(--border)" strokeWidth="0.5" />
                <text x="44" y="48" fontSize="9" fill="rgba(100,160,220,0.95)" fontFamily="monospace">○○</text>
                <text x="60" y="65" fontSize="9" fill="rgba(150,150,150,0.9)" fontFamily="monospace">≈</text>
                <text x="47" y="9" fontSize="6" fill="var(--text-muted)" fontFamily="monospace">12</text>
                <text x="87" y="52" fontSize="6" fill="var(--text-muted)" fontFamily="monospace">3</text>
                <text x="47" y="98" fontSize="6" fill="var(--text-muted)" fontFamily="monospace">6</text>
                <text x="1" y="52" fontSize="6" fill="var(--text-muted)" fontFamily="monospace">9</text>
              </svg>
            </div>
          </div>

          {/* 6. Side Profile */}
          <p style={SL}>6 — Side / Profile Observation</p>
          <div className="fm-plot">
            <span className="fm-plot-label">Profile View</span>
            <div className="fm-plot-shape">
              <svg viewBox="0 0 200 80" width="100%" height="80">
                <path d="M 20 20 Q 100 10 180 20 L 190 25 L 100 70 L 10 25 Z" fill="none" stroke="rgba(212,175,55,0.6)" strokeWidth="1.5" />
                <line x1="20" y1="25" x2="180" y2="25" stroke="rgba(212,175,55,0.3)" strokeWidth="0.75" strokeDasharray="4,3" />
                <text x="85" y="19" fontSize="8" fill="var(--text-muted)" fontFamily="monospace">TABLE</text>
                <text x="2" y="28" fontSize="7" fill="rgba(255,255,255,0.3)" fontFamily="monospace">GIRDLE</text>
                <text x="90" y="68" fontSize="7" fill="rgba(255,255,255,0.3)" fontFamily="monospace">CULET</text>
              </svg>
            </div>
          </div>
          <p style={{ ...BODY, marginTop: '10px' }}>{precut.sideProfile}</p>

          {/* 7. Structural Table */}
          <p style={SL}>7 — Structural Observation Table</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <thead><tr>{['No', 'Feature', 'Severity'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>{precut.structuralTable.map((r, i) => (
              <tr key={i}>
                <td style={TC}>{i + 1}</td>
                <td style={TC}>{r.feature}<br /><span style={{ color: 'var(--accent)', fontSize: '0.8125rem' }}>{r.location} · {r.view}</span></td>
                <td style={TC}><SeverityBadge level={r.severity} /></td>
              </tr>
            ))}</tbody>
          </table>

          {/* 8. Recovery Range */}
          <p style={SL}>8 — Estimated Recovery Range</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', marginBottom: '12px' }}>
            <div><p style={FL}>Projected Range</p><p style={FV}>{precut.recovery.low}% — {precut.recovery.high}%</p></div>
            <div><p style={FL}>Basis</p><p style={FV}>{precut.recovery.basis}</p></div>
          </div>
          <p style={BODY}>{precut.recovery.notes}</p>

          {/* 9. Conditional Factors */}
          <p style={SL}>9 — Conditional Factors</p>
          <p style={{ ...BODY, marginBottom: '13px', color: 'var(--text-muted)' }}>High yield outcomes are more probable IF:</p>
          {precut.conditionals.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: '11px', marginBottom: '11px' }}>
              <span style={{ color: 'var(--gold)', fontSize: '0.9375rem', flexShrink: 0 }}>—</span>
              <p style={BODY}>{c}</p>
            </div>
          ))}

          {/* 10. Cutting Approach Options */}
          <p style={SL}>10 — Cutting Approach Options</p>
          {precut.options.map((o, i) => (
            <div key={i} className={`fm-option${i === 1 ? ' rec' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--gold)' }}>{o.label}</p>
                {i === 1 && <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--gold)' }}>Recommended</span>}
              </div>
              <p style={BODY}>{o.desc}</p>
            </div>
          ))}

          {/* 11. Summary */}
          <p style={SL}>11 — Summary Evaluation</p>
          <p style={FL}>Overall Assessment</p>
          <p style={{ ...BODY, marginTop: '6px', marginBottom: '17px' }}>{precut.summary.assessment}</p>
          <p style={FL}>Recommended Direction</p>
          <p style={{ ...BODY, marginTop: '6px' }}>{precut.summary.recommendation}</p>

          {/* 12. Analyst Notes */}
          <p style={SL}>12 — Analyst Notes</p>
          <p style={BODY}>{precut.analystNotes}</p>

          <div className="fm-disclaimer">This report provides gemstone evaluation information based on currently observable conditions at the time of examination. Internal structures may extend beyond visible boundaries. Material removal may reveal previously hidden structural features that alter yield, stability, or cutting approach. This report is analytical in function and does not constitute a price quote or guarantee of final outcome. CCG Cut Feasibility Reports are the proprietary product of Cutting Corners Gems.</div>
        </div>
      )}

      {activeTab === 'postcut' && (
        <div className="fm-card">
          {/* Header */}
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px' }}>CCG Cut Feasibility Report</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3125rem, 6vw, 1.6875rem)', color: 'var(--text)', lineHeight: 1.1, marginBottom: '6px' }}>Post-Cut Change Report</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Report #{postcut.id} · {postcut.date} · {postcut.analyst}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', marginBottom: '8px' }}>
            <div><p style={FL}>Client</p><p style={FV}>{postcut.clientName}</p></div>
            <div><p style={FL}>Original Report</p><p style={FV}>#{postcut.originalReportId}</p></div>
          </div>

          {/* 1. Final Overview */}
          <p style={SL}>1 — Final Gemstone Overview</p>
          {[
            ['Original Weight', postcut.overview.originalWeight],
            ['Final Weight', postcut.overview.finalWeight],
            ['Weight Loss', postcut.overview.weightLoss],
            ['Yield', postcut.overview.yieldPercent],
            ['Original Shape / Style', postcut.overview.originalShapeStyle],
            ['Final Shape / Style', postcut.overview.finalShapeStyle],
          ].map(([l, v]) => <div key={l}><p style={FL}>{l}</p><p style={FV}>{v}</p></div>)}

          {/* 2. Before/After Summary */}
          <p style={SL}>2 — Before / After Summary</p>
          <p style={FL}>Primary Objectives</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '9px 0 17px' }}>
            {postcut.beforeAfter.objectives.map((o, i) => (
              <span key={i} style={{ padding: '6px 13px', border: '1px solid var(--gold)', background: 'var(--gold)', fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', display: 'inline-block' }}>{o}</span>
            ))}
          </div>
          <p style={FL}>Summary Notes</p>
          <p style={{ ...BODY, marginTop: '6px' }}>{postcut.beforeAfter.summaryNotes}</p>

          {/* 3. Structural Change Table */}
          <p style={SL}>3 — Structural Change Table</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <thead><tr>{['#', 'Feature', 'Result'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>{postcut.changeTable.map((r, i) => (
              <tr key={i}>
                <td style={TC}>{i + 1}</td>
                <td style={TC}>{r.feature}<br /><span style={{ color: 'var(--accent)', fontSize: '0.8125rem' }}>{r.action}</span></td>
                <td style={TC}><ResultBadge result={r.result} /></td>
              </tr>
            ))}</tbody>
          </table>

          {/* 4. Original Plot */}
          <p style={SL}>4 — Original Structural Plot</p>
          <div className="fm-plot">
            <span className="fm-plot-label">Before — Crown</span>
            <div className="fm-plot-shape">
              <svg viewBox="0 0 100 100" width="100%" height="180">
                <ellipse cx="50" cy="50" rx="44" ry="36" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3,2" />
                <ellipse cx="50" cy="50" rx="20" ry="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="2,2" />
                <text x="72" y="28" fontSize="9" fill="rgba(100,160,220,0.7)" fontFamily="monospace">○</text>
                <text x="18" y="55" fontSize="9" fill="#d4af37" fontFamily="monospace">~</text>
                <text x="50" y="90" fontSize="9" fill="#d4af37" fontFamily="monospace">△</text>
                <text x="47" y="9" fontSize="6" fill="rgba(255,255,255,0.3)" fontFamily="monospace">12</text>
                <text x="87" y="52" fontSize="6" fill="rgba(255,255,255,0.3)" fontFamily="monospace">3</text>
                <text x="47" y="98" fontSize="6" fill="rgba(255,255,255,0.3)" fontFamily="monospace">6</text>
                <text x="1" y="52" fontSize="6" fill="rgba(255,255,255,0.3)" fontFamily="monospace">9</text>
              </svg>
            </div>
          </div>

          {/* 5. Final Plot */}
          <p style={SL}>5 — Final Structural Plot</p>
          <div className="fm-plot">
            <span className="fm-plot-label">After — Crown</span>
            <div className="fm-plot-shape">
              <svg viewBox="0 0 100 100" width="100%" height="180">
                <ellipse cx="50" cy="50" rx="44" ry="36" fill="none" stroke="#d4af37" strokeWidth="1.5" />
                <ellipse cx="50" cy="50" rx="20" ry="14" fill="none" stroke="#d4af37" strokeWidth="1" />
                <text x="72" y="28" fontSize="9" fill="rgba(100,160,220,0.6)" fontFamily="monospace">○</text>
                <text x="47" y="9" fontSize="6" fill="var(--text-muted)" fontFamily="monospace">12</text>
                <text x="87" y="52" fontSize="6" fill="var(--text-muted)" fontFamily="monospace">3</text>
                <text x="47" y="98" fontSize="6" fill="var(--text-muted)" fontFamily="monospace">6</text>
                <text x="1" y="52" fontSize="6" fill="var(--text-muted)" fontFamily="monospace">9</text>
              </svg>
            </div>
          </div>

          {/* 6. Structural Outcome */}
          <p style={SL}>6 — Structural Outcome Analysis</p>
          <p style={FL}>Damage Removed</p>
          <p style={{ ...BODY, marginTop: '6px', marginBottom: '17px' }}>{postcut.structuralOutcome.damageRemoved}</p>
          <p style={FL}>Remaining Features</p>
          <p style={{ ...BODY, marginTop: '6px', marginBottom: '17px' }}>{postcut.structuralOutcome.remainingFeatures}</p>
          <p style={FL}>Newly Exposed Features</p>
          <p style={{ ...BODY, marginTop: '6px', marginBottom: '17px' }}>{postcut.structuralOutcome.newlyExposed}</p>
          <p style={FL}>Structural Stability After Cutting</p>
          <p style={{ ...FV, marginTop: '6px' }}>{postcut.structuralOutcome.stability}</p>

          {/* 7. Optical Performance */}
          <p style={SL}>7 — Optical Performance Observation</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <thead><tr>{['Aspect', 'Rating'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>{postcut.optical.map((r, i) => (
              <tr key={i}>
                <td style={TC}>{r.aspect}<br /><span style={{ color: 'var(--accent)', fontSize: '0.8125rem' }}>{r.note}</span></td>
                <td style={TC}><span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--gold)', fontWeight: 600 }}>{r.rating}</span></td>
              </tr>
            ))}</tbody>
          </table>

          {/* 8. Weight Change Summary */}
          <p style={SL}>8 — Weight Change Summary</p>
          {[
            ['Original Weight', postcut.weightChange.original],
            ['Final Weight', postcut.weightChange.final],
            ['Weight Removed', postcut.weightChange.removed],
            ['Yield Percentage', postcut.weightChange.yieldPercent],
            ['Yield Category', postcut.weightChange.category],
          ].map(([l, v]) => <div key={l}><p style={FL}>{l}</p><p style={FV}>{v}</p></div>)}

          {/* 9. Final Notes */}
          <p style={SL}>9 — Final Notes</p>
          <p style={BODY}>{postcut.finalNotes}</p>

          {/* 10. Documentation Record */}
          <p style={SL}>10 — Documentation Record</p>
          {[
            ['Before Photos Captured', postcut.documentation.beforePhotos],
            ['After Photos Captured', postcut.documentation.afterPhotos],
            ['Plot Maps Completed', postcut.documentation.plotMaps],
            ['Client Approval Recorded', postcut.documentation.clientApproval],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid rgba(30,60,120,0.4)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--accent)' }}>{l}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', fontWeight: 600, color: v === 'Yes' ? 'rgba(100,200,120,0.9)' : 'rgba(220,80,80,0.9)' }}>{v}</p>
            </div>
          ))}

          <div className="fm-disclaimer">This report documents the structural and optical changes resulting from gemstone cutting or recutting. Observations are based on visual and microscopic examination at the time of documentation. The report records observed changes and outcomes but does not constitute a valuation or guarantee of market value. CCG Cut Feasibility Reports are the proprietary product of Cutting Corners Gems.</div>
        </div>
      )}
    </>
  );
}
