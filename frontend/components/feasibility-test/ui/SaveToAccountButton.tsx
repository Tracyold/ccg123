import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { saveWizardResult } from '../../../lib/wizardResultsService'
import type { WizardResultPayload } from '../../../lib/wizardResultsService'

interface SaveToAccountButtonProps {
  payload:    WizardResultPayload
  isLoggedIn: boolean
}

interface WizardFolder {
  id:         string
  name:       string
  is_default: boolean
}

const PENDING_KEY = 'ccg_pending_wizard_save'

// ── Folder picker modal ───────────────────────────────────────
function FolderPickerModal({
  folders,
  onCancel,
  onSubmit,
}: {
  folders:  WizardFolder[]
  onCancel: () => void
  onSubmit: (folderId: string) => void
}) {
  const [selected, setSelected] = useState<string>(
    folders.find(f => f.is_default)?.id ?? folders[0]?.id ?? ''
  )

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 clamp(1rem,5vw,2rem)',
      }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 380,
          background: 'var(--bg-deep)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 'clamp(1.25rem,5vw,1.75rem)',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 'clamp(15px,4vw,17px)',
          fontWeight: 600, color: 'var(--text)',
        }}>
          Save to Folder
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => setSelected(f.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 14px',
                background: 'transparent',
                border: `1px solid ${selected === f.id ? 'rgba(255,211,105,0.8)' : 'var(--border)'}`,
                borderRadius: 8,
                color: selected === f.id ? 'var(--accent)' : 'var(--text)',
                fontFamily: 'var(--font-body)', fontSize: '0.875rem',
                cursor: 'pointer', textAlign: 'left',
                transition: 'border-color 150ms, color 150ms',
              }}
            >
              <span style={{ opacity: 0.6, fontSize: '1rem' }}>▤</span>
              {f.is_default ? 'New Results' : f.name}
              {f.is_default && (
                <span style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--font-body)', fontSize: 9,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--text-muted)', opacity: 0.6,
                }}>
                  default
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)', fontSize: '0.8125rem',
              padding: '10px 18px', borderRadius: 6, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => { if (selected) onSubmit(selected) }}
            disabled={!selected}
            style={{
              background: 'var(--accent)',
              border: 'none',
              color: 'var(--bg-deep)',
              fontFamily: 'var(--font-body)', fontSize: '0.8125rem',
              fontWeight: 600,
              padding: '10px 18px', borderRadius: 6, cursor: 'pointer',
              opacity: selected ? 1 : 0.4,
              transition: 'opacity 150ms',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
export default function SaveToAccountButton({ payload, isLoggedIn }: SaveToAccountButtonProps) {
  const [status,      setStatus]      = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [folders,     setFolders]     = useState<WizardFolder[]>([])
  const [showPicker,  setShowPicker]  = useState(false)
  const [pendingFolder, setPendingFolder] = useState<string | null>(null)

  // Fetch folders when logged in
  useEffect(() => {
    if (!isLoggedIn) return
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Ensure default folder exists
      const { data: existing } = await supabase
        .from('wizard_folders')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single()

      if (!existing) {
        const { data: created } = await supabase
          .from('wizard_folders')
          .insert({ user_id: user.id, name: 'New Results', is_default: true })
          .select()
          .single()
        if (created) {
          setFolders([created])
          return
        }
      }

      const { data: allFolders } = await supabase
        .from('wizard_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      setFolders(allFolders ?? [])
    })()
  }, [isLoggedIn])

  // Auto-save pending result after login
  useEffect(() => {
    if (!isLoggedIn) return
    const pending = sessionStorage.getItem(PENDING_KEY)
    if (!pending) return
    sessionStorage.removeItem(PENDING_KEY)

    // If we have folders ready, show the picker for the pending save
    if (folders.length > 0) {
      setShowPicker(true)
    }
  }, [isLoggedIn, folders])

  // ── Save with chosen folder ──
  const doSave = async (folderId: string) => {
    setShowPicker(false)
    setStatus('saving')

    const result = await saveWizardResult(payload, folderId)
    if (result) {
      setStatus('saved')
    } else {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const handleSave = () => {
    if (!isLoggedIn) {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(payload))
      window.open('/login', '_blank')
      return
    }

    // If only one folder (default), skip the picker and save directly
    if (folders.length === 1) {
      doSave(folders[0].id)
      return
    }

    // Multiple folders — show picker
    setShowPicker(true)
  }

  const label = {
    idle:   isLoggedIn ? 'Save to Account' : 'Log In to Save',
    saving: 'Saving...',
    saved:  '✓ Saved',
    error:  'Error — Try Again',
  }[status]

  const borderColor = {
    idle:   'rgba(255,211,105,0.45)',
    saving: 'rgba(255,211,105,0.25)',
    saved:  'rgba(163,196,168,0.6)',
    error:  'rgba(248,113,113,0.5)',
  }[status]

  const textColor = {
    idle:   'var(--accent)',
    saving: 'var(--text-muted)',
    saved:  '#a3c4a8',
    error:  '#f87171',
  }[status]

  return (
    <>
      <button
        type="button"
        onClick={handleSave}
        disabled={status === 'saving' || status === 'saved'}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          background: 'transparent',
          color: textColor,
          border: `0.5px solid ${borderColor}`,
          padding: 'clamp(19px, 2.2vw, 21px) 20px',
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(19px, 2.2vw, 21px)',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: status === 'saving' || status === 'saved' ? 'default' : 'pointer',
          borderRadius: 14,
          transition: 'all 220ms ease',
          opacity: status === 'saving' ? 0.6 : 1,
          boxShadow: status === 'saved' ? '0 0 16px rgba(163,196,168,0.12)' : 'none',
        }}
      >
        {status !== 'saving' && status !== 'saved' && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v8M4 6l3 3 3-3M2 10v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {label}
      </button>

      {showPicker && (
        <FolderPickerModal
          folders={folders}
          onCancel={() => setShowPicker(false)}
          onSubmit={doSave}
        />
      )}
    </>
  )
}