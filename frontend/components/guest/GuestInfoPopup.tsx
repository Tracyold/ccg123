import { useState } from 'react';
import { GuestInfo, popupOverlayStyle, popupBoxStyle, inputStyle, labelStyle, goldBtnStyle, ghostBtnStyle } from './shopTypes';

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
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'rgba(255,255,255,0.52)', marginBottom: '6px' }}>
          Your Information
        </p>
        <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '20px', lineHeight: 1.6 }}>
          Please enter your details before continuing.
        </p>

        <label style={labelStyle}>Full Name *</label>
        <input style={inputStyle} placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} />

        <label style={labelStyle}>Email Address *</label>
        <input style={inputStyle} type="email" placeholder="jane@email.com" value={email} onChange={e => setEmail(e.target.value)} />

        <label style={labelStyle}>Phone Number *</label>
        <input style={inputStyle} type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />

        <label style={labelStyle}>Shipping Address *</label>
        <input style={inputStyle} placeholder="123 Main St, City, State, ZIP" value={address} onChange={e => setAddress(e.target.value)} />

        {err && <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '11px', color: '#c07070', marginBottom: '10px' }}>{err}</p>}

        <button style={goldBtnStyle} onClick={handleSubmit}>Continue</button>
        <button style={ghostBtnStyle} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

