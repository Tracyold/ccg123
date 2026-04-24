// components/account/desktop/DesktopAccount.tsx
//
// This is the ROOT COMPONENT for the desktop account page.
// It is the only file imported by pages/account.tsx for desktop.
//
// What this file does:
//   1. Imports MobileShell.css (must be first -- all CSS classes live here)
//   2. Imports all panels, drawers, tiles, and UI components
//   3. Manages ALL panel/drawer open-close state (nothing else manages this)
//   4. Receives ALL data from pages/account.tsx as props (no Supabase calls here)
//   5. Renders the full desktop layout: nav, feed, tab bar, panels, drawers
//
// Mirrors MobileAccount.tsx exactly -- same layout, same UX, same props.
// Lives separately so desktop-specific tweaks never touch mobile code.


import { useState } from 'react';
import { WizardResult } from '@/components/account/mobile/tiles/3FeasibilityTile';

import { useAuth } from '../shared/hooks/useAuth';
import { useDeleteAccount } from '../shared/hooks/useDeleteAccount';

// ── UI components ──
import Nav3            from '../mobile/ui/3Nav';
import TabBar3         from '../mobile/ui/3TabBar';
import MenuDrawer3     from '../mobile/ui/3MenuDrawer';
import SmsConsent3     from '../mobile/ui/3SmsConsentModal';
import ShopFeed3       from '../mobile/ui/3ShopFeed';
import ShopItemDrawer3 from '../mobile/drawers/3ShopItemDrawer';

// ── Tiles ──
import MessagesTile3        from '../mobile/tiles/3MessagesTile';
import WorkOrderTile3       from '../mobile/tiles/3WorkOrderTile';
import InvoicesTile3        from '../mobile/tiles/3InvoicesTile';
import FeasibilityTile3     from '../mobile/tiles/3FeasibilityTile';
import InquiriesTile3       from '../mobile/tiles/3InquiriesTile';
import SmsTile3             from '../mobile/tiles/3SmsTile';
import ServiceRequestsTile3 from '../mobile/tiles/3ServiceRequestsTile';
import ProfileTile3         from '../mobile/tiles/3ProfileTile';
import FeedbackTile3        from '../mobile/tiles/3FeedbackTile';

// ── Panels ──
import ChatPanel3           from './panels/DesktopChatPanel';
import OrdersPanel3         from '../mobile/panels/3OrdersPanel';
import InvoicesPanel3       from '../mobile/panels/3InvoicesPanel';
import ServiceRequestPanel3 from '../mobile/panels/3ServiceRequestPanel';
import InquiriesPanel3      from '../mobile/panels/3InquiriesPanel';
import WizardResultsPanel3  from '../mobile/panels/3WizardResultsPanel';
import ProfilePanel3        from '../mobile/panels/3ProfilePanel';

// ── Drawers ──
import WorkOrderDrawer3      from '../mobile/drawers/3WorkOrderDrawer';
import InvoiceDrawer3        from '../mobile/drawers/3InvoiceDrawer';
import ServiceRequestDrawer3 from '../mobile/drawers/3ServiceRequestDrawer';


// ── Prop types ──
// These are ALL the values that pages/account.tsx passes down.
// Every piece of data the desktop UI needs comes through here.
export interface DesktopAccountProps {
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
  chatError?:           string | null;
  clearChatError?:      () => void;
  pendingUploads?:      any[];
  dismissPendingUpload?: (tempId: string) => void;
  chatEndRef:        React.RefObject<HTMLDivElement>;
  chatFileRef:       React.RefObject<HTMLInputElement>;
  // Wizard
  latestWizardResult?: WizardResult;
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
  // Fallback refreshers for realtime-less tables. Child components call
  // these after a successful write so the list updates even when the
  // Supabase realtime channel misses the event.
  refreshInquiries:       () => Promise<void>;
  refreshServiceRequests: () => Promise<void>;
  deleteAccount:     (confirmText: string) => Promise<{ error?: string }>;
}

// Panel names -- which slide-up panel is open
type PanelName =
  | 'chat' | 'orders' | 'invoices' | 'servicereq'
  | 'inquiries' | 'wizard' | 'profile' | null;

// Drawer names -- which right-slide drawer is open
type DrawerName = 'workorder' | 'invoice' | 'servicereq' | 'shopitem' | null;

export default function DesktopAccount(props: DesktopAccountProps) {

  // ── Shared hooks ──
  const { signOut }   = useAuth();
  const deleteHook    = useDeleteAccount(props.session);

  // ── All account data ──
  const inquiries       = props.inquiries;
  const serviceRequests = props.serviceRequests;
  const workOrders      = props.workOrders;
  const invoices        = props.invoices;
  const invoiceTotal    = props.invoiceTotal;
  const invoiceCount    = props.invoiceCount;

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

  // ── Service Request form state ──
  // These are kept in DesktopAccount ONLY so the wizard-results flow can
  // pre-fill the form before opening the sheet (handleWizardServiceRequest).
  // Submission, gate check, and submitting-boolean all live inside
  // ServiceRequestPanel3 itself.
  const [showSRForm, setShowSRForm] = useState(false);
  const [srType,     setSrType]     = useState('');
  const [srDesc,     setSrDesc]     = useState('');


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

  // ── Wizard → Service Request pre-fill ──
  // Wizard results panel calls this on "Create Service Request".
  // We populate the form state, then flip showSRForm=true to open the sheet.
  // The ServiceRequestPanel3 sees the pre-filled values and lets the user
  // edit them before submitting.
  const handleWizardServiceRequest = (result: any) => {
    setSrType(result.recommendation ?? '');
    const stone = [result.stone_variety, result.stone_species].filter(Boolean).join(' ');
    setSrDesc(
      'Stone: ' + stone +
      '\nWizard Score: ' + Math.round(result.feasibility_percent) + '%' +
      '\nRecommendation: ' + result.recommendation
    );
    setShowSRForm(true);
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
    workOrders.some(w => w.status === 'CREATED' || w.status === 'ACCEPTED'),
    invoices.some(inv => !inv.paid_at),
  ].filter(Boolean).length;

  // Whether the user has an active work order (needed by SMS consent modal)
  const hasOpenWorkOrder = workOrders.some(
    w => w.status === 'CREATED' || w.status === 'ACCEPTED'
  );

  // ── Wizard results for the feasibility tile ──
  // In production: fetch from Supabase. For now pass empty array
  // and the tile handles the empty state gracefully.
  const wizardResults = props.latestWizardResult ? [props.latestWizardResult] : [];

  return (
    <div className="mobile-shell desktop-shell">

      {/* ── SMS Consent Modal -- above everything ── */}
      {pendingSmsConsent && (
        <SmsConsent3
          toggle={pendingSmsConsent}
          hasOpenWorkOrder={hasOpenWorkOrder}
          onConfirm={handleSmsConfirm}
          onCancel={() => setPendingSmsConsent(null)}
        />
      )}

      {/* ══════════════════════════════════════════
          LEFT COLUMN — dashboard feed
      ══════════════════════════════════════════ */}
      <div className="mobile-shell desktop-left">

        {/* Sticky top nav */}
        <Nav3
          onMenuOpen={() => setMenuOpen(true)}
          onThemeToggle={toggleTheme}
        />

        {/* Scrollable feed */}
        <div className="feed">

          {/* Welcome block */}
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

          {/* Notification tiles */}
          <div className="feed-block">

            <MessagesTile3
              chatThread={props.chatThread}
              messages={props.messages}
              onClick={() => openPanel('chat')}
            />

            <div className="tile-row">
              <WorkOrderTile3
                workOrders={workOrders}
                onClick={() => openPanel('orders')}
              />
              <InvoicesTile3
                invoices={invoices}
                invoiceTotal={invoiceTotal}
                onClick={() => openPanel('invoices')}
              />
            </div>

            <FeasibilityTile3
              results={wizardResults}
              onClick={() => openPanel('wizard')}
            />

            <div className="tile-row">
              <InquiriesTile3
                inquiries={inquiries}
                onClick={() => openPanel('inquiries')}
              />
              <SmsTile3
                smsPrefs={props.smsPrefs}
                onClick={() => openPanel('profile')}
              />
            </div>

            <ServiceRequestsTile3
              serviceRequests={serviceRequests}
              onClick={() => openPanel('servicereq')}
            />

            <ProfileTile3
              profile={props.profile}
              onClick={() => openPanel('profile')}
            />

            <FeedbackTile3 session={props.session} />

          </div>{/* end feed-block */}

          {/* Shop feed */}
          <ShopFeed3
            session={props.session}
            onItemClick={(item) => openDrawer('shopitem', item)}
          />

        </div>{/* end feed */}

      </div>{/* end desktop-left */}

      {/* ══════════════════════════════════════════
          RIGHT COLUMN — panels + drawers
      ══════════════════════════════════════════ */}
      <div className="desktop-right">

        {/* Tab bar pins to bottom of right column */}
        <TabBar3
          onMenuOpen={() => setMenuOpen(true)}
          onChatOpen={() => openPanel('chat')}
          onInvoices={() => openPanel('invoices')}
          onThemeToggle={toggleTheme}
          hasUnread={!!props.chatThread?.account_has_unread}
        />

        {/* ── Panels slide up from bottom of right column ── */}

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
          chatError={props.chatError}
          clearChatError={props.clearChatError}
          pendingUploads={props.pendingUploads}
          dismissPendingUpload={props.dismissPendingUpload}
          handleChatFile={props.handleChatFile}
          onClose={closePanel}
          onOpen={props.openChatDrawer}
        />

        <OrdersPanel3
          open={activePanel === 'orders'}
          workOrders={workOrders}
          adminInfo={props.adminInfo}
          profile={props.profile}
          onSelectWO={(wo) => openDrawer('workorder', wo)}
          onAcceptWO={props.acceptWO}
          onClose={closePanel}
        />

        <InvoicesPanel3
          open={activePanel === 'invoices'}
          invoices={invoices}
          onSelectInvoice={(inv) => openDrawer('invoice', inv)}
          onClose={closePanel}
        />

        <ServiceRequestPanel3
          open={activePanel === 'servicereq'}
          serviceRequests={serviceRequests}
          session={props.session}
          profile={props.profile}
          onSelectSR={(sr) => openDrawer('servicereq', sr)}
          onClose={closePanel}
          refreshServiceRequests={props.refreshServiceRequests}
          showSRForm={showSRForm}
          setShowSRForm={setShowSRForm}
          srType={srType}
          setSrType={setSrType}
          srDesc={srDesc}
          setSrDesc={setSrDesc}
        />

        <InquiriesPanel3
          open={activePanel === 'inquiries'}
          inquiries={inquiries}
          onClose={closePanel}
          refreshInquiries={props.refreshInquiries}
        />

        <WizardResultsPanel3
          open={activePanel === 'wizard'}
          onClose={closePanel}
          onCreateServiceRequest={(result) => {
            handleWizardServiceRequest(result);
            openPanel('servicereq');
          }}
        />

        <ProfilePanel3
          open={activePanel === 'profile'}
          profile={props.profile}
          editProfile={props.editProfile}
          smsPrefs={props.smsPrefs}
          profileSaving={props.profileSaving}
          profileFlash={props.profileFlash}
          hasProfileChanges={props.hasProfileChanges}
          invoiceCount={invoiceCount}
          invoiceTotal={invoiceTotal}
          hasOpenWorkOrder={hasOpenWorkOrder}
          setEditProfile={props.setEditProfile}
          saveProfile={props.saveProfile}
          onSmsToggle={handleSmsClick}
          onClose={closePanel}
          showDeleteModal={deleteHook.showDeleteModal}
          setShowDeleteModal={deleteHook.setShowDeleteModal}
          deleteConfirmText={deleteHook.deleteConfirmText}
          setDeleteConfirmText={deleteHook.setDeleteConfirmText}
          deleteError={deleteHook.deleteError}
          deleting={deleteHook.deleting}
          onOpenDeleteModal={deleteHook.openDeleteModal}
          onDeleteAccount={deleteHook.deleteAccount}
        />

        {/* ── Drawers slide in from right over the panel ── */}
        {/* Rendered last so they sit on top of panels */}

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

        <ShopItemDrawer3
          open={activeDrawer === 'shopitem'}
          item={drawerData}
          session={props.session}
          onClose={closeDrawer}
          refreshInquiries={props.refreshInquiries}
        />

      </div>{/* end desktop-right */}

      {/* ── Menu drawer overlays both columns ── */}
      <MenuDrawer3
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(panel) => { setMenuOpen(false); openPanel(panel); }}
        onSignOut={signOut}
      />

    </div>
  );
}