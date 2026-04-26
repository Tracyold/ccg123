import { useState } from 'react';
import { inputStyle, labelStyle, goldBtnStyle, ghostBtnStyle, inputFocus, inputBlur } from './shopTypes';

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
          <input style={inputStyle} placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Last Name *</label>
          <input style={inputStyle} placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
        </div>
      </div>
      <label style={labelStyle}>Phone Number *</label>
      <input style={inputStyle} type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
      <label style={labelStyle}>Email Address *</label>
      <input style={inputStyle} type="email" placeholder="jane@email.com" value={email} onChange={e => setEmail(e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
      <label style={labelStyle}>Shipping Address</label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input style={{ ...inputStyle, flex: 2, marginBottom: 0 }} placeholder="Address Line 1" value={addr1} onChange={e => setAddr1(e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
        <input style={{ ...inputStyle, flex: 1, marginBottom: 0 }} placeholder="Apt / Suite" value={addr2} onChange={e => setAddr2(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input style={{ ...inputStyle, flex: 2, marginBottom: 0 }} placeholder="City" value={city} onChange={e => setCity(e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
        <input style={{ ...inputStyle, flex: 1, marginBottom: 0 }} placeholder="State" value={addrState} onChange={e => setAddrState(e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <select style={{...inputStyle, flex: 2, marginBottom: 0}} value={country} onChange={e => setCountry(e.target.value)} onFocus={inputFocus} onBlur={inputBlur}>
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
        <input style={{ ...inputStyle, flex: 1, marginBottom: 0 }} placeholder="ZIP" value={zip} onChange={e => setZip(e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
      </div>
      {err && <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '10px' }}>{err}</p>}
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
        onFocus={inputFocus} onBlur={inputBlur}
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
