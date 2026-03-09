import { fmtDate } from '../../lib/utils';

const SERVICE_TYPES = [
  'Custom Rough Cut',
  'Re-Cut & Re-Polish — Starting Price: $249',
  'Table Re-Polish — Starting Price: $119',
  'Crown Re-Polish — Starting Price: $149',
  'Pavilion Re-Polish — Starting Price: $149',
  'Gemstone Material Cut Design — Starting Price: $99',
  'Virtual Consultation — Free 30 Minute Minimum Consultation',
];

interface Props {
  inquiries: any[];
  serviceRequests: any[];
  inquiryTab: 'inquiries' | 'service';
  setInquiryTab: (tab: 'inquiries' | 'service') => void;
  showSRForm: boolean;
  srType: string;
  srDesc: string;
  srSubmitting: boolean;
  srGateMsg: string;
  setSrType: (v: string) => void;
  setSrDesc: (v: string) => void;
  setShowSRForm: (v: boolean) => void;
  onOpenSRForm: () => void;
  onSubmitSR: () => void;
}

export default function InquiryList({
  inquiries, serviceRequests, inquiryTab, setInquiryTab,
  showSRForm, srType, srDesc, srSubmitting, srGateMsg,
  setSrType, setSrDesc, setShowSRForm, onOpenSRForm, onSubmitSR
}: Props) {
  return (
    <div style={{ padding: '28px' }}>
      <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '24px', color: 'var(--text)', marginBottom: '16px' }}>Inquiries</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        <button className={`acc-tab ${inquiryTab === 'inquiries' ? 'on' : ''}`} onClick={() => setInquiryTab('inquiries')}>Product Inquiries</button>
        <button className={`acc-tab ${inquiryTab === 'service' ? 'on' : ''}`} onClick={() => setInquiryTab('service')}>Service Requests</button>
      </div>

      {inquiryTab === 'inquiries' ? (
        inquiries.length === 0 ? <p className="acc-empty">No product inquiries</p> :
        inquiries.map(inq => (
          <div key={inq.account_inquiry_id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '14px', marginBottom: '10px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>{inq.description}</p>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{fmtDate(inq.created_at)}</span>
          </div>
        ))
      ) : (
        <>
          <button className="acc-btn-gold" style={{ marginBottom: '16px', width: 'auto', padding: '10px 20px' }} onClick={onOpenSRForm}>
            Submit Service Request
          </button>
          {srGateMsg && <p style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(214,180,70,0.08)', padding: '12px', marginBottom: '16px', lineHeight: 1.6 }}>{srGateMsg}</p>}

          {showSRForm && (
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '20px', marginBottom: '16px' }}>
              <label className="acc-label">Service Type *</label>
              <select value={srType} onChange={e => setSrType(e.target.value)}
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px', fontFamily: 'var(--font-body)', fontSize: '13px', marginBottom: '12px' }}>
                <option value="">Select service type</option>
                {SERVICE_TYPES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
              <label className="acc-label">Description *</label>
              <textarea value={srDesc} onChange={e => setSrDesc(e.target.value)} placeholder="Describe your request..."
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px', fontFamily: 'var(--font-body)', fontSize: '13px', minHeight: '96px', resize: 'vertical', marginBottom: '12px' }} />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.6 }}>
                All prices are estimated starting prices. Some gems may be less, some may be more. No work order prices are set in stone until I am able to inspect the piece and the customer accepts the work order through the website.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="acc-btn-gold" onClick={onSubmitSR} disabled={srSubmitting || !srType || !srDesc.trim()} style={{ width: 'auto', padding: '10px 20px' }}>
                  {srSubmitting ? 'Submitting...' : 'Submit'}
                </button>
                <button className="acc-btn-ghost" onClick={() => setShowSRForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {serviceRequests.length === 0 ? <p className="acc-empty">No service requests</p> :
          serviceRequests.map(sr => (
            <div key={sr.service_request_id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '14px', marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--gold)', marginBottom: '4px' }}>{sr.service_type}</div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>{sr.description}</p>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{fmtDate(sr.created_at)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
