// components/account/mobile/MobileAccount.tsx
//
// This is the ROOT COMPONENT for the mobile account page.
// It is the only file imported by pages/account.tsx for mobile.
//
// What this file does:
//   1. Imports MobileShell.css (must be first -- all CSS classes live here)
//   2. Imports all panels, drawers, tiles, and UI components
//   3. Manages ALL panel/drawer open-close state (nothing else manages this)
//   4. Receives ALL data from pages/account.tsx as props (no Supabase calls here)
//   5. Renders the full mobile layout: nav, feed, tab bar, panels, drawers
//
// The welcome block at the top of the feed and the data wiring
// are all done here. Tiles, panels, and drawers just receive what they need.

import './MobileShell.css';
import { useState } from 'react';

// ── UI components ──
import Nav3           from './ui/3Nav';
import TabBar3        from './ui/3TabBar';
import MenuDrawer3    from './ui/3MenuDrawer';
import SmsConsent3    from './ui/3SmsConsentModal';
import ShopFeed3      from './ui/3ShopFeed';

// ── Tiles ──
import MessagesTile3        from './tiles/3MessagesTile';
import WorkOrderTile3       from './tiles/3WorkOrderTile';
import InvoicesTile3        from './tiles/3InvoicesTile';
import FeasibilityTile3     from './tiles/3FeasibilityTile';
import InquiriesTile3       from './tiles/3InquiriesTile';
import SmsTile3             from './tiles/3SmsTile';
import ServiceRequestsTile3 from './tiles/3ServiceRequestsTile';
import ProfileTile3         from './tiles/3ProfileTile';
import FeedbackTile3        from './tiles/3FeedbackTile';

// ── Panels ──
import ChatPanel3           from './panels/3ChatPanel';
import OrdersPanel3         from './panels/3OrdersPanel';
import InvoicesPanel3       from './panels/3InvoicesPanel';
import ServiceRequestPanel3 from './panels/3ServiceRequestPanel';
import InquiriesPanel3      from './panels/3InquiriesPanel';
import WizardResultsPanel3  from './panels/3WizardResultsPanel';
import ProfilePanel3        from './panels/3ProfilePanel';

// ── Drawers ──
import WorkOrderDrawer3      from './drawers/3WorkOrderDrawer';
import InvoiceDrawer3        from './drawers/3InvoiceDrawer';
import ServiceRequestDrawer3 from './drawers/3ServiceRequestDrawer';

// ── Prop types ──
// These are ALL the values that pages/account.tsx passes down.
// Every piece of data the mobile UI needs comes through here.
export interface MobileAccountProps {
  // Auth
  session:           any;
  // Profile
  profile:           any;
  editProfile:       any;
  smsPrefs:          any;
  adminInfo:         any;
  profileSaving:     boolean;
  profileFlash:      boolean;
  hasProfileChanges: boolean;
  // Counts + lists
  invoiceCount:      number;
  invoiceTotal:      number;
  workOrders:        any[];
  invoices:          any[];
  inquiries:         any[];
  serviceRequests:   any[];
  // Chat
  chatThread:        any;
  messages:          any[];
  chatInput:         string;
  chatSending:       boolean;
  chatUploading:     boolean;
  chatEndRef:        React.RefObject<HTMLDivElement>;
  chatFileRef:       React.RefObject<HTMLInputElement>;
  // Wizard
  latestWizardResult?: any;
  // Setters
  setEditProfile:    (v: any) => void;
  setChatInput:      (v: string) => void;
  // Actions
  saveProfile:       () => void;
  toggleSms:         (col: string, val: boolean) => void;
  acceptWO:          (wo: any) => void;
  sendChat:          () => void;
  openChatDrawer:    () => void;
  handleChatFile:    (e: React.ChangeEvent<HTMLInputElement>) => void;
  submitSR:          () => void;
  openSRForm:        () => Promise<void>;
  deleteAccount:     (confirmText: string) => Promise<{ error?: string }>;
}

// Panel names -- which slide-up panel is open
type PanelName =
  | 'chat' | 'orders' | 'invoices' | 'servicereq'
  | 'inquiries' | 'wizard' | 'profile' | null;

// Drawer names -- which right-slide drawer is open
type DrawerName = 'workorder' | 'invoice' | 'servicereq' | null;

export default function MobileAccount(props: MobileAccountProps) {

  // ── Panel state ──
  // Only one panel can be open at a time.
  // Panels slide up from the bottom.
  const [activePanel,  setActivePanel]  = useState<PanelName>(null);

  // ── Drawer state ──
  // Only one drawer can be open at a time.
  // Drawers slide in from the right.
  // drawerData holds the specific item (WO, invoice, SR) that was tapped.
  const [activeDrawer, setActiveDrawer] = useState<DrawerName>(null);
  const [drawerData,   setDrawerData]   = useState<any>(null);

  // ── Menu state ──
  const [menuOpen, setMenuOpen] = useState(false);

  // ── SMS consent state ──
  // When the user taps a SMS toggle to enable it, we show a consent modal first.
  // pendingSmsConsent holds which toggle is waiting for confirmation.
  const [pendingSmsConsent, setPendingSmsConsent] = useState<any>(null);

  // ── Panel helpers ──
  const openPanel  = (name: PanelName) => setActivePanel(name);
  const closePanel = ()                 => setActivePanel(null);

  // ── Drawer helpers ──
  const openDrawer  = (name: DrawerName, data?: any) => {
    setDrawerData(data ?? null);
    setActiveDrawer(name);
  };
  const closeDrawer = () => {
    setActiveDrawer(null);
    setDrawerData(null);
  };

  // ── SMS toggle handler ──
  // Turning OFF: call toggleSms directly (no consent needed)
  // Turning ON: show consent modal first, then call toggleSms on confirm
  const handleSmsClick = (toggle: any) => {
    const isOn = !!props.smsPrefs?.[toggle.col];
    if (isOn) {
      props.toggleSms(toggle.col, false);
    } else {
      setPendingSmsConsent(toggle);
    }
  };
  const handleSmsConfirm = () => {
    if (!pendingSmsConsent) return;
    props.toggleSms(pendingSmsConsent.col, true);
    setPendingSmsConsent(null);
  };

  // ── Theme toggle ──
  // Switches data-theme attribute on <html> between dark and light.
  // MobileShell.css has :root[data-theme="dark"] and :root[data-theme="light"] rules.
  const toggleTheme = () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
  };

  // ── Derived values used in the welcome block ──
  const hour       = new Date().getHours();
  const greeting   = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName  = props.profile?.name?.split(' ')[0] || 'there';
  const dateLabel  = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  // Count how many notification categories have something new
  const updateCount = [
    !!props.chatThread?.account_has_unread,
    props.workOrders.some(w => w.status === 'CREATED' || w.status === 'ACCEPTED'),
    props.invoices.some(inv => !inv.paid_at),
  ].filter(Boolean).length;

  // Whether the user has an active work order (needed by SMS consent modal)
  const hasOpenWorkOrder = props.workOrders.some(
    w => w.status === 'CREATED' || w.status === 'ACCEPTED'
  );

  // ── Wizard results for the feasibility tile ──
  // In production: fetch from Supabase. For now pass empty array
  // and the tile handles the empty state gracefully.
  const wizardResults = props.latestWizardResult ? [props.latestWizardResult] : [];

  return (
    // mobile-shell: the root container -- max-width 430px, centered, dark/light themed
    <div className="mobile-shell">

      {/* ── SMS Consent Modal ── */}
      {/* Appears above everything when user tries to enable an SMS toggle */}
      {pendingSmsConsent && (
        <SmsConsent3
          toggle={pendingSmsConsent}
          hasOpenWorkOrder={hasOpenWorkOrder}
          onConfirm={handleSmsConfirm}
          onCancel={() => setPendingSmsConsent(null)}
        />
      )}

      {/* ── Nav ── */}
      {/* Sticky top bar with CCG logo, theme toggle, hamburger */}
      <Nav3
        onMenuOpen={() => setMenuOpen(true)}
        onThemeToggle={toggleTheme}
      />

      {/* ── Feed ── */}
      {/* The main scrollable content area */}
      <div className="feed">

        {/* Welcome block -- greeting + date + update count */}
        {/* Converted from the .welcome div in the HTML */}
        <div className="welcome">
          <div className="welcome-name">{greeting}, {firstName}.</div>
          <div className="welcome-meta">
            {dateLabel}&nbsp;·&nbsp;
            {updateCount > 0 ? (
              <span>{updateCount} update{updateCount !== 1 ? 's' : ''}</span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>All caught up</span>
            )}
          </div>
          {/* Login timestamp -- set dynamically */}
          <div
            id="login-stamp"
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 8,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--text-muted)', marginTop: 6, opacity: 0.6,
            }}
          >
            {`Signed in ${new Date().toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
            })} · ${new Date().toLocaleTimeString('en-US', {
              hour: 'numeric', minute: '2-digit', hour12: true,
            })}`}
          </div>
        </div>

        {/* ── Notification tiles ── */}
        {/* feed-block groups tiles with 8px gap */}
        <div className="feed-block">

          {/* Messages tile -- full width, wide variant */}
          <MessagesTile3
            chatThread={props.chatThread}
            messages={props.messages}
            onClick={() => openPanel('chat')}
          />

          {/* Work Orders + Invoices -- two column row */}
          <div className="tile-row">
            <WorkOrderTile3
              workOrders={props.workOrders}
              onClick={() => openPanel('orders')}
            />
            <InvoicesTile3
              invoices={props.invoices}
              invoiceTotal={props.invoiceTotal}
              onClick={() => openPanel('invoices')}
            />
          </div>

          {/* Feasibility tile -- shows 3 most recent wizard results */}
          <FeasibilityTile3
            results={wizardResults}
            onClick={() => openPanel('wizard')}
          />

          {/* Inquiries + SMS -- two column row */}
          <div className="tile-row">
            <InquiriesTile3
              inquiries={props.inquiries}
              onClick={() => openPanel('inquiries')}
            />
            <SmsTile3
              smsPrefs={props.smsPrefs}
              onClick={() => openPanel('profile')}
            />
          </div>

          {/* Service Requests -- count tile, full width */}
          <ServiceRequestsTile3
            serviceRequests={props.serviceRequests}
            onClick={() => openPanel('servicereq')}
          />

          {/* Profile -- slim bar */}
          <ProfileTile3
            profile={props.profile}
            onClick={() => openPanel('profile')}
          />

          {/* Feedback tile -- star rating, self-contained */}
          <FeedbackTile3 />

        </div>{/* end feed-block */}

        {/* ── Shop feed ── */}
        {/* Divider + 2-column grid of shop items */}
        <ShopFeed3 />

      </div>{/* end feed */}

      {/* ── Tab bar ── */}
      {/* Fixed at bottom -- Menu · Chat · Invoices · Theme */}
      <TabBar3
        onMenuOpen={() => setMenuOpen(true)}
        onChatOpen={() => openPanel('chat')}
        onInvoices={() => openPanel('invoices')}
        onThemeToggle={toggleTheme}
        hasUnread={!!props.chatThread?.account_has_unread}
      />

      {/* ── Menu drawer ── */}
      {/* Bottom sheet with navigation links */}
      <MenuDrawer3
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(panel) => { setMenuOpen(false); openPanel(panel); }}
      />

      {/* ── Panels ── */}
      {/* Each panel slides up from the bottom. Only one is open at a time.
          The open prop controls whether className includes 'open'. */}

      <ChatPanel3
        open={activePanel === 'chat'}
        messages={props.messages}
        chatInput={props.chatInput}
        chatSending={props.chatSending}
        chatUploading={props.chatUploading}
        chatEndRef={props.chatEndRef}
        chatFileRef={props.chatFileRef}
        setChatInput={props.setChatInput}
        sendChat={props.sendChat}
        handleChatFile={props.handleChatFile}
        onClose={closePanel}
        onOpen={props.openChatDrawer}
      />

      <OrdersPanel3
        open={activePanel === 'orders'}
        workOrders={props.workOrders}
        adminInfo={props.adminInfo}
        profile={props.profile}
        onSelectWO={(wo) => openDrawer('workorder', wo)}
        onAcceptWO={props.acceptWO}
        onClose={closePanel}
      />

      <InvoicesPanel3
        open={activePanel === 'invoices'}
        invoices={props.invoices}
        onSelectInvoice={(inv) => openDrawer('invoice', inv)}
        onClose={closePanel}
      />

      <ServiceRequestPanel3
        open={activePanel === 'servicereq'}
        serviceRequests={props.serviceRequests}
        session={props.session}
        onSelectSR={(sr) => openDrawer('servicereq', sr)}
        onClose={closePanel}
      />

      <InquiriesPanel3
        open={activePanel === 'inquiries'}
        inquiries={props.inquiries}
        onClose={closePanel}
      />

      <WizardResultsPanel3
        open={activePanel === 'wizard'}
        onClose={closePanel}
      />

      <ProfilePanel3
        open={activePanel === 'profile'}
        profile={props.profile}
        editProfile={props.editProfile}
        smsPrefs={props.smsPrefs}
        profileSaving={props.profileSaving}
        profileFlash={props.profileFlash}
        hasProfileChanges={props.hasProfileChanges}
        invoiceCount={props.invoiceCount}
        invoiceTotal={props.invoiceTotal}
        hasOpenWorkOrder={hasOpenWorkOrder}
        setEditProfile={props.setEditProfile}
        saveProfile={props.saveProfile}
        onSmsToggle={handleSmsClick}
        onClose={closePanel}
      />

      {/* ── Drawers ── */}
      {/* Each drawer slides in from the right. Only one is open at a time.
          drawerData holds the selected item (wo, invoice, sr). */}

      <WorkOrderDrawer3
        open={activeDrawer === 'workorder'}
        wo={drawerData}
        adminInfo={props.adminInfo}
        profile={props.profile}
        onAccept={props.acceptWO}
        onClose={closeDrawer}
      />

      <InvoiceDrawer3
        open={activeDrawer === 'invoice'}
        invoice={drawerData}
        profile={props.profile}
        adminInfo={props.adminInfo}
        onClose={closeDrawer}
      />

      <ServiceRequestDrawer3
        open={activeDrawer === 'servicereq'}
        sr={drawerData}
        onClose={closeDrawer}
      />

    </div>
  );
}