import { useRouter } from 'next/router';

const footerCss = `
.ccg-footer {
  background: var(--bg-deep);
  border-top: 1px solid rgba(255,255,255,0.08);
  padding: 40px 48px;
}
.ccg-footer-tagline {
  font-family: var(--font-body);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--text);
  margin-bottom: 28px;
}
.ccg-footer-content {
  display: flex;
  justify-content: space-between;
  gap: 32px;
}
.ccg-footer-links {
  display: flex;
  flex-direction: column;
}
.ccg-footer-link {
  font-family: var(--font-body);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  text-decoration: none;
  line-height: 2.0;
  transition: color 180ms ease, font-size 150ms ease;
}
.ccg-footer-link:hover {
  color: rgba(var(--text-rgb, 238,238,238),0.85);
  font-size: 12.5px;
}
.ccg-footer-contact {
  display: flex;
  flex-direction: column;
}
.ccg-footer-contact-name {
  font-family: var(--font-body);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  line-height: 2.0;
}
.ccg-footer-contact-link {
  font-family: var(--font-body);
  font-size: 15px;
  letter-spacing: 0.04em;
  color: var(--text);
  text-decoration: none;
  line-height: 2.0;
  transition: color 180ms ease, font-size 150ms ease;
}
.ccg-footer-contact-link:hover {
  color: rgba(var(--text-rgb, 238,238,238),0.85);
  font-size: 12.5px;
}
.ccg-footer-welcome {
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
  line-height: 2.0;
}

@media (max-width: 767px) {
  .ccg-footer {
    padding: 32px 24px;
  }
  .ccg-footer-tagline {
    margin-bottom: 24px;
  }
}
`;

export default function Footer() {
  const router = useRouter();
  const path = router.pathname;

  // Don't show footer on admin or account routes
  if (path.startsWith('/admin') || path.startsWith('/account')) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: footerCss }} />
      <footer className="ccg-footer">
        <div className="ccg-footer-tagline">
          COLOR CONSCIOUS CAREFUL CUTTING
        </div>
        <div className="ccg-footer-content">
          <div className="ccg-footer-links">
            <a href="/legal" className="ccg-footer-link">legal</a>
            <a href="/company-model" className="ccg-footer-link">Our Story</a>
            <a href="/legal/privacy-policy" className="ccg-footer-link">privacy policy</a>
            <a href="/shop" className="ccg-footer-link">shop</a>
            <a href="/portfolio" className="ccg-footer-link">portfolio</a>
            <a href="/login" className="ccg-footer-link">sign in / sign up</a>
          </div>
          <div className="ccg-footer-contact">
            <span className="ccg-footer-contact-name">Michael Wall</span>
            <a href="tel:4802864595" className="ccg-footer-contact-link">480.286.4595</a>
            <a href="mailto:mwall@cuttingcornersgems.com" className="ccg-footer-contact-link">mwall@cuttingcornersgems.com</a>
            <span className="ccg-footer-welcome">texts and emails welcome</span>
          </div>
        </div>
      </footer>
    </>
  );
}
