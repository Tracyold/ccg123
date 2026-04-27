// components/account/mobile/panels/3WizardResultsPanel.tsx

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { getUserWizardResults } from '../../../../lib/wizardResultsService';
import type { WizardResult } from '../../../../lib/wizardResultsService';
import WizardResultDrawer3 from '../drawers/3WizardResultDrawer';
import WizardFolderGrid from '../grids/WizardFolderGrid';
import { WizardFolderTextModal } from '../modals/WizardFolderModal';
import { useSwipeDownToClose } from '../../shared/hooks/useSwipeDownToClose';
import FirstTimeTips from '../ui/FirstTimeTips';

interface WizardResultsPanelProps {
  open:                    boolean;
  onClose:                 () => void;
  onCreateServiceRequest?: (result: WizardResult) => void;
}

interface WizardFolder {
  id:         string;
  name:       string;
  is_default: boolean;
  created_at: string;
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
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono-mob)', fontSize: 'clamp(2.5rem,10vw,3.5rem)',
      fontWeight: 700, color,
      lineHeight: 1,
    }}>
      {pct}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────

async function fetchFolders(userId: string): Promise<WizardFolder[]> {
  const { data, error } = await supabase
    .from('wizard_folders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) { console.error('fetchFolders:', error); return []; }
  return data ?? [];
}

async function ensureDefaultFolder(userId: string): Promise<WizardFolder | null> {
  // Check if default folder already exists
  const { data: existing } = await supabase
    .from('wizard_folders')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();
  if (existing) return existing;

  // Create it
  const { data, error } = await supabase
    .from('wizard_folders')
    .insert({ user_id: userId, name: 'New Results', is_default: true })
    .select()
    .single();
  if (error) { console.error('ensureDefaultFolder:', error); return null; }
  return data;
}

// ── Component ─────────────────────────────────────────────────

export default function WizardResultsPanel3({
  open, onClose, onCreateServiceRequest,
}: WizardResultsPanelProps) {
  const { elementRef, touchHandlers } = useSwipeDownToClose({ onClose });

  // Data
  const [results,        setResults]        = useState<WizardResult[]>([]);
  const [folders,        setFolders]        = useState<WizardFolder[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [loadError,      setLoadError]      = useState<string | null>(null);

  // Navigation
  const [activeTab,      setActiveTab]      = useState<'active' | 'archive'>('active');
  const [openFolder,     setOpenFolder]     = useState<WizardFolder | null>(null); // null = folder grid view

  // Drawer
  const [selectedResult, setSelectedResult] = useState<WizardResult | null>(null);

  // Modals
  const [showAddFolder,  setShowAddFolder]  = useState(false);

  // ── Fetch on open ──────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      // Ensure default folder exists
      await ensureDefaultFolder(user.id);

      // Fetch folders + results in parallel
      const [folderData, resultData] = await Promise.all([
        fetchFolders(user.id),
        getUserWizardResults().catch(() => []),
      ]);

      if (cancelled) return;

      // Assign any unfoldered results to the default folder
      const defaultFolder = folderData.find(f => f.is_default);
      if (defaultFolder) {
        const unfoldered = resultData.filter((r: any) => !r.folder_id);
        if (unfoldered.length > 0) {
          await supabase
            .from('wizard_results')
            .update({ folder_id: defaultFolder.id })
            .in('id', unfoldered.map((r: any) => r.id));
          unfoldered.forEach((r: any) => { r.folder_id = defaultFolder.id; });
        }
      }

      setFolders(folderData);
      setResults(resultData);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [open]);

  // Reset view when panel closes
  useEffect(() => {
    if (!open) {
      setOpenFolder(null);
      setActiveTab('active');
    }
  }, [open]);

  // ── Folder actions ─────────────────────────────────────────

  const handleAddFolder = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('wizard_folders')
      .insert({ user_id: user.id, name, is_default: false })
      .select()
      .single();
    if (error) { console.error('addFolder:', error); alert('Could not create folder.'); return; }
    setFolders(prev => [...prev, data]);
    setShowAddFolder(false);
  };

  const handleRenameFolder = async (id: string, newName: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
    const { error } = await supabase
      .from('wizard_folders')
      .update({ name: newName })
      .eq('id', id);
    if (error) {
      console.error('renameFolder:', error);
      // Revert
      setFolders(prev => prev.map(f => f.id === id ? { ...f, name: f.name } : f));
      alert('Could not rename folder.');
    }
  };

  const handleDeleteFolder = async (id: string) => {
    // Move its results to the default folder first
    const defaultFolder = folders.find(f => f.is_default);
    if (defaultFolder) {
      await supabase
        .from('wizard_results')
        .update({ folder_id: defaultFolder.id })
        .eq('folder_id', id);
      setResults(prev => prev.map(r =>
        (r as any).folder_id === id ? { ...r, folder_id: defaultFolder.id } : r
      ));
    }

    setFolders(prev => prev.filter(f => f.id !== id));
    const { error } = await supabase.from('wizard_folders').delete().eq('id', id);
    if (error) { console.error('deleteFolder:', error); alert('Could not delete folder.'); }
  };

  // ── Archive action (called from drawer) ────────────────────

  const handleArchive = async (id: string) => {
    const prev         = results.find(r => r.id === id);
    const prevArchived = (prev as any)?.is_archived ?? false;

    setResults(list => list.map(r =>
      r.id === id ? { ...r, is_archived: true } : r
    ));
    setSelectedResult(null);

    const { error } = await supabase
      .from('wizard_results')
      .update({ is_archived: true })
      .eq('id', id);

    if (error) {
      console.error('Archive write failed:', error);
      setResults(list => list.map(r =>
        r.id === id ? { ...r, is_archived: prevArchived } : r
      ));
      alert('Could not archive this result. Please try again.');
    }
  };

  // ── Move to folder (called from drawer) ───────────────────

  const handleMoveToFolder = async (resultId: string, folderId: string) => {
    setResults(list => list.map(r =>
      r.id === resultId ? { ...r, folder_id: folderId } : r
    ));
    // Update selected result so drawer reflects new folder immediately
    setSelectedResult(prev => prev ? { ...prev, folder_id: folderId } as any : prev);

    const { error } = await supabase
      .from('wizard_results')
      .update({ folder_id: folderId })
      .eq('id', resultId);

    if (error) {
      console.error('moveToFolder:', error);
      alert('Could not move result. Please try again.');
    }
  };

  // ── Derived lists ──────────────────────────────────────────

  const activeResults   = results.filter(r => !(r as any).is_archived);
  const archivedResults = results.filter(r =>  (r as any).is_archived);

  // Results shown inside an open folder (active only)
  const folderResults = openFolder
    ? activeResults.filter(r => (r as any).folder_id === openFolder.id)
    : [];

  // ── Render ─────────────────────────────────────────────────

  return (
    <>
      <div ref={elementRef} className={`slide-panel${open ? ' open' : ''}`}>
        <FirstTimeTips type="panel-down" show={open} />

        {/* ── Header ── */}
        <div className="panel-header" {...touchHandlers}>
          {openFolder ? (
            // Inside a folder — show back button + folder name
            <button
              className="wiz-back-btn"
              onClick={() => setOpenFolder(null)}
            >
              ← {openFolder.is_default ? 'New Results' : openFolder.name}
            </button>
          ) : (
            <span className="panel-title">Wizard Results</span>
          )}
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Tab row (only on folder grid view) ── */}
        {!openFolder && (
          <div className="sr-tab-bar">
            <button
              className={`sr-tab${activeTab === 'active' ? ' active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active · {activeResults.length}
            </button>
            <button
              className={`sr-tab${activeTab === 'archive' ? ' active' : ''}`}
              onClick={() => setActiveTab('archive')}
            >
              Archive{archivedResults.length > 0 ? ` · ${archivedResults.length}` : ''}
            </button>
            <button
              className="sr-tab wiz-add-folder-btn"
              onClick={() => setShowAddFolder(true)}
            >
              + Add Folder
            </button>
          </div>
        )}

        {/* ── Body ── */}
        <div className="sr-list" style={{ flex: 1, overflowY: 'auto' }}>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
              <p style={{ fontFamily: 'var(--font-ui-mob)', fontSize: '0.875rem', color: 'var(--text-mob-muted)' }}>Loading...</p>
            </div>

          ) : loadError ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(1rem,4.5vw,1.5rem)', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-ui-mob)', fontSize: 'clamp(13px,3.5vw,14px)', color: 'var(--text-mob-muted)' }}>
                {loadError}
              </p>
            </div>

          ) : openFolder ? (
            // ── Inside a folder: show its results ──
            folderResults.length === 0 ? (
              <div className="wiz-empty">
                <div className="wiz-empty-sub">No results in this folder.</div>
              </div>
            ) : (
              <div className="wiz-grid">
                {folderResults.map(r => {
                  const color  = BAND_COLOR[r.band] ?? '#e7e5e4';
                  const label  = BAND_LABEL[r.band] ?? r.recommendation;
                  const pct    = Math.round(r.feasibility_percent);
                  const stone  = [r.stone_variety, r.stone_species].filter(Boolean).join(' ') || 'Unnamed stone';
                  const date   = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const weight = r.stone_weight_ct ? `${r.stone_weight_ct}ct` : '—ct';
                  return (
                    <div
                      key={r.id}
                      className="wiz-thumb"
                      style={{
                        borderColor: color + '80',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '20px 12px',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)',
                        transition: 'box-shadow 120ms ease',
                      }}
                      onClick={() => setSelectedResult(r)}
                      onPointerDown={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.55)'; }}
                      onPointerUp={e   => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)'; }}
                      onPointerLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)'; }}
                    >
                      <ScoreRing pct={pct} color={color} />
                      <div style={{
                        fontFamily: 'var(--font-ui-mob)',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--text-mob)',
                        textAlign: 'center',
                        lineHeight: 1.3,
                      }}>
                        {stone}
                      </div>
                    </div>
                  );
                })}
              </div>
            )

          ) : activeTab === 'active' ? (
            // ── Folder grid ──
            folders.length === 0 ? (
              <div className="wiz-empty">
                <div className="wiz-empty-title">No folders yet.</div>
              </div>
            ) : (
              <WizardFolderGrid
                folders={folders}
                results={activeResults as any}
                onOpenFolder={setOpenFolder}
                onRenameFolder={handleRenameFolder}
                onDeleteFolder={handleDeleteFolder}
              />
            )

          ) : (
            // ── Archive tab ──
            archivedResults.length === 0 ? (
              <div className="wiz-empty">
                <div className="wiz-empty-sub">No archived results.</div>
              </div>
            ) : (
              <div className="wiz-grid">
                {archivedResults.map(r => {
                  const color  = BAND_COLOR[r.band] ?? '#e7e5e4';
                  const label  = BAND_LABEL[r.band] ?? r.recommendation;
                  const pct    = Math.round(r.feasibility_percent);
                  const stone  = [r.stone_variety, r.stone_species].filter(Boolean).join(' ') || 'Unnamed stone';
                  const date   = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const weight = r.stone_weight_ct ? `${r.stone_weight_ct}ct` : '—ct';
                  return (
                    <div
                      key={r.id}
                      className="wiz-thumb"
                      style={{
                        borderColor: color + '80',
                        cursor: 'default',
                        opacity: 0.45,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '20px 12px',
                      }}
                    >
                      <ScoreRing pct={pct} color={color} />
                      <div style={{
                        fontFamily: 'var(--font-ui-mob)',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--text-mob)',
                        textAlign: 'center',
                        lineHeight: 1.3,
                      }}>
                        {stone}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Add folder modal ── */}
      {showAddFolder && (
        <WizardFolderTextModal
          title="New Folder"
          submitLabel="Create"
          onCancel={() => setShowAddFolder(false)}
          onSubmit={handleAddFolder}
        />
      )}

      {/* ── Result drawer ── */}
      <WizardResultDrawer3
        open={selectedResult !== null}
        result={selectedResult}
        onClose={() => setSelectedResult(null)}
        onArchive={handleArchive}
        onMoveToFolder={handleMoveToFolder}
        folders={folders}
        onCreateServiceRequest={onCreateServiceRequest}
      />
    </>
  );
}