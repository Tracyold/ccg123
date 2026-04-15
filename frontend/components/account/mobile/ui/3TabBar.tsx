// components/account/mobile/ui/3TabBar.tsx

interface TabBarProps {
  onMenuOpen:    () => void;
  onChatOpen:    () => void;
  onInvoices:    () => void;
  onThemeToggle: () => void;
  hasUnread:     boolean;
}

export default function TabBar3({
  onMenuOpen, onChatOpen, onInvoices, onThemeToggle, hasUnread,
}: TabBarProps) {
  return (
    <div className="tab-bar">
      <div className="tab" onClick={onMenuOpen}>
        <div className="tab-icon">☰</div>
        <div className="tab-lbl">Menu</div>
      </div>
      <div className="tab" onClick={onChatOpen} style={{ position: 'relative' }}>
        {hasUnread && <div className="tab-dot" />}
        <div className="tab-icon" style={hasUnread ? { color: 'var(--gold)', opacity: 1 } : undefined}>✉</div>
        <div className="tab-lbl" style={hasUnread ? { color: 'var(--gold)' } : undefined}>Chat</div>
      </div>
      <div className="tab" onClick={onInvoices}>
        <div className="tab-icon">◈</div>
        <div className="tab-lbl">Invoices</div>
      </div>
      <div className="tab" onClick={onThemeToggle}>
        <div className="tab-icon">◐</div>
        <div className="tab-lbl">Theme</div>
      </div>
    </div>
  );
}