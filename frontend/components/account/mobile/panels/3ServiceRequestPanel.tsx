// components/account/mobile/panels/3ServiceRequestPanel.tsx

import { useState, useRef, useEffect } from 'react';
import { fmtDate, fmtTime } from '../../../../lib/utils';
import { useSwipeDownToClose } from '../../shared/hooks/useSwipeDownToClose';
import { supabase } from '../../../../lib/supabase';
import { SERVICE_TYPES } from '../../shared/1InquiryList';
import FirstTimeTips from '../ui/FirstTimeTips';

interface ServiceRequestPanelProps {
  open:            boolean;
  serviceRequests: any[];
  session:         any;
  onSelectSR:      (sr: any) => void;
  onClose:         () => void;
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

const TOOLTIPS: Record<string, string> = {
  service: 'This can be changed in the future. Selecting it doesn\'t lock you in. We just want a rough idea.',
  dims:    'If you\'re unsure, do not guess -- just say "Unknown" and please include at least one photo of the stone next to a quarter for scale.',
  desc:    'All information is good information. Tell us a story -- tell us anything about the stone. Where did you get it? What do you want it to become? Any inclusions or cracks you\'ve noticed?',
  photos:  'Photos are the most helpful thing you can add. They give us a layer of understanding that words alone can\'t convey. Include one next to a quarter for scale if possible.',
};

export default function ServiceRequestPanel3({
  open, serviceRequests, session, onSelectSR, onClose,
  showSRForm, setShowSRForm, srType, setSrType, srDesc, setSrDesc,
  srSubmitting, srGateMsg, openSRForm, submitSR,
}: ServiceRequestPanelProps) {

  const { elementRef: panelRef, touchHandlers: panelHandlers } = useSwipeDownToClose({ onClose });
  const { elementRef: sheetRef, touchHandlers: sheetHandlers } = useSwipeDownToClose({ onClose: () => setShowSRForm(false) });

  const [activeTip,  setActiveTip]  = useState<string | null>(null);
  const [weight,     setWeight]     = useState('');
  const [dims,       setDims]       = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos,     setPhotos]     = useState<string[]>([]);

  const toggleTip = (id: string) => setActiveTip(prev => prev === id ? null : id);

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleOpenForm = () => {
    setShowSRForm(true);
  };

  const handleSubmitForm = async () => {
    if (!srType.trim() || !srDesc.trim()) {
      alert('Service type and description are required.');
      return;
    }
    let fullDesc = srDesc.trim();
    if (weight.trim()) fullDesc += `\nWeight: ${weight.trim()}`;
    if (dims.trim())   fullDesc += `\nDimensions: ${dims.trim()}`;
    setSrDesc(fullDesc);
    await submitSR();
    setShowSRForm(false);
    setWeight('');
    setDims('');
  };

  const InfoBtn = ({ id }: { id: string }) => (
    <button
      className={`nr-info-btn${activeTip === id ? ' active' : ''}`}
      onClick={() => toggleTip(id)}
    >
      i
    </button>
  );

  const Tip = ({ id }: { id: string }) => (
    <div className={`nr-tooltip${activeTip === id ? ' show' : ''}`}>
      {TOOLTIPS[id]}
    </div>
  );

  // ── Swipeable SR card ──
  function SwipeableSR({ sr, onSelect, onDelete }: { sr: any; onSelect: (sr: any) => void; onDelete: (id: string) => void }) {
    const [startX,    setStartX]   = useState(0);
    const [offsetX,   setOffsetX]  = useState(0);
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
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(sr.service_request_id); }}
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 80,
            background: '#ef4444', color: 'white', border: 'none',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
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

  const [localSRs, setLocalSRs] = useState(serviceRequests);
  useEffect(() => { setLocalSRs(serviceRequests); }, [serviceRequests]);

  const handleDeleteSR = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service request?')) return;
    setLocalSRs(prev => prev.filter(s => s.service_request_id !== id));
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ is_archived: true })
        .eq('service_request_id', id);
      if (error) {
        console.error('Archive error:', error);
        alert('Failed to delete. Please try again.');
        setLocalSRs(serviceRequests);
      }
    } catch (err) {
      console.error('Archive exception:', err);
      setLocalSRs(serviceRequests);
    }
  };

  return (
    <>
      {/* ── SERVICE REQUESTS LIST PANEL ── */}
      <div ref={panelRef} className={`slide-panel${open ? ' open' : ''}`}>
        <FirstTimeTips type="panel-down" show={open} />

        <div className="panel-header" {...panelHandlers}>
          <span className="panel-title">Service Requests</span>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>

        {srGateMsg && (
          <div style={{
            background: 'var(--bg-card)', color: 'var(--text-muted)', padding: '16px',
            margin: '8px', borderRadius: '4px', fontSize: 12, textAlign: 'center',
          }}>
            {srGateMsg}
          </div>
        )}

        {/* ── New button + divider ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderRadius:'999px', padding: 'clamp(0.75rem, 3.5vw, 1rem) clamp(1rem, 4.5vw, 1.25rem) 0' }}>
          <button
            onClick={handleOpenForm}
            onMouseDown={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
            onMouseUp={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}
            onTouchStart={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
            onTouchEnd={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}
            style={{
              background: 'var(--gold)',
              border: '0.5px solid var(--border)',
              borderRadius: '999px',
              color: 'var(--text)',
              fontFamily: 'var(--font-ui)',
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

        <div className="sr-list" style={{ flex: 1, overflowY: 'auto' }}>
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
      <div
        className={`nr-overlay${showSRForm ? ' open' : ''}`}
        onClick={() => setShowSRForm(false)}
      />
      <div ref={sheetRef} className={`nr-sheet${showSRForm ? ' open' : ''}`}>
        <FirstTimeTips type="panel-down" show={showSRForm} />
        <div className="nr-handle" {...sheetHandlers} />
        <div className="nr-head" {...sheetHandlers}>
          <span className="nr-title">New Service Request</span>
          <button className="nr-close" onClick={() => setShowSRForm(false)}>✕</button>
        </div>

        <div className="nr-body">

          {/* Service Type */}
          <div className="nr-field">
            <div className="nr-field-head">
              <span className="nr-label">
                Service Type <span style={{ color: 'var(--gold)', fontSize: 7 }}>REQUIRED</span>
              </span>
              <InfoBtn id="service" />
            </div>
            <Tip id="service" />
            <div className="nr-select-wrap">
              <select
                className="nr-select req"
                value={srType}
                onChange={e => setSrType(e.target.value)}
              >
                <option value="">Select a service type...</option>
                {SERVICE_TYPES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <span className="nr-select-arrow">▾</span>
            </div>
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

          {/* Photos */}
          <div className="nr-field" style={{ marginBottom: 24 }}>
            <div className="nr-field-head">
              <span className="nr-label">Photos</span>
              <InfoBtn id="photos" />
            </div>
            <Tip id="photos" />
            <div className="nr-photo-area" onClick={() => fileInputRef.current?.click()}>
              <div className="nr-photo-area-icon">📷</div>
              <div className="nr-photo-area-label">
                Tap to add photos<br />
                <span style={{ fontSize: 10, opacity: 0.6 }}>JPG, PNG — as many as you like</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={() => {}}
            />
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