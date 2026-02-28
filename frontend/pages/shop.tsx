import { useState, useEffect, useRef } from 'react';
import { X, Search, MessageSquare, ShoppingCart } from 'lucide-react';
import TopNav from '../components/shared/TopNav';
import Footer from '../components/shared/Footer';
import { supabase } from '../lib/supabase';
import { formatMoney } from '../lib/utils';

interface Product {
  product_id: string;
  title: string;
  description: string | null;
  total_price: number;
  price_per_carat: number | null;
  gem_type: string | null;
  shape: string | null;
  weight: number | null;
  color: string | null;
  origin: string | null;
  treatment: string | null;
  gia_report_number: string | null;
  gia_report_pdf_url: string | null;
  photo_url: string | null;
  product_state: string;
}

interface GuestInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface AdminInfo {
  business_name: string | null;
  full_name: string | null;
  address: string | null;
  phone: string | null;
  contact_email: string | null;
}

// ── Shared Styles ────────────────────────────────────────────
const popupOverlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 200,
  backgroundColor: 'rgba(0,0,0,0.85)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '20px',
};
const popupBoxStyle: React.CSSProperties = {
  backgroundColor: '#0A0A0A',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '16px',
  width: '100%', maxWidth: '480px', maxHeight: '90vh',
  overflowY: 'auto', padding: '32px',
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  padding: '10px 12px',
  color: '#FAFAFA',
  fontFamily: "'Comfortaa', sans-serif",
  fontSize: '13px',
  outline: 'none',
  marginBottom: '10px',
};
const labelStyle: React.CSSProperties = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: '9px', fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: 'rgba(255,255,255,0.38)',
  display: 'block', marginBottom: '5px',
};
const goldBtnStyle: React.CSSProperties = {
  width: '100%', textAlign: 'center',
  fontFamily: "'Montserrat', sans-serif",
  fontSize: '11px', fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.20em',
  backgroundColor: '#d4af37', color: '#050505',
  border: 'none', padding: '14px 24px',
  cursor: 'pointer',
};
const ghostBtnStyle: React.CSSProperties = {
  width: '100%', textAlign: 'center',
  fontFamily: "'Montserrat', sans-serif",
  fontSize: '10px', fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  backgroundColor: 'transparent',
  color: 'rgba(255,255,255,0.38)',
  border: 'none', cursor: 'pointer',
  padding: '10px 0', marginTop: '8px',
};

// ── Guest Info Popup ────────────────────────────────────────
function GuestInfoPopup({ onSubmit, onClose }: { onSubmit: (info: GuestInfo) => void; onClose: () => void }) {
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

// ── Invoice Preview Popup ───────────────────────────────────
function InvoicePreviewPopup({
  product, adminInfo, buyerInfo, onContinue, onCancel, loading
}: {
  product: Product;
  adminInfo: AdminInfo | null;
  buyerInfo: { name: string; email: string; phone: string; shippingAddress: string; businessName?: string | null };
  onContinue: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const specRows = [
    { label: 'Title', value: product.title },
    { label: 'Gem Type', value: product.gem_type },
    { label: 'Shape', value: product.shape },
    { label: 'Weight', value: product.weight ? `${product.weight} ct` : null },
    { label: 'Color', value: product.color },
    ...(product.origin ? [{ label: 'Origin', value: product.origin }] : []),
    ...(product.treatment ? [{ label: 'Treatment', value: product.treatment }] : []),
    ...(product.gia_report_number ? [{ label: 'GIA Report #', value: product.gia_report_number }] : []),
    ...(product.price_per_carat ? [{ label: 'Price / ct', value: formatMoney(product.price_per_carat) }] : []),
  ].filter(r => r.value);

  const sectionLabel: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif", fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'rgba(255,255,255,0.30)', marginBottom: '10px', marginTop: '18px' };
  const divider: React.CSSProperties = { height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '16px 0' };

  return (
    <div style={popupOverlayStyle}>
      <div style={{ ...popupBoxStyle, maxWidth: '520px' }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'rgba(255,255,255,0.52)', marginBottom: '18px' }}>
          Invoice Preview
        </p>

        <p style={sectionLabel}>From</p>
        {adminInfo && (
          <div style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>
            <div style={{ color: '#d4af37', fontWeight: 700 }}>{adminInfo.business_name}</div>
            <div>{adminInfo.full_name}</div>
            <div>{adminInfo.address}</div>
            <div>{adminInfo.contact_email}</div>
            <div>{adminInfo.phone}</div>
          </div>
        )}

        <div style={divider} />

        <p style={sectionLabel}>Bill To</p>
        <div style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>
          <div style={{ color: 'rgba(255,255,255,0.80)' }}>{buyerInfo.name}</div>
          <div>{buyerInfo.email}</div>
          <div>{buyerInfo.phone}</div>
          <div>{buyerInfo.shippingAddress}</div>
          {buyerInfo.businessName && <div>{buyerInfo.businessName}</div>}
        </div>

        <div style={divider} />

        <p style={sectionLabel}>Product</p>
        {specRows.map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.38)', flexShrink: 0 }}>{label}</span>
            <span style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.70)', textAlign: 'right' }}>{value}</span>
          </div>
        ))}

        <div style={divider} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.38)' }}>Total</span>
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: '20px', color: 'rgba(45,212,191,1)' }}>{formatMoney(product.total_price)}</span>
        </div>
        <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginBottom: '24px' }}>
          Payment method: Card via Stripe
        </p>

        <button style={goldBtnStyle} onClick={onContinue} disabled={loading}>
          {loading ? 'Redirecting...' : 'Continue to Payment'}
        </button>
        <button style={ghostBtnStyle} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ── Inquiry Sub-Forms ───────────────────────────────────────
function InquiryContactForm({ onSubmit, onClose }: { onSubmit: (info: any) => void; onClose: () => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
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
      {err && <p style={{ fontSize: '11px', color: '#c07070', marginBottom: '10px' }}>{err}</p>}
      <button style={goldBtnStyle} onClick={() => {
        if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim()) { setErr('All fields are required.'); return; }
        onSubmit({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone: phone.trim() });
      }}>Continue</button>
      <button style={ghostBtnStyle} onClick={onClose}>Cancel</button>
    </>
  );
}

function InquiryDescForm({ onSubmit, onClose, submitting }: { onSubmit: (desc: string) => void; onClose: () => void; submitting: boolean }) {
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

// ── Main Page ───────────────────────────────────────────────
export default function ShopPage() {
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  // Guest info
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [pendingAction, setPendingAction] = useState<'buy' | null>(null);

  // Inquiry state
  const [inquiryStep, setInquiryStep] = useState<'collect-info' | 'describe' | 'success' | null>(null);
  const [guestCollected, setGuestCollected] = useState<{firstName: string; lastName: string; email: string; phone: string} | null>(null);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);

  // Invoice preview
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [accountUser, setAccountUser] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Auth — auto sign out if somehow logged in as guest on page load
  useEffect(() => {
    const guestId = process.env.NEXT_PUBLIC_GUEST_ACCOUNT_USER_ID;
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (s && s.user.id === guestId) {
        await supabase.auth.signOut();
        setSession(null);
      } else {
        setSession(s);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, s) => {
      if (s && s.user.id === guestId) {
        await supabase.auth.signOut();
        setSession(null);
      } else {
        setSession(s);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load products
  useEffect(() => {
    async function load() {
      // Use shop_active_products view for public — shows only PUBLISHED products
      const { data, error } = await supabase
        .from('shop_active_products')
        .select('*');
      if (!error && data) {
        setProducts(data);
      } else {
        // Fallback: query products directly for PUBLISHED state
        const { data: fallback } = await supabase
          .from('products')
          .select('*')
          .eq('product_state', 'PUBLISHED')
          .order('created_at', { ascending: false });
        setProducts(fallback || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Load account user info if authenticated
  useEffect(() => {
    if (!session) { setAccountUser(null); return; }
    supabase
      .from('account_users')
      .select('*')
      .eq('account_user_id', session.user.id)
      .single()
      .then(({ data }) => setAccountUser(data));
  }, [session]);

  // Photo URL helper
  const getPhotoUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return supabase.storage.from('product-photos').getPublicUrl(url).data.publicUrl;
  };

  // ── Inquiry Flow ────────────────────────────────────────
  const guestId = process.env.NEXT_PUBLIC_GUEST_ACCOUNT_USER_ID;
  const isRealUser = session && session.user.id !== guestId;

  const handleInquiryClick = () => {
    if (isRealUser) {
      setInquiryStep('describe');
    } else {
      setInquiryStep('collect-info');
    }
  };

  const handleGuestInfoForInquiry = async (info: {firstName: string; lastName: string; email: string; phone: string}) => {
    setGuestCollected(info);
    setInquiryStep('describe');
  };

  const handleInquiryDescSubmit = async (desc: string) => {
    if (!modalProduct) return;
    setInquirySubmitting(true);
    try {
      if (isRealUser) {
        await supabase.from('account_inquiries').insert({
          account_user_id: session.user.id,
          description: desc,
          product_id: modalProduct.product_id,
          photo_url: null,
        });
        await supabase.functions.invoke('send-admin-notification', {
          body: { event_type: 'account_inquiries', user_id: session.user.id },
        }).catch(() => {});
      } else if (guestCollected) {
        await supabase.from('guest_inquiries').insert({
          name: guestCollected.firstName + ' ' + guestCollected.lastName,
          email: guestCollected.email,
          phone: guestCollected.phone,
          shipping_address: 'Not provided',
          description: desc,
          product_id: modalProduct.product_id,
          photo_url: null,
        });
        await supabase.functions.invoke('send-admin-notification', {
          body: { event_type: 'guest_inquiries', guest_name: guestCollected.firstName + ' ' + guestCollected.lastName },
        }).catch(() => {});
      }
      setInquiryStep('success');
    } catch (e) {
      console.error('Inquiry error:', e);
    }
    setInquirySubmitting(false);
  };

  const handleInquiryOK = async () => {
    
    setInquiryStep(null);
    setGuestCollected(null);
    setModalProduct(null);
  };

  const closeInquiry = () => {
    
    setInquiryStep(null);
    setGuestCollected(null);
  };

  // ── Purchase Flow ───────────────────────────────────────
  const handleBuyClick = async () => {
    if (!session && !guestInfo) {
      setPendingAction('buy');
      setShowGuestPopup(true);
      return;
    }
    // Fetch admin info for invoice preview
    const { data: admin } = await supabase
      .from('admin_users')
      .select('business_name, full_name, address, phone, contact_email')
      .single();
    setAdminInfo(admin);
    setShowInvoicePreview(true);
  };

  const handleCheckout = async () => {
    if (!modalProduct) return;
    setCheckoutLoading(true);

    const isGuest = !session;
    const buyerInfo = isGuest && guestInfo
      ? { name: guestInfo.name, email: guestInfo.email, phone: guestInfo.phone, shippingAddress: guestInfo.address, businessName: null }
      : accountUser
        ? { name: accountUser.name, email: accountUser.email, phone: accountUser.phone, shippingAddress: accountUser.shipping_address, businessName: accountUser.business_name }
        : { name: '', email: '', phone: '', shippingAddress: '', businessName: null };

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/checkout/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: modalProduct.product_id,
          guest: isGuest,
          guest_info: isGuest ? guestInfo : undefined,
          account_user_id: session?.user?.id,
          admin_snapshot: adminInfo ? {
            businessName: adminInfo.business_name,
            fullName: adminInfo.full_name,
            address: adminInfo.address,
            phone: adminInfo.phone,
            contactEmail: adminInfo.contact_email,
          } : {},
          account_snapshot: buyerInfo,
          line_items: [{
            product_id: modalProduct.product_id,
            title: modalProduct.title,
            gem_type: modalProduct.gem_type,
            shape: modalProduct.shape,
            weight: modalProduct.weight,
            color: modalProduct.color,
            origin: modalProduct.origin,
            treatment: modalProduct.treatment,
            description: modalProduct.description,
            price_per_carat: modalProduct.price_per_carat,
            total_price: modalProduct.total_price,
            gia_report_number: modalProduct.gia_report_number,
            gia_report_pdf_url: modalProduct.gia_report_pdf_url,
            photo_url: modalProduct.photo_url,
          }],
        }),
      });
      const { url, error } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        console.error('Checkout error:', error);
        setCheckoutLoading(false);
      }
    } catch (e) {
      console.error('Checkout error:', e);
      setCheckoutLoading(false);
    }
  };

  // Guest info callback
  const handleGuestInfoSubmit = (info: GuestInfo) => {
    setGuestInfo(info);
    setShowGuestPopup(false);
    if (pendingAction === 'buy') {
      setPendingAction(null);
      // Trigger buy flow after setting guest info
      setTimeout(() => handleBuyClick(), 100);
    }
    setPendingAction(null);
  };

  const buyerInfo = session && accountUser
    ? { name: accountUser.name || '', email: accountUser.email || '', phone: accountUser.phone || '', shippingAddress: accountUser.shipping_address || '', businessName: accountUser.business_name }
    : guestInfo
      ? { name: guestInfo.name, email: guestInfo.email, phone: guestInfo.phone, shippingAddress: guestInfo.address, businessName: null }
      : { name: '', email: '', phone: '', shippingAddress: '', businessName: null };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shopCss }} />
      <TopNav />
      <main style={{ background: '#050505', minHeight: '100vh', paddingTop: '56px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 48px 80px' }}>
          <p style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '11px', textTransform: 'uppercase',
            letterSpacing: '0.20em',
            color: 'rgba(255,255,255,0.52)',
            marginBottom: '8px',
          }}>
            Gems for Sale
          </p>
          <h1 style={{
            fontFamily: "'Oranienbaum', serif",
            fontSize: 'clamp(30px, 6vw, 60px)',
            fontWeight: 400,
            color: '#FAFAFA',
            marginBottom: '48px',
          }}>
            Shop
          </h1>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.45)' }}>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                Loading...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.45)' }}>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                No products available
              </p>
            </div>
          ) : (
            <div className="shop-grid">
              {products.map((product) => (
                <div
                  key={product.product_id}
                  className="shop-card"
                  onClick={() => setModalProduct(product)}
                  data-testid={`product-${product.product_id}`}
                >
                  <div className="shop-card-img">
                    {product.photo_url ? (
                      <img
                        src={getPhotoUrl(product.photo_url)!}
                        alt={product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: "'Montserrat', sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>No Photo</span>
                      </div>
                    )}
                    <div className="shop-card-vignette" />
                  </div>
                  <div style={{ padding: '14px 4px 0' }}>
                    <h3 style={{ fontFamily: "'Oranienbaum', serif", fontSize: '18px', color: '#FAFAFA', margin: '0 0 4px', fontWeight: 400 }}>
                      {product.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      {product.gem_type && <span className="shop-tag">{product.gem_type}</span>}
                      {product.shape && <span className="shop-tag">{product.shape}</span>}
                      {product.weight && <span className="shop-tag">{product.weight} ct</span>}
                      {product.color && <span className="shop-tag">{product.color}</span>}
                    </div>
                    <p style={{ fontFamily: "'Courier New', monospace", fontSize: '16px', color: 'rgba(45,212,191,1)', margin: 0 }}>
                      {formatMoney(product.total_price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </main>

      {/* Product Detail Modal */}
      {modalProduct && !showInvoicePreview && !showGuestPopup && !inquiryStep && (
        <div
          style={popupOverlayStyle}
          onClick={(e) => { if (e.target === e.currentTarget) { setModalProduct(null); } }}
        >
          <div style={{ ...popupBoxStyle, maxWidth: '560px' }}>
            <button
              onClick={() => { setModalProduct(null); }}
              style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FAFAFA', zIndex: 10 }}
            >
              <X size={18} />
            </button>

            {/* Product image */}
            {modalProduct.photo_url && (
              <div style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', aspectRatio: '4/3' }}>
                <img
                  src={getPhotoUrl(modalProduct.photo_url)!}
                  alt={modalProduct.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            <h2 style={{ fontFamily: "'Oranienbaum', serif", fontSize: '24px', fontWeight: 400, color: '#FAFAFA', marginBottom: '8px' }}>
              {modalProduct.title}
            </h2>

            <p style={{ fontFamily: "'Courier New', monospace", fontSize: '22px', color: 'rgba(45,212,191,1)', marginBottom: '20px' }}>
              {formatMoney(modalProduct.total_price)}
            </p>

            {/* Specs */}
            <div style={{ marginBottom: '20px' }}>
              {[
                { label: 'Gem Type', value: modalProduct.gem_type },
                { label: 'Shape', value: modalProduct.shape },
                { label: 'Weight', value: modalProduct.weight ? `${modalProduct.weight} ct` : null },
                { label: 'Color', value: modalProduct.color },
                { label: 'Origin', value: modalProduct.origin },
                { label: 'Treatment', value: modalProduct.treatment },
                { label: 'Price/ct', value: modalProduct.price_per_carat ? formatMoney(modalProduct.price_per_carat) : null },
              ].filter(r => r.value).map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.38)' }}>{label}</span>
                  <span style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.70)' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* GIA */}
            {modalProduct.gia_report_number && (
              <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.38)' }}>GIA Report</span>
                <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.70)', margin: '4px 0 0' }}>
                  #{modalProduct.gia_report_number}
                  {modalProduct.gia_report_pdf_url && (
                    <a href={modalProduct.gia_report_pdf_url} target="_blank" rel="noopener noreferrer" style={{ color: '#d4af37', marginLeft: '8px', fontSize: '11px' }}>
                      View Report
                    </a>
                  )}
                </p>
              </div>
            )}

            {modalProduct.description && (
              <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', lineHeight: 1.75, color: 'rgba(255,255,255,0.55)', marginBottom: '24px' }}>
                {modalProduct.description}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                style={{ ...goldBtnStyle, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleBuyClick}
              >
                <ShoppingCart size={14} /> Buy Now
              </button>
              <button
                style={{ flex: 1, textAlign: 'center', fontFamily: "'Montserrat', sans-serif", fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.20em', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleInquiryClick}
              >
                <MessageSquare size={14} /> Inquire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      {inquiryStep && modalProduct && (() => {
        const displayName = guestCollected ? guestCollected.firstName + ' ' + guestCollected.lastName : accountUser?.name || '';
        const displayEmail = guestCollected?.email || accountUser?.email || '';
        const displayPhone = guestCollected?.phone || accountUser?.phone || '';

        if (inquiryStep === 'collect-info') return (
          <div style={popupOverlayStyle}>
            <div style={popupBoxStyle}>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'rgba(255,255,255,0.52)', marginBottom: '6px' }}>Inquire About This Gem</p>
              <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '20px', lineHeight: 1.6 }}>Please share your contact details so we can follow up.</p>
              <InquiryContactForm onSubmit={handleGuestInfoForInquiry} onClose={closeInquiry} />
            </div>
          </div>
        );

        if (inquiryStep === 'describe') return (
          <div style={popupOverlayStyle}>
            <div style={popupBoxStyle}>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'rgba(255,255,255,0.52)', marginBottom: '6px' }}>Inquiry — {modalProduct.title}</p>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px' }}>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.30)', marginBottom: '8px' }}>Your Details</div>
                <div style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
                  {displayName && <div>{displayName}</div>}
                  {displayEmail && <div>{displayEmail}</div>}
                  {displayPhone && <div>{displayPhone}</div>}
                </div>
              </div>
              <InquiryDescForm onSubmit={handleInquiryDescSubmit} onClose={closeInquiry} submitting={inquirySubmitting} />
            </div>
          </div>
        );

        if (inquiryStep === 'success') return (
          <div style={popupOverlayStyle}>
            <div style={{ ...popupBoxStyle, textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>✓</div>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'rgba(45,212,191,1)', marginBottom: '10px' }}>Inquiry Sent!</p>
              <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.7, marginBottom: '28px' }}>
                We've received your inquiry about <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{modalProduct.title}</strong> and will be in touch soon.
              </p>
              <button style={goldBtnStyle} onClick={handleInquiryOK}>OK</button>
            </div>
          </div>
        );

        return null;
      })()}

      {/* Guest Info Popup */}
      {showGuestPopup && (
        <GuestInfoPopup
          onSubmit={handleGuestInfoSubmit}
          onClose={() => { setShowGuestPopup(false); setPendingAction(null); }}
        />
      )}

      {/* Invoice Preview */}
      {showInvoicePreview && modalProduct && (
        <InvoicePreviewPopup
          product={modalProduct}
          adminInfo={adminInfo}
          buyerInfo={buyerInfo}
          onContinue={handleCheckout}
          onCancel={() => setShowInvoicePreview(false)}
          loading={checkoutLoading}
        />
      )}
    </>
  );
}

const shopCss = `
.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
@media (max-width: 767px) {
  .shop-grid {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  main > div { padding: 16px 16px 60px !important; }
}
@media (max-width: 480px) {
  .shop-grid { grid-template-columns: 1fr; }
}
.shop-card {
  cursor: pointer;
  transition: transform 220ms ease-out;
}
.shop-card:hover {
  transform: translateY(-4px);
}
.shop-card:hover .shop-card-img {
  border-color: rgba(255,255,255,0.16);
  box-shadow: 0 18px 48px rgba(0,0,0,0.65);
}
.shop-card-img {
  position: relative;
  aspect-ratio: 1 / 1;
  background: #0A0A0A;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.55);
  transition: border-color 220ms ease-out, box-shadow 220ms ease-out;
}
.shop-card-vignette {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 26px 12px rgba(0,0,0,0.50);
  pointer-events: none;
  z-index: 2;
}
.shop-tag {
  font-family: 'Montserrat', sans-serif;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255,255,255,0.45);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  padding: 3px 8px;
}
`;
