import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    if (!phone.trim()) { setError('Phone number is required'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
    if (error) {
      setError(error.message);
    } else {
      setStep('otp');
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (!otp.trim()) { setError('OTP is required'); return; }
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: otp.trim(),
      type: 'sms',
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Ensure account_users row exists
    if (data?.user) {
      const { data: existing } = await supabase
        .from('account_users')
        .select('account_user_id')
        .eq('account_user_id', data.user.id)
        .single();
      if (!existing) {
        await supabase.from('account_users').insert({
          account_user_id: data.user.id,
          name: '',
          email: data.user.email || '',
          phone: phone.trim(),
        });
      }
    }
    router.push('/account');
  };

  return (
    <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#111111', border: '0.5px solid rgba(214,180,70,0.55)', padding: '40px', maxWidth: '480px', width: '100%' }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: '12px' }}>
          CUTTING CORNERS GEMS
        </p>
        <h1 style={{ fontFamily: "'Oranienbaum', serif", fontSize: '28px', color: '#FAFAFA', marginBottom: '24px' }}>
          Sign In
        </h1>

        {step === 'phone' ? (
          <>
            <label style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '6px' }}>
              PHONE NUMBER
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              style={{ width: '100%', background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.10)', padding: '10px', color: '#d4af37', fontFamily: "'Comfortaa', sans-serif", fontSize: '14px', marginBottom: '16px', outline: 'none' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }}
            />
            {error && <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '12px', color: 'rgba(255,80,80,0.85)', marginBottom: '12px' }}>{error}</p>}
            <button
              onClick={sendOtp}
              disabled={loading}
              style={{ width: '100%', background: 'transparent', border: '1px solid rgba(214,180,70,0.9)', color: '#d4af37', fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', padding: '14px', cursor: 'pointer', boxShadow: '0 0 14px rgba(214,180,70,0.35)' }}
            >
              {loading ? '...' : 'SEND CODE'}
            </button>
          </>
        ) : (
          <>
            <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginBottom: '16px' }}>
              Enter the code sent to {phone}
            </p>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="000000"
              style={{ width: '100%', background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.10)', padding: '10px', color: '#d4af37', fontFamily: "'Comfortaa', sans-serif", fontSize: '18px', textAlign: 'center', letterSpacing: '0.3em', marginBottom: '16px', outline: 'none' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }}
            />
            {error && <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '12px', color: 'rgba(255,80,80,0.85)', marginBottom: '12px' }}>{error}</p>}
            <button
              onClick={verifyOtp}
              disabled={loading}
              style={{ width: '100%', background: 'transparent', border: '1px solid rgba(214,180,70,0.9)', color: '#d4af37', fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', padding: '14px', cursor: 'pointer', boxShadow: '0 0 14px rgba(214,180,70,0.35)' }}
            >
              {loading ? '...' : 'VERIFY'}
            </button>
            <button
              onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
              style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.38)', fontFamily: "'Montserrat', sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.18em', padding: '12px 0', marginTop: '8px', cursor: 'pointer' }}
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
