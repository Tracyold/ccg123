// start of pages/admin/products.tsx

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { formatMoney, fmtDate, fmtTime } from '../../lib/utils';

const TABS = ['active', 'drafts', 'inactive'] as const;
const TAB_LABELS: Record<string, string> = { active: 'Live', drafts: 'Drafts', inactive: 'Inactive' };
const EMPTY_FORM: Record<string, string> = {
  title: '', gem_type: '', color: '', shape: '', weight: '',
  origin: '', treatment: '', gia_report_number: '', gia_report_pdf_url: '',
  price_per_carat: '', total_price: '', description: '', photo_url: '',
};

function genId() { return crypto.randomUUID(); }

async function upsertProduct(p: any, state: string) {
  return supabase.from('products').upsert({
    product_id: p.product_id,
    title: p.title || '',
    gem_type: p.gem_type || null,
    color: p.color || null,
    shape: p.shape || null,
    weight: p.weight ? parseFloat(p.weight) : null,
    origin: p.origin || null,
    treatment: p.treatment || null,
    gia_report_number: p.gia_report_number || null,
    gia_report_pdf_url: p.gia_report_pdf_url || null,
    price_per_carat: p.price_per_carat ? parseFloat(p.price_per_carat) : null,
    total_price: p.total_price ? parseFloat(p.total_price) : 0,
    description: p.description || null,
    photo_url: p.photo_url || null,
    product_state: state,
  }, { onConflict: 'product_id' });
}

function GIASection({ value, onChange }: { value: string; onChange: (f: string, v: string) => void }) {
  const [mode, setMode] = useState('url');
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const handleFile = async (e: any) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    onChange('gia_report_pdf_url', `[uploaded] ${f.name}`);
  };
  return (
    <div className="gia-blk">
      <div className="gia-l">GIA Report</div>
      <div className="gia-mr">
        {[['url', 'PDF URL'], ['upload', 'Upload'], ['photo', 'Photo URL']].map(([m, l]) => (
          <button key={m} type="button" className={`gmb ${mode === m ? 'on' : ''}`} onClick={() => setMode(m)}>{l}</button>
        ))}
      </div>
      {mode === 'upload' ? (
        <div className="uz" onClick={() => fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept=".pdf" onChange={handleFile} />
          <div className="ui">↑</div><p>Click to upload GIA PDF</p>
          {fileName && <div className="ufn">{fileName}</div>}
        </div>
      ) : (
        <input type="text" placeholder={mode === 'url' ? 'https://www.gia.edu/report-check/...' : 'https://... photo URL'}
          value={value} onChange={e => onChange('gia_report_pdf_url', e.target.value)}
          style={{ background: 'var(--k1)', border: '.5px solid var(--ln)', color: 'var(--tx)', padding: '8px 10px', fontFamily: 'var(--sans)', fontSize: '18px', width: '100%', outline: 'none' }}
        />
      )}
    </div>
  );
}

function ProductForm({ queue, currentIndex, onCurrentChange, onClose, onAddToQueue, onPublishAll, onSaveDrafts, onSwitchIndex, saving }: any) {
  const current = queue[currentIndex];
  const [flash, setFlash] = useState(false);
  const timerRef = useRef<any>(null);
  const upd = (f: string, v: string) => onCurrentChange({ ...current, [f]: v });

  useEffect(() => {
    timerRef.current = setInterval(async () => {
      const { error } = await upsertProduct(current, 'DRAFT');
      if (!error) { setFlash(true); setTimeout(() => setFlash(false), 2000); }
    }, 15000);
    return () => clearInterval(timerRef.current);
  }, [current]);

  return (
    <div className="ov">
      <div className="qp">
        <div className="qh">Queue ({queue.length}/10)</div>
        <div className="ql">
          {queue.map((item: any, i: number) => (
            <div key={item.product_id} className={`qi ${i === currentIndex ? 'cur' : ''}`} onClick={() => onSwitchIndex(i)}>
              <div className="qi-t">{item.title || '(New Product)'}</div>
              <div className="qi-id">{item.product_id}</div>
              <div className="qi-s">{item._saved ? 'Draft saved' : 'Unsaved'}</div>
            </div>
          ))}
        </div>
        <button className="qadd" onClick={onAddToQueue} disabled={queue.length >= 10}>+ Add Another</button>
      </div>
      <div className="fp">
        <div className="fh">
          <div className="fh-title">{current.title || 'New Product'}<span style={{ fontSize: 18, color: 'var(--d1)', fontWeight: 300, marginLeft: 10 }}>{currentIndex + 1} / {queue.length}</span></div>
          <div className="fhr"><span className={`sf ${flash ? 'on' : ''}`}>✓ Saved</span><button className="xb" onClick={onClose}>×</button></div>
        </div>
        <div className="fb">
          <div className="fr fr3">
            <div className="fg"><label>Product ID</label><input readOnly value={current.product_id} /></div>
            <div className="fg"><label>Date</label><input readOnly value={fmtDate(current.created_at)} /></div>
            <div className="fg"><label>Time</label><input readOnly value={fmtTime(current.created_at)} /></div>
          </div>
          <div className="fr fr1"><div className="fg"><label>Title</label><input placeholder="e.g. Burmese Pigeon Blood Ruby" value={current.title} onChange={e => upd('title', e.target.value)} /></div></div>
          <div className="fr fr3">
            <div className="fg"><input placeholder="GemType" value={current.gem_type} onChange={e => upd('gem_type', e.target.value)} /></div>
            <div className="fg"><input placeholder="Color" value={current.color} onChange={e => upd('color', e.target.value)} /></div>
            <div className="fg"><input placeholder="Shape" value={current.shape} onChange={e => upd('shape', e.target.value)} /></div>
          </div>
          <div className="fr fr3">
            <div className="fg"><input placeholder="weight" value={current.weight || ''} onChange={e => upd('weight', e.target.value)} /></div>
            <div className="fg"><input placeholder="origin" value={current.origin} onChange={e => upd('origin', e.target.value)} /></div>
            <div className="fg"><input placeholder="treatment" value={current.treatment} onChange={e => upd('treatment', e.target.value)} /></div>
          </div>
          <div className="fr fr2">
            <div className="fg"><label>GIA Report Number</label><input placeholder="2211234567" value={current.gia_report_number} onChange={e => upd('gia_report_number', e.target.value)} /></div>
            <div className="fg"><label>Photo URL</label><input placeholder="https://..." value={current.photo_url} onChange={e => upd('photo_url', e.target.value)} /></div>
          </div>
          <GIASection value={current.gia_report_pdf_url} onChange={upd} />
          <div className="fr fr2">
            <div className="fg"><label>Price Per Carat ($)</label><input placeholder="12000" value={current.price_per_carat || ''} onChange={e => upd('price_per_carat', e.target.value)} /></div>
            <div className="fg"><label>Total Price ($)</label><input placeholder="41040" value={current.total_price || ''} onChange={e => upd('total_price', e.target.value)} /></div>
          </div>
          <div className="fr fr1"><div className="fg"><label>Description</label><textarea placeholder="Additional notes..." value={current.description} onChange={e => upd('description', e.target.value)} /></div></div>
        </div>
        <div className="ff">
          <div className="ff-note">{queue.length > 1 ? `${queue.length} products in queue` : 'Up to 10 products per session'}</div>
          <div className="ffa">
            <button className="bg" onClick={onSaveDrafts} disabled={saving}>{saving ? 'Saving...' : 'Save Drafts'}</button>
            {currentIndex < queue.length - 1 && <button className="bn" onClick={() => onSwitchIndex(currentIndex + 1)}>Next →</button>}
            <button className="bp" onClick={onPublishAll} disabled={saving}>{saving ? 'Saving...' : queue.length > 1 ? `Publish All (${queue.length})` : 'Publish'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [tab, setTab] = useState<string>('active');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [queue, setQueue] = useState<any[]>([]);
  const [curIdx, setCurIdx] = useState(0);

  const filtered: Record<string, any[]> = {
    active: products.filter(p => p.product_state === 'ACTIVE'),
    drafts: products.filter(p => p.product_state === 'DRAFT'),
    inactive: products.filter(p => p.product_state === 'INACTIVE'),
  };

  async function loadProducts() {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (e) setError(e.message); else setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => { loadProducts(); }, []);

  async function openAdd() {
    const np = { ...EMPTY_FORM, product_id: genId(), created_at: new Date().toISOString(), product_state: 'DRAFT', _saved: false };
    const { error: e } = await supabase.from('products').insert({ product_id: np.product_id, title: '', total_price: 0, product_state: 'DRAFT' });
    if (e) { setError(e.message); return; }
    setQueue([np]); setCurIdx(0); setProducts(prev => [np, ...prev]); setShowForm(true);
  }

  function openEdit(product: any) { setQueue([{ ...product, _saved: true }]); setCurIdx(0); setShowForm(true); }

  function updateCurrent(updated: any) {
    const nq = [...queue]; nq[curIdx] = updated; setQueue(nq);
    setProducts(prev => prev.map(p => p.product_id === updated.product_id ? updated : p));
  }

  async function addToQueue() {
    if (queue.length >= 10) return;
    const np = { ...EMPTY_FORM, product_id: genId(), created_at: new Date().toISOString(), product_state: 'DRAFT', _saved: false };
    const { error: e } = await supabase.from('products').insert({ product_id: np.product_id, title: '', total_price: 0, product_state: 'DRAFT' });
    if (e) { setError(e.message); return; }
    const nq = [...queue, np]; setQueue(nq); setCurIdx(nq.length - 1); setProducts(prev => [np, ...prev]);
  }

  async function saveDrafts() {
    setSaving(true);
    for (const p of queue) { const { error: e } = await upsertProduct(p, 'DRAFT'); if (e) { setError(e.message); setSaving(false); return; } }
    await loadProducts(); setSaving(false); setShowForm(false);
  }

  async function publishAll() {
    setSaving(true);
    for (const p of queue) { const { error: e } = await upsertProduct(p, 'ACTIVE'); if (e) { setError(e.message); setSaving(false); return; } }
    // TODO: Call send-new-listing-notification edge function for each published product
    // for (const p of queue) { await supabase.functions.invoke('send-new-listing-notification', { body: { product_id: p.product_id } }); }
    await loadProducts(); setSaving(false); setShowForm(false); setTab('active');
  }

  async function publishOne(product: any) {
    const { error: e } = await upsertProduct(product, 'ACTIVE');
    if (e) { setError(e.message); return; }
    // TODO: await supabase.functions.invoke('send-new-listing-notification', { body: { product_id: product.product_id } });
    await loadProducts();
  }

  async function removeOne(product: any) {
    const { error: e } = await supabase.from('products').update({ product_state: 'INACTIVE' }).eq('product_id', product.product_id);
    if (e) { setError(e.message); return; }
    await loadProducts();
  }

  return (
    <AdminLayout activeNav="products">
      <div className="ph">
        <div className="ph-title">Products</div>
        <div className="ph-right">
          {error && <div className="err-bar">{error}</div>}
          <button className="btn-add" onClick={openAdd} disabled={loading}>+ Add Product</button>
        </div>
      </div>
      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {TAB_LABELS[t]}<span className="tab-n">{filtered[t].length}</span>
          </button>
        ))}
      </div>
      <div className="pb">
        {loading ? (
          <div className="loading">Loading Products...</div>
        ) : filtered[tab].length === 0 ? (
          <div className="empty"><div className="empty-ic">◈</div><div className="empty-tx">No {TAB_LABELS[tab].toLowerCase()} products</div></div>
        ) : (
          <table className="tbl">
            <thead><tr><th>Product</th><th>GIA</th><th>Weight</th><th>Status</th><th>Date</th><th>Total Price</th><th></th></tr></thead>
            <tbody>
              {filtered[tab].map((p: any) => (
                <tr key={p.product_id} onClick={() => openEdit(p)}>
                  <td><div className="td-name">{p.title || '(New Product)'}</div><div className="td-sub">{[p.gem_type, p.color, p.origin].filter(Boolean).join(' · ')}</div></td>
                  <td style={{ fontSize: 11, color: 'var(--d1)' }}>{p.gia_report_number || '--'}</td>
                  <td style={{ fontSize: 12 }}>{p.weight ? `${p.weight} ct` : '--'}</td>
                  <td><span className={`pill pill-${(p.product_state || 'D')[0]}`}>{p.product_state}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--d1)' }}>{fmtDate(p.created_at)}</td>
                  <td className="td-price">{formatMoney(p.total_price)}</td>
                  <td><div className="ra" onClick={e => e.stopPropagation()}>
                    <button className="ab" onClick={() => openEdit(p)}>Edit</button>
                    {p.product_state === 'DRAFT' && <button className="ab pub" onClick={() => publishOne(p)}>Publish</button>}
                    {(p.product_state === 'PUBLISHED' || p.product_state === 'ACTIVE') && <button className="ab rem" onClick={() => removeOne(p)}>Remove</button>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showForm && <ProductForm queue={queue} currentIndex={curIdx} onCurrentChange={updateCurrent} onClose={() => setShowForm(false)} onAddToQueue={addToQueue} onPublishAll={publishAll} onSaveDrafts={saveDrafts} onSwitchIndex={setCurIdx} saving={saving} />}
    </AdminLayout>
  );
}

// end of pages/admin/products.tsx