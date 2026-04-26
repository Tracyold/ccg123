import { useRouter } from 'next/router';
import Link from 'next/link';

const footerCss = `
.ccg-footer {
  background: var(--bg-deep);
  border-top: 1px solid var(--border);
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.ccg-footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.ccg-footer-link {
  font-family: var(--font-body);
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 180ms ease;
}
.ccg-footer-link:hover {
  color: var(--text);
}
.ccg-footer-separator {
  color: var(--border);
  font-size: 0.75rem;
  user-select: none;
}
.ccg-footer-email {
  font-family: var(--font-body);
  font-size: 0.8125rem;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 180ms ease;
}
.ccg-footer-email:hover {
  color: var(--text);
}

@media (max-width: 767px) {
  .ccg-footer {
    padding: 48px 20px;
  }
  .ccg-footer-links {
    gap: 8px;
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
        <div className="ccg-footer-links">
          <Link href="/legal" className="ccg-footer-link">legal</Link>
          <span className="ccg-footer-separator">|</span>
          <Link href="/about" className="ccg-footer-link">about</Link>
          <span className="ccg-footer-separator">|</span>
          <Link href="/social" className="ccg-footer-link">social</Link>
          <span className="ccg-footer-separator">|</span>
          <Link href="/contact" className="ccg-footer-link">contact</Link>
        </div>
        <a href="mailto:admin@cuttingcornersgems.com" className="ccg-footer-email">
          admin@cuttingcornersgems.com
        </a>
      </footer>
    </>
  );
}
