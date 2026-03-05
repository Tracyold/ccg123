import Head from 'next/head';
import { useRouter } from 'next/router';

const Section = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '48px' }}>
    {title && (
      <h2 style={{ fontFamily: "'Oranienbaum', serif", fontSize: 'clamp(20px, 3vw, 28px)', color: '#FAFAFA', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        {title}
      </h2>
    )}
    {children}
  </div>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: '14px', lineHeight: 1.85, color: 'rgba(255,255,255,0.65)', marginBottom: '16px' }}>{children}</p>
);

const Li = ({ children }: { children: React.ReactNode }) => (
  <li style={{ fontSize: '14px', lineHeight: 1.85, color: 'rgba(255,255,255,0.65)', marginBottom: '6px' }}>{children}</li>
);

const Num = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '32px' }}>
    <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.8)', marginBottom: '12px' }}>{n}. {title}</h3>
    {children}
  </div>
);

export default function LegalPage() {
  const router = useRouter();
  return (
    <>
      <Head><title>Legal & Policies — Cutting Corners Gems</title></Head>
      <div style={{ background: '#050505', minHeight: '100vh', color: '#FAFAFA' }}>

        {/* Nav */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }}>← Cutting Corners Gems</button>
          <div style={{ display: 'flex', gap: '24px' }}>
            <button onClick={() => router.push('/legal/privacy-policy')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>Privacy Policy</button>
            <button onClick={() => router.push('/legal/sms-terms')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>SMS Disclosure</button>
          </div>
        </div>

        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '64px 40px' }}>

          {/* Header */}
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.7)', marginBottom: '12px' }}>Cutting Corners Gems</p>
          <h1 style={{ fontFamily: "'Oranienbaum', serif", fontSize: 'clamp(32px, 5vw, 52px)', color: '#FAFAFA', marginBottom: '16px', lineHeight: 1.15 }}>Legal & Policies</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '64px' }}>Effective Date: March 4, 2026</p>

          <Section title="Why We Publish Our Policies">
            <P>Cutting Corners Gems believes that clear communication builds trust. Because gemstone cutting involves natural materials, shipping, and specialized services, we provide written policies so customers know exactly how our services operate before sending in their gemstones.</P>
            <P>These policies are not written to avoid responsibility. They exist to ensure that customers understand how the process works, what risks naturally exist with gemstone materials, and what procedures we follow to protect both the customer and the gemstone.</P>
            <P>Our goal is simple: clarity, transparency, and fairness for everyone involved.</P>
          </Section>

          <Section title="Customer Communication & Relationship Commitment">
            <P>At Cutting Corners Gems, we believe that gemstone cutting is not simply a transaction — it is a collaborative process that works best when the cutter and the customer are able to communicate clearly and openly.</P>
            <P>Customers may communicate with us through several avenues available on the website, including:</P>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              {['Live chat within the customer account dashboard','Chat notifications routed to SMS when enabled','Product inquiry forms','Service request submissions','Work order messaging','Email communication','Direct text messaging','Telephone calls'].map(i => <Li key={i}>{i}</Li>)}
            </ul>
            <P>Work orders follow a structured process designed to ensure that both the customer and Cutting Corners Gems clearly understand the services being requested before work begins.</P>
          </Section>

          <Section title="Legacy Customer & Annual Pricing Policy">
            <P>Customers who complete fifty (50) fully completed and paid work orders may become eligible for Legacy Customer Pricing (grandfathered pricing). Once this milestone is reached, the base service price in effect at that time will remain associated with the qualifying account.</P>
            <P>Legacy Customer Pricing applies only to the standard base service fee and does not apply to additional services, special materials, complex cutting projects, repairs, or other non-standard conditions. It is non-transferable.</P>
            <P>Base service prices will not be increased more than once within any twelve (12) month period. Customers with Legacy Pricing are not affected by future base price adjustments within the scope of their qualifying services.</P>
          </Section>

          <Section title="Gemstone Service Risk, Material Disclosure & Liability Agreement">
            <Num n="1" title="Nature of Natural Gemstones">
              <P>Gemstones are natural crystalline materials that may contain inclusions, fractures, cleavage planes, internal stress, crystal growth irregularities, mineral inclusions, and structural discontinuities. These characteristics may not be fully visible prior to cutting.</P>
            </Num>
            <Num n="2" title="Professional Standard of Care">
              <P>Cutting Corners Gems performs all services using professional lapidary practices, reasonable skill, and careful handling. The Customer acknowledges that professional care does not eliminate the inherent risks associated with cutting natural gemstones.</P>
            </Num>
            <Num n="3" title="Risk Disclosure and Customer Notification">
              <P>Where reasonably identifiable, Cutting Corners Gems will inform the Customer of risks associated with the specific gemstone material, structural condition, visible fractures, inclusions, or potential structural weaknesses before approving a work order.</P>
            </Num>
            <Num n="4" title="Documentation of Gemstone Condition">
              <P>Cutting Corners Gems documents gemstone condition before and after service whenever reasonably possible, including photographic records, written notes, and post-service documentation.</P>
            </Num>
            <Num n="5" title="Structural Failure and Inherent Material Risk">
              <P>Despite professional care, gemstone materials may contain internal conditions that cannot be detected prior to cutting. During lapidary processes, these conditions may result in cracking, chipping, cleaving, structural fracture, or breakage. The Customer acknowledges that these outcomes may occur even when services are performed professionally.</P>
            </Num>
            <Num n="6" title="Weight Reduction">
              <P>Gemstone cutting necessarily involves removal of material. Final gemstone weight is not guaranteed unless explicitly agreed upon in writing.</P>
            </Num>
            <Num n="7" title="Appearance and Optical Outcome">
              <P>Lapidary services are craft-based professional processes. While performed with professional skill, final visual appearance cannot be guaranteed to meet subjective expectations due to factors including internal inclusions, refractive properties, crystal orientation, and structural limitations.</P>
            </Num>
            <Num n="8" title="Pre-Existing Structural Conditions">
              <P>Cutting Corners Gems shall not be responsible for damage resulting from pre-existing internal structural conditions that were not reasonably detectable prior to cutting.</P>
            </Num>
            <Num n="9" title="Shipping and Custody">
              <P>Risk of loss or damage during inbound shipping remains with the Customer until the gemstone has been received by Cutting Corners Gems. Cutting Corners Gems shall not be responsible for delays, loss, or damage occurring while items are in transit through third-party shipping providers.</P>
            </Num>
            <Num n="10" title="Limitation of Liability">
              <P>To the maximum extent permitted by law, any liability related to services performed shall be limited to the service fee paid for the work order.</P>
            </Num>
            <Num n="11" title="Assumption of Risk">
              <P>By submitting a gemstone for service, the Customer acknowledges and accepts the inherent risks associated with gemstone cutting and lapidary processes.</P>
            </Num>
            <Num n="12" title="Governing Law">
              <P>This Agreement shall be governed by the laws of the State of Arizona. Any disputes shall occur within Maricopa County, Arizona, unless otherwise required by law.</P>
            </Num>
            <Num n="13" title="Acceptance">
              <P>Submission of a gemstone, acceptance of a work order, or shipment of a gemstone to Cutting Corners Gems constitutes acceptance of this Agreement.</P>
            </Num>
          </Section>

          {/* Contact */}
          <div style={{ marginTop: '64px', padding: '32px', border: '1px solid rgba(212,175,55,0.15)', background: 'rgba(212,175,55,0.04)' }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '16px' }}>Contact</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 2 }}>
              Cutting Corners Gems<br />
              850 S River Dr #2117, Tempe, Arizona 85281<br />
              Website Admin: Tracy Young — admin@cuttingcornersgems.com<br />
              Gemstone Cutter: Michael Wall — Mwall@cuttingcornersgems.com
            </p>
          </div>

          {/* Footer links */}
          <div style={{ marginTop: '48px', display: 'flex', gap: '24px', justifyContent: 'center' }}>
            <button onClick={() => router.push('/legal/privacy-policy')} style={{ background: 'none', border: 'none', color: 'rgba(212,175,55,0.6)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>Privacy Policy</button>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <button onClick={() => router.push('/legal/sms-terms')} style={{ background: 'none', border: 'none', color: 'rgba(212,175,55,0.6)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>SMS Disclosure</button>
          </div>

        </div>
      </div>
    </>
  );
}