// pages/account.tsx
// ─────────────────────────────────────────────────────────────────────────────
// All data fetching and business logic lives in hooks.
// This file just wires them together and routes to mobile or desktop UI.
// ─────────────────────────────────────────────────────────────────────────────

import MobileAccount  from '../components/account/mobile/MobileAccount';
import DesktopAccount from '../components/account/desktop/DesktopAccount';
import TopNav         from '../components/shared/TopNav';

// ── Shared hooks ──
import { useAuth }           from '../components/account/shared/hooks/useAuth';
import { useIsMobile }       from '../components/account/shared/hooks/useIsMobile';
import { useAccountData }    from '../components/account/shared/hooks/useAccountInfo';
import { useProfile }        from '../components/account/shared/hooks/useProfile';
import { useChat }           from '../components/account/shared/hooks/useChat';
import { useWorkOrders }     from '../components/account/shared/hooks/useWorkOrders';
import { useServiceRequest } from '../components/account/shared/hooks/useServiceRequest';
import { useDeleteAccount }  from '../components/account/shared/hooks/useDeleteAccount';

export default function AccountPage() {
  // ── Auth ──
  const { session, signOut } = useAuth();
  const { isMobile }         = useIsMobile();
  const isDesktop            = !isMobile;

  // ── All data + realtime ──
  const data = useAccountData(session);

  // ── Business logic hooks ──
  const profileHook = useProfile(session, data.profile, data.setProfile, data.setSmsPrefs);
  const chatHook    = useChat(session, data.chatThread, data.setMessages);
  const woHook      = useWorkOrders(session, data.setWorkOrders);
  const srHook      = useServiceRequest(session, data.setServiceRequests);
  const deleteHook  = useDeleteAccount(session);

  // ── Loading guard ──
  if (!session || data.loading) {
    return <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }} />;
  }

  // ── Shared props -- passed to both mobile and desktop ──
  const sharedProps = {
    // Auth
    session,
    // Profile
    profile:           data.profile,
    editProfile:       profileHook.editProfile,
    smsPrefs:          data.smsPrefs,
    adminInfo:         data.adminInfo,
    profileSaving:     profileHook.profileSaving,
    profileFlash:      profileHook.profileFlash,
    hasProfileChanges: profileHook.hasProfileChanges,
    // Counts + lists
    invoiceCount:      data.invoiceCount,
    invoiceTotal:      data.invoiceTotal,
    workOrders:        data.workOrders,
    invoices:          data.invoices,
    inquiries:         data.inquiries,
    serviceRequests:   data.serviceRequests,
    // Chat
    chatThread:        data.chatThread,
    messages:          data.messages,
    chatInput:         chatHook.chatInput,
    chatSending:       chatHook.chatSending,
    chatUploading:     chatHook.chatUploading,
    chatError:         chatHook.chatError,
    clearChatError:    chatHook.clearChatError,
    pendingUploads:    chatHook.pendingUploads,
    dismissPendingUpload: chatHook.dismissPendingUpload,
    chatEndRef:        chatHook.chatEndRef,
    chatFileRef:       chatHook.chatFileRef,
    // Wizard
    latestWizardResult: data.latestWizardResult,
    // Setters
    setEditProfile:    profileHook.setEditProfile,
    setChatInput:      chatHook.setChatInput,
    // Actions
    saveProfile:       profileHook.saveProfile,
    toggleSms:         profileHook.toggleSms,
    acceptWO:          woHook.acceptWO,
    sendChat:          chatHook.sendChat,
    openChatDrawer:    chatHook.openChatDrawer,
    handleChatFile:    chatHook.handleChatFile,
    refreshInquiries:       data.refreshInquiries,
    refreshServiceRequests: data.refreshServiceRequests,
    deleteAccount: async (confirmText: string) => {
      deleteHook.setDeleteConfirmText(confirmText);
      await deleteHook.deleteAccount();
      return {};
    },
  };

  // ── Mobile ──
  if (isMobile) {
    return (
      <>
        <TopNav />
        <MobileAccount {...sharedProps} />
      </>
    );
  }

  // ── Desktop ──
  if (isDesktop) {
    return (
      <>
        <TopNav />
        <DesktopAccount {...sharedProps} />
      </>
    );
  }
}