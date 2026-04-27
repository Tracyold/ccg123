// components/account/mobile/panels/wizard/3WizardFolderModal.tsx
//
// Shared modal used by:
//   • Add Folder       — text input, submit creates folder
//   • Rename Folder    — text input pre-filled with current name
//   • Delete Folder    — confirmation only, no input
//   • Change Folder    — list of folders to pick from, no input

import { useState } from 'react';

interface WizardFolder {
  id:         string;
  name:       string;
  is_default: boolean;
}

// ── Add / Rename ─────────────────────────────────────────────
interface TextModalProps {
  title:          string;
  initialValue?:  string;
  submitLabel:    string;
  onCancel:       () => void;
  onSubmit:       (value: string) => void;
}

export function WizardFolderTextModal({
  title, initialValue = '', submitLabel, onCancel, onSubmit,
}: TextModalProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <Backdrop onCancel={onCancel}>
      <div className="wiz-modal-box">
        <div className="wiz-modal-title">{title}</div>
        <input
          autoFocus
          className="wiz-modal-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && value.trim()) onSubmit(value.trim()); }}
          placeholder="Folder name"
          maxLength={40}
        />
        <div className="wiz-modal-actions">
          <button className="wiz-modal-cancel" onClick={onCancel}>Cancel</button>
          <button
            className="wiz-modal-submit"
            onClick={() => { if (value.trim()) onSubmit(value.trim()); }}
            disabled={!value.trim()}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

// ── Delete confirmation ───────────────────────────────────────
interface DeleteModalProps {
  folderName: string;
  onCancel:   () => void;
  onConfirm:  () => void;
}

export function WizardFolderDeleteModal({ folderName, onCancel, onConfirm }: DeleteModalProps) {
  return (
    <Backdrop onCancel={onCancel}>
      <div className="wiz-modal-box">
        <div className="wiz-modal-title">Delete "{folderName}"?</div>
        <p className="wiz-modal-body">
          Results in this folder will move back to New Results. This cannot be undone.
        </p>
        <div className="wiz-modal-actions">
          <button className="wiz-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="wiz-modal-delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </Backdrop>
  );
}

// ── Change folder picker ──────────────────────────────────────
interface ChangeModalProps {
  folders:       WizardFolder[];
  currentFolder: string | null;
  onCancel:      () => void;
  onSubmit:      (folderId: string) => void;
}

export function WizardFolderChangeModal({
  folders, currentFolder, onCancel, onSubmit,
}: ChangeModalProps) {
  const [selected, setSelected] = useState<string>(currentFolder ?? '');

  return (
    <Backdrop onCancel={onCancel}>
      <div className="wiz-modal-box">
        <div className="wiz-modal-title">Move to Folder</div>
        <div className="wiz-modal-folder-list">
          {folders.map(f => (
            <button
              key={f.id}
              className={`wiz-modal-folder-item${selected === f.id ? ' selected' : ''}`}
              onClick={() => setSelected(f.id)}
            >
              <span className="wiz-modal-folder-icon">▤</span>
              {f.name}
              {f.is_default && (
                <span className="wiz-modal-folder-default">default</span>
              )}
            </button>
          ))}
        </div>
        <div className="wiz-modal-actions">
          <button className="wiz-modal-cancel" onClick={onCancel}>Cancel</button>
          <button
            className="wiz-modal-submit"
            onClick={() => { if (selected) onSubmit(selected); }}
            disabled={!selected || selected === currentFolder}
          >
            Move
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

// ── Shared backdrop ───────────────────────────────────────────
function Backdrop({ onCancel, children }: { onCancel: () => void; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 12020,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 clamp(1rem,5vw,2rem)',
      }}
      onClick={onCancel}
    >
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 380 }}>
        {children}
      </div>
    </div>
  );
}