// components/account/mobile/panels/3ServiceRequestPanel.tsx
// Converted from <!-- SERVICE REQUESTS PANEL --> and <!-- NEW SERVICE REQUEST SHEET -->
// in account-dashboard-v3.html
//
// This file contains two things:
//   1. The panel that lists existing service requests (sr-list, sr-card classes)
//   2. The "New Request" bottom sheet form (nr-sheet, nr-overlay classes)
//
// HTML → JSX changes:
//   class=      → className=
//   onclick=    → onClick=
//   onchange=   → onChange=
//   for=        → htmlFor=
//   style="..." → style={{ camelCase }}

import { useState, useRef, useEffect } from 'react';
import { fmtDate, fmtTime } from '../../../../lib/utils';
import { useSwipeDownToClose } from '../../shared/hooks/useSwipeDownToClose';
import { supabase } from '../../../../lib/supabase';
import FirstTimeTips from '../ui/FirstTimeTips';

interface ServiceRequestPanelProps {
  open:            boolean;
  serviceRequests: any[];
  session:         any;
  onSelectSR:      (sr: any) => void;
  onClose:         () => void;
  // Service request form logic from useServiceRequest hook
  showSRForm:      boolean;
  setShowSRForm:   (v: boolean) => void;
  srType:          string;
  setSrType:       (v: string) => void;
  srDesc:          string;
  setSrDesc:       (v: string) => void;
  srSubmitting:    boolean;
  srGateMsg:       string;
  openSRForm:      () => Promise<void>;
  submitSR:        () => Promise<void>;
}

// Tooltip IDs and their text -- from the HTML nr-tooltip divs
const TOOLTIPS: Record<string, string> = {
  gem:     'If you\'re unsure, type "Unknown" -- but please add photos so we can help identify it.',
  color:   'Enter your best guess. It doesn\'t have to be an exact mix of colors. "Deep blue with slight green" is perfectly fine.',
  dims:    'If you\'re unsure, do not guess -- just say "Unknown" and please include at least one photo of the stone next to a quarter for scale.',
  service: 'This can be changed in the future. Selecting it doesn\'t lock you in. We just want a rough idea.',
  wizard:  'If you have a wizard result for this stone, select its reference number below. Or go to Results → tap the result → "Create Service Request" to auto-fill everything.',
  desc:    'All information is good information. Tell us a story -- tell us anything about the stone. Where did you get it? What do you want it to become? Any inclusions or cracks you\'ve noticed?',
  photos:  'Photos are the most helpful thing you can add. They give us a layer of understanding that words alone can\'t convey. Include one next to a quarter for scale if possible.',
};

export default function ServiceRequestPanel3({
  open, serviceRequests, session, onSelectSR, onClose,
  showSRForm, setShowSRForm, srType, setSrType, srDesc, setSrDesc,
  srSubmitting, srGateMsg, openSRForm, submitSR,
}: ServiceRequestPanelProps) {

  // ── Swipe down to close ──
  const { elementRef: panelRef, touchHandlers: panelHandlers } = useSwipeDownToClose({ onClose });
  const { elementRef: sheetRef, touchHandlers: sheetHandlers } = useSwipeDownToClose({ onClose: () => setShowSRForm(false) });

  // ── New request form state ──
  // Note: srType and srDesc are now managed by the parent via useServiceRequest hook
  // We keep local state for form UI that isn't part of the submission
  const [activeTip,   setActiveTip]   = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Optional stone detail fields (not required for submission)
  const [stone, setStone] = useState('');
  const [weight, setWeight] = useState('');
  const [dims, setDims] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [wizardRef, setWizardRef] = useState('');
  const [desc, setDesc] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  // Toggle tooltip -- clicking the gold "i" button shows/hides the tip
  const toggleTip = (id: string) => setActiveTip(prev => prev === id ? null : id);

  // Handle photo file selection
  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: In production, upload photos to Supabase Storage and attach to submission
    // For now, this is a placeholder for future photo upload functionality
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleOpenForm = async () => {
    await openSRForm();
    if (!srGateMsg) {
      setShowSRForm(true);
    }
  };

  const handleSubmitForm = async () => {
    if (!srType.trim() || !srDesc.trim()) {
      alert('Service type and description are required.');
      return;
    }
    await submitSR();
    setShowSRForm(false);
  };

  // ── Info button -- the gold circle "i" ──
  const InfoBtn = ({ id }: { id: string }) => (
    <button
      className={`nr-info-btn${activeTip === id ? ' active' : ''}`}
      onClick={() => toggleTip(id)}
    >
      i
    </button>
  );

  // ── Tooltip block -- slides open below a field ──
  const Tip = ({ id }: { id: string }) => (
    <div className={`nr-tooltip${activeTip === id ? ' show' : ''}`}>
      {TOOLTIPS[id]}
    </div>
  );

  // ── Swipeable Tile Component ──
  function SwipeableSR({ sr, onSelect, onDelete }: { sr: any; onSelect: (sr: any) => void; onDelete: (id: string) => void }) {
    const [startX, setStartX] = useState(0);
    const [offsetX, setOffsetX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const threshold = -80;

    const handleTouchStart = (e: React.TouchEvent) => {
      setStartX(e.touches[0].clientX - offsetX);
      setIsSwiping(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isSwiping) return;
      const currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      if (diff <= 0) {
        setOffsetX(Math.max(diff, threshold - 20));
      }
    };

    const handleTouchEnd = () => {
      setIsSwiping(false);
      if (offsetX < threshold / 2) {
        setOffsetX(threshold);
      } else {
        setOffsetX(0);
      }
    };

    return (
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(sr.service_request_id); }}
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 80,
            background: '#ef4444', color: 'white', border: 'none',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1
          }}
        >
          Delete
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
            minHeight: '140px', // Increased height to fit content
            display: 'flex', flexDirection: 'column', justifyContent: 'center'
          }}
        >
          <div className="sr-card-top">
            <div className="sr-card-stone">
              {sr.service_type?.includes('Unknown') ? 'Unknown Stone' : sr.service_type || 'Service Request'}
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

  const [localSRs, setLocalSRs] = useState(serviceRequests);
  useEffect(() => { setLocalSRs(serviceRequests); }, [serviceRequests]);

  const handleDeleteSR = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service request?')) return;
    setLocalSRs(prev => prev.filter(s => s.service_request_id !== id));
    try {
      const { error } = await supabase.from('service_requests').delete().eq('service_request_id', id);
      if (error) { alert('Failed to delete. Please try again.'); setLocalSRs(serviceRequests); }
    } catch (err) { setLocalSRs(serviceRequests); }
  };

  return (
    <>
      {/* ── SERVICE REQUESTS LIST PANEL ── */}
      {/* Converted from <div class="slide-panel" id="servicereq-panel"> */}
      <div ref={panelRef} className={`slide-panel${open ? ' open' : ''}`}>
        <FirstTimeTips type="panel-down" show={open} />

        {/* Panel header with + New button */}
        <div className="panel-header" {...panelHandlers}>
          <span className="panel-title">Service Requests</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* + New button -- opens the new request sheet */}
            <button
              onClick={handleOpenForm}
              style={{
                background: 'var(--gold)', color: 'var(--bg-deep)', border: 'none',
                padding: '5px 12px', fontFamily: 'var(--font-mono)', fontSize: 8,
                letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              + New
            </button>
            <button className="panel-close" onClick={onClose}>✕</button>
          </div>
        </div>
        
        {/* Gate message -- shown if user doesn't have phone or SMS prefs */}
        {srGateMsg && (
          <div style={{
            background: 'var(--bg-light)', color: 'var(--text-muted)', padding: '16px',
            margin: '8px', borderRadius: '4px', fontSize: 12, textAlign: 'center',
          }}>
            {srGateMsg}
          </div>
        )}

        {/* sr-list: the list of existing service request cards */}
        <div className="sr-list">
          {localSRs.length === 0 ? (
            <div style={{
              fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)',
              textAlign: 'center', padding: '40px 0', fontStyle: 'italic', opacity: 0.6,
            }}>
              No service requests yet.<br />Create one from your wizard results or tap + New.
            </div>
          ) : (
            localSRs.map(sr => (
              <SwipeableSR
                key={sr.service_request_id}
                sr={sr}
                onSelect={onSelectSR}
                onDelete={handleDeleteSR}
              />
            ))
          )}
        </div>
      </div>

      {/* ── NEW SERVICE REQUEST SHEET ── */}
      {/* Converted from <!-- NEW SERVICE REQUEST SHEET --> */}
      {/* nr-overlay: dark background behind the sheet */}
      <div
        className={`nr-overlay${showSRForm ? ' open' : ''}`}
        onClick={() => setShowSRForm(false)}
      />
      {/* nr-sheet: the bottom sheet that slides up */}
      <div ref={sheetRef} className={`nr-sheet${showSRForm ? ' open' : ''}`}>
        <FirstTimeTips type="panel-down" show={showSRForm} />

        {/* Drag handle bar */}
        <div className="nr-handle" {...sheetHandlers} />

        {/* Sheet header */}
        <div className="nr-head" {...sheetHandlers}>
          <span className="nr-title">New Service Request</span>
          <button className="nr-close" onClick={() => setShowSRForm(false)}>✕</button>
        </div>

        {/* Scrollable form body */}
        <div className="nr-body">

          {/* Note: Contact info is pre-filled from the user's profile */}
          <div className="nr-section-divider">Service Details</div>

          {/* Service Type */}
          <div className="nr-field">
            <div className="nr-field-head">
              <span className="nr-label">
                Service Type <span style={{ color: 'var(--gold)', fontSize: 7 }}>REQUIRED</span>
              </span>
              <InfoBtn id="service" />
            </div>
            <Tip id="service" />
            <input
              className="nr-input req"
              placeholder="e.g. Cutting, Polishing, Setting"
              value={srType}
              onChange={e => setSrType(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="nr-field">
            <div className="nr-field-head">
              <span className="nr-label">
                Description <span style={{ color: 'var(--gold)', fontSize: 7 }}>REQUIRED</span>
              </span>
              <InfoBtn id="desc" />
            </div>
            <Tip id="desc" />
            <textarea
              className="nr-input req"
              placeholder="Tell us about the stone and what you need..."
              value={srDesc}
              onChange={e => setSrDesc(e.target.value)}
              style={{ minHeight: '100px', fontFamily: 'var(--font-ui)', resize: 'vertical' }}
            />
          </div>

          {/* Weight */}
          <div className="nr-field">
            <div className="nr-field-head">
              <span className="nr-label">Weight (ct)</span>
            </div>
            <input
              className="nr-input"
              placeholder="e.g. 4.2 ct or Unknown"
              value={weight}
              onChange={e => setWeight(e.target.value)}
            />
          </div>

          {/* Dimensions */}
          <div className="nr-field">
            <div className="nr-field-head">
              <span className="nr-label">Dimensions (W × L × D)</span>
              <InfoBtn id="dims" />
            </div>
            <Tip id="dims" />
            <input
              className="nr-input"
              placeholder="e.g. 10 × 8 × 6 mm or Unknown"
              value={dims}
              onChange={e => setDims(e.target.value)}
            />
          </div>

          {/* ── SERVICE SECTION ── */}
          <div className="nr-section-divider">Service</div>

          {/* Service Type dropdown */}
          <div className="nr-field">
            <div className="nr-field-head">
              <span className="nr-label">Service Type</span>
              <InfoBtn id="service" />
            </div>
            <Tip id="service" />
            {/* nr-select-wrap positions the ▾ arrow over the select */}
            <div className="nr-select-wrap">
              <select
                className="nr-select"
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
              >
                <option value="">Select a service type...</option>
                <option value="repair">Repair</option>
                <option value="recut">Recut</option>
                <option value="custom">Custom Cut</option>
                <option value="polish">Polish</option>
                <option value="consultation">Consultation</option>
                <option value="evaluation">Evaluation</option>
                <option value="feasibility">Feasibility Report</option>
              </select>
              <span className="nr-select-arrow">▾</span>
            </div>
          </div>

          {/* Attach Wizard Result dropdown */}
          <div className="nr-field">
            <div className="nr-field-head">
              <span className="nr-label">Attach Wizard Result</span>
              <InfoBtn id="wizard" />
            </div>
            <Tip id="wizard" />
            <div className="nr-select-wrap">
              <select
                className="nr-select"
                value={wizardRef}
                onChange={e => setWizardRef(e.target.value)}
              >
                <option value="">No wizard result attached</option>
                {/* In production: map over real wizard results from Supabase */}
                <option value="WR-001">WR-001 -- Aquamarine, Polish Only</option>
                <option value="WR-002">WR-002 -- Sapphire, Stone Repair</option>
                <option value="WR-003">WR-003 -- Tourmaline, Partial Recut</option>
              </select>
              <span className="nr-select-arrow">▾</span>
            </div>
          </div>

          {/* Description textarea */}
          <div className="nr-field">
            <div className="nr-field-head">
              <span className="nr-label">Description</span>
              <InfoBtn id="desc" />
            </div>
            <Tip id="desc" />
            <textarea
              className="nr-textarea"
              rows={5}
              placeholder="Describe your stone, your goals, any history you know about it..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          {/* Photos upload area */}
          <div className="nr-field" style={{ marginBottom: 24 }}>
            <div className="nr-field-head">
              <span className="nr-label">Photos</span>
              <InfoBtn id="photos" />
            </div>
            <Tip id="photos" />

            {/* Tap the dashed area to open file picker */}
            <div className="nr-photo-area" onClick={() => fileInputRef.current?.click()}>
              <div className="nr-photo-area-icon">📷</div>
              <div className="nr-photo-area-label">
                Tap to add photos<br />
                <span style={{ fontSize: 10, opacity: 0.6 }}>JPG, PNG -- as many as you like</span>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handlePhotos}
            />

            {/* Photo thumbnail grid -- shows selected photos */}
            {photos.length > 0 && (
              <div className="nr-photo-grid">
                {photos.map((src, i) => (
                  <div
                    key={i}
                    className="nr-photo-thumb"
                    style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  >
                    <button className="nr-photo-rm" onClick={() => removePhoto(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>{/* end nr-body */}

        {/* Sheet footer with submit button */}
        <div className="nr-footer">
          <button className="nr-submit-btn" onClick={handleSubmitForm} disabled={srSubmitting}>
            {srSubmitting ? 'Submitting...' : 'Submit Service Request →'}
          </button>
          <div className="nr-req-note">
            Fields marked <span style={{ color: 'var(--gold)' }}>REQUIRED</span> must be filled before submitting.
          </div>
        </div>

      </div>{/* end nr-sheet */}
    </>
  );
}