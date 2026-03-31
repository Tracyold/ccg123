import { useState, useEffect, useRef } from 'react';
import { X, Search, MessageSquare, ShoppingCart } from 'lucide-react';
import TopNav from '../components/shared/TopNav';
import Footer from '../components/shared/Footer';
import { supabase } from '../lib/supabase';
import { formatMoney } from '../lib/utils';
import { GuestInfoPopup } from '../components/guest/GuestInfoPopup';
import { GuestInfo, Product, AdminInfo } from '../components/guest/shopTypes';
import { InvoicePreviewPopup } from '../components/guest/InvoicePreviewPopup';
import { InquiryContactForm, InquiryDescForm } from '../components/guest/InquiryContactForm';
import ProductDetailModal from '../components/guest/ProductDetailModal';
import InquiryModal from '../components/guest/InquiryModal';
import '../styles/shopCardEffect.css';


// ── Shared Styles ────────────────────────────────────────────
const popupOverlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 200,
  backgroundColor: 'rgba(0,0,0,0.85)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '20px',
};
const popupBoxStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  width: '100%', maxWidth: '480px', maxHeight: '90vh',
  overflowY: 'auto', padding: '32px',
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  padding: '10px 12px',
  color: 'var(--text)',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  outline: 'none',
  marginBottom: '10px',
};
const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '9px', fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: 'var(--text-muted)',
  display: 'block', marginBottom: '5px',
};
const goldBtnStyle: React.CSSProperties = {
  width: '100%', textAlign: 'center',
  fontFamily: 'var(--font-body)',
  fontSize: '11px', fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.20em',
  backgroundColor: 'var(--gold)', color: 'var(--bg)',
  border: 'none', padding: '14px 24px',
  cursor: 'pointer',
};
const ghostBtnStyle: React.CSSProperties = {
  width: '100%', textAlign: 'center',
  fontFamily: 'var(--font-body)',
  fontSize: '10px', fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  backgroundColor: 'transparent',
  color: 'var(--text-muted)',
  border: 'none', cursor: 'pointer',
  padding: '10px 0', marginTop: '8px',
};

// ── Inquiry Sub-Forms ───────────────────────────────────────


// ── Main Page ───────────────────────────────────────────────
export default function ShopPage() {
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [tappedProduct, setTappedProduct] = useState<string | null>(null);

  const handleCardClick = (product: Product) => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      setModalProduct(product);
      return;
    }
    if (tappedProduct === product.product_id) {
      setModalProduct(product);
      setTappedProduct(null);
    } else {
      setTappedProduct(product.product_id);
    }
  };

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
      <main style={{ background: 'var(--bg-gradient)', minHeight: '100vh', paddingTop: '56px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 48px 80px' }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px', textTransform: 'uppercase',
            letterSpacing: '0.20em',
            color: 'var(--text-muted)',
            marginBottom: '8px',
          }}>
            Gems for Sale
          </p>
          <h1 style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(30px, 6vw, 60px)',
            fontWeight: 400,
            color: 'var(--text)',
            marginBottom: '48px',
          }}>
            Shop
          </h1>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                Loading...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                No products available
              </p>
            </div>
          ) : (
            <div className="shop-grid">
              {products.map((product) => (
                <div
                  key={product.product_id}
                  className={`shop-card${tappedProduct === product.product_id ? " tapped" : ""}`}
                  onClick={() => handleCardClick(product)}
                  data-testid={`product-${product.product_id}`}
                >
                  <div className="shop-card-img">
                    {product.photo_url ? (
                      <img
                        src={getPhotoUrl(product.photo_url)!}
                        alt={product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.0)', transformOrigin: 'center' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-ui)', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>No Photo</span>
                      </div>
                    )}
                    <div className="shop-card-vignette" />
                  </div>
                  <div style={{ padding: '0px 0px 0' }}>
                    <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '23px', color: 'var(--bg)', margin: '0 0 4px', fontWeight: 700 }}>
                      {product.title}
                    </h3>
                    <div className="shop-card-mobile-title" style={{ display: 'none' }}>
                      {product.title.split(' ')[0]}
                    </div>
                    <div style={{ display: 'flex', gap: '13px', flexWrap: 'wrap', marginBottom: '9px' }}>
                      {product.gem_type && <span className="shop-tag">{product.gem_type}</span>}
                      {product.weight && <span className="shop-tag">{product.weight} ct</span>}
                      {product.color && <span className="shop-tag">{product.color}</span>}
                    </div>
                   
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
        <ProductDetailModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onBuy={handleBuyClick}
          onInquire={handleInquiryClick}
          getPhotoUrl={getPhotoUrl}
        />
      )}

      {/* Inquiry Modal */}
      {inquiryStep && modalProduct && (
        <InquiryModal
          inquiryStep={inquiryStep}
          product={modalProduct}
          guestCollected={guestCollected}
          accountUser={accountUser}
          submitting={inquirySubmitting}
          onGuestInfoSubmit={handleGuestInfoForInquiry}
          onClose={closeInquiry}
          onDescSubmit={handleInquiryDescSubmit}
          onOK={handleInquiryOK}
        />
      )}

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
.shop-card {
  cursor: pointer;
  transition: transform 400ms ease-out;
}
.shop-card:hover {
  transform: translateY(0px);
}
.shop-card:hover .shop-card-img {
  border-color: rgba(0, 0, 0, 0.16);
  box-shadow: 0 18px 48px rgba(0,0,0,0.65);
}
.shop-card-img {
  position: relative;
  aspect-ratio: 1 / 1;
  background: #ffffff20;
  border-radius: 1.7px;
  border: 1.7px solid rgba(20, 16, 16, 0.98);
  overflow: hidden;
  box-shadow: 0 0px 1px rgba(0,0,0,0.35);
  transition: border-color 10ms ease-out, box-shadow 50ms ease-in;
}
.shop-card-vignette {
  position: absolute;
  inset: 10px;
  box-shadow: inset 8 0 30px 12px rgba(0, 0, 0, 0.12);
  pointer-events: none;
  z-index: 2;
}
.shop-tag {
  font-family: var(--font-body);
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.13em;
  color: var(--accent);
  background: rgba(34, 32, 32, 0.84);
  border: 1px solid var(--border);
  padding: 0px 8px;
}
@media (max-width: 767px) {
  .shop-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 15px 15px;
  }
  .shop-card-img {
    border-radius: 8px;
  }
  .shop-card-title {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #d4af37;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 8px 0 0;
  }
  .shop-card .shop-tag { display: none; }
  .shop-card h3 { display: none; }
  .shop-card p { display: none; }
  .shop-card-mobile-title { display: block; }
  .shop-card-img img {
    transition: filter 80ms ease-in;
  }
}
`;
