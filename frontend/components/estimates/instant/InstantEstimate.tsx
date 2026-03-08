import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Fx, DNode,
  BASE_PRICE, WEIGHT_OPTS, SPECIES_OPTS, SHAPE_OPTS, COLOR_OPTS,
  DARKNESS_OPTS, DAMAGE_OPTS, SERVICE_OPTS,
  CONDITION_OPTS, INTENT_OPTS, WHY_RECUT_OPTS, WHY_SHAPE_OPTS,
  DAMAGE_TREES,
} from './estimate-data';

// ─── Phase & State ───────────────────────────────────────────────
type Phase =
  | 'condition'
  | 'intent' | 'intent_shape' | 'intent_weight' | 'intent_species'
  | 'intent_color' | 'intent_why' | 'darkness'
  | 'weight' | 'species' | 'transparency' | 'shape'
  | 'damage_select' | 'damage_sub' | 'service' | 'result';

interface St {
  phase: Phase;
  condition: string;
  intent: string; intentShape: string; intentWhy: string;
  darkness: string; color: string;
  weight: string; wMk: number;
  species: string; transparency: string; shape: string;
  dmgTypes: string[]; dmgIdx: number; nodeId: string;
  priceMk: number; flags: string[]; onlineRecs: string[]; svcRecs: string[];
  svcCmp: string;
  onlineTriggerCount: number;
  feasibilityTriggerCount: number;
}

const INIT: St = {
  phase: 'condition',
  condition: '', intent: '', intentShape: '', intentWhy: '',
  darkness: '', color: '',
  weight: '', wMk: 0, species: '', transparency: '', shape: '',
  dmgTypes: [], dmgIdx: 0, nodeId: 'start',
  priceMk: 0, flags: [], onlineRecs: [], svcRecs: [],
  svcCmp: '',
  onlineTriggerCount: 0,
  feasibilityTriggerCount: 0,
};

// ─── Component ───────────────────────────────────────────────────
export default function InstantEstimate() {
  const router = useRouter();
  const [st, setSt] = useState<St>(INIT);
  const [sel, setSel] = useState('');
  const [multi, setMulti] = useState<string[]>([]);

  // ── Effect applier ──────────────────────────────────────────────
  function applyFx(fx: Fx[], base: St, remaining: number): St {
    let s = { ...base };
    for (const f of fx) {
      if (f.t === 'price')    s.priceMk += f.n;
      else if (f.t === 'flag')     s.flags = [...s.flags, f.msg];
      else if (f.t === 'online')   s.onlineRecs = [...s.onlineRecs, f.msg];
      else if (f.t === 'recommend') s.svcRecs = [...s.svcRecs, f.svc];
      else if (f.t === 'condFlag' && remaining === 0) s.flags = [...s.flags, f.msg];
    }
    return s;
  }

  // ── Handlers ────────────────────────────────────────────────────
  function go(patch: Partial<St>, clearSel = true) {
    setSt(p => ({ ...p, ...patch }));
    if (clearSel) { setSel(''); setMulti([]); }
  }

  function handleCondition(v: string) {
    if (v === 'rough') {
      go({ condition: v, onlineTriggerCount: st.onlineTriggerCount + 1, priceMk: st.priceMk + 250, svcRecs: [...st.svcRecs, 'Rough Cut Transformation'], phase: 'weight' });
    } else if (v === 'cut') {
      go({ condition: v, phase: 'intent' });
    } else {
      // cut_damaged — go straight to weight
      go({ condition: v, phase: 'weight' });
    }
  }

  function handleIntent(v: string) {
    if (v === 'measurement') {
      go({ intent: v, feasibilityTriggerCount: st.feasibilityTriggerCount + 1, phase: 'weight' });
    } else if (v === 'brighten') {
      go({ intent: v, phase: 'darkness' });
    } else if (v === 'surface_clean') {
      go({ intent: v, phase: 'weight' });
    } else {
      // complete_recut or shape_change — ask shape first
      go({ intent: v, phase: 'intent_shape' });
    }
  }

  function handleIntentShape(v: string) {
    go({ intentShape: v, phase: 'intent_weight' });
  }

  function handleIntentWeight(v: string) {
    const w = WEIGHT_OPTS.find(x => x.label === v)!;
    if (w.online) {
      go({ weight: v, wMk: 0, onlineTriggerCount: st.onlineTriggerCount + 1, phase: 'intent_species' });
    } else {
      go({ weight: v, wMk: w.mk, phase: 'intent_species' });
    }
  }

  function handleIntentSpecies(v: string) {
    go({ species: v, phase: 'intent_color' });
  }

  function handleIntentColor(v: string) {
    go({ color: v, phase: 'intent_why' });
  }

  function handleIntentWhy(v: string) {
    const isRecut = st.intent === 'complete_recut';
    if (v === 'damage') {
      // Use shape already captured in intentShape, skip shape step, go to damage
      go({ intentWhy: v, shape: st.intentShape, phase: 'damage_select' });
    } else if (v === 'jewelry_fit') {
      go({ intentWhy: v, feasibilityTriggerCount: st.feasibilityTriggerCount + 1, shape: st.intentShape, phase: 'damage_select' });
    } else {
      // no_reason or dont_like — add $50
      go({
        intentWhy: v,
        priceMk: st.priceMk + 50,
        feasibilityTriggerCount: !isRecut ? st.feasibilityTriggerCount + 1 : st.feasibilityTriggerCount,
        phase: 'service',
      });
    }
  }

  function handleDarkness(v: string) {
    const n = parseInt(v);
    if (n <= 5) {
      go({ darkness: v, onlineTriggerCount: st.onlineTriggerCount + 1, phase: 'weight' });
    } else {
      go({
        darkness: v,
        priceMk: st.priceMk + 50,
        svcRecs: [...st.svcRecs, 'Recut & repolish'],
        feasibilityTriggerCount: st.feasibilityTriggerCount + 1,
        phase: 'weight',
      });
    }
  }

  function handleWeight(v: string) {
    const w = WEIGHT_OPTS.find(x => x.label === v)!;
    if (w.online) {
      go({ weight: v, wMk: 0, onlineTriggerCount: st.onlineTriggerCount + 1, phase: 'species' });
    } else {
      go({ weight: v, wMk: w.mk, phase: 'species' });
    }
  }

  function handleSpecies(v: string) {
    const nextPhase = st.condition === 'rough' || st.intent === 'measurement' ? 'service' : 'transparency';
    go({ species: v, phase: nextPhase });
  }

  function handleTransparency(v: string) {
    if (v !== 'Transparent') {
      go({ transparency: v, onlineTriggerCount: st.onlineTriggerCount + 1, phase: 'shape' });
    } else {
      go({ transparency: v, phase: 'shape' });
    }
  }

  function handleShape(v: string) {
    go({ shape: v, phase: 'damage_select' });
  }

  function handleDamageSelect() {
    if (!multi.length) return;
    if (multi.includes('nodamage') && multi.length === 1) {
      setSt(p => ({
        ...p,
        dmgTypes: ['nodamage'],
        priceMk: p.priceMk + 60,
        onlineRecs: [...p.onlineRecs, 'No damage found — likely a repolish. Online estimate recommended for accurate pricing.'],
        phase: 'service',
      }));
      setMulti([]);
      return;
    }
    const types = multi.filter(d => d !== 'nodamage');
    setSt(p => ({ ...p, dmgTypes: types, dmgIdx: 0, nodeId: 'start', phase: 'damage_sub' }));
    setMulti([]);
  }

  function handleDamageNode(optIdx: number) {
    const type = st.dmgTypes[st.dmgIdx];
    const node = DAMAGE_TREES[type][st.nodeId];
    const opt = node.opts[optIdx];
    const remaining = st.dmgTypes.length - st.dmgIdx - 1;
    let ns = applyFx(opt.fx, st, remaining);
    if (opt.next !== null) {
      ns = { ...ns, nodeId: opt.next };
    } else {
      const next = st.dmgIdx + 1;
      ns = next < st.dmgTypes.length
        ? { ...ns, dmgIdx: next, nodeId: 'start' }
        : { ...ns, phase: 'service' };
    }
    setSt(ns); setSel('');
  }

  function handleService(v: string) {
    go({ svcCmp: v, phase: 'result' });
  }

  // ── Progress ────────────────────────────────────────────────────
  const PHASE_ORDER: Phase[] = [
    'condition','intent','intent_shape','intent_weight','intent_species',
    'intent_color','intent_why','darkness',
    'weight','species','transparency','shape',
    'damage_select','damage_sub','service','result',
  ];
  const progress = (PHASE_ORDER.indexOf(st.phase) / (PHASE_ORDER.length - 1)) * 100;

  const curType = st.dmgTypes[st.dmgIdx];
  const curNode = curType ? DAMAGE_TREES[curType]?.[st.nodeId] : null;
  const curTypeLabel = DAMAGE_OPTS.find(d => d.id === curType)?.label || '';

  const highBase = st.svcRecs.length ? Math.max(...st.svcRecs.map(r => BASE_PRICE[r] || 50)) : 50;
  const totalHigh = highBase + st.wMk + st.priceMk;

  // ── Option Button ────────────────────────────────────────────────
  function Opt({ label, active, onClick, isMulti = false }: { label: string; active: boolean; onClick: () => void; isMulti?: boolean }) {
    return (
      <button className={`eq-opt${active ? ' sel' : ''}`} onClick={onClick}>
        {isMulti && <span style={{ marginRight: 12, opacity: 0.5, fontFamily: 'monospace' }}>{active ? '◆' : '◇'}</span>}
        {label}
      </button>
    );
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .eq-wrap { min-height: 100svh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 24px 60px; background: #050505; }
        .eq-inner { width: 100%; max-width: 600px; }
        .eq-bar { width: 100%; height: 1px; background: rgba(255,255,255,0.06); margin-bottom: 48px; position: relative; }
        .eq-fill { position: absolute; top: 0; left: 0; height: 100%; background: rgba(212,175,55,0.6); transition: width 300ms ease; }
        .eq-step { font-family: 'Montserrat', sans-serif; font-size: 15px; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(212,175,55,0.9); margin-bottom: 20px; }
        .eq-q { font-family: 'Oranienbaum', serif; font-size: clamp(27px, 4.5vw, 40px); color: #FAFAFA; line-height: 1.2; margin-bottom: 40px; }
        .eq-sub { font-family: 'Montserrat', sans-serif; font-size: 15px; color: rgba(255,255,255,0.75); margin-bottom: 20px; letter-spacing: 0.05em; }
        .eq-opts { display: flex; flex-direction: column; gap: 8px; margin-bottom: 40px; }
        .eq-opt { padding: 17px 22px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: rgba(255,255,255,0.85); font-family: 'Montserrat', sans-serif; font-size: 19px; text-align: left; cursor: pointer; transition: all 150ms; letter-spacing: 0.02em; width: 100%; }
        .eq-opt:hover { border-color: rgba(212,175,55,0.4); color: #FAFAFA; background: rgba(212,175,55,0.04); }
        .eq-opt.sel { border-color: rgba(212,175,55,0.9); color: #FAFAFA; background: rgba(212,175,55,0.08); }
        .eq-acts { display: flex; gap: 12px; }
        .eq-next { padding: 15px 36px; background: #d4af37; border: none; color: #050505; font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; cursor: pointer; }
        .eq-next:disabled { opacity: 0.25; cursor: not-allowed; }
        .eq-back { padding: 15px 22px; background: none; border: 1px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.75); font-family: 'Montserrat', sans-serif; font-size: 15px; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; }
        .res-row { display: flex; justify-content: space-between; align-items: baseline; padding: 13px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .res-lbl { font-family: 'Montserrat', sans-serif; font-size: 15px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.65); }
        .res-val { font-family: 'Montserrat', sans-serif; font-size: 17px; color: rgba(255,255,255,0.95); }
        .flag-item { padding: 12px 16px; border-left: 2px solid rgba(220,80,80,0.7); margin-bottom: 8px; background: rgba(220,80,80,0.06); font-family: 'Montserrat', sans-serif; font-size: 15px; color: rgba(220,80,80,0.95); line-height: 1.6; }
        .online-item { padding: 12px 16px; border-left: 2px solid rgba(100,160,220,0.7); margin-bottom: 8px; background: rgba(100,160,220,0.06); font-family: 'Montserrat', sans-serif; font-size: 15px; color: rgba(100,160,220,0.95); line-height: 1.6; }
        .price-box { padding: 28px; border: 1px solid rgba(212,175,55,0.2); background: rgba(212,175,55,0.03); margin-bottom: 24px; }
        .price-note { font-family: 'Montserrat', sans-serif; font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.85; margin-top: 12px; }
        .feas-box { padding: 20px 24px; border: 1px solid rgba(212,175,55,0.2); background: rgba(212,175,55,0.03); margin-bottom: 24px; }
      `}</style>

      <div className="eq-wrap">
        <div className="eq-inner">
          <div className="eq-bar"><div className="eq-fill" style={{ width: `${progress}%` }} /></div>

          {/* CONDITION */}
          {st.phase === 'condition' && (<>
            <p className="eq-step">Step 1 — Condition</p>
            <h1 className="eq-q">What is the current condition of your gemstone?</h1>
            <div className="eq-opts">{CONDITION_OPTS.map(c => <Opt key={c.id} label={c.label} active={sel === c.id} onClick={() => setSel(c.id)} />)}</div>
            <div className="eq-acts">
              <button className="eq-back" onClick={() => router.push('/estimates')}>Back</button>
              <button className="eq-next" disabled={!sel} onClick={() => handleCondition(sel)}>Next</button>
            </div>
          </>)}

          {/* INTENT */}
          {st.phase === 'intent' && (<>
            <p className="eq-step">Step 2 — Service Intent</p>
            <h1 className="eq-q">What kind of service are you looking for?</h1>
            <div className="eq-opts">{INTENT_OPTS.map(i => <Opt key={i.id} label={i.label} active={sel === i.id} onClick={() => setSel(i.id)} />)}</div>
            <div className="eq-acts">
              <button className="eq-back" onClick={() => { go({ phase: 'condition' }); setSel(st.condition); }}>Previous</button>
              <button className="eq-next" disabled={!sel} onClick={() => handleIntent(sel)}>Next</button>
            </div>
          </>)}

          {/* INTENT SHAPE */}
          {st.phase === 'intent_shape' && (<>
            <p className="eq-step">{st.intent === 'complete_recut' ? 'Desired shape' : 'Current shape'}</p>
            <h1 className="eq-q">{st.intent === 'complete_recut' ? 'What shape would you like the stone recut to?' : 'What is the current shape of your gemstone?'}</h1>
            <div className="eq-opts">{SHAPE_OPTS.map(s => <Opt key={s} label={s} active={sel === s} onClick={() => setSel(s)} />)}</div>
            <div className="eq-acts">
              <button className="eq-back" onClick={() => { go({ phase: 'intent' }); setSel(st.intent); }}>Previous</button>
              <button className="eq-next" disabled={!sel} onClick={() => handleIntentShape(sel)}>Next</button>
            </div>
          </>)}

          {/* INTENT WEIGHT */}
          {st.phase === 'intent_weight' && (<>
            <p className="eq-step">Weight</p>
            <h1 className="eq-q">What is the weight of your gemstone?</h1>
            <div className="eq-opts">{WEIGHT_OPTS.map(w => <Opt key={w.label} label={w.label} active={sel === w.label} onClick={() => setSel(w.label)} />)}</div>
            <div className="eq-acts">
              <button className="eq-back" onClick={() => { go({ phase: 'intent_shape' }); setSel(st.intentShape); }}>Previous</button>
              <button className="eq-next" disabled={!sel} onClick={() => handleIntentWeight(sel)}>Next</button>
            </div>
          </>)}

          {/* INTENT SPECIES */}
          {st.phase === 'intent_species' && (<>
            <p className="eq-step">Species</p>
            <h1 className="eq-q">What is the species of your gemstone?</h1>
            <div className="eq-opts">{SPECIES_OPTS.map(s => <Opt key={s} label={s} active={sel === s} onClick={() => setSel(s)} />)}</div>
            <div className="eq-acts">
              <button className="eq-back" onClick={() => { go({ phase: 'intent_weight' }); setSel(st.weight); }}>Previous</button>
              <button className="eq-next" disabled={!sel} onClick={() => handleIntentSpecies(sel)}>Next</button>
            </div>
          </>)}

          {/* INTENT COLOR */}
          {st.phase === 'intent_color' && (<>
            <p className="eq-step">Color</p>
            <h1 className="eq-q">What is the color of your gemstone?</h1>
            <div className="eq-opts">{COLOR_OPTS.map(c => <Opt key={c} label={c} active={sel === c} onClick={() => setSel(c)} />)}</div>
            <div className="eq-acts">
              <button className="eq-back" onClick={() => { go({ phase: 'intent_species' }); setSel(st.species); }}>Previous</button>
              <button className="eq-next" disabled={!sel} onClick={() => handleIntentColor(sel)}>Next</button>
            </div>
          </>)}

          {/* INTENT WHY */}
          {st.phase === 'intent_why' && (<>
            <p className="eq-step">{st.intent === 'complete_recut' ? 'Reason for recut' : 'Reason for shape change'}</p>
            <h1 className="eq-q">{st.intent === 'complete_recut' ? 'Why are you seeking a recut?' : 'Why are you looking to change the shape?'}</h1>
            <div className="eq-opts">
              {(st.intent === 'complete_recut' ? WHY_RECUT_OPTS : WHY_SHAPE_OPTS).map(w => <Opt key={w.id} label={w.label} active={sel === w.id} onClick={() => setSel(w.id)} />)}
            </div>
            <div className="eq-acts">
              <button className="eq-back" onClick={() => { go({ phase: 'intent_color' }); setSel(st.color); }}>Previous</button>
              <button className="eq-next" disabled={!sel} onClick={() => handleIntentWhy(sel)}>Next</button>
            </div>
          </>)}

          {/* DARKNESS */}
          {st.phase === 'darkness' && (<>
            <p className="eq-step">Color Brightness</p>
            <h1 className="eq-q">Rate the current darkness of your stone.</h1>
            <p className="eq-sub">1 = cannot see through it in warm LED lighting &nbsp;·&nbsp; 10 = completely transparent in warm LED lighting</p>
            <div className="eq-opts" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {DARKNESS_OPTS.map(d => <Opt key={d} label={d} active={sel === d} onClick={() => setSel(d)} />)}
            </div>
            <div className="eq-acts">
              <button className="eq-back" onClick={() => { go({ phase: 'intent' }); setSel(st.intent); }}>Previous</button>
              <button className="eq-next" disabled={!sel} onClick={() => handleDarkness(sel)}>Next</button>
            </div>
          </>)}

          {/* WEIGHT (cut_damaged / surface_clean paths) */}
          {st.phase === 'weight' && (<>
            <p className="eq-step">Weight</p>
            <h1 className="eq-q">What is the weight of your gemstone?</h1>
            <div className="eq-opts">{WEIGHT_OPTS.map(w => <Opt key={w.label} label={w.label} active={sel === w.label} onClick={() => setSel(w.label)} />)}</div>
            <div className="eq-acts">
              <button className="eq-back" onClick={() => { go({ phase: st.condition === 'cut' ? 'intent' : 'condition' }); setSel(st.condition === 'cut' ? st.intent : st.condition); }}>Previous</button>
              <button className="eq-next" disabled={!sel} onClick={() => handleWeight(sel)}>Next</button>
            </div>
          </>)}

          {/* SPECIES */}
          {st.phase === 'species' && (<>
            <p className="eq-step">Species</p>
            <h1 className="eq-q">What is the species of your gemstone?</h1>
            <div className="eq-opts">{SPECIES_OPTS.map(s => <Opt key={s} label={s} active={sel === s} onClick={() => setSel(s)} />)}</div>
            <div className="eq-acts">
              <button className="eq-back" onClick={() => { go({ phase: 'weight' }); setSel(st.weight); }}>Previous</button>
              <button className="eq-next" disabled={!sel} onClick={() => handleSpecies(sel)}>Next</button>
            </div>
          </>)}

          {/* TRANSPARENCY */}
          {st.phase === 'transparency' && (<>
            <p className="eq-step">Transparency</p>
            <h1 className="eq-q">Is your gemstone transparent, translucent, or opaque?</h1>
            <div className="eq-opts">{['Transparent','Translucent','Opaque'].map(s => <Opt key={s} label={s} active={sel === s} onClick={() => setSel(s)} />)}</div>
            <div className="eq-acts">
              <button className="eq-back" onClick={() => { go({ phase: 'species' }); setSel(st.species); }}>Previous</button>
              <button className="eq-next" disabled={!sel} onClick={() => handleTransparency(sel)}>Next</button>
            </div>
          </>)}

          {/* SHAPE */}
          {st.phase === 'shape' && (<>
            <p className="eq-step">Shape</p>
            <h1 className="eq-q">What is the current shape of your gemstone?</h1>
            <div className="eq-opts">{SHAPE_OPTS.map(s => <Opt key={s} label={s} active={sel === s} onClick={() => setSel(s)} />)}</div>
            <div className="eq-acts">
              <button className="eq-back" onClick={() => { go({ phase: 'transparency' }); setSel(st.transparency); }}>Previous</button>
              <button className="eq-next" disabled={!sel} onClick={() => handleShape(sel)}>Next</button>
            </div>
          </>)}

          {/* DAMAGE SELECT */}
          {st.phase === 'damage_select' && (<>
            <p className="eq-step">Damage</p>
            <h1 className="eq-q">What kind of damage does your gemstone have?</h1>
            <p className="eq-sub">Select all that apply</p>
            <div className="eq-opts">{DAMAGE_OPTS.map(d => <Opt key={d.id} label={d.label} active={multi.includes(d.id)} isMulti onClick={() => setMulti(p => p.includes(d.id) ? p.filter(x => x !== d.id) : [...p, d.id])} />)}</div>
            <div className="eq-acts">
              <button className="eq-back" onClick={() => { setSt(p => ({ ...p, phase: 'shape' })); setSel(st.shape); setMulti([]); }}>Previous</button>
              <button className="eq-next" disabled={!multi.length} onClick={handleDamageSelect}>Next</button>
            </div>
          </>)}

          {/* DAMAGE SUB-QUESTIONS */}
          {st.phase === 'damage_sub' && curNode && (<>
            <p className="eq-step">{curTypeLabel} — type {st.dmgIdx + 1} of {st.dmgTypes.length}</p>
            <h1 className="eq-q">{curNode.q}</h1>
            <div className="eq-opts">{curNode.opts.map(o => <Opt key={o.label} label={o.label} active={sel === o.label} onClick={() => setSel(o.label)} />)}</div>
            <div className="eq-acts">
              <button className="eq-next" disabled={!sel} onClick={() => { const i = curNode.opts.findIndex(o => o.label === sel); if (i >= 0) handleDamageNode(i); }}>Next</button>
            </div>
          </>)}

          {/* SERVICE COMPARISON */}
          {st.phase === 'service' && (<>
            <p className="eq-step">Service</p>
            <h1 className="eq-q">What service were you hoping to get an estimate for?</h1>
            <p className="eq-sub">This is compared against what we recommend — it does not affect pricing</p>
            <div className="eq-opts">{SERVICE_OPTS.map(s => <Opt key={s} label={s} active={sel === s} onClick={() => setSel(s)} />)}</div>
            <div className="eq-acts">
              <button className="eq-next" disabled={!sel} onClick={() => handleService(sel)}>See Results</button>
            </div>
          </>)}

          {/* RESULT */}
          {st.phase === 'result' && (() => {
            const hasOnline = st.onlineTriggerCount > 0;
            const hasFeasibility = st.feasibilityTriggerCount > 0 || st.flags.length === 1;
            const hasInPerson = st.flags.length >= 2;
            const totalTriggers = st.onlineTriggerCount + st.feasibilityTriggerCount + (st.flags.length > 0 ? 1 : 0);
            const showPrice = !hasOnline && !hasFeasibility && !hasInPerson;

            const headline = hasOnline
              ? 'An online estimate is recommended.'
              : hasInPerson
              ? 'An in-person evaluation is recommended.'
              : hasFeasibility
              ? 'A closer look is needed first.'
              : 'Here is your estimate.';

            return (<>
              <p className="eq-step">Estimate Summary</p>
              <h1 className="eq-q" style={{ marginBottom: 32 }}>{headline}</h1>

              {/* Trigger tally */}
              {totalTriggers > 0 && (
                <div style={{ marginBottom: 28, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
                    {totalTriggers === 1
                      ? '1 of your answers pointed toward a different path.'
                      : `${totalTriggers} of your answers pointed toward a different path.`}
                  </p>
                </div>
              )}

              {/* Stone summary */}
              <div style={{ marginBottom: 32 }}>
                {([
                  ['Condition', CONDITION_OPTS.find(c => c.id === st.condition)?.label],
                  ['Intent', INTENT_OPTS.find(i => i.id === st.intent)?.label],
                  ['Weight', st.weight], ['Species', st.species],
                  ['Color', st.color], ['Transparency', st.transparency], ['Shape', st.shape],
                ] as [string, string | undefined][]).filter(([, v]) => v).map(([l, v]) => (
                  <div key={l} className="res-row">
                    <span className="res-lbl">{l}</span>
                    <span className="res-val">{v}</span>
                  </div>
                ))}
              </div>

              {/* Online estimate recommendation */}
              {hasOnline && (
                <div style={{ padding: '20px 24px', border: '1px solid rgba(100,160,220,0.25)', background: 'rgba(100,160,220,0.04)', marginBottom: 28 }}>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(100,160,220,0.9)', marginBottom: 8 }}>Recommended Next Step</p>
                  <p style={{ fontFamily: 'Oranienbaum, serif', fontSize: 27, color: 'rgba(100,160,220,0.95)', marginBottom: 12 }}>Online Estimate — $3</p>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.85, marginBottom: 16 }}>
                    Based on your answers, we recommend starting with an online estimate. This lets our cutter review your stone through photos before committing to a service.
                  </p>
                  <a href="/estimates" style={{ display: 'inline-block', padding: '11px 24px', background: 'rgba(100,160,220,0.1)', border: '1px solid rgba(100,160,220,0.3)', color: 'rgba(100,160,220,0.95)', fontFamily: 'Montserrat, sans-serif', fontSize: 15, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>View Online Estimate Options →</a>
                </div>
              )}

              {/* In-person evaluation */}
              {!hasOnline && hasInPerson && (
                <div style={{ padding: '20px 24px', border: '1px solid rgba(220,80,80,0.2)', background: 'rgba(220,80,80,0.03)', marginBottom: 28 }}>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(220,80,80,0.9)', marginBottom: 8 }}>Recommended Next Step</p>
                  <p style={{ fontFamily: 'Oranienbaum, serif', fontSize: 27, color: '#d4af37', marginBottom: 12 }}>In-Person Evaluation — $10</p>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.85 }}>
                    Your stone has characteristics that require hands-on evaluation before any estimate can be made. The $10 fee is credited toward any service you proceed with.
                  </p>
                </div>
              )}

              {/* Feasibility report */}
              {!hasOnline && !hasInPerson && hasFeasibility && (
                <div className="feas-box">
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.9)', marginBottom: 8 }}>Recommended Next Step</p>
                  <p style={{ fontFamily: 'Oranienbaum, serif', fontSize: 27, color: '#d4af37', marginBottom: 12 }}>Feasibility Report — $30</p>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.85 }}>
                    A feasibility report will determine what is possible for your stone before any service is quoted. If services are rendered after the report, the $30 fee is waived and the report is included when your gemstone is returned.
                  </p>
                </div>
              )}

              {/* Price estimate — always show unless in-person evaluation required */}
              {!hasInPerson && (
                <div className="price-box">
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.9)', marginBottom: 8 }}>Estimate Range</p>
                  <p style={{ fontFamily: 'Oranienbaum, serif', fontSize: 56, color: '#d4af37', lineHeight: 1 }}>${totalHigh}</p>
                  <p className="price-note">This is an estimate — not a quote. An estimate is an informed guess based on your answers and is not binding. A quote is a firm price offered by the cutter after personally reviewing your stone. All prices shown here are subject to change once your gemstone is examined.</p>
                  {st.svcRecs.length > 0 && (
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>Recommended Service</p>
                      {st.svcRecs.map((r, i) => <p key={i} style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 17, color: 'rgba(255,255,255,0.95)', marginBottom: 4 }}>{r}</p>)}
                    </div>
                  )}
                  {st.svcCmp && st.svcCmp !== 'Not sure' && st.svcRecs.length > 0 && !st.svcRecs.includes(st.svcCmp) && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.85 }}>
                        You were hoping for <strong style={{ color: 'rgba(255,255,255,0.95)' }}>{st.svcCmp}</strong>. Based on your answers, <strong style={{ color: 'rgba(212,175,55,0.95)' }}>{st.svcRecs[0]}</strong> may be more appropriate.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="eq-next" onClick={() => { setSt(INIT); setSel(''); setMulti([]); }}>Start Over</button>
                <a href="/estimates" style={{ display: 'flex', alignItems: 'center', padding: '15px 22px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', fontFamily: 'Montserrat, sans-serif', fontSize: 15, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>All Estimates</a>
              </div>
            </>);
          })()}

        </div>
      </div>
    </>
  );
}