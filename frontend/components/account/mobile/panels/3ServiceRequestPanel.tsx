// frontend/components/account/mobile/panels/3ServiceRequestPanel.tsx
//
// Service request panel (mobile).
//
// This panel now owns ONLY:
//   • The list of service requests (active + archived)
//   • The Active / Archive tabs
//   • The swipe-to-archive mechanic
//   • The "+ New Request" button that opens the form
//   • Fetching the user's existing SMS-consent state once, to pass to
//     the form (so a returning user doesn't re-see the checkbox)
//
// The FORM itself lives in a separate file:
//   components/account/mobile/forms/ServiceRequestForm.tsx
//
// Nothing about the archive flow or tabs has changed from the last
// working version — those parts are preserved byte-for-byte.

import { useState, useEffect } from 'react';
import { fmtDate, fmtTime } from '../../../../lib/utils';
import { useSwipeDownToClose } from '../../shared/hooks/useSwipeDownToClose';
import { supabase } from '../../../../lib/supabase';
import FirstTimeTips from '../ui/FirstTimeTips';
import ServiceRequestForm from '../forms/ServiceRequestForm';

interface ServiceRequestPanelProps {
  open:                   boolean;
  serviceRequests:        any[];
  session:                any;
  profile:                any;
  onSelectSR:             (sr: any) => void;
  onClose:                () => void;
  refreshServiceRequests: () => Promise<void>;
  // Wizard prefill handshake — MobileAccount holds these so the wizard
  // results panel can set srType + srDesc + showSRForm=true to open the
  // form with fields already populated.
  showSRForm:             boolean;
  setShowSRForm:          (v: boolean) => void;
  srType:                 string;
  setSrType:              (v: string) => void;
  srDesc:                 string;
  setSrDesc:              (v: string) => void;
}

type SRTab = 'active' | 'archive';

export default function ServiceRequestPanel3({
  open, serviceRequests, session, profile, onSelectSR, onClose,
  refreshServiceRequests,
  showSRForm, setShowSRForm, srType, setSrType, srDesc, setSrDesc,
}: ServiceRequestPanelProps) {

  const { elementRef: panelRef, touchHandlers: panelHandlers } = useSwipeDownToClose({ onClose });

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<SRTab>('active');

  // ── Existing-consent state ──
  // Populated once when the panel opens. Passed to ServiceRequestForm so
  // first-time users see the consent checkbox, and returning users see a
  // passive "already consented" note.
  const [existingConsent, setExistingConsent] = useState<{
    consented:   boolean;
    consentedAt: string | null;
  }>({ consented: false, consentedAt: null });

  // Fetch consent state when the panel first becomes visible (and also
  // re-fetch whenever the sheet is about to open, so a freshly consented
  // user on a second SR flow sees the passive note).
  useEffect(() => {
    if (!open || !session?.user?.id) return;
    let cancelled = false;
    (async () => {
      // Current SMS prefs — did they ever opt into work-order SMS?
      const { data: prefs } = await supabase
        .from('user_sms_preferences')
        .select('opt_in_work_orders')
        .eq('user_id', session.user.id)
        .maybeSingle();

      // If yes, find the earliest SR that recorded the consent so we
      // can show the date ("consented on ...").
      let consentedAt: string | null = null;
      if (prefs?.opt_in_work_orders) {
        const { data: firstSR } = await supabase
          .from('service_requests')
          .select('workorder_sms_consent_at')
          .eq('account_user_id', session.user.id)
          .eq('workorder_sms_consent', true)
          .not('workorder_sms_consent_at', 'is', null)
          .order('workorder_sms_consent_at', { ascending: true })
          .limit(1)
          .maybeSingle();
        consentedAt = firstSR?.workorder_sms_consent_at ?? null;
      }

      if (cancelled) return;
      setExistingConsent({
        consented:   !!prefs?.opt_in_work_orders,
        consentedAt,
      });
    })();
    return () => { cancelled = true; };
  }, [open, session?.user?.id]);

  // ── Swipeable SR card (mechanic preserved; button label + color via CSS) ──
  function SwipeableSR({
    sr,
    onSelect,
    onArchive,
  }: {
    sr: any;
    onSelect: (sr: any) => void;
    onArchive: (id: string) => void;
  }) {
    const [startX,    setStartX]    = useState(0);
    const [offsetX,   setOffsetX]   = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const threshold = -80;

    const handleTouchStart = (e: React.TouchEvent) => {
      setStartX(e.touches[0].clientX - offsetX);
      setIsSwiping(true);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isSwiping) return;
      const diff = e.touches[0].clientX - startX;
      if (diff <= 0) setOffsetX(Math.max(diff, threshold - 20));
    };
    const handleTouchEnd = () => {
      setIsSwiping(false);
      setOffsetX(offsetX < threshold / 2 ? threshold : 0);
    };

    return (
      <div className="sr-card-wrap">
        <button
          className="sr-archive-btn"
          onClick={(e) => { e.stopPropagation(); onArchive(sr.service_request_id); }}
        >
          Archive
        </button>
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="sr-card"
          onClick={() => onSelect(sr)}
          style={{
            position: 'relative', zIndex: 2,
            transform: `translateX(${offsetX}px)`,
            transition: isSwiping ? 'none' : 'transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}
        >
          <div className="sr-card-top">
            <div className="sr-card-stone">
              {sr.service_type || 'Service Request'}
            </div>
            <span className="sr-card-status">Pending</span>
          </div>
          <div className="sr-card-rec">{sr.service_type}</div>
          <div className="sr-card-date">
            {sr.created_at ? `${fmtDate(sr.created_at)} · ${fmtTime(sr.created_at)}` : '--'}
          </div>
        </div>
      </div>
    );
  }

  // ── Static (archived) card — no swipe, no click, fully grayed-out ──
  function ArchivedSR({ sr }: { sr: any }) {
    return (
      <div className="sr-card-wrap">
        <div
          className="sr-card archived"
          style={{
            minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}
        >
          <div className="sr-card-top">
            <div className="sr-card-stone">
              {sr.service_type || 'Service Request'}
            </div>
            <span className="sr-card-status">Archived</span>
          </div>
          <div className="sr-card-rec">{sr.service_type}</div>
          <div className="sr-card-date">
            {sr.created_at ? `${fmtDate(sr.created_at)} · ${fmtTime(sr.created_at)}` : '--'}
          </div>
        </div>
      </div>
    );
  }

  // ── Archive action ──
  // 1. Optimistically mark as archived in local state (snappy UI)
  // 2. Write to Supabase (source of truth)
  // 3. On failure: revert and surface the error
  // 4. On success: refreshServiceRequests() as realtime fallback
  const [localSRs, setLocalSRs] = useState(serviceRequests);
  useEffect(() => { setLocalSRs(serviceRequests); }, [serviceRequests]);

  const handleArchiveSR = async (id: string) => {
    if (!confirm('Archive this service request? It will move to the Archive tab and cannot be un-archived by you.')) return;

    // Capture the original value so we can revert on failure.
    const prev = localSRs.find(s => s.service_request_id === id);
    const prevArchived = prev?.is_archived ?? false;

    // Optimistic update.
    setLocalSRs(list => list.map(s =>
      s.service_request_id === id ? { ...s, is_archived: true } : s
    ));

    const { error } = await supabase
      .from('service_requests')
      .update({ is_archived: true })
      .eq('service_request_id', id);

    if (error) {
      console.error('Archive write failed:', error);
      // Revert.
      setLocalSRs(list => list.map(s =>
        s.service_request_id === id ? { ...s, is_archived: prevArchived } : s
      ));
      alert('Could not archive this request. Please try again.');
      return;
    }

    // Success — refetch from DB so realtime-less tables stay in sync.
    await refreshServiceRequests();
  };

  // ── Filter by tab ──
  const activeList   = localSRs.filter(s => !s.is_archived);
  const archivedList = localSRs.filter(s =>  s.is_archived);
  const shownList    = activeTab === 'active' ? activeList : archivedList;

  return (
    <>
      {/* ── SERVICE REQUESTS LIST PANEL ── */}
      <div ref={panelRef} className={`slide-panel${open ? ' open' : ''}`}>
        <FirstTimeTips type="panel-down" show={open} />

        <div className="panel-header" {...panelHandlers}>
          <span className="panel-title">Service Requests</span>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Active / Archive tabs ── */}
        <div className="sr-tab-bar">
          <button
            className={`sr-tab${activeTab === 'active' ? ' active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active{activeList.length > 0 ? ` · ${activeList.length}` : ''}
          </button>
          <button
            className={`sr-tab${activeTab === 'archive' ? ' active' : ''}`}
            onClick={() => setActiveTab('archive')}
          >
            Archive{archivedList.length > 0 ? ` · ${archivedList.length}` : ''}
          </button>
        </div>

        {/* ── "+ New Request" only on Active tab ── */}
        {activeTab === 'active' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 'clamp(0.75rem, 3.5vw, 1rem) clamp(1rem, 4.5vw, 1.25rem) 0' }}>
              <button
                onClick={() => setShowSRForm(true)}
                onMouseDown={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
                onMouseUp={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}
                onTouchStart={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
                onTouchEnd={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}
                style={{
                  background: 'var(--gold)',
                  border: '0.5px solid var(--border)',
                  borderRadius: '999px',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-ui-mob)',
                  fontSize: 'clamp(13px, 3.5vw, 15px)',
                  letterSpacing: '0.08em',
                  padding: 'clamp(0.6rem, 2.5vw, 0.875rem) clamp(1.5rem, 6vw, 2rem)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                + New Request
              </button>
            </div>
            <div style={{ height: '0.5px', background: 'var(--bdr2)', margin: 'clamp(0.75rem, 3.5vw, 1rem) 0 0' }} />
          </>
        )}

        <div className="sr-list">
          {shownList.length === 0 ? (
            <div className="sr-empty">
              {activeTab === 'active'
                ? <>No service requests yet.<br />Create one from your wizard results or tap + New.</>
                : <>Nothing archived yet.</>
              }
            </div>
          ) : (
            shownList.map(sr => (
              activeTab === 'active'
                ? (
                  <SwipeableSR
                    key={sr.service_request_id}
                    sr={sr}
                    onSelect={onSelectSR}
                    onArchive={handleArchiveSR}
                  />
                )
                : (
                  <ArchivedSR
                    key={sr.service_request_id}
                    sr={sr}
                  />
                )
            ))
          )}
        </div>
      </div>

      {/* ── FORM ── extracted into its own file/component ── */}
      <ServiceRequestForm
        open={showSRForm}
        session={session}
        profile={profile}
        existingConsent={existingConsent}
        srType={srType}   setSrType={setSrType}
        srDesc={srDesc}   setSrDesc={setSrDesc}
        onClose={() => setShowSRForm(false)}
        onSubmitted={async () => {
          setShowSRForm(false);
          setSrType('');
          setSrDesc('');
          await refreshServiceRequests();
        }}
      />
    </>
  );
}
