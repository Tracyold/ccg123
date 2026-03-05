import Head from 'next/head';
import { useRouter } from 'next/router';

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: '14px', lineHeight: 1.85, color: 'rgba(255,255,255,0.65)', marginBottom: '16px' }}>{children}</p>
);
const Li = ({ children }: { children: React.ReactNode }) => (
  <li style={{ fontSize: '14px', lineHeight: 1.85, color: 'rgba(255,255,255,0.65)', marginBottom: '6px' }}>{children}</li>
);
const Sec = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '40px' }}>
    <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.8)', marginBottom: '14px' }}>{n}. {title}</h2>
    {children}
  </div>
);

export default function PrivacyPolicy() {
  const router = useRouter();
  return (
    <>
      <Head><title>Privacy Policy — Cutting Corners Gems</title></Head>
      <div style={{ background: '#050505', minHeight: '100vh', color: '#FAFAFA' }}>

        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }}>← Cutting Corners Gems</button>
          <div style={{ display: 'flex', gap: '24px' }}>
            <button onClick={() => router.push('/legal')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>Legal</button>
            <button onClick={() => router.push('/legal/sms-terms')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>SMS Disclosure</button>
          </div>
        </div>

        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '64px 40px' }}>

          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.7)', marginBottom: '12px' }}>Cutting Corners Gems</p>
          <h1 style={{ fontFamily: "'Oranienbaum', serif", fontSize: 'clamp(32px, 5vw, 52px)', color: '#FAFAFA', marginBottom: '16px', lineHeight: 1.15 }}>Privacy Policy</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '64px' }}>Effective Date: March 4, 2026</p>

          <P>Cutting Corners Gems respects your privacy and is committed to protecting the personal information you provide when using our website and services. By using this website or creating an account, you acknowledge and agree to the practices described in this Privacy Policy.</P>

          <Sec n="1" title="What 'Information We Collect' Means">
            <P>Within this Privacy Policy, "collect" refers to information you voluntarily provide while using the website. Cutting Corners Gems does not gather hidden personal information, purchase personal data, or obtain personal information from unrelated third-party data brokers.</P>
            <P>The information you provide allows the system to operate services including:</P>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              {['Creating and accessing a user account','Logging into the website securely','Creating and managing gemstone service work orders','Submitting service requests','Communicating through internal chat','Sending inquiries or support messages','Issuing and viewing invoices','Processing payments','Receiving SMS notifications for enabled account events','Managing shipping addresses','Purchasing gemstones from the shop'].map(i => <Li key={i}>{i}</Li>)}
            </ul>
          </Sec>

          <Sec n="2" title="Information You May Provide">
            <P><strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Account Information</strong> — Name, email address, phone number, account login credentials, and notification settings.</P>
            <P><strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Shipping Information</strong> — Shipping address for returning serviced gemstones or delivering purchases. Used solely for sending completed work orders or purchased gemstones.</P>
            <P><strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Service & Transaction Information</strong> — Work order submissions, service instructions, invoice records, payment status, and transaction references.</P>
            <P><strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Communication Information</strong> — Messages sent through internal chat, customer service inquiries, and work order communications.</P>
            <P><strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Technical & Usage Information</strong> — Limited data such as IP address, device type, browser information, and access timestamps used for system security and functionality.</P>
          </Sec>

          <Sec n="3" title="How Your Information Is Used">
            <P>Information provided may be used to create and maintain your account, process service requests, generate and track work orders, issue invoices, ship completed or purchased gemstones, deliver SMS notifications for enabled events, operate the internal messaging system, maintain transaction records, improve system reliability, and comply with applicable legal requirements.</P>
            <P>Cutting Corners Gems does not use personal information for unsolicited marketing communications.</P>
          </Sec>

          <Sec n="4" title="SMS Messaging and Notification Services">
            <P>SMS notifications are delivered through Twilio, a third-party communications provider. When SMS notifications are enabled in your account dashboard, your phone number may be transmitted to Twilio solely for delivering the operational notifications you have chosen to receive.</P>
            <P>Twilio operates under telecommunications industry regulations enforcing user opt-in requirements, opt-out capability, message transparency, and carrier compliance monitoring.</P>
            <P>Users may disable SMS notifications at any time within their Account Dashboard → Notification Settings, or by replying STOP to any message.</P>
            <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', padding: '16px 20px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,220,100,0.85)', lineHeight: 1.75, margin: 0 }}>
                <strong>Exception for Active Work Orders:</strong> If you have an open or active work order, SMS notifications for work order status updates cannot be disabled until the work order is completed or closed. These notifications are required to ensure both parties remain informed while your gemstone is in our possession. Once the work order is completed, the toggle may be adjusted normally.
              </p>
            </div>
            <P>Standard message and data rates may apply. Cutting Corners Gems uses SMS messaging solely for operational notifications and does not send marketing or promotional text messages.</P>
          </Sec>

          <Sec n="5" title="Payment Processing">
            <P>Payments are processed through Stripe. Cutting Corners Gems does not store or retain payment card numbers, banking details, or other payment credentials. Users are securely redirected to Stripe's payment interface and Cutting Corners Gems receives only payment status confirmation.</P>
          </Sec>

          <Sec n="6" title="Account Authenticity, Fraud Prevention & Age Restrictions">
            <P>Accounts must accurately represent the individual controlling the account and must be created by individuals 18 years of age or older. Accounts found to be fraudulent or controlled by minors will be immediately suspended. Suspected fraudulent activity may be reported to relevant authorities.</P>
          </Sec>

          <Sec n="7" title="Data Storage and Security">
            <P>We implement reasonable technical and organizational safeguards including encrypted website connections (HTTPS), access control and authentication systems, secure server infrastructure, and activity monitoring. While reasonable safeguards are used, no system can guarantee absolute security.</P>
          </Sec>

          <Sec n="8" title="Information Sharing">
            <P>Cutting Corners Gems does not sell, rent, or trade personal information. Information may be shared only when necessary to operate the website, including with payment processing providers, shipping providers, communication service providers, and website hosting providers. Information may also be disclosed when required by law.</P>
          </Sec>

          <Sec n="9" title="Account Control and Information Access">
            <P>Users may access and update their information through their account dashboard, including contact information, shipping addresses, and notification preferences.</P>
          </Sec>

          <Sec n="10" title="Data Retention">
            <P>Information may be retained as long as necessary to provide services, maintain records, comply with legal and accounting requirements, and resolve disputes. Service records, invoices, and transaction history may be retained as part of normal business recordkeeping.</P>
          </Sec>

          <Sec n="11" title="Cookies and Technical Data">
            <P>The website may use cookies to support account login sessions, website functionality, performance monitoring, and security. Cookies are intended to support system operation rather than advertising.</P>
          </Sec>

          <Sec n="12" title="Third-Party Services">
            <P>The website relies on third-party providers for hosting, payment processing, messaging services, and system operations. These providers operate according to their own privacy and security policies.</P>
          </Sec>

          <Sec n="13" title="Children's Privacy">
            <P>This website is not directed toward individuals under the age of 18. Accounts must be created and controlled by individuals who are 18 years of age or older. Accounts controlled by minors will be suspended.</P>
          </Sec>

          <Sec n="14" title="Changes to This Privacy Policy">
            <P>Cutting Corners Gems may update this Privacy Policy periodically. Updated versions will be posted on this page with a revised effective date. Continued use of the website after changes are posted constitutes acceptance of the updated policy.</P>
          </Sec>

          <Sec n="15" title="Contact Information">
            <div style={{ padding: '24px', border: '1px solid rgba(212,175,55,0.15)', background: 'rgba(212,175,55,0.04)' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 2, margin: 0 }}>
                Cutting Corners Gems<br />
                850 S River Dr #2117, Tempe, Arizona 85281<br />
                Website Admin: Tracy Young — admin@cuttingcornersgems.com<br />
                Gemstone Cutter: Michael Wall — Mwall@cuttingcornersgems.com
              </p>
            </div>
          </Sec>

          <div style={{ marginTop: '48px', display: 'flex', gap: '24px', justifyContent: 'center' }}>
            <button onClick={() => router.push('/legal')} style={{ background: 'none', border: 'none', color: 'rgba(212,175,55,0.6)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>Legal</button>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <button onClick={() => router.push('/legal/sms-terms')} style={{ background: 'none', border: 'none', color: 'rgba(212,175,55,0.6)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>SMS Disclosure</button>
          </div>

        </div>
      </div>
    </>
  );
}