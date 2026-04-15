// components/account/mobile/ui/3Nav.tsx

interface NavProps {
  onMenuOpen:    () => void;
  onThemeToggle: () => void;
}

export default function Nav3({ onMenuOpen, onThemeToggle }: NavProps) {
  return (
    <nav className="nav">
      <div className="nav-logo">CCG <em>·</em> Account</div>
      <div className="nav-right">
        <button className="icon-btn" onClick={onThemeToggle} aria-label="Toggle theme">◐</button>
        <button className="icon-btn lg" onClick={onMenuOpen} aria-label="Open menu">☰</button>
      </div>
    </nav>
  );
}