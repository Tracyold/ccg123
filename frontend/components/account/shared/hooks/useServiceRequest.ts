import { useState } from 'react';
import { supabase } from '../../../../lib/supabase';

export function useServiceRequest(session: any, setServiceRequests: (fn: any) => void) {
  const [showSRForm, setShowSRForm] = useState(false);
  const [srType, setSrType] = useState('');
  const [srDesc, setSrDesc] = useState('');
  const [srSubmitting, setSrSubmitting] = useState(false);
  const [srGateMsg, setSrGateMsg] = useState('');
  const [wizardPrefill, setWizardPrefill] = useState<any>(null);

  const openSRForm = async () => {
    const { data: prefs } = await supabase.from('user_sms_preferences').select('opt_in_work_orders').eq('user_id', session.user.id).single();
    const { data: p } = await supabase.from('account_users').select('phone').eq('account_user_id', session.user.id).single();
    if (!p?.phone || !prefs?.opt_in_work_orders) {
      setSrGateMsg('To submit a service request you must have a phone number on file and work order SMS notifications enabled.');
      return;
    }
    setSrGateMsg('');
    setShowSRForm(true);
  };

  const submitSR = async () => {
    if (!srType || !srDesc.trim()) return;
    setSrSubmitting(true);
    await supabase.from('service_requests').insert({
      account_user_id: session.user.id,
      service_type: srType,
      description: srDesc,
      photo_url: null,
    });
    await supabase.functions.invoke('send-admin-notification', {
      body: { event_type: 'service_requests', user_id: session.user.id },
    });
    setSrSubmitting(false);
    setShowSRForm(false);
    setSrType('');
    setSrDesc('');
    setWizardPrefill(null);
    const { data: sr } = await supabase.from('service_requests').select('*')
      .eq('account_user_id', session.user.id).order('created_at', { ascending: false });
    setServiceRequests(sr || []);
  };

  const handleWizardServiceRequest = (
    result: any,
    setActiveTab: (tab: string) => void,
    setInquiryTab: (tab: 'inquiries' | 'service') => void
  ) => {
    setWizardPrefill(result);
    setActiveTab('inquiries');
    setInquiryTab('service');
    setShowSRForm(true);
    setSrType(result.recommendation ?? '');
    const stone = [result.stone_variety, result.stone_species].filter(Boolean).join(' ');
    setSrDesc(
      'Stone: ' + stone +
      '\nWizard Score: ' + Math.round(result.feasibility_percent) + '%' +
      '\nRecommendation: ' + result.recommendation +
      '\nWeight Loss Estimate: ' + result.weight_loss
    );
  };

  return {
    showSRForm, setShowSRForm,
    srType, setSrType,
    srDesc, setSrDesc,
    srSubmitting, srGateMsg,
    wizardPrefill,
    openSRForm, submitSR, handleWizardServiceRequest,
  };
}