// components/account/mobile/panels/wizard/3WizardFolderGrid.tsx
//
// Renders the folder thumbnail grid inside the Wizard Results panel.
// Each folder is a square tile showing the folder name and result count.
// The default "New Results" folder is always first and cannot be deleted.
//
// Props:
//   folders        — all folders belonging to this user
//   results        — all wizard results (used for per-folder counts)
//   onOpenFolder   — called when user taps a folder tile
//   onAddFolder    — called when user taps + Add Folder (handled in parent)
//   onRenameFolder — (id, newName) => void
//   onDeleteFolder — (id) => void

import { useState } from 'react';
import { WizardFolderTextModal, WizardFolderDeleteModal } from '../modals/WizardFolderModal';

interface WizardFolder {
  id:         string;
  name:       string;
  is_default: boolean;
  created_at: string;
}

interface WizardResult {
  id:        string;
  folder_id: string | null;
  [key: string]: any;
}

interface Props {
  folders:        WizardFolder[];
  results:        WizardResult[];
  onOpenFolder:   (folder: WizardFolder) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
}

export default function WizardFolderGrid({
  folders, results, onOpenFolder, onRenameFolder, onDeleteFolder,
}: Props) {
  const [renaming, setRenaming] = useState<WizardFolder | null>(null);
  const [deleting, setDeleting] = useState<WizardFolder | null>(null);

  // Count results per folder
  const countFor = (folderId: string) =>
    results.filter(r => r.folder_id === folderId).length;

  // Default folder first, then alphabetical
  const sorted = [...folders].sort((a, b) => {
    if (a.is_default) return -1;
    if (b.is_default) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <div className="wiz-folder-grid">
        {sorted.map(folder => {
          const count = countFor(folder.id);
          return (
            <div key={folder.id} className="wiz-folder-tile tile dim">
              {/* Tap opens folder */}
              <button
                className="wiz-folder-tile-inner"
                onClick={() => onOpenFolder(folder)}
              >
                <div className="wiz-folder-icon">▤</div>
                <div className="wiz-folder-name">
                  {folder.is_default ? 'New Results' : folder.name}
                </div>
                <div className="wiz-folder-count">
                  {count} {count === 1 ? 'result' : 'results'}
                </div>
              </button>

              {/* Context actions — rename + delete (not on default) */}
              {!folder.is_default && (
                <div className="wiz-folder-actions">
                  <button
                    className="wiz-folder-action-btn"
                    onClick={e => { e.stopPropagation(); setRenaming(folder); }}
                    title="Rename"
                  >
                    ✎
                  </button>
                  <button
                    className="wiz-folder-action-btn"
                    onClick={e => { e.stopPropagation(); setDeleting(folder); }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rename modal */}
      {renaming && (
        <WizardFolderTextModal
          title="Rename Folder"
          initialValue={renaming.name}
          submitLabel="Rename"
          onCancel={() => setRenaming(null)}
          onSubmit={name => {
            onRenameFolder(renaming.id, name);
            setRenaming(null);
          }}
        />
      )}

      {/* Delete confirmation modal */}
      {deleting && (
        <WizardFolderDeleteModal
          folderName={deleting.name}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            onDeleteFolder(deleting.id);
            setDeleting(null);
          }}
        />
      )}
    </>
  );
}