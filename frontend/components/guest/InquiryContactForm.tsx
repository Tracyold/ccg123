import { useState } from 'react';
import { inputStyle, labelStyle, goldBtnStyle, ghostBtnStyle } from './shopTypes';

export function InquiryContactForm({ onSubmit, onClose }: { onSubmit: (info: any) => void; onClose: () => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+1 ');
  const [email, setEmail] = useState('');
  const [addr1, setAddr1] = useState('');
  const [addr2, setAddr2] = useState('');
  const [city, setCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [country, setCountry] = useState('');
  const [zip, setZip] = useState('');
  const [err, setErr] = useState('');
  return (
    <>
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>First Name *</label>
          <input style={inputStyle} placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Last Name *</label>
          <input style={inputStyle} placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
      </div>
      <label style={labelStyle}>Phone Number *</label>
      <input style={inputStyle} type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
      <label style={labelStyle}>Email Address *</label>
      <input style={inputStyle} type="email" placeholder="jane@email.com" value={email} onChange={e => setEmail(e.target.value)} />
      <label style={labelStyle}>Shipping Address</label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input style={{ ...inputStyle, flex: 2, marginBottom: 0 }} placeholder="Address Line 1" value={addr1} onChange={e => setAddr1(e.target.value)} />
        <input style={{ ...inputStyle, flex: 1, marginBottom: 0 }} placeholder="Apt / Suite" value={addr2} onChange={e => setAddr2(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input style={{ ...inputStyle, flex: 2, marginBottom: 0 }} placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
        <input style={{ ...inputStyle, flex: 1, marginBottom: 0 }} placeholder="State" value={addrState} onChange={e => setAddrState(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input style={{ ...inputStyle, flex: 2, marginBottom: 0 }} placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />
        <input style={{ ...inputStyle, flex: 1, marginBottom: 0 }} placeholder="ZIP" value={zip} onChange={e => setZip(e.target.value)} />
      </div>
      {err && <p style={{ fontSize: '11px', color: '#c07070', marginBottom: '10px' }}>{err}</p>}
      <button style={goldBtnStyle} onClick={() => {
        if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim()) { setErr('All fields are required.'); return; }
        const shipping = [addr1.trim(), addr2.trim(), city.trim(), addrState.trim(), zip.trim(), country.trim()].filter(Boolean).join(', ');
        onSubmit({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone: phone.trim(), shipping_address: shipping });
      }}>Continue</button>
      <button style={ghostBtnStyle} onClick={onClose}>Cancel</button>
    </>
  );
}

export function InquiryDescForm({ onSubmit, onClose, submitting }: { onSubmit: (desc: string) => void; onClose: () => void; submitting: boolean }) {
  const [desc, setDesc] = useState('');
  return (
    <>
      <label style={labelStyle}>Your Message *</label>
      <textarea
        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
        placeholder="Tell us about your interest in this gem..."
        value={desc}
        onChange={e => setDesc(e.target.value)}
      />
      <button style={{ ...goldBtnStyle, opacity: submitting || !desc.trim() ? 0.5 : 1 }}
        onClick={() => { if (desc.trim()) onSubmit(desc.trim()); }}
        disabled={submitting || !desc.trim()}>
        {submitting ? 'Sending...' : 'Submit Inquiry'}
      </button>
      <button style={ghostBtnStyle} onClick={onClose}>Cancel</button>
    </>
  );
}

;
