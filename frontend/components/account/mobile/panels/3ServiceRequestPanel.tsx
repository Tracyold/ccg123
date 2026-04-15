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

import { useState, useRef } from 'react';
import { fmtDate, fmtTime } from '../../../../lib/utils';

interface ServiceRequestPanelProps {
  open:            boolean;
  serviceRequests: any[];
  session:         any;
  onSelectSR:      (sr: any) => void;
  onClose:         () => void;
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
}: ServiceRequestPanelProps) {

  // ── New request form state ──
  const [sheetOpen,   setSheetOpen]   = useState(false);
  const [name,        setName]        = useState('');
  const [phone,       setPhone]       = useState('');
  const [email,       setEmail]       = useState('');
  const [gem,         setGem]         = useState('');
  const [color,       setColor]       = useState('');
  const [weight,      setWeight]      = useState('');
  const [dims,        setDims]        = useState('');
  const [serviceType, setServiceType] = useState('');
  const [wizardRef,   setWizardRef]   = useState('');
  const [desc,        setDesc]        = useState('');
  const [photos,      setPhotos]      = useState<string[]>([]);
  const [activeTip,   setActiveTip]   = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle tooltip -- clicking the gold "i" button shows/hides the tip
  const toggleTip = (id: string) => setActiveTip(prev => prev === id ? null : id);

  // Handle photo file selection
  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setPhotos(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const submitForm = () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      alert('Name, phone number, and email are required.');
      return;
    }
    // In production: call Supabase insert here
    // For now close the sheet
    setSheetOpen(false);
    // Reset form
    setName(''); setPhone(''); setEmail(''); setGem(''); setColor('');
    setWeight(''); setDims(''); setServiceType(''); setWizardRef('');
    setDesc(''); setPhotos([]);
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

  return (
    <>
      {/* ── SERVICE REQUESTS LIST PANEL ── */}
      {/* Converted from <div class="slide-panel" id="servicereq-panel"> */}
      <div className={`slide-panel${open ? ' open' : ''}`}>

        {/* Panel header with + New button */}
        <div className="panel-header">
          <span className="panel-title">Service Requests</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* + New button -- opens the new request sheet */}
            <button
              onClick={() => setSheetOpen(true)}
              style={{
                background: 'var(--gold)', color: 'var(--bg-deep)', border: 'none',
                padding: '5px 12px', fontFamily: 'var(--font-mono)', fontSize: 8,
                letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              + New
            </button>
            <button className="panel-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* sr-list: the list of existing service request cards */}
        <div className="sr-list">
          {serviceRequests.length === 0 ? (
            // Empty state -- shown when no service requests exist
            <div style={{
              fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)',
              textAlign: 'center', padding: '40px 0', fontStyle: 'italic', opacity: 0.6,
            }}>
              No service requests yet.<br />Create one from your wizard results or tap + New.
            </div>
          ) : (
            serviceRequests.map(sr => (
              // sr-card: each service request card
              // border-left gold accent, clickable to open drawer
              <div
                key={sr.service_request_id}
                className="sr-card"
                onClick={() => onSelectSR(sr)}
              >
                {/* sr-card-top: stone name + status badge */}
                <div className="sr-card-top">
                  <div className="sr-card-stone">
                    {sr.service_type?.includes('Unknown') ? 'Unknown Stone' : sr.service_type || 'Service Request'}
                  </div>
                  <span className="sr-card-status">Pending</span>
                </div>
                {/* sr-card-rec: the recommendation/service type */}
                <div className="sr-card-rec">{sr.service_type}</div>
                {/* sr-card-date: submission timestamp */}
                <div className="sr-card-date">
                  {sr.created_at ? `${fmtDate(sr.created_at)} · ${fmtTime(sr.created_at)}` : '--'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── NEW SERVICE REQUEST SHEET ── */}
      {/* Converted from <!-- NEW SERVICE REQUEST SHEET --> */}
      {/* nr-overlay: dark background behind the sheet */}
      <div
        className={`nr-overlay${sheetOpen ? ' open' : ''}`}
        onClick={() => setSheetOpen(false)}
      />
      {/* nr-sheet: the bottom sheet that slides up */}
      <div className={`nr-sheet${sheetOpen ? ' open' : ''}`}>

        {/* Drag handle bar */}
        <div className="nr-handle" />

        {/* Sheet header */}
        <div className="nr-head">
          <span className="nr-title">New Service Request</span>
          <button className="nr-close" onClick={() => setSheetOpen(false)}>✕</button>
        </div>

        {/* Scrollable form body */}
        <div className="nr-body">

          {/* ── CONTACT SECTION ── */}
          <div className="nr-section-divider">Contact</div>

          {/* Full Name -- required (nr-input req has gold left border) */}
          <div className="nr-field">
            <div className="nr-field-head">
              <span className="nr-label">
                Full Name <span style={{ color: 'var(--gold)', fontSize: 7 }}>REQUIRED</span>
              </span>
            </div>
            <input
              className="nr-input req"
              placeholder="Your full name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Phone -- required */}
          <div className="nr-field">
            <div className="nr-field-head">
              <span className="nr-label">
                Phone Number <span style={{ color: 'var(--gold)', fontSize: 7 }}>REQUIRED</span>
              </span>
            </div>
            <input
              className="nr-input req"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {/* Email -- required */}
          <div className="nr-field">
            <div className="nr-field-head">
              <span className="nr-label">
                Email <span style={{ color: 'var(--gold)', fontSize: 7 }}>REQUIRED</span>
              </span>
            </div>
            <input
              className="nr-input req"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* ── STONE DETAILS SECTION ── */}
          <div className="nr-section-divider">Stone Details</div>

          {/* Gem Type */}
          <div className="nr-field">
            <div className="nr-field-head">
              <span className="nr-label">Gem Type</span>
              <InfoBtn id="gem" />
            </div>
            <Tip id="gem" />
            <input
              className="nr-input"
              placeholder="e.g. Sapphire, Tourmaline, Unknown"
              value={gem}
              onChange={e => setGem(e.target.value)}
            />
          </div>

          {/* Color */}
          <div className="nr-field">
            <div className="nr-field-head">
              <span className="nr-label">Color</span>
              <InfoBtn id="color" />
            </div>
            <Tip id="color" />
            <input
              className="nr-input"
              placeholder="e.g. Royal blue, pale yellow-green"
              value={color}
              onChange={e => setColor(e.target.value)}
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
          <button className="nr-submit-btn" onClick={submitForm}>
            Submit Service Request →
          </button>
          <div className="nr-req-note">
            Fields marked <span style={{ color: 'var(--gold)' }}>REQUIRED</span> must be filled before submitting.
          </div>
        </div>

      </div>{/* end nr-sheet */}
    </>
  );
}