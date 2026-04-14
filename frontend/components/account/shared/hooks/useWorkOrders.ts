import { useState } from 'react';
import { supabase } from '../../../../lib/supabase';

export function useWorkOrders(session: any, setWorkOrders: (fn: any) => void) {
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [showAddressEdit, setShowAddressEdit] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  const acceptWO = async (wo: any) => {
    const log = [
      ...(Array.isArray(wo.edit_history) ? wo.edit_history : []),
      { action: 'ACCEPTED by user', by: 'user', at: new Date().toISOString() },
    ];
    await supabase.from('work_orders')
      .update({ status: 'ACCEPTED', accepted_at: new Date().toISOString(), edit_history: log })
      .eq('work_order_id', wo.work_order_id)
      .eq('account_user_id', session.user.id);
    await supabase.functions.invoke('send-admin-notification', {
      body: { event_type: 'work_orders', work_order_id: wo.work_order_id },
    });
    setWorkOrders((prev: any[]) => prev.map(w =>
      w.work_order_id === wo.work_order_id
        ? { ...w, status: 'ACCEPTED', accepted_at: new Date().toISOString(), edit_history: log }
        : w
    ));
    setSelectedWO((prev: any) =>
      prev ? { ...prev, status: 'ACCEPTED', accepted_at: new Date().toISOString(), edit_history: log } : prev
    );
  };

  const openWODetail = (wo: any) => setSelectedWO(wo);

  return {
    selectedWO, setSelectedWO,
    showAddressEdit, setShowAddressEdit,
    tempAddress, setTempAddress,
    addressConfirmed, setAddressConfirmed,
    acceptWO, openWODetail,
  };
}