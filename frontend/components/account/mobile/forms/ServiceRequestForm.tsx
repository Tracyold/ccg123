// frontend/components/account/mobile/forms/ServiceRequestForm.tsx
//
// ─── What changed in this revision ─────────────────────────────────────────
//   • NEW "shape" field added (requires SQL migration below — paste into
//     Supabase SQL Editor before deploying this file):
//
//        alter table public.service_requests
//          add column if not exists shape text;
//
//   • Layout rearranged to pair related fields on the same row:
//
//       Row 1:  [ Gem Type        ]  [ Gem Color         ]
//       Row 2:  [ Weight ][ ct ]      [ Shape             ]
//       Row 3:  [ Qty ] [ L ]×[ W ]×[ D ]   (mm under each)
//       Row 4:  [ Service Type dropdown — full width      ]
//
//     Each paired row uses a local .srf-pair CSS class injected via
//     <style jsx> at the bottom of this file, so no separate CSS edit
//     needed. Fields inside each pair remain independent inputs, each
//     with its own state and DB column.
//
//   • Submit button no longer uses `disabled` — user can always click it.
//     If validation fails, an error message appears above the button and
//     auto-scrolls into view so the user can see the reason. This fixes
//     the "clicking submit does nothing" bug (where the button was just
//     silently greyed out).
//
//   • Small measurement rows now left-aligned instead of centered.
//
// ─── What stayed the same ──────────────────────────────────────────────────
//   • Contact snapshot (prefill from profile; required inputs if missing)
//   • Custom fields with click-to-edit labels, max 2
//   • Photo upload to service-request-photos bucket, 3 max, 25MB each
//   • SMS consent checkbox first time / passive note thereafter
//   • All colors via CSS custom properties. Zero hex literals.

import { useState, useRef, useEffect } from 'react';
import { useSwipeDownToClose } from '../../shared/hooks/useSwipeDownToClose';
import { supabase } from '../../../../lib/supabase';
import { SERVICE_TYPES } from '../../shared/1InquiryList';
import FirstTimeTips from '../ui/FirstTimeTips';

// ── Types ────────────────────────────────────────────────────────────────────
export interface ServiceRequestFormProps {
  open:             boolean;
  session:          any;
  profile:          any;
  existingConsent:  { consented: boolean; consentedAt: string | null };
  srType:           string;
  setSrType:        (v: string) => void;
  srDesc:           string;
  setSrDesc:        (v: string) => void;
  onClose:          () => void;
  onSubmitted:      () => Promise<void>;
}

interface PhotoItem {
  tempId:          string;
  fileName:        string;
  objectUrl:       string;
  storagePath:     string | null;
  publicUrl:       string | null;
  uploading:       boolean;
  uploaded:        boolean;
  showSuccessPill: boolean;
  error:           string | null;
}

interface CustomField {
  id:           string;
  label:        string;
  value:        string;
  editingLabel: boolean;
}

// Upload rules
const MAX_PHOTOS          = 3;
const MAX_PHOTO_BYTES     = 25 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'heic', 'webp'];
const ACCEPTED_MIME_HINT  = '.png,.jpg,.jpeg,.heic,.webp,image/*';
const MAX_CUSTOM_FIELDS   = 2;

const TOOLTIPS: Record<string, string> = {
  service: 'Optional. Selecting a service type is a rough hint — we finalize the scope after reviewing photos and details.',
  dims:    'If you\'re unsure, do not guess — leave blank and please include at least one photo of the stone next to a quarter for scale.',
  desc:    'All information is good information. Tell us a story — where did you get it? What do you want it to become? Any inclusions or cracks you\'ve noticed?',
  photos:  'Photos are the most helpful thing you can add. Include one next to a quarter for scale if possible. Up to 3, max 25MB each.',
};

// Lightweight unique-id generator (crypto.randomUUID isn't universally available on older iOS)
const uid = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};


// ─────────────────────────────────────────────────────────────────────────────
export default function ServiceRequestForm({
  open, session, profile, existingConsent,
  srType, setSrType, srDesc, setSrDesc,
  onClose, onSubmitted,
}: ServiceRequestFormProps) {

  const { elementRef, touchHandlers } = useSwipeDownToClose({ onClose });

  // ── Contact snapshot (only editable if profile is missing the field) ──────
  const [contactName,    setContactName]    = useState('');
  const [contactEmail,   setContactEmail]   = useState('');
  const [contactPhone,   setContactPhone]   = useState('');
  const [contactAddress, setContactAddress] = useState('');

  // ── Structured fields ─────────────────────────────────────────────────────
  const [gemType,  setGemType]  = useState('');
  const [gemColor, setGemColor] = useState('');
  const [shape,    setShape]    = useState('');
  const [weightCt, setWeightCt] = useState('');
  const [dimL,     setDimL]     = useState('');
  const [dimW,     setDimW]     = useState('');
  const [dimD,     setDimD]     = useState('');
  const [quantity, setQuantity] = useState('1');

  // ── Custom fields ─────────────────────────────────────────────────────────
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  // ── Photos ────────────────────────────────────────────────────────────────
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── SMS consent ───────────────────────────────────────────────────────────
  const [consentChecked, setConsentChecked] = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeTip,   setActiveTip]   = useState<string | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Scroll submit error into view when it appears.
  useEffect(() => {
    if (submitError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [submitError]);

  // Reset all transient state when the sheet closes.
  useEffect(() => {
    if (!open) {
      setContactName(''); setContactEmail(''); setContactPhone(''); setContactAddress('');
      setGemType(''); setGemColor(''); setShape(''); setWeightCt('');
      setDimL(''); setDimW(''); setDimD(''); setQuantity('1');
      setCustomFields([]);
      photos.forEach(p => { try { URL.revokeObjectURL(p.objectUrl); } catch {} });
      setPhotos([]);
      setConsentChecked(false);
      setActiveTip(null);
      setSubmitError(null);
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Contact resolution: profile value wins; else user-entered ─────────────
  const finalName    = (profile?.name             || '').trim() || contactName.trim();
  const finalEmail   = (profile?.email            || '').trim() || contactEmail.trim();
  const finalPhone   = (profile?.phone            || '').trim() || contactPhone.trim();
  const finalAddress = (profile?.shipping_address || '').trim() || contactAddress.trim();

  const profileHasName    = !!(profile?.name             && String(profile.name).trim());
  const profileHasEmail   = !!(profile?.email            && String(profile.email).trim());
  const profileHasPhone   = !!(profile?.phone            && String(profile.phone).trim());
  const profileHasAddress = !!(profile?.shipping_address && String(profile.shipping_address).trim());

  // ── Custom field helpers ──────────────────────────────────────────────────
  const addCustomField = () => {
    if (customFields.length >= MAX_CUSTOM_FIELDS) return;
    setCustomFields(prev => [
      ...prev,
      { id: uid(), label: `Custom field ${prev.length + 1}`, value: '', editingLabel: true },
    ]);
  };
  const updateCustomField = (id: string, patch: Partial<CustomField>) => {
    setCustomFields(prev => prev.map(cf => cf.id === id ? { ...cf, ...patch } : cf));
  };
  const removeCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(cf => cf.id !== id));
  };

  // ── Photo upload ──────────────────────────────────────────────────────────
  const handleFilesPicked = async (files: FileList | null) => {
    if (!files || !session?.user?.id) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    const toProcess = Array.from(files).slice(0, remaining);

    for (const file of toProcess) {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        console.warn('Photo rejected (extension):', file.name);
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        console.warn('Photo rejected (size):', file.name);
        continue;
      }

      const tempId      = uid();
      const objectUrl   = URL.createObjectURL(file);
      const storagePath = `${session.user.id}/${tempId}.${ext}`;

      setPhotos(prev => [...prev, {
        tempId, fileName: file.name, objectUrl,
        storagePath, publicUrl: null,
        uploading: true, uploaded: false,
        showSuccessPill: false, error: null,
      }]);

      (async () => {
        let settled = false;
        try {
          // 60s timeout so a hung request can't freeze the submit button forever.
          const uploadRace = Promise.race([
            supabase.storage
              .from('service-request-photos')
              .upload(storagePath, file, { cacheControl: '3600', upsert: false }),
            new Promise<{ data: null; error: { message: string } }>((resolve) =>
              setTimeout(() => resolve({
                data: null,
                error: { message: 'Upload timed out after 60 seconds. Please try again.' },
              }), 60_000),
            ),
          ]);

          const result = await uploadRace;
          const upErr = (result as any)?.error;
          if (upErr) {
            settled = true;
            setPhotos(prev => prev.map(p => p.tempId === tempId
              ? { ...p, uploading: false, error: upErr.message ?? 'Upload failed' }
              : p));
            return;
          }

          let publicUrl: string | null = null;
          try {
            const { data: pub } = supabase.storage
              .from('service-request-photos')
              .getPublicUrl(storagePath);
            publicUrl = pub?.publicUrl ?? null;
          } catch (urlErr) {
            console.warn('getPublicUrl threw (non-fatal):', urlErr);
          }

          settled = true;
          setPhotos(prev => prev.map(p => p.tempId === tempId
            ? { ...p, uploading: false, uploaded: true, publicUrl, showSuccessPill: true, error: null }
            : p));

          setTimeout(() => {
            setPhotos(prev => prev.map(p => p.tempId === tempId
              ? { ...p, showSuccessPill: false }
              : p));
          }, 2000);
        } catch (err: any) {
          settled = true;
          console.error('Photo upload exception:', err);
          setPhotos(prev => prev.map(p => p.tempId === tempId
            ? { ...p, uploading: false, error: err?.message ?? 'Upload failed' }
            : p));
        } finally {
          // Belt-and-suspenders: never leave a photo stuck in "uploading".
          if (!settled) {
            setPhotos(prev => prev.map(p => p.tempId === tempId
              ? { ...p, uploading: false, error: 'Upload did not complete.' }
              : p));
          }
        }
      })();
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = async (tempId: string) => {
    const target = photos.find(p => p.tempId === tempId);
    if (!target) return;
    try { URL.revokeObjectURL(target.objectUrl); } catch {}
    setPhotos(prev => prev.filter(p => p.tempId !== tempId));
    if (target.uploaded && target.storagePath) {
      try { await supabase.storage.from('service-request-photos').remove([target.storagePath]); }
      catch (e) { console.warn('Photo storage removal failed (non-blocking):', e); }
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const anyPhotoUploading = photos.some(p => p.uploading);
  const contactComplete =
    finalName.length    > 0 &&
    finalEmail.length   > 0 &&
    finalPhone.length   > 0 &&
    finalAddress.length > 0;
  const consentSatisfied = existingConsent.consented ? true : consentChecked;

  // ── Submit ────────────────────────────────────────────────────────────────
  // NOTE: We do NOT disable the Submit button — if you click it and a gate
  // fails, you get a visible error message instead of a silent dead click.
  const handleSubmit = async () => {
    setSubmitError(null);

    if (!session?.user?.id) {
      setSubmitError('Session missing. Please log out and log back in.');
      return;
    }
    if (submitting) return;                 // already in flight
    if (anyPhotoUploading) {
      setSubmitError('Please wait for photos to finish uploading before submitting.');
      return;
    }
    if (!contactComplete) {
      const missing: string[] = [];
      if (finalName.length    === 0) missing.push('name');
      if (finalEmail.length   === 0) missing.push('email');
      if (finalPhone.length   === 0) missing.push('phone');
      if (finalAddress.length === 0) missing.push('shipping address');
      setSubmitError(`Please fill in: ${missing.join(', ')}.`);
      return;
    }
    if (!srDesc.trim()) {
      setSubmitError('Please add a description.');
      return;
    }
    if (!consentSatisfied) {
      setSubmitError('Please check the SMS notification consent box to submit.');
      return;
    }

    setSubmitting(true);
    try {
      const qtyNum = parseInt(quantity, 10);
      const finalQty = Number.isFinite(qtyNum) && qtyNum >= 1 && qtyNum <= 99 ? qtyNum : 1;

      const now = new Date().toISOString();
      const consentAtToStore = existingConsent.consented
        ? (existingConsent.consentedAt ?? now)
        : (consentChecked ? now : null);

      const { data: inserted, error: insErr } = await supabase
        .from('service_requests')
        .insert({
          account_user_id:          session.user.id,
          service_type:             srType.trim() || null,
          description:              srDesc.trim(),
          gem_type:                 gemType.trim()  || null,
          gem_color:                gemColor.trim() || null,
          shape:                    shape.trim()    || null,
          weight_ct:                weightCt.trim() ? parseFloat(weightCt) : null,
          dim_length_mm:            dimL.trim() ? parseFloat(dimL) : null,
          dim_width_mm:             dimW.trim() ? parseFloat(dimW) : null,
          dim_depth_mm:             dimD.trim() ? parseFloat(dimD) : null,
          quantity:                 finalQty,
          photo_urls:               photos.filter(p => p.uploaded && p.publicUrl).map(p => p.publicUrl),
          contact_name:             finalName,
          contact_email:            finalEmail,
          contact_phone:            finalPhone,
          contact_address:          finalAddress,
          workorder_sms_consent:    consentSatisfied,
          workorder_sms_consent_at: consentAtToStore,
          is_archived:              false,
        })
        .select('service_request_id')
        .maybeSingle();

      if (insErr || !inserted?.service_request_id) {
        console.error('Service request insert failed:', insErr);
        setSubmitError(insErr?.message || 'Could not submit. Please try again.');
        return;
      }

      // Custom fields (best-effort)
      const goodFields = customFields
        .filter(cf => cf.label.trim().length > 0)
        .map((cf, i) => ({
          service_request_id: inserted.service_request_id,
          account_user_id:    session.user.id,
          label:              cf.label.trim(),
          value:              cf.value.trim() || null,
          sort_order:         i,
        }));
      if (goodFields.length > 0) {
        const { error: cfErr } = await supabase
          .from('service_request_custom_fields')
          .insert(goodFields);
        if (cfErr) console.warn('Custom fields insert failed (non-blocking):', cfErr);
      }

      // SMS prefs upsert on first consent (best-effort)
      if (consentChecked && !existingConsent.consented) {
        const { error: prefErr } = await supabase
          .from('user_sms_preferences')
          .upsert(
            { user_id: session.user.id, opt_in_work_orders: true },
            { onConflict: 'user_id' },
          );
        if (prefErr) console.warn('SMS prefs upsert failed (non-blocking):', prefErr);
      }

      // Admin notification (best-effort)
      try {
        await supabase.functions.invoke('send-admin-notification', {
          body: { event_type: 'service_requests', user_id: session.user.id },
        });
      } catch (notifyErr) {
        console.warn('Admin notification edge function failed (non-blocking):', notifyErr);
      }

      await onSubmitted();
    } catch (err: any) {
      console.error('Service request submit exception:', err);
      setSubmitError(err?.message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Local render helpers ──────────────────────────────────────────────────
  const toggleTip = (id: string) => setActiveTip(prev => prev === id ? null : id);
  const InfoBtn = ({ id }: { id: string }) => (
    <button
      className={`nr-info-btn${activeTip === id ? ' active' : ''}`}
      onClick={() => toggleTip(id)}
      type="button"
    >i</button>
  );
  const Tip = ({ id }: { id: string }) => (
    <div className={`nr-tooltip${activeTip === id ? ' show' : ''}`}>
      {TOOLTIPS[id]}
    </div>
  );

  const ReadContact = ({ label, value }: { label: string; value: string }) => (
    <div className="srf-contact-row">
      <span className="srf-contact-label">{label}</span>
      <span className="srf-contact-value">{value}</span>
    </div>
  );

  const EditContact = ({
    label, value, onChange, type = 'text', placeholder,
  }: {
    label: string; value: string;
    onChange: (v: string) => void;
    type?: string; placeholder: string;
  }) => (
    <div className="srf-contact-row required">
      <span className="srf-contact-label">
        {label} <span className="srf-required-tag">REQUIRED</span>
      </span>
      <input
        className="nr-input"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <>
      <div
        className={`nr-overlay${open ? ' open' : ''}`}
        onClick={onClose}
      />
      <div ref={elementRef} className={`nr-sheet${open ? ' open' : ''}`}>
        <FirstTimeTips type="panel-down" show={open} />
        <div className="nr-handle" {...touchHandlers} />
        <div className="nr-head" {...touchHandlers}>
          <span className="nr-title">New Service Request</span>
          <button className="nr-close" onClick={onClose} type="button">✕</button>
        </div>

        <div className="nr-body">

          {/* ── CONTACT ── */}
          <div className="srf-section">
            <div className="srf-section-title">Contact Info</div>
            <div className="srf-contact-block">
              {profileHasName
                ? <ReadContact label="Name" value={profile.name} />
                : <EditContact label="Name"     value={contactName}    onChange={setContactName}    placeholder="Your full name" />}
              {profileHasEmail
                ? <ReadContact label="Email" value={profile.email} />
                : <EditContact label="Email"    value={contactEmail}   onChange={setContactEmail}   placeholder="you@example.com" type="email" />}
              {profileHasPhone
                ? <ReadContact label="Phone" value={profile.phone} />
                : <EditContact label="Phone"    value={contactPhone}   onChange={setContactPhone}   placeholder="(555) 555-5555" type="tel" />}
              {profileHasAddress
                ? <ReadContact label="Shipping" value={profile.shipping_address} />
                : <EditContact label="Shipping" value={contactAddress} onChange={setContactAddress} placeholder="Street, City, State, ZIP" />}
            </div>
          </div>

          {/* ── STONE DETAILS ── */}
          <div className="srf-section">
            <div className="srf-section-title">Stone Details</div>

            {/* Row 1: Gem Type | Gem Color */}
            <div className="srf-pair">
              <div className="srf-pair-cell">
                <div className="nr-field-head">
                  <span className="nr-label">Gem Type</span>
                </div>
                <input
                  className="nr-input"
                  value={gemType}
                  onChange={e => setGemType(e.target.value)}
                  placeholder="e.g. Sapphire, Tourmaline..."
                />
              </div>
              <div className="srf-pair-cell">
                <div className="nr-field-head">
                  <span className="nr-label">Gem Color</span>
                </div>
                <input
                  className="nr-input"
                  value={gemColor}
                  onChange={e => setGemColor(e.target.value)}
                  placeholder="e.g. Cornflower blue..."
                />
              </div>
            </div>

            {/* Row 2: Weight + ct | Shape */}
            <div className="srf-pair">
              <div className="srf-pair-cell">
                <div className="nr-field-head">
                  <span className="nr-label">Weight</span>
                </div>
                <div className="srf-weight-row">
                  <input
                    className="nr-input srf-weight-input"
                    inputMode="decimal"
                    value={weightCt}
                    onChange={e => setWeightCt(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="4.20"
                  />
                  <span className="srf-unit-suffix">ct</span>
                </div>
              </div>
              <div className="srf-pair-cell">
                <div className="nr-field-head">
                  <span className="nr-label">Shape</span>
                </div>
                <input
                  className="nr-input"
                  value={shape}
                  onChange={e => setShape(e.target.value)}
                  placeholder="e.g. Oval, Round, Cushion..."
                />
              </div>
            </div>

            {/* Row 3: Qty | L × W × D mm */}
            <div className="srf-pair srf-pair-tight">
              <div className="srf-pair-cell srf-pair-qty">
                <div className="nr-field-head">
                  <span className="nr-label">Qty</span>
                </div>
                <input
                  className="nr-input sq"
                  inputMode="numeric"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="1"
                />
              </div>
              <div className="srf-pair-cell srf-pair-size">
                <div className="nr-field-head">
                  <span className="nr-label">Size (L × W × D)</span>
                  <InfoBtn id="dims" />
                </div>
                <Tip id="dims" />
                <div className="srf-size-row">
                  <div className="srf-size-box">
                    <input
                      className="nr-input sq"
                      inputMode="decimal"
                      value={dimL}
                      onChange={e => setDimL(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="L"
                    />
                    <span className="srf-unit-suffix">mm</span>
                  </div>
                  <span className="srf-size-sep" aria-hidden>×</span>
                  <div className="srf-size-box">
                    <input
                      className="nr-input sq"
                      inputMode="decimal"
                      value={dimW}
                      onChange={e => setDimW(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="W"
                    />
                    <span className="srf-unit-suffix">mm</span>
                  </div>
                  <span className="srf-size-sep" aria-hidden>×</span>
                  <div className="srf-size-box">
                    <input
                      className="nr-input sq"
                      inputMode="decimal"
                      value={dimD}
                      onChange={e => setDimD(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="D"
                    />
                    <span className="srf-unit-suffix">mm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Service type (full width) */}
            <div className="nr-field">
              <div className="nr-field-head">
                <span className="nr-label">Service Type</span>
                <InfoBtn id="service" />
              </div>
              <Tip id="service" />
              <div className="nr-select-wrap">
                <select
                  className="nr-select"
                  value={srType}
                  onChange={e => setSrType(e.target.value)}
                >
                  <option value="">Select a service type (optional)...</option>
                  {SERVICE_TYPES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <span className="nr-select-arrow">▾</span>
              </div>
            </div>
          </div>

          {/* ── CUSTOM FIELDS ── */}
          <div className="srf-section">
            <div className="srf-section-title">Custom Fields</div>
            {customFields.map((cf) => (
              <div key={cf.id} className="srf-custom-row">
                {cf.editingLabel ? (
                  <input
                    className="srf-custom-label-input"
                    value={cf.label}
                    autoFocus
                    onChange={e => updateCustomField(cf.id, { label: e.target.value })}
                    onBlur={() => updateCustomField(cf.id, {
                      editingLabel: false,
                      label: cf.label.trim() || 'Custom field',
                    })}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                  />
                ) : (
                  <button
                    className="srf-custom-label-btn"
                    onClick={() => updateCustomField(cf.id, { editingLabel: true })}
                    type="button"
                    title="Click to edit label"
                  >
                    {cf.label}
                  </button>
                )}
                <input
                  className="nr-input"
                  value={cf.value}
                  onChange={e => updateCustomField(cf.id, { value: e.target.value })}
                  placeholder="Value"
                />
                <button
                  className="srf-custom-remove"
                  onClick={() => removeCustomField(cf.id)}
                  type="button"
                  aria-label="Remove custom field"
                >✕</button>
              </div>
            ))}
            {customFields.length < MAX_CUSTOM_FIELDS && (
              <button className="srf-custom-add" onClick={addCustomField} type="button">
                + Add custom field
              </button>
            )}
          </div>

          {/* ── DESCRIPTION ── */}
          <div className="srf-section">
            <div className="nr-field">
              <div className="nr-field-head">
                <span className="nr-label">
                  Description <span className="srf-required-tag">REQUIRED</span>
                </span>
                <InfoBtn id="desc" />
              </div>
              <Tip id="desc" />
              <textarea
                className="nr-input req"
                placeholder="Tell us about the stone and what you need..."
                value={srDesc}
                onChange={e => setSrDesc(e.target.value)}
                style={{ minHeight: '100px', fontFamily: 'var(--font-ui-mob)', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* ── PHOTOS ── */}
          <div className="srf-section">
            <div className="nr-field-head">
              <span className="nr-label">Photos</span>
              <InfoBtn id="photos" />
            </div>
            <Tip id="photos" />

            {photos.length < MAX_PHOTOS && (
              <div className="nr-photo-area" onClick={() => fileInputRef.current?.click()}>
                <div className="nr-photo-area-icon">📷</div>
                <div className="nr-photo-area-label">
                  Tap to add photos<br />
                  <span style={{ fontSize: 'clamp(10px, 2.6vw, 11px)', opacity: 0.6 }}>
                    PNG · JPG · HEIC · WEBP · max 25MB · up to 3
                  </span>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept={ACCEPTED_MIME_HINT}
              multiple
              style={{ display: 'none' }}
              onChange={e => handleFilesPicked(e.target.files)}
            />

            {photos.length > 0 && (
              <div className="srf-photo-grid">
                {photos.map((p) => (
                  <div
                    key={p.tempId}
                    className={`srf-photo-thumb${p.error ? ' srf-photo-error' : ''}`}
                    style={{ backgroundImage: `url(${p.objectUrl})` }}
                  >
                    {p.uploading && <div className="srf-photo-uploading">Uploading…</div>}
                    {p.showSuccessPill && <div className="srf-photo-success">Uploaded</div>}
                    {p.error && <div className="srf-photo-uploading">Failed</div>}
                    <button
                      className="srf-photo-remove"
                      onClick={() => removePhoto(p.tempId)}
                      type="button"
                      aria-label="Remove photo"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── SMS CONSENT ── */}
          <div className="srf-section">
            <div className="srf-section-title">Work Order SMS</div>
            {existingConsent.consented ? (
              <div className="srf-consent-done">
                ✓ You already consented to work-order SMS{existingConsent.consentedAt ? ` on ${new Date(existingConsent.consentedAt).toLocaleDateString()}` : ''}.
              </div>
            ) : (
              <div className="srf-consent-block">
                <label className="srf-consent-check">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={e => setConsentChecked(e.target.checked)}
                  />
                  <span>
                    I understand this service request may trigger a manual work order,
                    and that I am requesting a service from Cutting Corners Gems.
                    I understand that if a work order is created, I must opt in to
                    text-message notifications on my cell phone for updates about
                    the work order.
                  </span>
                </label>
                <p className="srf-consent-note">
                  If you have never had a work order in your account before, you
                  will always be contacted before Cutting Corners opens a work
                  order. Don't be worried about the checkbox — we need it to
                  send you text-message notifications by law.
                </p>
              </div>
            )}
          </div>

          {/* ── SUBMIT ERROR ── */}
          {submitError && (
            <div ref={errorRef} className="srf-submit-error">{submitError}</div>
          )}

        </div>{/* end nr-body */}

        <div className="nr-footer">
          <button
            className="nr-submit-btn"
            onClick={handleSubmit}
            type="button"
          >
            {submitting
              ? 'Submitting...'
              : anyPhotoUploading
                ? 'Uploading photos...'
                : 'Submit Service Request →'}
          </button>
          <div className="nr-req-note">
            Fields marked <span style={{ color: 'var(--gold)' }}>REQUIRED</span> must be filled before submitting.
          </div>
        </div>
      </div>

      {/* ── LOCAL STYLES FOR THIS FILE ────────────────────────────────────────
           Keeping these scoped via <style jsx> so you don't have to edit
           MobileShell.css again for this round. Everything else the form
           uses (.nr-*, .srf-*) already lives in the shared stylesheet. */}
      <style jsx>{`
        /* Two-column field pair layout. Wraps on very narrow screens so
           it never horizontally overflows. */
        :global(.srf-pair) {
          display: flex;
          gap: clamp(0.5rem, 2.5vw, 0.75rem);
          margin-bottom: clamp(0.75rem, 3.5vw, 1.125rem);
          flex-wrap: wrap;
          align-items: flex-start;
        }
        :global(.srf-pair-cell) {
          flex: 1 1 45%;
          min-width: 0;
        }

        /* Tight layout for the Qty + L×W×D row — Qty stays skinny, size
           takes the remainder. Left-aligned (not centered). */
        :global(.srf-pair-tight) {
          flex-wrap: nowrap;
          align-items: flex-start;
        }
        :global(.srf-pair-qty) {
          flex: 0 0 auto;
          max-width: 30%;
        }
        :global(.srf-pair-size) {
          flex: 1 1 auto;
        }
        :global(.srf-pair-size .srf-size-row) {
          justify-content: flex-start !important;
        }
      `}</style>
    </>
  );
}
