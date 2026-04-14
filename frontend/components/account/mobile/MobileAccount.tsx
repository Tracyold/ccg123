import { useState } from 'react'

// ── Shared hooks ───────────────────────────────────────────────────────────
import { useAuth }           from '../shared/hooks/useAuth'
import { useAccountData }    from '../shared/hooks/useAccountInfo'
import { useProfile }        from '../shared/hooks/useProfile'
import { useChat }           from '../shared/hooks/useChat'
import { useWorkOrders }     from '../shared/hooks/useWorkOrders'
import { useServiceRequest } from '../shared/hooks/useServiceRequest'
import { useNavigation }     from '../shared/hooks/useNavigation'
import { useDeleteAccount }  from '../shared/hooks/useDeleteAccount'
import { usePanel }          from '../shared/hooks/usePanel'

// ── Mobile components ──────────────────────────────────────────────────────
import MobileNavBar          from './MobileNavBar'
import MobileMenuBarBottom   from './MobileMenuBarBottom'
import MobileHamburgerMenu   from './MobileHamburgerMenu'
import MobileDashboard       from './MobileDashboard'
import MobileChatPanel       from './MobileChatPanel'
import MobileWorkOrders      from './MobileWorkOrders'
import MobileInvoices        from './MobileInvoices'
import MobileWizardTab       from './MobileWizardTab'
import MobileResults         from './MobileResults'
import MobileServiceRequests from './MobileServiceRequests'
import MobileInquiries       from './MobileInquiries'
import MobileProfile         from './MobileProfile'
import MobileShopDrawer      from './MobileShopDrawer'
import MobileSMSModal        from './MobileSMSModal'

// ── Types ──────────────────────────────────────────────────────────────────

interface SelectedShopItem {
  idx:  number
  item: any
}

// ── Component ──────────────────────────────────────────────────────────────

export default function MobileAccount() {

  // ── Shared hooks ──
  const { session, signOut } = useAuth()

  const {
    profile, setProfile,
    smsPrefs, setSmsPrefs,
    invoices,
    invoiceTotal,
    workOrders, setWorkOrders,
    inquiries,
    serviceRequests, setServiceRequests,
    adminInfo,
    chatThread,
    messages, setMessages,
    latestWizardResult,
    loading,
  } = useAccountData(session)

  const profileHook        = useProfile(session, profile, setProfile, setSmsPrefs)
  const chatHook           = useChat(session, chatThread, setMessages)
  const workOrderHook      = useWorkOrders(session, setWorkOrders)
  const serviceRequestHook = useServiceRequest(session, setServiceRequests)
  const { activeTab, setActiveTab } = useNavigation()
  const deleteHook         = useDeleteAccount(session)

  const {
    activePanel,
    activeDrawer,
    openPanel,
    closePanel,
    openDrawer,
    closeDrawer,
    closeAll,
    isPanelOpen,
    isDrawerOpen,
  } = usePanel()

  // ── Mobile-only state ──
  const [shopItem, setShopItem] = useState<SelectedShopItem | null>(null)
  const [smsModalOpen, setSmsModalOpen] = useState(false)

  // ── Guards ──
  if (loading) return null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Top nav ── */}
      <MobileNavBar />

      {/* ── Main scroll feed ── */}
      <MobileDashboard
        profile={profile}
        workOrders={workOrders}
        messages={messages}
        chatThread={chatThread}
        invoices={invoices}
        invoiceTotal={invoiceTotal}
        smsPrefs={smsPrefs}
        serviceRequests={serviceRequests}
        latestWizardResult={latestWizardResult}
        onOpenPanel={openPanel}
        onOpenSms={() => setSmsModalOpen(true)}
        onOpenShopItem={(idx, item) => setShopItem({ idx, item })}
      />

      {/* ── Chat ── */}
      <MobileChatPanel
        isOpen={isPanelOpen('chat')}
        onClose={closePanel}
        messages={messages}
        chatInput={chatHook.chatInput}
        chatSending={chatHook.chatSending}
        chatUploading={chatHook.chatUploading}
        chatEndRef={chatHook.chatEndRef}
        chatFileRef={chatHook.chatFileRef}
        setChatInput={chatHook.setChatInput}
        sendChat={chatHook.sendChat}
        handleChatFile={chatHook.handleChatFile}
      />

      {/* ── Work Orders ── */}
      <MobileWorkOrders
        isOpen={isPanelOpen('workorders')}
        onClose={closePanel}
        workOrders={workOrders}
        adminInfo={adminInfo}
        profile={profile}
        selectedWO={workOrderHook.selectedWO}
        showAddressEdit={workOrderHook.showAddressEdit}
        tempAddress={workOrderHook.tempAddress}
        addressConfirmed={workOrderHook.addressConfirmed}
        setWorkOrders={setWorkOrders}
        onSelectWO={workOrderHook.openWODetail}
        onAcceptWO={workOrderHook.acceptWO}
        setSelectedWO={workOrderHook.setSelectedWO}
        setShowAddressEdit={workOrderHook.setShowAddressEdit}
        setTempAddress={workOrderHook.setTempAddress}
        setAddressConfirmed={workOrderHook.setAddressConfirmed}
      />

      {/* ── Invoices ── */}
      <MobileInvoices
        isOpen={isPanelOpen('invoices')}
        onClose={closePanel}
        invoices={invoices}
      />

      {/* ── Wizard ── */}
      <MobileWizardTab
        isOpen={isPanelOpen('wizard')}
        onClose={closePanel}
        session={session}
      />

      {/* ── Wizard Results ── */}
      <MobileResults
        isOpen={isPanelOpen('results')}
        onClose={closePanel}
        onServiceRequestCreated={() => openPanel('servicerequests')}
      />

      {/* ── Service Requests ── */}
      <MobileServiceRequests
        isOpen={isPanelOpen('servicerequests')}
        onClose={closePanel}
        serviceRequests={serviceRequests}
        showSRForm={serviceRequestHook.showSRForm}
        srType={serviceRequestHook.srType}
        srDesc={serviceRequestHook.srDesc}
        srSubmitting={serviceRequestHook.srSubmitting}
        srGateMsg={serviceRequestHook.srGateMsg}
        setSrType={serviceRequestHook.setSrType}
        setSrDesc={serviceRequestHook.setSrDesc}
        setShowSRForm={serviceRequestHook.setShowSRForm}
        onOpenSRForm={serviceRequestHook.openSRForm}
        onSubmitSR={serviceRequestHook.submitSR}
      />

      {/* ── Inquiries ── */}
      <MobileInquiries
        isOpen={isPanelOpen('inquiries')}
        onClose={closePanel}
        inquiries={inquiries}
      />

      {/* ── Profile ── */}
      <MobileProfile
        isOpen={isPanelOpen('profile')}
        onClose={closePanel}
        profile={profile}
        editProfile={profileHook.editProfile}
        profileSaving={profileHook.profileSaving}
        profileFlash={profileHook.profileFlash}
        hasProfileChanges={profileHook.hasProfileChanges}
        setEditProfile={profileHook.setEditProfile}
        onSave={profileHook.saveProfile}
        session={session}
        showDeleteModal={deleteHook.showDeleteModal}
        deleteConfirmText={deleteHook.deleteConfirmText}
        deleteError={deleteHook.deleteError}
        deleting={deleteHook.deleting}
        setShowDeleteModal={deleteHook.setShowDeleteModal}
        setDeleteConfirmText={deleteHook.setDeleteConfirmText}
        onDeleteAccount={deleteHook.deleteAccount}
        onSignOut={signOut}
      />

      {/* ── Shop Drawer ── */}
      <MobileShopDrawer
        isOpen={!!shopItem}
        onClose={() => setShopItem(null)}
        item={shopItem?.item ?? null}
      />

      {/* ── SMS Modal ── */}
      <MobileSMSModal
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
        smsPrefs={smsPrefs}
        hasOpenWorkOrder={workOrders.some(w => w.status === 'ACCEPTED' || w.status === 'CREATED')}
        toggleSms={profileHook.toggleSms}
      />

      {/* ── Bottom tab bar ── */}
      <MobileMenuBarBottom
        activePanel={activePanel}
        chatUnread={!!chatThread?.account_has_unread}
        onOpenPanel={openPanel}
        onOpenMenu={() => openPanel('menu')}
      />

      {/* ── Hamburger menu ── */}
      <MobileHamburgerMenu
        isOpen={isPanelOpen('menu')}
        onClose={closePanel}
        onNavigate={openPanel}
        activePanel={activePanel}
      />
    </>
  )
}