import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.10)',
  padding: '10px', color: '#d4af37', fontFamily: "'Comfortaa', sans-serif", fontSize: '14px',
  marginBottom: '12px', outline: 'none', transition: 'border 200ms ease, box-shadow 200ms ease',
};
const labelStyle: React.CSSProperties = {
  fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.2em',
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '6px',
};
const btnStyle: React.CSSProperties = {
  width: '100%', background: 'transparent', border: '1px solid rgba(214,180,70,0.9)',
  color: '#d4af37', fontFamily: "'Montserrat', sans-serif", fontSize: '11px',
  letterSpacing: '0.3em', textTransform: 'uppercase', padding: '14px', cursor: 'pointer',
  boxShadow: '0 0 14px rgba(214,180,70,0.35)',
};
const ghostBtn: React.CSSProperties = {
  width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.38)',
  fontFamily: "'Montserrat', sans-serif", fontSize: '10px', textTransform: 'uppercase',
  letterSpacing: '0.18em', padding: '12px 0', marginTop: '8px', cursor: 'pointer',
};
const errStyle: React.CSSProperties = {
  fontFamily: "'Comfortaa', sans-serif", fontSize: '12px', color: 'rgba(255,80,80,0.85)', marginBottom: '12px',
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [phone, setPhone] = useState('+1 ');
  const [otp, setOtp] = useState('');
  // Signup fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [addr1, setAddr1] = useState('');
  const [addr2, setAddr2] = useState('');
  const [city, setCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [country, setCountry] = useState('');
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    if (!phone.trim()) { setError('Phone number is required'); return; }
    if (mode === 'signup' && (!name.trim() || !email.trim() || !addr1.trim() || !city.trim() || !addrState.trim() || !zip.trim())) {
      setError('All fields are required for sign up'); return;
    }
    setLoading(true); setError('');
    const { error: e } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
    if (e) { setError(e.message); setLoading(false); return; }
    setStep('otp'); setLoading(false);
  };

  const verifyOtp = async () => {
    if (!otp.trim()) { setError('OTP is required'); return; }
    setLoading(true); setError('');
    const { data, error: e } = await supabase.auth.verifyOtp({
      phone: phone.trim(), token: otp.trim(), type: 'sms',
    });
    if (e) { setError(e.message); setLoading(false); return; }
    if (!data?.user) { setError('Verification failed'); setLoading(false); return; }

    const userId = data.user.id;

    if (mode === 'signup') {
      // Step 4: Insert account_users row
      const { error: insertErr } = await supabase.from('account_users').insert({
        account_user_id: userId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        shipping_address: [addr1.trim(), addr2.trim(), city.trim(), addrState.trim(), zip.trim(), country.trim()].filter(Boolean).join(', '),
        status: 'ACTIVE',
      });
      if (insertErr && !insertErr.message.includes('duplicate')) {
        setError(insertErr.message); setLoading(false); return;
      }

      // Step 5: Insert user_sms_preferences
      await supabase.from('user_sms_preferences').insert({
        user_id: userId,
        phone: phone.trim(),
        opt_in_work_orders: false,
        opt_in_tracking: false,
        opt_in_chat: false,
        opt_in_purchases: false,
        opt_in_new_listings: false,
      });
      // Step 6: DB trigger creates chat_threads row automatically — do NOT create manually
    } else {
      // Login: ensure account_users row exists
      const { data: existing } = await supabase
        .from('account_users').select('account_user_id').eq('account_user_id', userId).single();
      if (!existing) {
        // First-time login without signup form — create minimal row
        await supabase.from('account_users').insert({
          account_user_id: userId, name: '', email: '', phone: phone.trim(),
        });
      }
    }

    router.push('/account');
  };

  return (
    <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#111111', border: '0.5px solid rgba(214,180,70,0.55)', padding: '40px', maxWidth: '480px', width: '100%', position: 'relative' }}>
        <button onClick={() => router.push('/')} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '20px', cursor: 'pointer', lineHeight: 1, padding: '4px' }}>✕</button>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: '12px' }}>
          CUTTING CORNERS GEMS
        </p>
        <h1 style={{ fontFamily: "'Oranienbaum', serif", fontSize: '28px', color: '#FAFAFA', marginBottom: '24px' }}>
          {mode === 'signup' ? 'Create Account' : 'Sign In'}
        </h1>

        {step === 'form' ? (
          <>
            {mode === 'signup' && (
              <>
                <label style={labelStyle}>FULL NAME</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }} />
                <label style={labelStyle}>EMAIL</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@email.com" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }} />
              </>
            )}
            <label style={labelStyle}>PHONE NUMBER</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" style={inputStyle} onFocus={e => { if (!e.target.value) setPhone('+1 '); e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }} />
            {mode === 'signup' && (
              <>
                <label style={labelStyle}>SHIPPING ADDRESS</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input value={addr1} onChange={e => setAddr1(e.target.value)} placeholder="Address Line 1" style={{ ...inputStyle, flex: 2, marginBottom: 0 }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }} />
                  <input value={addr2} onChange={e => setAddr2(e.target.value)} placeholder="Apt / Suite" style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }} />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="City" style={{ ...inputStyle, flex: 2, marginBottom: 0 }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }} />
                  <input value={addrState} onChange={e => setAddrState(e.target.value)} placeholder="State" style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" style={{ ...inputStyle, flex: 2, marginBottom: 0 }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }} />
                  <input value={zip} onChange={e => setZip(e.target.value)} placeholder="ZIP" style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }} />
                </div>
              </>
            )}
            {error && <p style={errStyle}>{error}</p>}
            <button onClick={sendOtp} disabled={loading} style={btnStyle}>
              {loading ? '...' : 'SEND CODE'}
            </button>
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} style={ghostBtn}>
              {mode === 'login' ? 'Create Account' : 'Already have an account? Sign In'}
            </button>
          </>
        ) : (
          <>
            <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginBottom: '16px' }}>
              Enter the code sent to {phone}
            </p>
            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000"
              style={{ ...inputStyle, fontSize: '18px', textAlign: 'center', letterSpacing: '0.3em' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }} />
            {error && <p style={errStyle}>{error}</p>}
            <button onClick={verifyOtp} disabled={loading} style={btnStyle}>
              {loading ? '...' : 'VERIFY'}
            </button>
            <button onClick={() => { setStep('form'); setOtp(''); setError(''); }} style={ghostBtn}>Back</button>
          </>
        )}
      </div>
    </div>
  );
}
