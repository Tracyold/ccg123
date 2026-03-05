import Head from 'next/head';
import { useRouter } from 'next/router';

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: '14px', lineHeight: 1.85, color: 'rgba(255,255,255,0.65)', marginBottom: '16px' }}>{children}</p>
);
const Li = ({ children }: { children: React.ReactNode }) => (
  <li style={{ fontSize: '14px', lineHeight: 1.85, color: 'rgba(255,255,255,0.65)', marginBottom: '8px' }}>{children}</li>
);
const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '40px' }}>
    <h2 style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: 'clamp(29x, 17vw, 24px)', color: '#FAFAFA', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>{title}</h2>
    {children}
  </div>
);
const SampleMsg = ({ label, msg }: { label: string; msg: string }) => (
  <div style={{ padding: '12px 16px', background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', marginBottom: '10px' }}>
    <p style={{ fontSize: '19px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', margin: '0 0 6px 0' }}>{label}</p>
    <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.75)', margin: 0, fontFamily: "'Courier New', monospace", lineHeight: 1.6 }}>{msg}</p>
  </div>
);

export default function SmsTerms() {
  const router = useRouter();
  return (
    <>
      <Head><title>SMS Disclosure — Cutting Corners Gems</title></Head>
      <div style={{ background: '#050505', minHeight: '100vh', color: '#FAFAFA' }}>

        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }}>← Cutting Corners Gems</button>
          <div style={{ display: 'flex', gap: '24px' }}>
            <button onClick={() => router.push('/legal')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>Legal</button>
            <button onClick={() => router.push('/legal/privacy-policy')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>Privacy Policy</button>
          </div>
        </div>

        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '64px 40px' }}>

          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '15px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.7)', marginBottom: '12px' }}>Cutting Corners Gems</p>
          <h1 style={{ fontFamily: "'Oranienbaum', serif", fontSize: 'clamp(32px, 5vw, 52px)', color: '#FAFAFA', marginBottom: '16px', lineHeight: 1.15 }}>SMS Notification Terms & Disclosure</h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>Effective Date: March 4, 2026</p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.35)', marginBottom: '48px' }}>Program Name: Cutting Corners Gems — User Opt-In/Out Account Notifications</p>

          {/* Intro */}
          <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', padding: '20px 24px', marginBottom: '48px' }}>
            <P>By providing a mobile phone number and enabling SMS notification toggles within your account dashboard, you consent to receive transactional SMS notifications related to your account activity. Notifications are optional and can be enabled or disabled individually at any time from your Account Dashboard → Notification Settings.</P>
            <p style={{ fontSize: '17px', color: 'rgba(255,220,100,0.8)', margin: 0 }}>Cutting Corners Gems does not send unsolicited marketing or promotional SMS messages. All messages are operational in nature and correspond to account activity you have chosen to track.</p>
          </div>

          {/* Program Categories */}
          <Block title="Messaging Programs">
            <P>Cutting Corners Gems operates three distinct SMS messaging programs, each corresponding to a specific notification category:</P>
            <div style={{ display: 'grid', gap: '12px', marginBottom: '8px' }}>
              {[
                { label: 'Account Notifications', desc: 'Transactional alerts for work orders, invoices, service requests, tracking updates, and account activity.' },
                { label: 'New Listing Alerts', desc: 'Optional marketing notifications sent when new gemstones are listed in the shop. Frequency varies by inventory.' },
                { label: 'Chat Message Alerts', desc: 'Two-way conversational notifications when new messages are sent or received through the account chat system.' },
              ].map(p => (
                <div key={p.label} style={{ padding: '14px 18px', background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d4af37', flexShrink: 0, marginTop: '5px' }} />
                  <div>
                    <p style={{ fontSize: '17px', fontWeight: 600, color: '#FAFAFA', margin: '0 0 4px 0', letterSpacing: '0.05em' }}>{p.label}</p>
                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.65 }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Block>

          {/* Account Notifications */}
          <Block title="Account Notifications (Transactional)">
            <P>These notifications are sent only for events you have explicitly opted into within your account dashboard. They include:</P>
            <ul style={{ fontSize: '15px',paddingLeft: '20px', marginBottom: '20px' }}>
              <Li><strong style={{ color: 'rgba(255,255,255,0.8)', fontSize: '17px' }}>Work Order Updates</strong> — Creation, acceptance, item received, service completed, edits, and revisions.</Li>
              <Li><strong style={{ color: 'rgba(255,255,255,0.8)', fontSize: '17px' }}>Invoice Notifications</strong> — When a new invoice is issued and available for payment.</Li>
              <Li><strong style={{ color: 'rgba(255,255,255,0.8)', fontSize: '17px' }}>Tracking Updates</strong> — When an item has been dispatched with tracking information.</Li>
              <Li><strong style={{ color: 'rgba(255,255,255,0.8)', fontSize: '17px' }}>Service Request Confirmations</strong> — When a service request has been received.</Li>
              <Li><strong style={{ color: 'rgba(255,255,255,0.8)', fontSize: '17px' }}>Purchase Confirmations</strong> — When a shop purchase is completed.</Li>
            </ul>
            <P>Sample messages:</P>
            <SampleMsg label="Work Order Created" msg="Cutting Corners Gems: A new work order has been created for your account and is ready for your review. Log in to accept. Reply STOP to opt out." />
            <SampleMsg label="Service Completed" msg="Cutting Corners Gems: Your gemstone service is complete. Your invoice is now available in your account dashboard. Reply STOP to opt out." />
            <SampleMsg label="Tracking Update" msg="Cutting Corners Gems: Your item has been shipped. Tracking: [tracking number]. Reply STOP to opt out." />

            <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', padding: '16px 20px', marginTop: '16px' }}>
              <p style={{ fontSize: '17px', color: 'rgba(255,220,100,0.85)', lineHeight: 1.75, margin: 0 }}>
                <strong>Active Work Order Requirement:</strong> Work order notifications cannot be disabled while you have an open work order. Because your gemstone is in our possession during this time, we require the ability to reach you with status updates and required confirmations. This toggle becomes available to turn off once your work order is complete and your item has been returned.
              </p>
            </div>
          </Block>

          {/* Marketing */}
          <Block title="New Gemstone Listing Alerts (Marketing)">
            <P><p style={{ fontSize: '17px' }}>If enabled, you will receive one SMS notification each time a new gemstone is listed in the shop. Each message contains a direct link to that listing.</p></P>
            <P><p style={{ fontSize: '17px' }}>If multiple gemstones are listed on the same day, you may receive one message per listing. Notifications are sent only when an item is first listed — not when it sells or is updated.</p></P>
            <P><p style={{ fontSize: '17px' }}>Sample messages:</p></P>
            <SampleMsg label="New Listing" msg="Cutting Corners Gems: A new gemstone has just been listed — [item name]. View it here: [link]. Reply STOP to opt out." />
            <SampleMsg label="New Listing (Multiple)" msg="Cutting Corners Gems: New listing — [item name] is now available in the shop: [link]. Reply STOP to opt out." />
          </Block>

          {/* Chat */}
          <Block title="Chat Message Alerts (2-Way Messaging)">
            <P><p style={{ fontSize: '17px' }}>If enabled, you will receive an SMS notification when a new message is posted in your account's internal chat thread by the Cutting Corners Gems team.</p></P>
            <P><p style={{ fontSize: '17px' }}>Chat notifications support two-way messaging. You may reply directly to the SMS and your reply will be automatically added to your account's chat thread. Replies sent within the website chat interface may also generate an SMS notification to you.</p></P>
            <P><p style={{ fontSize: '17px' }}>The complete chat history remains accessible within your account dashboard. SMS serves as a notification and reply interface — the website is the primary record of all conversations.</p></P>
            <P><p style={{ fontSize: '17px' }}>Sample messages:</p></P>
            <SampleMsg label="New Chat Message" msg="Cutting Corners Gems: You have a new message from our team. Reply here or log in to your account to respond. Reply STOP to opt out." />
            <SampleMsg label="Chat Reply Confirmation" msg="Cutting Corners Gems: Your reply has been received and added to your account chat. Reply STOP to opt out." />
          </Block>

          {/* Opt-in */}
          <Block title="Opt-In Process">
            <P>SMS notifications are not enabled by default. To receive messages you must:</P>
            <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <Li>Provide a valid mobile phone number within your account profile.</Li>
              <Li>Enable the desired SMS notification toggle(s) within your Account Dashboard → Notification Settings.</Li>
              <Li>Confirm activation by checking the consent checkbox and clicking "Enable Notifications" in the confirmation modal that appears for each toggle.</Li>
            </ol>
            <P>Each notification category has a separate opt-in toggle and a separate consent modal. Enabling one category does not enable others.</P>
          </Block>

          {/* Opt-out */}
          <Block title="Opt-Out Process">
            <P><p style={{ fontSize: '17px' }}>You may disable any SMS notification category at any time by turning off the corresponding toggle in your Account Dashboard → Notification Settings.</p></P>
            <P><p style={{ fontSize: '17px' }}>You may also reply <strong style={{ color: '#FAFAFA' }}>STOP</strong> to any message to opt out. After opting out, messages from that program will no longer be sent unless you re-enable the toggle in your account dashboard.</p></P>
            <P><p style={{ fontSize: '17px' }}>Reply <strong style={{ color: '#FAFAFA' }}>HELP</strong> to any message for assistance.</p></P>
            <P><p style={{ fontSize: '17px' }}>Standard message and data rates may apply depending on your mobile carrier.</p></P>
          </Block>

          {/* Standard Responses */}
          <Block title="Standard Keyword Responses">
            <div style={{ display: 'grid', gap: '10px' }}>
              <ul style={{ fontSize: '19px'}}>
                <SampleMsg label="STOP Response" msg="You have been unsubscribed from Cutting Corners Gems SMS notifications. No further messages will be sent. You may re-enable notifications at any time from your account dashboard." />
                <SampleMsg label="HELP Response" msg="Cutting Corners Gems SMS Notifications. For support: admin@cuttingcornersgems.com or visit cuttingcornersgems.com. To stop messages reply STOP. Msg & data rates may apply." />
                <SampleMsg label="Opt-In Confirmation" msg="Cutting Corners Gems: You have enabled [notification type] SMS alerts. Manage notifications anytime at your account dashboard. Reply STOP to opt out. Msg & data rates may apply." />
              </ul>
            </div>
          </Block>

          {/* Data Use */}
          <Block title="Data Use and Privacy">
            <P><p style={{ fontSize: '17px' }}> Mobile phone numbers are used solely to deliver the notification types you choose to enable. Cutting Corners Gems does not sell, rent, or distribute phone numbers to third parties for any purpose.</p></P>
            <P><p style={{ fontSize: '17px' }}>SMS communications are strictly limited to operational notifications and opted-in marketing related to account activity and gemstone listings. No unsolicited messages are sent.</p></P>
            <P><p style={{ fontSize: '17px' }}>For additional information about how personal data is handled, please refer to the <button onClick={() => router.push('/legal/privacy-policy')} style={{ background: 'none', border: 'none', color: 'rgba(212,175,55,0.8)', cursor: 'pointer', fontSize: '17px', textDecoration: 'underline', padding: 0 }}>Privacy Policy</button>.</p></P>
          </Block>

          {/* Contact */}
          <div style={{ marginTop: '32px', padding: '24px', border: '1px solid rgba(212,175,55,0.15)', background: 'rgba(212,175,55,0.04)' }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '15px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '12px' }}>Contact</p>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 2, margin: 0 }}>
              Cutting Corners Gems<br />
              850 S River Dr #2117, Tempe, Arizona 85281<br />
              Website Admin: Tracy Young — admin@cuttingcornersgems.com<br />
              Gemstone Cutter: Michael Wall — Mwall@cuttingcornersgems.com
            </p>
          </div>

          <div style={{ marginTop: '48px', display: 'flex', gap: '24px', justifyContent: 'center' }}>
            <button onClick={() => router.push('/legal')} style={{ background: 'none', border: 'none', color: 'rgba(212,175,55,0.6)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>Legal</button>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <button onClick={() => router.push('/legal/privacy-policy')} style={{ background: 'none', border: 'none', color: 'rgba(212,175,55,0.6)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>Privacy Policy</button>
          </div>

        </div>
      </div>
    </>
  );
}