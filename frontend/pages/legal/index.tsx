import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import SmsPreview from '../../components/legal/smscomp';

// ─── Shared text primitives ───────────────────────────────────────────────────
const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: '16px', lineHeight: 1.9, color: 'var(--text)', marginBottom: '16px' }}>{children}</p>
);
const Li = ({ children }: { children: React.ReactNode }) => (
  <li style={{ fontSize: '16px', lineHeight: 1.9, color: 'var(--text)', marginBottom: '8px' }}>{children}</li>
);
const Num = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '28px' }}>
    <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px' }}>{n}. {title}</h4>
    {children}
  </div>
);
const PrivSec = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '36px' }}>
    <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px' }}>{n}. {title}</h4>
    {children}
  </div>
);
const SectionHeading = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <h3 id={id} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 2.5vw, 24px)', color: 'var(--text)', marginBottom: '18px', marginTop: '40px', scrollMarginTop: '120px' }}>{children}</h3>
);
const GoldNote = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid #d4af37', padding: '16px 20px', marginBottom: '20px', borderRadius: '2px' }}>
    <p style={{ fontSize: '13px', color: 'rgba(255,230,130,1)', lineHeight: 1.8, margin: 0 }}>{children}</p>
  </div>
);
const GoldDivider = () => (
  <div style={{ margin: '72px 0 64px', display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.35), transparent)' }} />
    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#d4af37', opacity: 0.5, flexShrink: 0 }} />
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #d4af37, transparent)' }} />
  </div>
);

// ─── TOC definition ───────────────────────────────────────────────────────────
const TOC_ITEMS = [
  { id: 'legal-top',        label: 'Legal & Policies',        group: 'legal' },
  { id: 'communication',    label: 'Communication',           group: 'legal' },
  { id: 'pricing',          label: 'Pricing Policy',          group: 'legal' },
  { id: 'service-agreement',label: 'Service Agreement',       group: 'legal' },
  { id: 'privacy-top',      label: 'Privacy Policy',          group: 'privacy' },
  { id: 'sms-top',          label: 'SMS Disclosure',          group: 'sms' },
  { id: 'sms-programs',     label: 'Messaging Programs',      group: 'sms' },
  { id: 'acct-notifications',label:'Account Notifications',   group: 'sms'  },
  { id: 'listing-alerts',   label: 'Listing Alerts',          group: 'sms' },
  { id: 'chat-alerts',      label: 'Chat Alerts',             group: 'sms' },
  { id: 'opt-in-out',       label: 'Opt-In / Opt-Out',        group: 'sms' },
  { id: 'keywords',         label: 'Keyword Responses',       group: 'sms' },
];

// ─── SMS sample data for SmsPreview ──────────────────────────────────────────
const acctNotificationExamples = [
  {
    title: 'Work Order — Full Notification Sequence',
    messages: [
      { id: '1', type: 'incoming' as const, text: 'You have successfully sent a service request to Cutting Corners Gems [service_request_id]. You are receiving this message because you agreed to recieve work order notifications.', time: 'Mar 4' },
      { id: '2', type: 'incoming' as const, text: 'Cutting Corners Gems: workorder [work_order_id] was created for [work_order_gem_type] [work_order_service_type] and is ready for you to accept. Please Click the link to review its details and click accept before sending your gemstone! [link]. NOTE: You are receiving this message because you agreed to recieve SMS notifications during the duration of an OPEN workorder. You may opt out when the workorder is not OPEN.', time: 'Mar 4' },
      { id: '3', type: 'incoming' as const, text: 'Cutting Corners Gems: You accepted Workorder [work_order_id] for [work_order_gem_type] [work_order_service_type]! NOTE: You are recieving this message because you agreed to recieve SMS notificationS while a workorder is OPEN. You may opt out when the workorder is not OPEN.', time: 'Mar 5' },
      { id: '4', type: 'incoming' as const, text: 'Cutting Corners Gems: Your workorder [work_order_id] for [work_order_gem_type] [work_order_service_type] acceptance is confirmed! Please send your gemstone to address on the workorder and provide tracking information using chat, email or text message.', time: 'Mar 5' },
      { id: '5', type: 'incoming' as const, text: 'Cutting Corners Gems: Your workorder [work_order_id] for [work_order_gem_type] [work_order_service_type] acceptance is confirmed. Please click the link to download your shipping label.', time: 'Mar 5' },
      { id: '6', type: 'incoming' as const, text: 'Cutting Corners Gems: Your [work_order_gem_type] for workorder [work_order_id] for [work_order_gem_type] [work_order_service_type] was recieve by Cutting Corners Gems', time: 'Mar 8' },
      { id: '7', type: 'incoming' as const, text: 'Cutting Corners Gems: Your workorder [work_order_id] for [work_order_gem_type] [work_order_service_type] is complete! Please click the link to review your invoice, notes, photos and payment options.', time: 'Mar 12' },
      { id: '8', type: 'incoming' as const, text: 'Cutting Corners Gems: Workorder [work_order_id] for [work_order_gem_type] [work_order_service_type] payment is complete. Your item will be shipped to the address on the your workorder within 24 horus.', time: 'Mar 12' },
      { id: '9', type: 'incoming' as const, text: 'Cutting Corners Gems: Your gemsone for workorder [work_order_id] for [work_order_gem_type] [work_order_service_type] has been shipped! Please click the link to view tracking information [link]. Please opt in to shipping notifications in your account dashboard to recieve shipping updates', time: 'Mar 13' },
    ],
  },
];

const listingAlertExamples = [
  {
    title: 'New Gemstone Listing Alert',
    messages: [
      { id: '1', type: 'incoming' as const, text: 'Cutting Corners Gems: A new gemstone has just been listed — [item name]. View it here: [link]. Reply STOP to opt out.', time: 'Now' },
    ],
  },
];

const chatAlertExamples = [
  {
    title: 'New Chat Message Alert',
    messages: [
      { id: '1', type: 'incoming' as const, text: 'Cutting Corners Gems: You have a new message from our team. Reply here or log in to your account to respond. To have resppond to chat messages direclty thrrough SMS please OPT-IN to DIRECT SMS CHAT NOTIFICATIONS. Reply STOP to opt out.', time: 'Now' },
      { id: '2', type: 'outgoing' as const, text: 'Got it, thanks!', time: 'Now' },
    ],
  },
  {
    title: 'Product Inquiry Sent',
    messages: [
      { id: '1', type: 'incoming' as const, text: 'Cutting Corners Gems: You sent a an inquiry about [product_title], [product_gem_type], [product_gem_weight]. We will respond shortly!', time: 'Now' },
    ],
  },
];

const keywordExamples = [
  {
    title: 'STOP Response',
    messages: [
      { id: '1', type: 'outgoing' as const, text: 'STOP', time: 'Now' },
      { id: '2', type: 'incoming' as const, text: 'You have been unsubscribed from Cutting Corners Gems SMS notifications. No further messages will be sent. You may re-enable notifications at any time from your account dashboard.', time: 'Now' },
    ],
  },
  {
    title: 'HELP Response',
    messages: [
      { id: '1', type: 'outgoing' as const, text: 'HELP', time: 'Now' },
      { id: '2', type: 'incoming' as const, text: 'Cutting Corners Gems SMS Notifications. For support: admin@cuttingcornersgems.com or visit cuttingcornersgems.com. To stop messages reply STOP. Msg & data rates may apply.', time: 'Now' },
    ],
  },
  {
    title: 'Opt-In Confirmation',
    messages: [
      { id: '1', type: 'incoming' as const, text: 'Cutting Corners Gems: You have enabled [notification type] SMS alerts. Manage notifications anytime at your account dashboard. Reply STOP to opt out. Msg & data rates may apply.', time: 'Now' },
    ],
  },
];

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LegalUnified() {
  const router = useRouter();
  const [activeId, setActiveId] = useState('legal-top');

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      for (let i = TOC_ITEMS.length - 1; i >= 0; i--) {
        const el = document.getElementById(TOC_ITEMS[i].id);
        if (el && el.getBoundingClientRect().top <= 130) {
          setActiveId(TOC_ITEMS[i].id);
          return;
        }
      }
      setActiveId('legal-top');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Head><title>Legal, Privacy & SMS Disclosure — Cutting Corners Gems</title></Head>

      <style>{`
        .toc-btn {
          display: block; width: 100%; text-align: left;
          padding: 7px 14px; border: none; border-radius: 3px;
          background: none; cursor: pointer;
          font-family: 'Comfortaa', sans-serif;
          font-size: 12px; letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text);
          transition: color 180ms, background 180ms;
          border-left: 2px solid transparent;
        }
        .toc-btn:hover { color: var(--text-muted); background: transparent; }
        .toc-btn.active { color: var(--accent); background: rgba(255,211,105,0.08); border-left-color: var(--accent); padding-left: 12px; }
        .toc-group-label {
          font-family: 'Comfortaa', sans-serif;
          font-size: 9px; letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 14px 14px 6px;
        }
        .mobile-tab {
          flex-shrink: 0; padding: 11px 14px;
          background: none; border: none; border-bottom: 2px solid transparent;
          font-family: 'Comfortaa', sans-serif;
          font-size: 10px; letter-spacing: 0.1em;
          text-transform: uppercase; white-space: nowrap;
          cursor: pointer; color: var(--text);
          transition: color 180ms, border-color 180ms;
        }
        .mobile-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
        .phone-thread::-webkit-scrollbar { display: none; }
        .anchor { scroll-margin-top: 120px; }
        @media (min-width: 901px) { .mobile-toc-bar { display: none !important; } }
        @media (max-width: 900px) { .desktop-sidebar { display: none !important; } }
      `}</style>

      <div style={{ background: 'transparent', minHeight: '100vh', color: 'var(--text)' }}>

        {/* ── Top nav ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(5,5,5,0.96)', backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }}>
            ← Cutting Corners Gems
          </button>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Legal &amp; Disclosures
          </span>
        </div>

        {/* ── Mobile TOC bar ── */}
        <div className="mobile-toc-bar" style={{
          position: 'sticky', top: '53px', zIndex: 90,
          background: 'rgba(8,8,8,0.97)', borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', overflowX: 'auto', padding: '0 16px',
          scrollbarWidth: 'none',
        }}>
          {TOC_ITEMS.map(t => (
            <button key={t.id} className={`mobile-tab${activeId === t.id ? ' active' : ''}`} onClick={() => scrollTo(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', maxWidth: '1180px', margin: '0 auto' }}>

          {/* ── Desktop sticky sidebar ── */}
          <aside className="desktop-sidebar" style={{
            width: '210px', flexShrink: 0,
            position: 'sticky', top: '53px',
            height: 'calc(100vh - 53px)', overflowY: 'auto',
            padding: '36px 0 40px',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div className="toc-group-label">Legal</div>
            {TOC_ITEMS.filter(t => t.group === 'legal').map(t => (
              <button key={t.id} className={`toc-btn${activeId === t.id ? ' active' : ''}`} onClick={() => scrollTo(t.id)}>{t.label}</button>
            ))}
            <div className="toc-group-label" style={{ marginTop: '8px' }}>Privacy</div>
            {TOC_ITEMS.filter(t => t.group === 'privacy').map(t => (
              <button key={t.id} className={`toc-btn${activeId === t.id ? ' active' : ''}`} onClick={() => scrollTo(t.id)}>{t.label}</button>
            ))}
            <div className="toc-group-label" style={{ marginTop: '8px' }}>SMS</div>
            {TOC_ITEMS.filter(t => t.group === 'sms').map(t => (
              <button key={t.id} className={`toc-btn${activeId === t.id ? ' active' : ''}`} onClick={() => scrollTo(t.id)}>{t.label}</button>
            ))}
            <div style={{ margin: '32px 14px 0', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--text-muted)', lineHeight: 1.9 }}>
                Effective<br />March 4, 2026
              </p>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main style={{ flex: 1, padding: '64px 48px 120px', minWidth: 0 }}>

            {/* Hero */}
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '12px' }}>Cutting Corners Gems</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5vw, 56px)', color: 'var(--text)', marginBottom: '20px', lineHeight: 1.1 }}>Legal, Privacy<br />&amp; SMS Disclosure</h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '64px' }}>
              Effective Date: March 4, 2026 · Program: Cutting Corners Gems — User Opt-In/Out Account Notifications
            </p>

            {/* ════════════════════════════════════════════════════
                SECTION 1 — LEGAL & POLICIES
            ════════════════════════════════════════════════════ */}
            <div id="legal-top" className="anchor">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 34px)', color: 'var(--text)', marginBottom: '24px' }}>Legal &amp; Policies</h2>
              <P>Cutting Corners Gems believes that clear communication builds trust. Because gemstone cutting involves natural materials, shipping, and specialized services, we provide written policies so customers know exactly how our services operate before sending in their gemstones.</P>
              <P>These policies are not written to avoid responsibility. They exist to ensure that customers understand how the process works, what risks naturally exist with gemstone materials, and what procedures we follow to protect both the customer and the gemstone. Our goal is simple: clarity, transparency, and fairness for everyone involved.</P>
            </div>

            <SectionHeading id="communication">Customer Communication &amp; Relationship Commitment</SectionHeading>
            <P>At Cutting Corners Gems, gemstone cutting is a collaborative process that works best when the cutter and customer communicate clearly. Customers may reach us through:</P>
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              {['Live chat within the customer account dashboard','Chat notifications routed to SMS when enabled','Product inquiry forms','Service request submissions','Work order messaging','Email, direct text messaging, and telephone calls'].map(i => <Li key={i}>{i}</Li>)}
            </ul>
            <P>Work orders follow a structured process: creation, customer acceptance, confirmation, service completion, and invoicing. We encourage customers to reach out at any stage with questions about their gemstone or service.</P>

            <SectionHeading id="pricing">Legacy Customer &amp; Annual Pricing Policy</SectionHeading>
            <P>Customers who complete fifty (50) fully paid work orders may become eligible for Legacy Customer Pricing. Once this milestone is reached, the base service price in effect at that time will remain associated with the qualifying account indefinitely.</P>
            <P>Legacy Pricing applies only to the standard base service fee. It is non-transferable and does not apply to additional services, special materials, complex projects, repairs, or non-standard characteristicss. Base service prices will not be increased more than once within any twelve (12) month period.</P>

            <SectionHeading id="service-agreement">Gemstone Service Risk, Material Disclosure &amp; Liability Agreement</SectionHeading>
            <Num n="1" title="Nature of Natural Gemstones">
              <P>Gemstones are natural crystalline materials that may contain inclusions, fractures, cleavage planes, internal stress, crystal growth irregularities, and structural discontinuities that cannot always be fully determined prior to cutting.</P>
            </Num>
            <Num n="2" title="Professional Standard of Care">
              <P>Cutting Corners Gems performs all services using professional lapidary practices and reasonable skill. The Customer acknowledges that professional care does not eliminate the inherent risks associated with cutting natural gemstones.</P>
            </Num>
            <Num n="3" title="Risk Disclosure and Customer Notification">
              <P>Where reasonably identifiable, Cutting Corners Gems will inform the Customer of risks associated with the specific gemstone material, structural characteristics, visible fractures, inclusions, or potential structural weaknesses before approving a work order.</P>
            </Num>
            <Num n="4" title="Documentation of Gemstone Characteristics">
              <P>Cutting Corners Gems documents gemstone characteristics before and after service whenever reasonably possible, including photographic records, written notes, and post-service documentation.</P>
            </Num>
            <Num n="5" title="Structural Failure and Inherent Material Risk">
              <P>Despite professional care, gemstone materials may contain internal characteristics which cannot be detected prior to cutting. These characteristicss may result in cracking, chipping, cleaving, structural fracture, or breakage. The Customer acknowledges that these outcomes may occur even when services are performed professionally.</P>
            </Num>
            <Num n="6" title="Weight Reduction">
              <P>Gemstone cutting is a handmade craft and necessarily involves removal of material. Final gemstone weight is not and could never possibly be guaranteed.</P>
            </Num>
            <Num n="7" title="Appearance and Optical Outcome">
              <P>Lapidary services are craft-based professional processes. While performed with professional skill, final visual appearance cannot be guaranteed due to factors including internal inclusions, refractive properties, crystal orientation, and structural limitations.</P>
            </Num>
            <Num n="8" title="Pre-Existing Structural characteristicss">
              <P>Cutting Corners Gems shall not be responsible for damage resulting from pre-existing internal structural characteristicss that were not reasonably detectable prior to cutting.</P>
            </Num>
            <Num n="9" title="Shipping and Custody">
              <P>Risk of loss or damage during inbound shipping remains with the Customer until received by Cutting Corners Gems. Cutting Corners Gems shall not be responsible for delays, loss, or damage occurring while items are in transit through third-party shipping providers.</P>
            </Num>
            <Num n="10" title="Limitation of Liability">
              <P>To the maximum extent permitted by law, any liability related to services performed shall be limited to the service fee paid for the work order.</P>
            </Num>
            <Num n="11" title="Assumption of Risk">
              <P>By submitting a gemstone for service, the Customer acknowledges and accepts the inherent risks associated with gemstone cutting and lapidary processes.</P>
            </Num>
            <Num n="12" title="Governing Law">
              <P>This Agreement shall be governed by the laws of the State of Arizona. Any disputes shall occur within the jurisctiction of Maricopa County, Arizona, unless otherwise required by law.</P>
            </Num>
            <Num n="13" title="Acceptance">
              <P>Submission of a gemstone, acceptance of a work order, or shipment of a gemstone to Cutting Corners Gems constitutes acceptance of this Agreement.</P>
            </Num>

            <GoldDivider />

            {/* ════════════════════════════════════════════════════
                SECTION 2 — PRIVACY POLICY
            ════════════════════════════════════════════════════ */}
            <div id="privacy-top" className="anchor">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 34px)', color: 'var(--text)', marginBottom: '24px' }}>Privacy Policy</h2>
              <P>Cutting Corners Gems respects your privacy and is committed to protecting the personal information you provide when using our website and services. By using this website or creating an account, you acknowledge and agree to the practices described below.</P>
            </div>

            <PrivSec n="1" title="What 'Information We Collect' Means">
              <P>Within this Privacy Policy, "collect" refers to information you voluntarily provide while using the website. Cutting Corners Gems does not gather hidden personal information, purchase personal data, or obtain information from unrelated third-party data brokers. The information you provide allows the system to operate services including account creation, work orders, service requests, internal chat, invoices, payments, SMS notifications, shipping, and shop purchases.</P>
            </PrivSec>
            <PrivSec n="2" title="Information You May Provide">
              <P><strong style={{ color: 'var(--text)' }}>Account Information</strong> — Name, email address, phone number, login credentials, and notification settings.</P>
              <P><strong style={{ color: 'var(--text)' }}>Shipping Information</strong> — Shipping address for returning serviced gemstones or delivering purchases. Used solely for sending completed work orders or purchased items.</P>
              <P><strong style={{ color: 'var(--text)' }}>Service & Transaction Information</strong> — Work order submissions, service instructions, invoice records, payment status, and transaction references.</P>
              <P><strong style={{ color: 'var(--text)' }}>Communication Information</strong> — Messages sent through internal chat, customer service inquiries, and work order communications.</P>
              <P><strong style={{ color: 'var(--text)' }}>Technical & Usage Information</strong> — Limited data such as IP address, device type, browser information, and access timestamps used for system security and functionality.</P>
            </PrivSec>
            <PrivSec n="3" title="How Your Information Is Used">
              <P>Information may be used to create and maintain your account, process service requests, generate and track work orders, issue invoices, ship gemstones, deliver SMS notifications for enabled events, operate the internal messaging system, maintain transaction records, improve system reliability, and comply with applicable legal requirements. Cutting Corners Gems does not use personal information for unsolicited marketing communications.</P>
            </PrivSec>
            <PrivSec n="4" title="SMS Messaging and Notification Services">
              <P>SMS notifications are delivered through Twilio. When SMS notifications are enabled, your phone number may be transmitted to Twilio solely for delivering the operational notifications you have chosen to receive. Users may disable SMS notifications at any time within their Account Dashboard, or by replying STOP to any message.</P>
              <GoldNote>
                <strong>Exception for Active Work Orders:</strong> If you have an open work order, SMS notifications for work order status updates cannot be disabled until the work order is completed or closed. These notifications are required to ensure both parties remain informed while your gemstone is in our possession.
              </GoldNote>
              <P>Standard message and data rates may apply. Cutting Corners Gems uses SMS messaging solely for operational notifications and does not send unsolicited marketing or promotional text messages.</P>
            </PrivSec>
            <PrivSec n="5" title="Payment Processing">
              <P>Payments are processed through Stripe. Cutting Corners Gems does not store or retain payment card numbers, banking details, or other payment credentials. Users are securely redirected to Stripe's payment interface and Cutting Corners Gems receives only payment status confirmation.</P>
            </PrivSec>
            <PrivSec n="6" title="Account Authenticity, Fraud Prevention & Age Restrictions">
              <P>Accounts must accurately represent the individual controlling the account and must be created by individuals 18 years of age or older. Accounts found to be fraudulent or controlled by minors will be immediately suspended. Suspected fraudulent activity may be reported to relevant authorities.</P>
            </PrivSec>
            <PrivSec n="7" title="Data Storage and Security">
              <P>We implement reasonable technical and organizational safeguards including encrypted connections (HTTPS), access control and authentication systems, secure server infrastructure, and activity monitoring. While reasonable safeguards are used, no system can guarantee absolute security.</P>
            </PrivSec>
            <PrivSec n="8" title="Information Sharing">
              <P>Cutting Corners Gems does not sell, rent, or trade personal information. Information may be shared only when necessary to operate the website, including with payment processors, shipping providers, communication service providers, and website hosting providers, or when required by law.</P>
            </PrivSec>
            <PrivSec n="9" title="Account Control and Information Access">
              <P>Users may access and update their information through their account dashboard, including contact information, shipping addresses, and notification preferences.</P>
            </PrivSec>
            <PrivSec n="10" title="Data Retention">
              <P>Information may be retained as long as necessary to provide services, maintain records, comply with legal and accounting requirements, and resolve disputes. Service records, invoices, and transaction history may be retained as part of normal business recordkeeping.</P>
            </PrivSec>
            <PrivSec n="11" title="Cookies and Technical Data">
              <P>The website may use cookies to support account login sessions, website functionality, performance monitoring, and security. Cookies are intended to support system operation rather than advertising.</P>
            </PrivSec>
            <PrivSec n="12" title="Third-Party Services">
              <P>The website relies on third-party providers for hosting, payment processing, messaging services, and system operations. These providers operate according to their own privacy and security policies.</P>
            </PrivSec>
            <PrivSec n="13" title="Children's Privacy">
              <P>This website is not directed toward individuals under the age of 18. Accounts must be created and controlled by individuals who are 18 years of age or older. Accounts controlled by minors will be suspended.</P>
            </PrivSec>
            <PrivSec n="14" title="Changes to This Privacy Policy">
              <P>Cutting Corners Gems may update this Privacy Policy periodically. Updated versions will be posted on this page with a revised effective date. Continued use of the website after changes are posted constitutes acceptance of the updated policy.</P>
            </PrivSec>

            <GoldDivider />

            {/* ════════════════════════════════════════════════════
                SECTION 3 — SMS DISCLOSURE
            ════════════════════════════════════════════════════ */}
            <div id="sms-top" className="anchor">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 34px)', color: 'var(--text)', marginBottom: '24px' }}>SMS Notification Terms &amp; Disclosure</h2>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '28px' }}>Program Name: Cutting Corners Gems — User Opt-In/Out Account Notifications</p>
              <GoldNote>
                By providing a mobile phone number and enabling SMS notification toggles within your account dashboard, you consent to receive transactional SMS notifications related to your account activity. Notifications are optional and can be enabled or disabled individually at any time from your Account Dashboard. Cutting Corners Gems does not send unsolicited marketing or promotional SMS messages.
              </GoldNote>
            </div>

            <SectionHeading id="sms-programs">Messaging Programs</SectionHeading>
            <P>Cutting Corners Gems operates three distinct SMS messaging programs, each corresponding to a specific notification category:</P>
            <div style={{ display: 'grid', gap: '10px', marginBottom: '24px' }}>
              {[
                { label: 'Account Notifications', desc: 'Transactional alerts for work orders, invoices, service requests, product inquiries and tracking updates.' },
                { label: 'New Listing Alerts', desc: 'Optional marketing notifications sent when new gemstones are listed in the online shop. Frequency varies by inventory.' },
                { label: 'Chat Message Alerts', desc: 'Two-way conversational notifications when new messages are sent or received through the account chat system.' },
              ].map(p => (
                <div key={p.label} style={{ padding: '14px 18px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d4af37', flexShrink: 0, marginTop: '5px', opacity: 0.7 }} />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', margin: '0 0 4px 0', letterSpacing: '0.05em' }}>{p.label}</p>
                    <p style={{ fontSize: '13px', color: 'var(--text)', margin: 0, lineHeight: 1.65 }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <SectionHeading id="acct-notifications">Account Notifications (Transactional)</SectionHeading>
            <P>These notifications are sent only for events you have explicitly opted into within your account dashboard. They include work order updates (creation, acceptance, confirmation, item received, service completed, payment, and shipping), invoice notifications, tracking updates, service request confirmations, and purchase confirmations.</P>
            <GoldNote>
              <strong>Active Work Order Requirement:</strong> Work order notifications cannot be disabled while you have an open work order. Because your gemstone is in our possession during this time, we require the ability to reach you with status updates and required confirmations. This toggle becomes available to turn off once your work order is complete and your item has been returned.
            </GoldNote>
            <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text)' }}>Sample messages:</p>
            <SmsPreview examples={acctNotificationExamples} />

            <SectionHeading id="listing-alerts">New Gemstone Listing Alerts (Marketing)</SectionHeading>
            <P>If enabled, you will receive one SMS notification each time a new gemstone is listed in the shop. Each message contains a direct link to that listing. If multiple gemstones are listed on the same day, you may receive one message per listing. Notifications are sent only when an item is first listed — not when it sells or is updated.</P>
            <SmsPreview examples={listingAlertExamples} />

            <SectionHeading id="chat-alerts">Chat Message Alerts (2-Way Messaging)</SectionHeading>
            <P>If enabled, you will receive an SMS notification when a new message is posted in your account's internal chat thread by the Cutting Corners Gems team. Chat notifications support two-way messaging — you may reply directly to the SMS and your reply will be automatically added to your account's chat thread. The complete chat history remains accessible within your account dashboard. SMS serves as a notification and reply interface — the website is the primary record of all conversations.</P>
            <SmsPreview examples={chatAlertExamples} />

            <SectionHeading id="opt-in-out">Opt-In / Opt-Out Process</SectionHeading>
            <P>SMS notifications are not enabled by default. To receive messages you must:</P>
            <ol style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <Li>Provide a valid mobile phone number within your account profile.</Li>
              <Li>Enable the desired SMS notification toggle(s) within your Account Dashboard → Notification Settings.</Li>
              <Li>Confirm activation by checking the consent checkbox and clicking "Enable Notifications" in the confirmation modal that appears for each toggle.</Li>
            </ol>
            <P>Each notification category has a separate opt-in toggle and a separate consent modal. Enabling one category does not enable others.</P>
            <P>You may disable any SMS notification category at any time by turning off the corresponding toggle in your Account Dashboard. You may also reply <strong style={{ color: 'var(--text)' }}>STOP</strong> to any message to opt out. Reply <strong style={{ color: 'var(--text)' }}>HELP</strong> to any message for assistance. Standard message and data rates may apply.</P>

            <SectionHeading id="keywords">Standard Keyword Responses</SectionHeading>
            <SmsPreview examples={keywordExamples} />

            <div style={{ marginTop: '16px' }}>
              <P>Mobile phone numbers are used solely to deliver the notification types you choose to enable. Cutting Corners Gems does not sell, rent, or distribute phone numbers to third parties for any purpose. SMS communications are strictly limited to operational notifications and opted-in marketing related to account activity and gemstone listings.</P>
            </div>

            {/* ── Contact block ── */}
            <div style={{ marginTop: '64px', padding: '28px', border: '1px solid #d4af37', background: '#d4af37', borderRadius: '2px' }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '14px' }}>Contact</p>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 2.1, margin: 0 }}>
                Cutting Corners Gems<br />
                850 S River Dr #2117, Tempe, Arizona 85281<br />
                Website Admin: Tracy Young — admin@cuttingcornersgems.com<br />
                Gemstone Cutter: Michael Wall — mwall@cuttingcornersgems.com
              </p>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}