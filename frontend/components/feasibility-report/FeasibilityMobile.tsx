import { useState } from 'react';
import { precut, postcut } from './shared-feasibility';

function SeverityBadge({ level }: { level: string }) {
  const colors: Record<string, string> = { Low: 'rgba(100,200,120,0.15)', Moderate: 'rgba(220,160,60,0.15)', High: 'rgba(220,80,80,0.15)' };
  const text: Record<string, string> = { Low: 'rgba(100,200,120,0.9)', Moderate: 'rgba(220,160,60,0.9)', High: 'rgba(220,80,80,0.9)' };
  return <span style={{ display: 'inline-block', padding: '2px 8px', background: colors[level] || 'rgba(255,255,255,0.05)', color: text[level] || 'rgba(255,255,255,0.5)', fontFamily: 'Montserrat, sans-serif', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: '2px' }}>{level}</span>;
}

function ResultBadge({ result }: { result: string }) {
  const isGood = ['Resolved', 'Improved', 'Excellent'].includes(result);
  return <span style={{ display: 'inline-block', padding: '2px 8px', background: isGood ? 'rgba(100,200,120,0.1)' : 'rgba(180,180,180,0.08)', color: isGood ? 'rgba(100,200,120,0.9)' : 'rgba(180,180,180,0.6)', fontFamily: 'Montserrat, sans-serif', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: '2px' }}>{result}</span>;
}

const SL = { fontFamily: 'Montserrat, sans-serif', fontSize: '13px', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: 'rgba(212,175,55,0.9)', marginBottom: '12px', marginTop: '28px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' };
const FL = { fontFamily: 'Montserrat, sans-serif', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'rgba(100,160,220,0.9)', marginBottom: '3px' };
const FV = { fontFamily: 'Montserrat, sans-serif', fontSize: '17px', color: 'rgba(255,255,255,0.95)', marginBottom: '17px' };
const TH = { fontFamily: 'Montserrat, sans-serif', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(100,160,220,0.9)', padding: '8px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'left' as const };
const TC = { fontFamily: 'Montserrat, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.85)', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'top' as const };

export default function FeasibilityMobile() {
  const [activeTab, setActiveTab] = useState<'precut' | 'postcut'>('precut');

  return (
    <>
      <style>{`
        .fm-tabs { display: flex; gap: 2px; margin-bottom: 32px; }
        .fm-tab { flex: 1; padding: 14px 0; text-align: center; font-family: 'Montserrat', sans-serif; font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; border: 1px solid rgba(30,60,120,0.7); background: transparent; color: rgba(255,255,255,0.75); cursor: pointer; transition: all 200ms; }
        .fm-tab.active { border-color: rgba(212,175,55,0.8); color: rgba(212,175,55,0.9); background: rgba(212,175,55,0.04); }
        .fm-card { background: #0D0D0D; border: 1px solid rgba(30,60,120,0.8); padding: 28px 20px; }
        .fm-plot { background: rgba(0,0,0,0.4); border: 1px solid rgba(30,60,120,0.8); padding: 20px; position: relative; min-height: 200px; }
        .fm-plot-label { font-family: 'Montserrat', sans-serif; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin-bottom: 8px; display: block; }
        .fm-plot-shape { display: flex; align-items: center; justify-content: center; }
        .fm-option { padding: 14px; border: 1px solid rgba(30,60,120,0.7); margin-bottom: 8px; background: rgba(255,255,255,0.02); }
        .fm-option.rec { border-color: rgba(212,175,55,0.6); background: rgba(212,175,55,0.04); }
        .fm-disclaimer { margin-top: 24px; padding: 14px; border: 1px solid rgba(30,60,120,0.6); background: rgba(255,255,255,0.02); font-family: 'Montserrat', sans-serif; font-size: '9px'; color: rgba(255,255,255,0.5); line-height: 1.7; font-size: 13px; }
      `}</style>

      {/* Tab switcher */}
      <div className="fm-tabs">
        <button className={`fm-tab${activeTab === 'precut' ? ' active' : ''}`} onClick={() => setActiveTab('precut')}>Pre-Cut</button>
        <button className={`fm-tab${activeTab === 'postcut' ? ' active' : ''}`} onClick={() => setActiveTab('postcut')}>Post-Cut</button>
      </div>

      {/* PRE-CUT */}
      {activeTab === 'precut' && (
        <div className="fm-card">
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.9)', marginBottom: '6px' }}>CCG Cut Feasibility Report</p>
          <p style={{ fontFamily: 'Oranienbaum, serif', fontSize: 'clamp(23px, 6vw, 32px)', color: '#FAFAFA', lineHeight: 1.1, marginBottom: '4px' }}>Pre-Cut Evaluation</p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginBottom: '4px' }}>Report #{precut.id}</p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.75)', marginBottom: '23px' }}>{precut.date} — {precut.analyst}</p>

          <p style={SL}>Gemstone Overview</p>
          {[['Species', precut.gem.species], ['Variety', precut.gem.variety], ['Origin', precut.gem.origin], ['Weight', precut.gem.weight], ['Measurements', precut.gem.measurements], ['Color', precut.gem.color], ['Transparency', precut.gem.transparency], ['Current Cut', precut.gem.currentCut]].map(([l, v]) => (
            <div key={l}><p style={FL}>{l}</p><p style={FV}>{v}</p></div>
          ))}

          <p style={SL}>Current Condition</p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, marginBottom: '8px' }}>{precut.condition}</p>

          <p style={SL}>Symbol Legend</p>
          {precut.symbolLegend.map(s => (
            <div key={s.symbol} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '14px', color: 'rgba(212,175,55,0.7)', minWidth: '17px' }}>{s.symbol}</span>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}><span style={{ color: 'rgba(255,255,255,0.75)', marginRight: '6px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.type}</span>{s.desc}</p>
            </div>
          ))}

          <p style={SL}>Structural Plots</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div className="fm-plot">
              <span className="fm-plot-label">Crown</span>
              <div className="fm-plot-shape">
                <svg viewBox="0 0 100 100" width="100%" height="180">
                  <ellipse cx="50" cy="50" rx="44" ry="36" fill="none" stroke="rgba(212,175,55,0.7)" strokeWidth="1.5" />
                  <ellipse cx="50" cy="50" rx="20" ry="14" fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="1" />
                  <text x="72" y="28" fontSize="9" fill="rgba(100,160,220,0.95)" fontFamily="monospace">○</text>
                  <text x="18" y="55" fontSize="9" fill="rgba(212,175,55,0.95)" fontFamily="monospace">~</text>
                  <text x="50" y="90" fontSize="9" fill="rgba(212,175,55,0.95)" fontFamily="monospace">△</text>
                  <text x="48" y="10" fontSize="6" fill="rgba(255,255,255,0.4)" fontFamily="monospace">12</text>
                  <text x="88" y="52" fontSize="6" fill="rgba(255,255,255,0.4)" fontFamily="monospace">3</text>
                  <text x="48" y="97" fontSize="6" fill="rgba(255,255,255,0.4)" fontFamily="monospace">6</text>
                  <text x="2" y="52" fontSize="6" fill="rgba(255,255,255,0.4)" fontFamily="monospace">9</text>
                </svg>
              </div>
            </div>
            <div className="fm-plot">
              <span className="fm-plot-label">Pavilion</span>
              <div className="fm-plot-shape">
                <svg viewBox="0 0 100 100" width="100%" height="180">
                  <ellipse cx="50" cy="50" rx="44" ry="36" fill="none" stroke="rgba(212,175,55,0.7)" strokeWidth="1.5" />
                  <ellipse cx="50" cy="50" rx="10" ry="8" fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="1" />
                  <text x="44" y="48" fontSize="9" fill="rgba(100,160,220,0.95)" fontFamily="monospace">○○</text>
                  <text x="60" y="65" fontSize="9" fill="rgba(220,160,60,0.95)" fontFamily="monospace">≈</text>
                  <text x="48" y="10" fontSize="6" fill="rgba(255,255,255,0.4)" fontFamily="monospace">12</text>
                  <text x="88" y="52" fontSize="6" fill="rgba(255,255,255,0.4)" fontFamily="monospace">3</text>
                  <text x="48" y="97" fontSize="6" fill="rgba(255,255,255,0.4)" fontFamily="monospace">6</text>
                  <text x="2" y="52" fontSize="6" fill="rgba(255,255,255,0.4)" fontFamily="monospace">9</text>
                </svg>
              </div>
            </div>
          </div>

          <p style={SL}>Structural Observations</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <thead><tr>{['Feature', 'Severity'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>{precut.structuralTable.map((r, i) => <tr key={i}><td style={TC}>{r.feature}<br /><span style={{ color: 'rgba(100,160,220,0.85)', fontSize: '13px' }}>{r.location}</span></td><td style={TC}><SeverityBadge level={r.severity} /></td></tr>)}</tbody>
          </table>

          <p style={SL}>Cutting Approach Options</p>
          {precut.options.map((o, i) => (
            <div key={i} className={`fm-option${i === 1 ? ' rec' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: 600, color: 'rgba(212,175,55,0.95)' }}>{o.label}</p>
                {i === 1 && <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: 'rgba(212,175,55,0.95)' }}>Recommended</span>}
              </div>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>{o.desc}</p>
            </div>
          ))}

          <p style={SL}>Summary</p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.75 }}>{precut.summary}</p>
          <div className="fm-disclaimer">This report is an analytical evaluation only. It does not constitute a price quote, guarantee of outcome, or appraisal. CCG Cut Feasibility Reports are the proprietary product of Cutting Corners Gems.</div>
        </div>
      )}

      {/* POST-CUT */}
      {activeTab === 'postcut' && (
        <div className="fm-card">
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.9)', marginBottom: '6px' }}>CCG Cut Feasibility Report</p>
          <p style={{ fontFamily: 'Oranienbaum, serif', fontSize: 'clamp(23px, 6vw, 32px)', color: '#FAFAFA', lineHeight: 1.1, marginBottom: '4px' }}>Post-Cut Change Report</p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginBottom: '4px' }}>Report #{postcut.id}</p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.75)', marginBottom: '23px' }}>{postcut.date} — {postcut.analyst}</p>

          <p style={SL}>Before & After</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', marginBottom: '8px' }}>
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(30,60,120,0.7)' }}>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: '10px' }}>Before</p>
              {[['Weight', postcut.before.weight], ['Cut', postcut.before.cut]].map(([l, v]) => <div key={l}><p style={FL}>{l}</p><p style={FV}>{v}</p></div>)}
            </div>
            <div style={{ padding: '14px', background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(30,60,120,0.7)' }}>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.85)', marginBottom: '10px' }}>After</p>
              {[['Weight', postcut.after.weight], ['Cut', postcut.after.cut]].map(([l, v]) => <div key={l}><p style={FL}>{l}</p><p style={FV}>{v}</p></div>)}
            </div>
          </div>

          <div style={{ padding: '14px 16px', background: 'rgba(100,200,120,0.05)', border: '1px solid rgba(30,60,120,0.7)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ ...FL, marginBottom: '4px' }}>Final Yield</p>
              <p style={{ fontFamily: 'Oranienbaum, serif', fontSize: '28px', color: 'rgba(100,200,120,0.9)', lineHeight: 1 }}>{postcut.yield.value}%</p>
            </div>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(100,200,120,0.7)', padding: '4px 8px', border: '1px solid rgba(100,200,120,0.2)' }}>{postcut.yield.category}</span>
          </div>

          <p style={SL}>Structural Changes</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <thead><tr>{['Feature', 'Result'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>{postcut.changeTable.map((r, i) => <tr key={i}><td style={TC}>{r.feature}<br /><span style={{ color: 'rgba(100,160,220,0.85)', fontSize: '13px' }}>{r.action}</span></td><td style={TC}><ResultBadge result={r.result} /></td></tr>)}</tbody>
          </table>

          <p style={SL}>Optical Performance</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <thead><tr>{['Aspect', 'Rating'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>{postcut.optical.map((r, i) => <tr key={i}><td style={TC}>{r.aspect}<br /><span style={{ color: 'rgba(100,160,220,0.85)', fontSize: '13px' }}>{r.note}</span></td><td style={TC}><span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', color: 'rgba(212,175,55,0.8)', fontWeight: 600 }}>{r.rating}</span></td></tr>)}</tbody>
          </table>

          <p style={SL}>Documentation Record</p>
          {postcut.documentation.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <span style={{ color: 'rgba(100,200,120,0.9)', fontSize: '17px', flexShrink: 0 }}>✓</span>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.65 }}>{d}</p>
            </div>
          ))}
          <div className="fm-disclaimer">This report documents the completed cutting service and is issued as a permanent record. CCG Cut Feasibility Reports are the proprietary product of Cutting Corners Gems.</div>
        </div>
      )}
    </>
  );
}
