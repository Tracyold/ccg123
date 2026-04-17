# Mobile Account Logic Wiring Plan

## Overview
Integrate shared hooks into `mobile/MobileAccount.tsx` while preserving the new UI design.

## Current State
- `mobile/MobileAccount.tsx` receives all data as props from `pages/account.tsx`
- Manages only UI state (panels, drawers, menu)
- Missing: Business logic for service requests, chat, sign-out, delete account

## Shared Hooks to Integrate

### 1. useAuth
**Source**: `shared/hooks/useAuth.ts`
**Current Status**: Not used in mobile
**What it does**: Manages session and provides `signOut()` function
**Where needed**: 
- `MenuDrawer3` - Sign-out button (currently placeholder)
**Changes**:
- Import `useAuth` in `MobileAccount.tsx`
- Extract `signOut` and pass to `MenuDrawer3`
- Update `MenuDrawer3` to accept `onSignOut` prop

### 2. useChat
**Source**: `shared/hooks/useChat.ts`
**Current Status**: Partially used (props passed but logic not wired)
**What it does**: 
- `sendChat()` - Send message with optimistic update
- `openChatDrawer()` - Mark thread as read when opening
- `handleChatFile()` - Upload file to Storage and send as attachment
**Where needed**: 
- `ChatPanel3` - Already receives these as props via `pages/account.tsx`
- BUT: `onOpen` callback not being called when panel opens
**Changes**:
- `ChatPanel3` already has `onOpen` prop - just needs to be called
- Currently passed from `pages/account.tsx` - verify it's being used

### 3. useServiceRequest
**Source**: `shared/hooks/useServiceRequest.ts`
**Current Status**: Not used in mobile
**What it does**:
- `openSRForm()` - Validates phone/SMS prefs before opening form
- `submitSR()` - Insert into DB, notify admin, refresh list
- `handleWizardServiceRequest()` - Prefill form from wizard result
**Where needed**:
- `ServiceRequestPanel3` - Form submission (currently mocked)
- `WizardResultsPanel3` - Create SR from result
**Changes**:
- Import `useServiceRequest` in `MobileAccount.tsx`
- Pass hook state/methods to `ServiceRequestPanel3`
- Pass `onCreateServiceRequest` callback to `WizardResultsPanel3`
- Update `ServiceRequestPanel3` to use real submit logic

### 4. useProfile
**Source**: `shared/hooks/useProfile.ts`
**Current Status**: Partially used (props passed from `pages/account.tsx`)
**What it does**:
- `saveProfile()` - Diff and update profile fields
- `toggleSms()` - Update SMS preferences
- `hasProfileChanges` - Computed boolean
**Where needed**: Already wired via `pages/account.tsx` props
**Changes**: None needed - already working

### 5. useDeleteAccount
**Source**: `shared/hooks/useDeleteAccount.ts`
**Current Status**: Not used in mobile
**What it does**:
- `openDeleteModal()` - Show confirmation modal
- `deleteAccount()` - Call RPC, sign out, redirect
**Where needed**: 
- `ProfilePanel3` - Delete button (currently decorative)
**Changes**:
- Import `useDeleteAccount` in `MobileAccount.tsx`
- Pass hook state/methods to `ProfilePanel3`
- Update `ProfilePanel3` delete button to open modal and call delete

## Implementation Steps

### Step 1: Update MobileAccount.tsx
```
1. Import shared hooks:
   - useAuth
   - useServiceRequest
   - useDeleteAccount

2. Call hooks in component:
   - const { signOut } = useAuth()
   - const srHook = useServiceRequest(props.session, props.setServiceRequests)
   - const deleteHook = useDeleteAccount(props.session)

3. Pass to child components:
   - MenuDrawer3: onSignOut={signOut}
   - ServiceRequestPanel3: srHook state/methods
   - WizardResultsPanel3: onCreateServiceRequest={srHook.handleWizardServiceRequest}
   - ProfilePanel3: deleteHook state/methods
```

### Step 2: Update MenuDrawer3
```
1. Add prop: onSignOut: () => Promise<void>
2. Update sign-out click handler to call onSignOut()
```

### Step 3: Update ServiceRequestPanel3
```
1. Add props from srHook:
   - showSRForm
   - srType, setSrType
   - srDesc, setSrDesc
   - srSubmitting
   - srGateMsg
   - openSRForm
   - submitSR

2. Replace mock submitForm with real submitSR
3. Add gate message display if srGateMsg is set
4. Replace hardcoded dropdowns with real data
```

### Step 4: Update WizardResultsPanel3
```
1. Add prop: onCreateServiceRequest callback
2. Pass to WizardResultDrawer
3. Wire button click to invoke callback
```

### Step 5: Update ProfilePanel3
```
1. Add props from deleteHook:
   - showDeleteModal
   - deleteConfirmText, setDeleteConfirmText
   - deleteError, deleting
   - openDeleteModal
   - deleteAccount

2. Add click handler to delete button
3. Add delete confirmation modal
4. Wire confirm button to deleteAccount()
```

## Notes
- Chat logic is already mostly wired via `pages/account.tsx`
- Profile save/SMS toggle already working
- Main gaps are: service request form, sign-out, delete account
- Preserve all existing UI/CSS - only change logic wiring
