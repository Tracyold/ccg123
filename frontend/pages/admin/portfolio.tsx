// start of pages/admin/portfolio.tsx

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { fmtDate, fmtTime } from '../../lib/utils';

const TABS = ['published', 'drafts', 'archived'] as const;
const TAB_LABELS: Record<string, string> = { published: 'Published', drafts: 'Drafts', archived: 'Archived' };
const EMPTY_FORM: Record<string, any> = { photo_url: '', year: '', caption: '', description: '', sort_order: '' };
function genId() { return 'PPH-' + Date.now().toString(36).toUpperCase(); }

function PhotoSection({ value, onChange }: { value: string; onChange: (f: string, v: string) => void }) {
  const [mode, setMode] = useState('upload');
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const handleFile = async (e: any) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    // Upload to portfolio-photos bucket
    const path = `${Date.now()}_${f.name}`;
    const { data, error } = await supabase.storage.from('portfolio-photos').upload(path, f, { contentType: f.type });
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('portfolio-photos').getPublicUrl(data.path);
      onChange('photo_url', urlData.publicUrl);
    } else {
      onChange('photo_url', `[uploaded] ${f.name}`);
    }
  };
  return (
    <div className="photo-blk">
      <div className="photo-l">Photo</div>
      <div className="photo-mr">
        {[['upload', 'Upload'], ['url', 'URL']].map(([m, l]) => (
          <button key={m} type="button" className={`gmb ${mode === m ? 'on' : ''}`} onClick={() => setMode(m)}>{l}</button>
        ))}
      </div>
      {mode === 'upload' ? (
        <div className="uz" onClick={() => fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.tiff,.tif,.dng,.heic" onChange={handleFile} />
          <div className="ui">↑</div><p>Click to upload photo</p>
          <p style={{ fontSize: 8.5, color: 'var(--d2)', marginTop: 4, letterSpacing: '.08em' }}>JPG · PNG · TIFF · DNG · HEIC · Max 25MB</p>
          {fileName && <div className="ufn">{fileName}</div>}
        </div>
      ) : (
        <input type="text" placeholder="https://... external image URL" value={value}
          onChange={e => onChange('photo_url', e.target.value)}
          style={{ background: 'var(--k1)', border: '1px solid var(--ln)', color: 'var(--tx)', padding: '8px 10px', fontFamily: 'var(--sans)', fontSize: '12px', width: '100%', outline: 'none' }}
        />
      )}
      {value && !value.startsWith('[uploaded]') ? (
        <img src={value} alt="" className="photo-preview" onError={(e: any) => (e.target.style.display = 'none')} />
      ) : (
        <div className="photo-preview-empty">◻</div>
      )}
    </div>
  );
}

function SortBadge({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const startEdit = (e: any) => { e.stopPropagation(); setDraft(String(value)); setEditing(true); setTimeout(() => inputRef.current?.focus(), 0); };
  const commit = () => { const n = parseInt(draft, 10); if (!isNaN(n) && n > 0) onCommit(n); setEditing(false); };
  const handleKey = (e: any) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); };
  if (editing) return <input ref={inputRef} className="sort-input" value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit} onKeyDown={handleKey} onClick={e => e.stopPropagation()} />;
  return <div className="sort-badge" onClick={startEdit} title="Click to reposition">{value}</div>;
}

function PhotoForm({ queue, currentIndex, onCurrentChange, onClose, onAddToQueue, onPublishAll, onSaveDrafts, onSwitchIndex, onArchiveCurrent, isEdit }: any) {
  const current = queue[currentIndex];
  const [flash, setFlash] = useState(false);
  const timer = useRef<any>(null);
  const upd = (f: string, v: any) => onCurrentChange({ ...current, [f]: v });

  useEffect(() => {
    timer.current = setInterval(async () => {
      // Auto-save as draft
      if (current.portfolio_photo_id && !current.portfolio_photo_id.startsWith('PPH-')) {
        await supabase.from('portfolio_photos').update({
          photo_url: current.photo_url || null,
          year: current.year || null,
          caption: current.caption || null,
          description: current.description || null,
          sort_order: current.sort_order ? parseInt(current.sort_order) : 0,
        }).eq('portfolio_photo_id', current.portfolio_photo_id);
      }
      setFlash(true); setTimeout(() => setFlash(false), 2000);
    }, 15000);
    return () => clearInterval(timer.current);
  }, [current]);

  return (
    <div className="ov">
      <div className="qp">
        <div className="qh">Queue ({queue.length}/10)</div>
        <div className="ql">
          {queue.map((item: any, i: number) => (
            <div key={item.portfolio_photo_id} className={`qi ${i === currentIndex ? 'cur' : ''}`} onClick={() => onSwitchIndex(i)}>
              {item.photo_url && !item.photo_url.startsWith('[uploaded]') ? (
                <img src={item.photo_url} alt="" className="qi-thumb" onError={(e: any) => (e.target.style.display = 'none')} />
              ) : <div className="qi-thumb-empty">◻</div>}
              <div className="qi-year">{item.year || '—'}</div>
              <div className="qi-t">{item.caption || '(New Photo)'}</div>
              <div className="qi-id">{item.portfolio_photo_id}</div>
              <div className="qi-s">{item._saved ? 'Draft saved' : 'Unsaved'}</div>
            </div>
          ))}
        </div>
        {!isEdit && <button className="qadd" onClick={onAddToQueue} disabled={queue.length >= 10}>+ Add Another</button>}
      </div>
      <div className="fp">
        <div className="fh">
          <div className="fh-title">
            {current.year ? <span style={{ fontFamily: 'var(--serif)', color: 'var(--gl)' }}>{current.year}</span> : 'New Photo'}
            {current.caption && <span style={{ fontSize: 13, color: 'var(--d1)', fontWeight: 300, marginLeft: 10 }}>{current.caption}</span>}
            <span style={{ fontSize: 12, color: 'var(--d2)', fontWeight: 300, marginLeft: 10 }}>{currentIndex + 1} / {queue.length}</span>
          </div>
          <div className="fhr"><span className={`sf ${flash ? 'on' : ''}`}>✓ Saved</span><button className="xb" onClick={onClose}>×</button></div>
        </div>
        <div className="fb">
          <div className="fr fr3">
            <div className="fg"><label>Photo ID</label><input readOnly value={current.portfolio_photo_id} /></div>
            <div className="fg"><label>Date</label><input readOnly value={fmtDate(current.created_at)} /></div>
            <div className="fg"><label>Time</label><input readOnly value={fmtTime(current.created_at)} /></div>
          </div>
          <PhotoSection value={current.photo_url} onChange={upd} />
          <div className="fr fr2">
            <div className="fg"><label>Year *</label><input placeholder="e.g. 2024" maxLength={4} value={current.year} onChange={e => upd('year', e.target.value)} />
              <span style={{ fontSize: 8.5, color: 'var(--d2)', marginTop: 3, letterSpacing: '.06em' }}>Displayed in gold below each photo on the public portfolio</span>
            </div>
            <div className="fg"><label>Sort Order</label><input type="number" placeholder="Leave blank to append at end" value={current.sort_order} onChange={e => upd('sort_order', e.target.value)} /></div>
          </div>
          <div className="fr fr1"><div className="fg"><label>Caption</label><input placeholder="e.g. Kashmir Sapphire Collection" value={current.caption} onChange={e => upd('caption', e.target.value)} /></div></div>
          <div className="fr fr1"><div className="fg"><label>Description</label><textarea placeholder="Additional details about this piece or collection..." value={current.description} onChange={e => upd('description', e.target.value)} /></div></div>
        </div>
        <div className="ff">
          <div className="ff-note">{queue.length > 1 ? `${queue.length} photos in queue` : 'Up to 10 photos per session'}</div>
          <div className="ffa">
            {isEdit && <button className="bg arc" onClick={onArchiveCurrent}>Archive</button>}
            <button className="bg" onClick={onSaveDrafts}>{queue.length > 1 ? 'Save Drafts' : 'Save Draft'}</button>
            {currentIndex < queue.length - 1 && <button className="bn" onClick={() => onSwitchIndex(currentIndex + 1)}>Next →</button>}
            <button className="bp" onClick={onPublishAll}>{queue.length > 1 ? `Publish All (${queue.length})` : 'Publish'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPortfolioPage() {
  const [tab, setTab] = useState<string>('published');
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [queue, setQueue] = useState<any[]>([]);
  const [curIdx, setCurIdx] = useState(0);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered: Record<string, any[]> = {
    published: photos.filter(p => p.published && !p.archived),
    drafts: photos.filter(p => !p.published && !p.archived),
    archived: photos.filter(p => p.archived),
  };

  async function loadPhotos() {
    setLoading(true);
    const { data } = await supabase.from('portfolio_photos').select('*').order('sort_order', { ascending: true });
    setPhotos(data || []); setLoading(false);
  }

  useEffect(() => { loadPhotos(); }, []);

  async function handleSortCommit(photo: any, newOrder: number) {
    const conflict = photos.find(p => p.sort_order === newOrder && p.portfolio_photo_id !== photo.portfolio_photo_id);
    if (conflict) {
      await supabase.from('portfolio_photos').update({ sort_order: photo.sort_order }).eq('portfolio_photo_id', conflict.portfolio_photo_id);
    }
    await supabase.from('portfolio_photos').update({ sort_order: newOrder }).eq('portfolio_photo_id', photo.portfolio_photo_id);
    await loadPhotos();
  }

  function openAdd() {
    const maxOrder = photos.length > 0 ? Math.max(...photos.map(p => p.sort_order)) : 0;
    const np = { ...EMPTY_FORM, portfolio_photo_id: genId(), created_at: new Date().toISOString(), published: false, archived: false, sort_order: maxOrder + 1, _saved: false };
    setQueue([np]); setCurIdx(0); setIsEdit(false); setShowForm(true);
  }

  function openEdit(photo: any) { if (selectMode) return; setQueue([{ ...photo, _saved: true }]); setCurIdx(0); setIsEdit(true); setShowForm(true); }
  function updateCurrent(updated: any) { const nq = [...queue]; nq[curIdx] = updated; setQueue(nq); }
  function addToQueue() {
    if (queue.length >= 10) return;
    const maxOrder = photos.length > 0 ? Math.max(...photos.map(p => p.sort_order)) : 0;
    const np = { ...EMPTY_FORM, portfolio_photo_id: genId(), created_at: new Date().toISOString(), published: false, archived: false, sort_order: maxOrder + queue.length + 1, _saved: false };
    const nq = [...queue, np]; setQueue(nq); setCurIdx(nq.length - 1);
  }

  async function saveDrafts() {
    for (const q of queue) {
      const isNew = !q.portfolio_photo_id || q.portfolio_photo_id.startsWith('PPH-');
      const payload = {
        photo_url: q.photo_url || '',
        year: q.year || null, caption: q.caption || null, description: q.description || null,
        sort_order: q.sort_order ? parseInt(q.sort_order) : 0,
        published: false, archived: false,
      };
      if (isNew) {
        await supabase.from('portfolio_photos').insert(payload);
      } else {
        await supabase.from('portfolio_photos').update(payload).eq('portfolio_photo_id', q.portfolio_photo_id);
      }
    }
    await loadPhotos(); setShowForm(false);
  }

  async function publishAll() {
    for (const q of queue) {
      const isNew = !q.portfolio_photo_id || q.portfolio_photo_id.startsWith('PPH-');
      const payload = {
        photo_url: q.photo_url || '',
        year: q.year || null, caption: q.caption || null, description: q.description || null,
        sort_order: q.sort_order ? parseInt(q.sort_order) : 0,
        published: true, archived: false,
      };
      if (isNew) {
        await supabase.from('portfolio_photos').insert(payload);
      } else {
        await supabase.from('portfolio_photos').update(payload).eq('portfolio_photo_id', q.portfolio_photo_id);
      }
    }
    await loadPhotos(); setShowForm(false); setTab('published');
  }

  async function archiveOne(id: string) {
    await supabase.from('portfolio_photos').update({ archived: true, published: false }).eq('portfolio_photo_id', id);
    await loadPhotos(); setShowForm(false);
  }

  function toggleSelect(id: string, e: any) { e.stopPropagation(); setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); }
  async function bulkPublish() { for (const id of selected) await supabase.from('portfolio_photos').update({ published: true }).eq('portfolio_photo_id', id); setSelected(new Set()); setSelectMode(false); await loadPhotos(); }
  async function bulkUnpublish() { for (const id of selected) await supabase.from('portfolio_photos').update({ published: false }).eq('portfolio_photo_id', id); setSelected(new Set()); setSelectMode(false); await loadPhotos(); }
  async function bulkArchive() { for (const id of selected) await supabase.from('portfolio_photos').update({ archived: true, published: false }).eq('portfolio_photo_id', id); setSelected(new Set()); setSelectMode(false); await loadPhotos(); }

  const currentTabPhotos = [...filtered[tab]].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <AdminLayout activeNav="portfolio">
      <div className="ph">
        <div className="ph-title">Portfolio</div>
        <div className="ph-actions">
          <button className={`btn-sel ${selectMode ? 'on' : ''}`} onClick={() => { setSelectMode(s => !s); setSelected(new Set()); }}>{selectMode ? 'Cancel' : 'Select'}</button>
          <button className="btn-add" onClick={openAdd}>+ Add Photos</button>
        </div>
      </div>
      {selectMode && selected.size > 0 && (
        <div className="bulk-bar">
          <span className="bulk-count">{selected.size} selected</span>
          <button className="bb pub" onClick={bulkPublish}>Publish</button>
          <button className="bb" onClick={bulkUnpublish}>Unpublish</button>
          <button className="bb arc" onClick={bulkArchive}>Archive</button>
        </div>
      )}
      <div className="tabs">
        {TABS.map(t => (<button key={t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>{TAB_LABELS[t]}<span className="tab-n">{filtered[t].length}</span></button>))}
      </div>
      <div className="pb" style={{ padding: '28px 32px' }}>
        {loading ? <div className="loading">Loading Photos...</div> : currentTabPhotos.length === 0 ? (
          <div className="empty"><div className="empty-ic">◻</div><div className="empty-tx">No {TAB_LABELS[tab].toLowerCase()} photos</div></div>
        ) : (
          <div className="grid">
            {currentTabPhotos.map(photo => (
              <div key={photo.portfolio_photo_id} className={`card ${selected.has(photo.portfolio_photo_id) ? 'selected' : ''}`} onClick={() => openEdit(photo)}>
                {photo.photo_url && !photo.photo_url.startsWith('[uploaded]') ? (
                  <img src={photo.photo_url} alt={photo.caption || ''} className="card-thumb" onError={(e: any) => (e.target.style.display = 'none')} />
                ) : <div className="card-thumb-empty">◻</div>}
                {selectMode ? (
                  <input type="checkbox" className="card-check" checked={selected.has(photo.portfolio_photo_id)} onChange={e => toggleSelect(photo.portfolio_photo_id, e)} onClick={e => e.stopPropagation()} />
                ) : tab !== 'archived' && <SortBadge value={photo.sort_order} onCommit={n => handleSortCommit(photo, n)} />}
                <div className={`pub-dot ${photo.published ? 'live' : 'draft'}`} />
                {tab !== 'archived' && !selectMode && (
                  <div className="card-ra" onClick={e => e.stopPropagation()}>
                    <button className="ab" onClick={() => openEdit(photo)}>Edit</button>
                    <button className="ab arc" onClick={() => archiveOne(photo.portfolio_photo_id)}>Archive</button>
                  </div>
                )}
                <div className="card-meta">
                  <div className={`card-year ${!photo.year ? 'empty' : ''}`}>{photo.year || 'No year'}</div>
                  {photo.caption && <div className="card-caption">{photo.caption}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showForm && <PhotoForm queue={queue} currentIndex={curIdx} onCurrentChange={updateCurrent} onClose={() => setShowForm(false)} onAddToQueue={addToQueue} onPublishAll={publishAll} onSaveDrafts={saveDrafts} onSwitchIndex={setCurIdx} onArchiveCurrent={() => archiveOne(queue[curIdx].portfolio_photo_id)} isEdit={isEdit} />}
    </AdminLayout>
  );
}

// end of pages/admin/portfolio.tsx