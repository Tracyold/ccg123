// pages/account.tsx
// ─────────────────────────────────────────────────────────────────────────────
// All data fetching and business logic lives in hooks.
// This file just wires them together and renders desktop or mobile UI.
// ─────────────────────────────────────────────────────────────────────────────

import MobileAccount from '../components/account/mobile/MobileAccount';
import Link from 'next/link';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useState } from 'react';

// ── Shared hooks ──
import { useAuth }          from '../components/account/shared/hooks/useAuth';
import { useIsMobile }      from '../components/account/shared/hooks/useIsMobile';
import { useAccountData }   from '../components/account/shared/hooks/useAccountInfo';
import { useProfile }       from '../components/account/shared/hooks/useProfile';
import { useChat }          from '../components/account/shared/hooks/useChat';
import { useWorkOrders }    from '../components/account/shared/hooks/useWorkOrders';
import { useServiceRequest } from '../components/account/shared/hooks/useServiceRequest';
import { useDeleteAccount } from '../components/account/shared/hooks/useDeleteAccount';

// ── Desktop components ──
import { supabase }            from '../lib/supabase';
import InvoiceList             from '../components/account/InvoiceList';
import WorkOrderList           from '../components/account/WorkOrderList';
import InquiryList             from '../components/account/InquiryList';
import HomeTab                 from '../components/account/HomeTab';
import WizardResultsTab        from '../components/account/WizardResultsTab';
import WorkOrderDetailModal    from '../components/account/WorkOrderDetailModal';
import ChatPanel               from '../components/account/ChatPanel';
import TopNav                  from '../components/shared/TopNav';

export default function AccountPage() {
  // ── Auth ──
  const { session, signOut, loading: authLoading } = useAuth();
  const { isMobile }         = useIsMobile();

  // ── EARLY AUTH GUARD (must be here) ──
if (authLoading) {
  return <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }} />;
}

if (!session) {
  // let useAuth/router handle redirect
  return null;
  
}


  // ── All data + realtime ──
  const data = useAccountData(session);
  
  if (data.loading) {
  return <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }} />;
}

  // ── Business logic hooks ──
  const profileHook = useProfile(session, data.profile, data.setProfile, data.setSmsPrefs);
  const chatHook    = useChat(session, data.chatThread, data.setMessages);
  const woHook      = useWorkOrders(session, data.setWorkOrders);
  const srHook      = useServiceRequest(session, data.setServiceRequests);
  const deleteHook  = useDeleteAccount(session);

  // ── Desktop-only state ──
  const [activeTab,    setActiveTab]    = useState('home');
  const [inquiryTab,   setInquiryTab]   = useState<'inquiries' | 'service'>('inquiries');

  // ── Loading guard ──
  if (!session || data.loading) {
    return <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }} />;
  }

  // ── Mobile ──
  if (isMobile) {
    return (
      <>
        <TopNav />
        <MobileAccount
          // Auth
          session={session}
          // Profile
          profile={data.profile}
          editProfile={profileHook.editProfile}
          smsPrefs={data.smsPrefs}
          adminInfo={data.adminInfo}
          profileSaving={profileHook.profileSaving}
          profileFlash={profileHook.profileFlash}
          hasProfileChanges={profileHook.hasProfileChanges}
          // Counts + lists
          invoiceCount={data.invoiceCount}
          invoiceTotal={data.invoiceTotal}
          workOrders={data.workOrders}
          invoices={data.invoices}
          inquiries={data.inquiries}
          serviceRequests={data.serviceRequests}
          // Chat
          chatThread={data.chatThread}
          messages={data.messages}
          chatInput={chatHook.chatInput}
          chatSending={chatHook.chatSending}
          chatUploading={chatHook.chatUploading}
          chatEndRef={chatHook.chatEndRef}
          chatFileRef={chatHook.chatFileRef}
          // Wizard
          latestWizardResult={data.latestWizardResult}
          // Setters
          setEditProfile={profileHook.setEditProfile}
          setChatInput={chatHook.setChatInput}
          // Actions
          saveProfile={profileHook.saveProfile}
          toggleSms={profileHook.toggleSms}
          acceptWO={woHook.acceptWO}
          sendChat={chatHook.sendChat}
          openChatDrawer={chatHook.openChatDrawer}
          chatError={chatHook.chatError}
          clearChatError={chatHook.clearChatError}
          pendingUploads={chatHook.pendingUploads}
          dismissPendingUpload={chatHook.dismissPendingUpload}
          handleChatFile={chatHook.handleChatFile}
          refreshInquiries={data.refreshInquiries}
          refreshServiceRequests={data.refreshServiceRequests}
          deleteAccount={async (confirmText: string) => {
            deleteHook.setDeleteConfirmText(confirmText);
            await deleteHook.deleteAccount();
            return {};
          }}
        />
      </>
    );
  }

  // ── Desktop ──
  const NAV = [
    { id: 'home',       label: 'Home'           },
    { id: 'workorders', label: 'Work Orders'    },
    { id: 'inquiries',  label: 'Inquiries'      },
    { id: 'wizard',     label: 'Wizard Results' },
    { id: 'invoices',   label: 'Invoices'       },
  ];

  const navContent = (
    <>
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '20px' }}>
        {NAV.map(n => (
          <button
            key={n.id}
            className={`acc-nav-item ${activeTab === n.id ? 'on' : ''}`}
            onClick={() => setActiveTab(n.id)}
          >
            {n.label}
          </button>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', paddingBottom: '12px', flexShrink: 0 }}>
        <Link href="/shop"      className="acc-nav-item" style={{ textDecoration: 'none' }}>Browse Shop</Link>
        <Link href="/portfolio" className="acc-nav-item" style={{ textDecoration: 'none' }}>See Portfolio</Link>
        <button className="acc-nav-item" style={{ color: 'var(--er, #b54040)' }} onClick={signOut}>
          Sign Out
        </button>
        <button
          className="acc-nav-item"
          style={{ color: 'var(--text-muted)', fontSize: '13px' }}
          onClick={deleteHook.openDeleteModal}
        >
          Delete Account
        </button>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', opacity: 0.5, lineHeight: 1.6 }}>
            © 2025 Cutting Corners Gems
          </p>
        </div>
      </div>
    </>
  );

  const tabContent = (
    <div className="acc-content">
      {activeTab === 'home' && (
        <HomeTab
          hasOpenWorkOrder={data.workOrders.some(w => w.status === 'ACCEPTED' || w.status === 'Created')}
          editProfile={profileHook.editProfile}
          profile={data.profile}
          profileSaving={profileHook.profileSaving}
          profileFlash={profileHook.profileFlash}
          hasProfileChanges={profileHook.hasProfileChanges}
          invoiceCount={data.invoiceCount}
          invoiceTotal={data.invoiceTotal}
          smsPrefs={data.smsPrefs}
          setEditProfile={profileHook.setEditProfile}
          saveProfile={profileHook.saveProfile}
          toggleSms={profileHook.toggleSms}
        />
      )}
      {activeTab === 'workorders' && (
        <WorkOrderList
          workOrders={data.workOrders}
          onSelect={woHook.openWODetail}
          onAccept={woHook.acceptWO}
        />
      )}
      {activeTab === 'inquiries' && (
        <InquiryList
          inquiries={data.inquiries}
          serviceRequests={data.serviceRequests}
          inquiryTab={inquiryTab}
          setInquiryTab={setInquiryTab}
          showSRForm={srHook.showSRForm}
          srType={srHook.srType}
          srDesc={srHook.srDesc}
          srSubmitting={srHook.srSubmitting}
          srGateMsg={srHook.srGateMsg}
          setSrType={srHook.setSrType}
          setSrDesc={srHook.setSrDesc}
          setShowSRForm={srHook.setShowSRForm}
          onOpenSRForm={srHook.openSRForm}
          onSubmitSR={srHook.submitSR}
        />
      )}
      {activeTab === 'invoices' && (
        <InvoiceList invoices={data.invoices} />
      )}
      {activeTab === 'wizard' && (
        <WizardResultsTab
          onCreateServiceRequest={(result) =>
            srHook.handleWizardServiceRequest(result, setActiveTab, setInquiryTab)
          }
        />
      )}
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: accountCss }} />
      <TopNav />

      <div className="acc-shell">
        <ResizablePanelGroup style={{ flex: 1, height: '100%' }}>
          <ResizablePanel defaultSize={65} minSize={40}>
            <div className="acc-left">
              <div className="acc-nav">{navContent}</div>
              {tabContent}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={35} minSize={20}>
            <ChatPanel
              messages={data.messages}
              chatInput={chatHook.chatInput}
              chatSending={chatHook.chatSending}
              chatUploading={chatHook.chatUploading}
              chatOpen={chatHook.chatOpen}
              chatEndRef={chatHook.chatEndRef}
              chatFileRef={chatHook.chatFileRef}
              setChatInput={chatHook.setChatInput}
              setChatOpen={chatHook.setChatOpen}
              openChatDrawer={chatHook.openChatDrawer}
              sendChat={chatHook.sendChat}
              handleChatFile={chatHook.handleChatFile}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <WorkOrderDetailModal
        selectedWO={woHook.selectedWO}
        adminInfo={data.adminInfo}
        profile={data.profile}
        showAddressEdit={woHook.showAddressEdit}
        tempAddress={woHook.tempAddress}
        addressConfirmed={woHook.addressConfirmed}
        setSelectedWO={woHook.setSelectedWO}
        setShowAddressEdit={woHook.setShowAddressEdit}
        setTempAddress={woHook.setTempAddress}
        setAddressConfirmed={woHook.setAddressConfirmed}
        setWorkOrders={data.setWorkOrders}
        acceptWO={woHook.acceptWO}
      />

      {deleteHook.showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-deep)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--bg-button)', padding: '40px', maxWidth: '440px', width: '100%' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(180,60,60,0.8)', marginBottom: '16px' }}>Permanent Action</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '25px', color: 'var(--text)', marginBottom: '16px', lineHeight: 1.2 }}>Delete Account</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '28px' }}>
              This will permanently delete your account. Any open work orders or invoices will remain on file. This cannot be undone.
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Type DELETE to confirm</p>
            <input
              type="text"
              value={deleteHook.deleteConfirmText}
              onChange={e => deleteHook.setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid rgba(180,60,60,0.3)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '13px', padding: '12px 14px', marginBottom: '12px', boxSizing: 'border-box', outline: 'none' }}
            />
            {deleteHook.deleteError && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'rgba(220,80,80,0.9)', marginBottom: '12px' }}>
                {deleteHook.deleteError}
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={deleteHook.deleteAccount}
                disabled={deleteHook.deleting}
                style={{ flex: 1, background: 'rgba(180,60,60,0.8)', border: 'none', color: 'var(--text)', fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '13px', cursor: deleteHook.deleting ? 'not-allowed' : 'pointer', opacity: deleteHook.deleting ? 0.5 : 1 }}
              >
                {deleteHook.deleting ? 'Deleting...' : 'Delete My Account'}
              </button>
              <button
                onClick={() => deleteHook.setShowDeleteModal(false)}
                style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const accountCss = `
.acc-shell {
  display: flex;
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  overflow: hidden;
}
.acc-left {
  display: flex;
  flex: 1;
  height: 100%;
  min-height: 0;
  min-width: 0;
}
.acc-nav {
  width: 180px;
  flex-shrink: 0;
  background: var(--bg);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.acc-nav-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 20px;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  background: none;
  border: none;
  border-left: 2px solid transparent;
  cursor: pointer;
  transition: color 0.15s;
}
.acc-nav-item.on { color: var(--bg-button); border-left-color: var(--border); }
.acc-nav-item:hover:not(.on) { color: var(--text); }
.acc-content { flex: 1; overflow-y: auto; min-height: 0; min-width: 0; max-height: 100%; }
.acc-right { width: 100%; height: 100%; border-left: 1px solid var(--border); display: flex; flex-direction: column; background: var(--bg-deep); overflow: hidden; }
.acc-label { font-family: var(--font-ui); font-size: 9px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 5px; }
.acc-input { width: 100%; background: var(--border); border: 1px solid var(--border); padding: 10px 12px; color: var(--text); font-family: var(--font-body); font-size: 13px; outline: none; }
.acc-input:focus { border-color: var(--gold); }
.acc-btn-gold { background: var(--gold); color: var(--bg); border: none; padding: 12px 20px; font-family: var(--font-ui); font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; width: 100%; }
.acc-btn-gold:disabled { opacity: 0.4; cursor: not-allowed; }
.acc-btn-ghost { background: var(--bg); border: 1px solid var(--border); color: var(--accent); padding: 10px 16px; font-family: var(--font-ui); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; }
.acc-tab { padding: 10px 0; font-family: var(--font-ui); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.45); background: none; border: none; border-bottom: 1px solid transparent; cursor: pointer; }
.acc-tab.on { color: var(--text); border-bottom-color: var(--bg-deep); }
.acc-empty { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.2em; }
.pill-toggle { border-radius: 860px !important; }
`;
