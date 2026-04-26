import { useState } from 'react';
import { GuestInfo, popupOverlayStyle, popupBoxStyle, inputStyle, labelStyle, goldBtnStyle, ghostBtnStyle , inputFocus, inputBlur } from './shopTypes';

export function GuestInfoPopup({ onSubmit, onClose }: { onSubmit: (info: GuestInfo) => void; onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [err, setErr] = useState('');

  function handleSubmit() {
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setErr('All fields are required.');
      return;
    }
    onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim(), address: address.trim() });
  }

  return (
    <div style={popupOverlayStyle}>
      <div style={popupBoxStyle}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'var(--text-muted)', marginBottom: '6px' }}>
          Your Information
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
          Please enter your details before continuing.
        </p>

        <label style={labelStyle}>Full Name *</label>
        <input style={inputStyle} placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />

        <label style={labelStyle}>Email Address *</label>
        <input style={inputStyle} type="email" placeholder="jane@email.com" value={email} onChange={e => setEmail(e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />

        <label style={labelStyle}>Phone Number *</label>
        <input style={inputStyle} type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />

        <label style={labelStyle}>Shipping Address *</label>
        <input style={inputStyle} placeholder="123 Main St, City, State, ZIP" value={address} onChange={e => setAddress(e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />

        {err && <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '10px' }}>{err}</p>}

        <button style={goldBtnStyle} onClick={handleSubmit}>Continue</button>
        <button style={ghostBtnStyle} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

