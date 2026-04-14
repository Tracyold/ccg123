import { useState } from 'react';

export const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'workorders', label: 'Work Orders' },
  { id: 'inquiries', label: 'Inquiries' },
  { id: 'wizard', label: 'Wizard Results' },
  { id: 'invoices', label: 'Invoices' },
];

export function useNavigation(initial = 'home') {
  const [activeTab, setActiveTab] = useState(initial);
  const [inquiryTab, setInquiryTab] = useState<'inquiries' | 'service'>('inquiries');

  return { activeTab, setActiveTab, inquiryTab, setInquiryTab, NAV_ITEMS };
}