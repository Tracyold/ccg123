import { useState } from 'react';
import { formatMoney } from '../../../lib/utils';

// ── Constants ──────────────────────────────────────────────────────────────

export const SMS_TOGGLES = [
  { label: 'Work Order Updates',     col: 'opt_in_work_orders',  description: 'Status updates while your stone is with us' },
  { label: 'Tracking Updates',       col: 'opt_in_tracking',     description: 'Shipping and delivery notifications' },
  { label: 'Chat Message Alerts',    col: 'opt_in_chat',         description: 'Alerts when you have a new message' },
  { label: 'Purchase Confirmations', col: 'opt_in_purchases',    description: 'Confirmations when a purchase completes' },
  { label: 'New Gem Listings',       col: 'opt_in_new_listings', description: 'Notify me when new gems are listed' },
] as const;

export type SmsToggle = typeof SMS_TOGGLES[number];

export const PROFILE_FIELDS = [
  { label: 'Name',             key: 'name',             placeholder: 'Full name' },
  { label: 'Email',            key: 'email',            placeholder: 'Email' },
  { label: 'Phone',            key: 'phone',            placeholder: 'Phone' },
  { label: 'Shipping Address', key: 'shipping_address', placeholder: 'Address' },
  { label: 'Business Name',    key: 'business_name',    placeholder: 'Add business name' },
] as const;

export const SMS_FOOTER_TEXT =
  'SMS alerts are sent to your phone number on file. Message & data rates may apply. Reply STOP to any message to opt out. For help reply HELP.';

// ── Types ──────────────────────────────────────────────────────────────────

export interface HomeViewProps {
  editProfile:       any;
  profile:           any;
  profileSaving:     boolean;
  profileFlash:      boolean;
  hasProfileChanges: boolean;
  invoiceCount:      number;
  invoiceTotal:      number;
  smsPrefs:          any;
  hasOpenWorkOrder?: boolean;
  setEditProfile:    (v: any) => void;
  saveProfile:       () => void;
  toggleSms:         (col: string, val: boolean) => void;
}

// ── Logic hook ─────────────────────────────────────────────────────────────

export interface UseHomeView {
  pendingToggle:    SmsToggle | null;
  setPendingToggle: (t: SmsToggle | null) => void;
  isSmsOn:          (col: string) => boolean;
  handleSmsClick:   (toggle: SmsToggle) => void;
  handleSmsConfirm: () => void;
  handleSmsCancel:  () => void;
  formattedTotal:   string;
}

export function useHomeView({
  smsPrefs,
  invoiceTotal,
  toggleSms,
}: Pick<HomeViewProps, 'smsPrefs' | 'invoiceTotal' | 'toggleSms'>): UseHomeView {
  const [pendingToggle, setPendingToggle] = useState<SmsToggle | null>(null);

  const isSmsOn = (col: string): boolean => !!smsPrefs?.[col];

  const handleSmsClick = (toggle: SmsToggle) => {
    if (isSmsOn(toggle.col)) {
      toggleSms(toggle.col, false);
    } else {
      setPendingToggle(toggle);
    }
  };

  const handleSmsConfirm = () => {
    if (!pendingToggle) return;
    toggleSms(pendingToggle.col, true);
    setPendingToggle(null);
  };

  const handleSmsCancel = () => setPendingToggle(null);

  const formattedTotal = formatMoney(invoiceTotal);

  return {
    pendingToggle,
    setPendingToggle,
    isSmsOn,
    handleSmsClick,
    handleSmsConfirm,
    handleSmsCancel,
    formattedTotal,
  };
}
