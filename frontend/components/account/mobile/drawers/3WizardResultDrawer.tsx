// components/account/mobile/drawers/3WizardResultDrawer.tsx

import type { WizardResult } from '../../../../lib/wizardResultsService';
import { useSwipeToClose } from '../../shared/hooks/useSwipeToClose';
import FirstTimeTips from '../ui/FirstTimeTips';
import { WizardFolderChangeModal } from '../modals/WizardFolderModal';
import { useState } from 'react';

interface WizardFolder {
  id:         string;
  name:       string;
  is_default: boolean;
}

interface WizardResultDrawerProps {
  open:                    boolean;
  result:                  WizardResult | null;
  onClose:                 () => void;
  onArchive:               (id: string) => void;
  onMoveToFolder:          (resultId: string, folderId: string) => void;
  folders:                 WizardFolder[];
  onCreateServiceRequest?: (result: WizardResult) => void;
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

function HeroRing({ pct, color }: { pct: number; color: string }) {
  const r      = 45;
  const circ   = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="res-ring">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border-mob)" strokeWidth="4" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 50 50)" />
      </svg>
      <div className="res-ring-num" style={{ color, fontSize: '2.0rem' }}>{pct}</div>
    </div>
  );
}

function ListItem({ text, color }: { text: string; color?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '8px 0', borderBottom: '0.5px solid var(--border-mob)',
    }}>
      <span style={{ color: color || 'var(--gold)', fontSize: '0.75rem', flexShrink: 0, marginTop: 1 }}>✓</span>
      <span style={{ fontFamily: 'var(--font-ui-mob)', fontSize: '0.8125rem', color: 'var(--text-mob)' }}>{text}</span>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="res-section">
      <div className="res-section-label" style={{ color: 'var(--text-mob-muted)' }}>{label}</div>
      {children}
    </div>
  );
}

export default function WizardResultDrawer3({
  open, result, onClose, onArchive, onMoveToFolder, folders, onCreateServiceRequest,
}: WizardResultDrawerProps) {
  const { elementRef, touchHandlers } = useSwipeToClose({ onClose });
  const [showChangeFolder, setShowChangeFolder] = useState(false);

  if (!result) return null;

  const pct    = Math.round(result.feasibility_percent);
  const color  = BAND_COLOR[result.band] ?? '#67e8f9';
  const label  = BAND_LABEL[result.band] ?? result.recommendation;
  const stone  = [result.stone_variety, result.stone_species].filter(Boolean).join(' ') || 'Unnamed stone';
  const weight = result.stone_weight_ct ? `${result.stone_weight_ct} ct` : '--';
  const date   = new Date(result.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const positive:   string[] = Array.isArray(result.positive_selections)   ? result.positive_selections   : [];
  const limiting:   string[] = Array.isArray(result.limiting_selections)   ? result.limiting_selections   : [];
  const structural: string[] = Array.isArray(result.structural_selections) ? result.structural_selections : [];

  const currentFolderId = (result as any).folder_id ?? null;
  const currentFolder   = folders.find(f => f.id === currentFolderId);
  const folderName      = currentFolder
    ? (currentFolder.is_default ? 'New Results' : currentFolder.name)
    : 'New Results';

  return (
    <>
      <div className={`overlay${open ? ' open' : ''}`} onClick={onClose} />

      <div
        ref={elementRef}
        className={`res-drawer${open ? ' open' : ''}`}
        {...touchHandlers}
      >
        <div className="res-handle" />

        <FirstTimeTips type="drawer-slide" show={open} />
        <div className="res-body">

          <div className="res-topbar">
            <span style={{
              fontFamily: 'var(--font-mono-mob)', fontSize: '0.625rem',
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--text-mob-muted)', flex: 1,
            }}>
              {stone}
            </span>
            <button className="res-close" onClick={onClose}>✕</button>
          </div>

          <div className="res-scroll">

            {/* ── Folder indicator ── */}
            <div className="wiz-drawer-folder-row">
              <span className="wiz-drawer-folder-label">
                In <strong>{folderName}</strong>
              </span>
              <button
                className="wiz-drawer-folder-change"
                onClick={() => setShowChangeFolder(true)}
              >
                change folder
              </button>
            </div>

            {/* ── Hero ── */}
            <div className="res-hero">
              <HeroRing pct={pct} color={color} />
              <div>
                <div className="res-stone-name">{stone}</div>
                <div className="res-stone-meta">
                  {weight} · {result.stone_cut || '--'}<br />
                  {result.stone_dimensions || '--'}
                </div>
                <div className="res-rec" style={{ color }}>{label}</div>
              </div>
            </div>

            <Section label="Positive Characteristics">
              {positive.length > 0
                ? positive.map((item, i) => <ListItem key={i} text={item} color="var(--gold)" />)
                : <div style={{ fontFamily: 'var(--font-ui-mob)', fontSize: '0.75rem', color: 'var(--text-mob-muted)', fontStyle: 'italic', padding: '6px 0' }}>None selected</div>
              }
            </Section>

            <Section label="Limiting Characteristics">
              {limiting.length > 0
                ? limiting.map((item, i) => <ListItem key={i} text={item} color="#f87171" />)
                : <div style={{ fontFamily: 'var(--font-ui-mob)', fontSize: '0.75rem', color: 'var(--text-mob-muted)', fontStyle: 'italic', padding: '6px 0' }}>None selected</div>
              }
            </Section>

            <Section label="Structural Condition">
              {structural.length > 0
                ? structural.map((item, i) => <ListItem key={i} text={item} color="#fb923c" />)
                : <div style={{ fontFamily: 'var(--font-ui-mob)', fontSize: '0.75rem', color: 'var(--text-mob-muted)', fontStyle: 'italic', padding: '6px 0' }}>None selected</div>
              }
            </Section>

            <div className="res-date">{date}</div>

            {/* Create Service Request */}
            {onCreateServiceRequest && (
              <div style={{ marginTop: 24 }}>
                <button
                  onClick={() => onCreateServiceRequest(result)}
                  style={{
                    width: '100%', background: 'var(--gold)', color: 'var(--bg-mob-deep)',
                    border: 'none', padding: 13, fontFamily: 'var(--font-mono-mob)',
                    fontSize: '0.625rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'opacity 180ms ease',
                  }}
                  onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
                  onMouseOut={e  => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                >
                  + Create Service Request
                </button>
              </div>
            )}

            {/* Archive */}
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => onArchive(result.id)}
                style={{
                  width: '100%', background: 'transparent',
                  border: '0.5px solid var(--border-mob)',
                  color: 'var(--text-mob-muted)',
                  padding: 13, fontFamily: 'var(--font-mono-mob)',
                  fontSize: '0.625rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'opacity 180ms ease',
                }}
                onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.6'; }}
                onMouseOut={e  => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              >
                Archive Result
              </button>
            </div>

          </div>{/* end res-scroll */}
        </div>{/* end res-body */}
      </div>{/* end res-drawer */}

      {/* ── Change folder modal ── */}
      {showChangeFolder && (
        <WizardFolderChangeModal
          folders={folders}
          currentFolder={currentFolderId}
          onCancel={() => setShowChangeFolder(false)}
          onSubmit={folderId => {
            onMoveToFolder(result.id, folderId);
            setShowChangeFolder(false);
          }}
        />
      )}
    </>
  );
}