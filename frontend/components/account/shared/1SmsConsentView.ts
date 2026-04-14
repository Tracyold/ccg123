import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConsentModalProps {
  toggle: { label: string; col: string };
  onConfirm: () => void;
  onCancel: () => void;
  hasOpenWorkOrder?: boolean;
}

export interface ConsentCopy {
  title: string;
  body: string;
  requirement?: string;
}

// ─── Copy Data ────────────────────────────────────────────────────────────────

export const CONSENT_COPY: Record<string, ConsentCopy> = {
  opt_in_work_orders: {
    title: 'Work Order SMS Alerts',
    body: 'By enabling this, you agree to receive SMS notifications from Cutting Corners Gems regarding your work order status, including acceptance, updates, and completion, changes and updates. Message & data rates may apply. Reply STOP at any time to opt out — however, see the note below.',
    requirement: 'Important: If you have an open work order, this notification type is required while the workorder is OPEN, because your gemstone is in our possession and we require live tracking records for each action taken during that that service . This toggle will become available to turn off once your work order when your gemstone is delivered to your hoe via shipping updates. By continuing you confirm you understand this requirement.',
  },
  opt_in_tracking: {
    title: 'Tracking Update Alerts',
    body: 'By enabling this, you agree to receive SMS notifications from Cutting Corners Gems with shipping and tracking updates for your orders. Message & data rates may apply. Reply STOP at any time to opt out.',
  },
  opt_in_chat: {
    title: 'Chat Message Alerts',
    body: 'By enabling this, you agree to receive SMS notifications from Cutting Corners Gems when you have a new message from our team. Message & data rates may apply. Reply STOP at any time to opt out.',
  },
  opt_in_purchases: {
    title: 'Purchase Confirmation Alerts',
    body: 'By enabling this, you agree to receive SMS confirmations from Cutting Corners Gems when a purchase is completed. Message & data rates may apply. Reply STOP at any time to opt out.',
  },
  opt_in_new_listings: {
    title: 'New Gem Listing Alerts',
    body: 'By enabling this, you agree to receive SMS notifications from Cutting Corners Gems when new gemstones are listed in the shop. Message frequency varies. Message & data rates may apply. Reply STOP at any time to opt out.',
  },
};

export const PRIVACY_FOOTER =
  'Cutting Corners Gems will never sell or share your phone number. You can manage your notification preferences at any time from your account dashboard. For help reply HELP. To stop all messages reply STOP.';

export const CHECKBOX_LABEL =
  'I agree to receive SMS notifications from Cutting Corners Gems. I understand I can opt out at any time by replying STOP, and that message & data rates may apply.';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseSmsConsentModal {
  checked: boolean;
  copy: ConsentCopy;
  toggleChecked: () => void;
  handleConfirm: () => void;
}

export function useSmsConsentModal(
  toggle: ConsentModalProps['toggle'],
  onConfirm: () => void
): UseSmsConsentModal {
  const [checked, setChecked] = useState(false);

  const copy: ConsentCopy = CONSENT_COPY[toggle.col] ?? {
    title: toggle.label,
    body: `By enabling this, you agree to receive SMS notifications from Cutting Corners Gems for ${toggle.label}. Message & data rates may apply. Reply STOP at any time to opt out.`,
  };

  const toggleChecked = () => setChecked(c => !c);

  const handleConfirm = () => {
    if (checked) onConfirm();
  };

  return { checked, copy, toggleChecked, handleConfirm };
}
