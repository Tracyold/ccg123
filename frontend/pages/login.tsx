import { useState } from 'react';
import TopNav from '../components/shared/TopNav';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
  padding: '10px', color: 'var(--gold)', fontFamily: 'var(--font-body)', fontSize: '14px',
  marginBottom: '12px', outline: 'none', transition: 'border 200ms ease, box-shadow 200ms ease',
};
const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.2em',
  textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px',
};
const btnStyle: React.CSSProperties = {
  width: '100%', background: 'transparent', border: '1px solid rgba(214,180,70,0.9)',
  color: 'var(--gold)', fontFamily: 'var(--font-body)', fontSize: '11px',
  letterSpacing: '0.3em', textTransform: 'uppercase', padding: '14px', cursor: 'pointer',
  boxShadow: '0 0 14px rgba(214,180,70,0.35)',
};
const ghostBtn: React.CSSProperties = {
  width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)',
  fontFamily: 'var(--font-ui)', fontSize: '10px', textTransform: 'uppercase',
  letterSpacing: '0.18em', padding: '12px 0', marginTop: '8px', cursor: 'pointer',
};
const errStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px',
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
    <>
    <TopNav />
    <div style={{ background: 'transparent', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'var(--bg-card)', border: '0.5px solid rgba(214,180,70,0.55)', padding: '40px', maxWidth: '480px', width: '100%', position: 'relative' }}>
        <button onClick={() => router.push('/')} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', lineHeight: 1, padding: '4px' }}>✕</button>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
          CUTTING CORNERS GEMS
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--text)', marginBottom: '24px' }}>
          {mode === 'signup' ? 'Create Account' : 'Sign In'}
        </h1>

        {step === 'form' ? (
          <>
            {mode === 'signup' && (
              <>
                <label style={labelStyle}>FULL NAME</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                <label style={labelStyle}>EMAIL</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@email.com" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
              </>
            )}
            <label style={labelStyle}>PHONE NUMBER</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" style={inputStyle} onFocus={e => { if (!e.target.value) setPhone('+1 '); e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
            {mode === 'signup' && (
              <>
                <label style={labelStyle}>SHIPPING ADDRESS</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input value={addr1} onChange={e => setAddr1(e.target.value)} placeholder="Address Line 1" style={{ ...inputStyle, flex: 2, marginBottom: 0 }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                  <input value={addr2} onChange={e => setAddr2(e.target.value)} placeholder="Apt / Suite" style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="City" style={{ ...inputStyle, flex: 2, marginBottom: 0 }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                  <input value={addrState} onChange={e => setAddrState(e.target.value)} placeholder="State" style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select value={country} onChange={e => setCountry(e.target.value)} style={{ ...inputStyle, flex: 2, marginBottom: 0 }}>
                    <option value="">Country</option>
              <option value="Afghanistan">Afghanistan</option>
              <option value="Albania">Albania</option>
              <option value="Algeria">Algeria</option>
              <option value="Andorra">Andorra</option>
              <option value="Angola">Angola</option>
              <option value="Argentina">Argentina</option>
              <option value="Armenia">Armenia</option>
              <option value="Australia">Australia</option>
              <option value="Austria">Austria</option>
              <option value="Azerbaijan">Azerbaijan</option>
              <option value="Bahamas">Bahamas</option>
              <option value="Bahrain">Bahrain</option>
              <option value="Bangladesh">Bangladesh</option>
              <option value="Belarus">Belarus</option>
              <option value="Belgium">Belgium</option>
              <option value="Belize">Belize</option>
              <option value="Bolivia">Bolivia</option>
              <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
              <option value="Brazil">Brazil</option>
              <option value="Bulgaria">Bulgaria</option>
              <option value="Cambodia">Cambodia</option>
              <option value="Canada">Canada</option>
              <option value="Chile">Chile</option>
              <option value="China">China</option>
              <option value="Colombia">Colombia</option>
              <option value="Costa Rica">Costa Rica</option>
              <option value="Croatia">Croatia</option>
              <option value="Cuba">Cuba</option>
              <option value="Cyprus">Cyprus</option>
              <option value="Czech Republic">Czech Republic</option>
              <option value="Denmark">Denmark</option>
              <option value="Dominican Republic">Dominican Republic</option>
              <option value="Ecuador">Ecuador</option>
              <option value="Egypt">Egypt</option>
              <option value="El Salvador">El Salvador</option>
              <option value="Estonia">Estonia</option>
              <option value="Ethiopia">Ethiopia</option>
              <option value="Finland">Finland</option>
              <option value="France">France</option>
              <option value="Georgia">Georgia</option>
              <option value="Germany">Germany</option>
              <option value="Ghana">Ghana</option>
              <option value="Greece">Greece</option>
              <option value="Guatemala">Guatemala</option>
              <option value="Honduras">Honduras</option>
              <option value="Hungary">Hungary</option>
              <option value="Iceland">Iceland</option>
              <option value="India">India</option>
              <option value="Indonesia">Indonesia</option>
              <option value="Iran">Iran</option>
              <option value="Iraq">Iraq</option>
              <option value="Ireland">Ireland</option>
              <option value="Israel">Israel</option>
              <option value="Italy">Italy</option>
              <option value="Jamaica">Jamaica</option>
              <option value="Japan">Japan</option>
              <option value="Jordan">Jordan</option>
              <option value="Kazakhstan">Kazakhstan</option>
              <option value="Kenya">Kenya</option>
              <option value="Kuwait">Kuwait</option>
              <option value="Latvia">Latvia</option>
              <option value="Lebanon">Lebanon</option>
              <option value="Lithuania">Lithuania</option>
              <option value="Luxembourg">Luxembourg</option>
              <option value="Malaysia">Malaysia</option>
              <option value="Mexico">Mexico</option>
              <option value="Moldova">Moldova</option>
              <option value="Monaco">Monaco</option>
              <option value="Morocco">Morocco</option>
              <option value="Nepal">Nepal</option>
              <option value="Netherlands">Netherlands</option>
              <option value="New Zealand">New Zealand</option>
              <option value="Nicaragua">Nicaragua</option>
              <option value="Nigeria">Nigeria</option>
              <option value="North Korea">North Korea</option>
              <option value="Norway">Norway</option>
              <option value="Oman">Oman</option>
              <option value="Pakistan">Pakistan</option>
              <option value="Panama">Panama</option>
              <option value="Paraguay">Paraguay</option>
              <option value="Peru">Peru</option>
              <option value="Philippines">Philippines</option>
              <option value="Poland">Poland</option>
              <option value="Portugal">Portugal</option>
              <option value="Qatar">Qatar</option>
              <option value="Romania">Romania</option>
              <option value="Russia">Russia</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="Senegal">Senegal</option>
              <option value="Serbia">Serbia</option>
              <option value="Singapore">Singapore</option>
              <option value="Slovakia">Slovakia</option>
              <option value="South Africa">South Africa</option>
              <option value="South Korea">South Korea</option>
              <option value="Spain">Spain</option>
              <option value="Sri Lanka">Sri Lanka</option>
              <option value="Sweden">Sweden</option>
              <option value="Switzerland">Switzerland</option>
              <option value="Syria">Syria</option>
              <option value="Taiwan">Taiwan</option>
              <option value="Thailand">Thailand</option>
              <option value="Trinidad and Tobago">Trinidad and Tobago</option>
              <option value="Tunisia">Tunisia</option>
              <option value="Turkey">Turkey</option>
              <option value="Ukraine">Ukraine</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="Uruguay">Uruguay</option>
              <option value="Uzbekistan">Uzbekistan</option>
              <option value="Venezuela">Venezuela</option>
              <option value="Vietnam">Vietnam</option>
              <option value="Yemen">Yemen</option>
              <option value="Zimbabwe">Zimbabwe</option>
                  </select>
                  <input value={zip} onChange={e => setZip(e.target.value)} placeholder="ZIP" style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
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
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Enter the code sent to {phone}
            </p>
            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000"
              style={{ ...inputStyle, fontSize: '18px', textAlign: 'center', letterSpacing: '0.3em' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
            {error && <p style={errStyle}>{error}</p>}
            <button onClick={verifyOtp} disabled={loading} style={btnStyle}>
              {loading ? '...' : 'VERIFY'}
            </button>
            <button onClick={() => { setStep('form'); setOtp(''); setError(''); }} style={ghostBtn}>Back</button>
          </>
        )}
      </div>
    </div>
    </>
  );
}
