import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { formatMoney, fmtDate, fmtTime } from '../../../lib/utils';

// STATUS_COLORS — lines 7–13 of [id].tsx
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  CREATED:   { bg: 'rgba(var(--gold-rgb), 0.08)',   color: 'var(--gold)' },
  ACCEPTED:  { bg: 'rgba(90,150,90,0.1)',      color: 'var(--accent)' },
  COMPLETED: { bg: 'rgba(80,120,200,0.1)',     color: 'var(--text-muted)' },
  CONFIRMED: { bg: 'rgba(120,80,200,0.12)',    color: 'var(--text-muted)' },
  CANCELLED: { bg: 'rgba(181,64,64,0.1)',      color: 'var(--text-muted)' },
};

interface WorkOrderDetailModalProps {
  selectedWO: any;
  setSelectedWO: React.Dispatch<React.SetStateAction<any>>;
  user: any;
  session: any;
  adminInfo: any;
  setWO: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function WorkOrderDetailModal({ selectedWO, setSelectedWO, user, session, adminInfo, setWO }: WorkOrderDetailModalProps) {
  // Addr edit state — lines 42–44 of [id].tsx
  const [editingWOAddr, setEditingWOAddr]       = useState(false);
  const [woAdminAddrEdit, setWoAdminAddrEdit]   = useState('');
  const [woClientAddrEdit, setWoClientAddrEdit] = useState('');

  // inputStyle — line 320 of [id].tsx
  const inputStyle: React.CSSProperties = { background: 'var(--k2)', border: '1px solid var(--ln)', color: 'var(--tx)', padding: '10px 12px', fontFamily: 'var(--sans)', fontSize: '15px', width: '100%', outline: 'none', height: '39px' };

  // appendLog — lines 180–184 of [id].tsx
  const appendLog = (wo: any, action: string, by: string) => {
    const prev = Array.isArray(wo.edit_history) ? wo.edit_history : [];
    return [...prev, { action, by, at: new Date().toISOString() }];
  };

  // confirmWO — lines 186–196 of [id].tsx
  const confirmWO = async (wo: any) => {
    const log = appendLog(wo, 'CONFIRMED by admin', 'admin');
    const { error } = await supabase.from('work_orders').update({ status: 'CONFIRMED', confirmed_at: new Date().toISOString(), edit_history: log }).eq('work_order_id', wo.work_order_id);
    if (error) { console.error('Confirm WO error:', error.message); return; }
    await supabase.functions.invoke('send-user-notification', {
      body: { event_type: 'work_order_confirmed', work_order_id: wo.work_order_id, user_id: wo.account_user_id },
    }).catch(() => {});
    setWO(prev => prev.map(w => w.work_order_id === wo.work_order_id ? { ...w, status: 'CONFIRMED', confirmed_at: new Date().toISOString(), edit_history: log } : w));
    setSelectedWO((prev: any) => prev ? { ...prev, status: 'CONFIRMED', confirmed_at: new Date().toISOString(), edit_history: log } : prev);
  };

  // completeWO — lines 198–206 of [id].tsx
  const completeWO = async (wo: any) => {
    const log = appendLog(wo, 'COMPLETE by admin', 'admin');
    const now = new Date().toISOString();
    const { error } = await supabase.from('work_orders').update({ status: 'COMPLETE', completed_at: now, edit_history: log }).eq('work_order_id', wo.work_order_id);
    if (error) { console.error('Complete WO error:', error.message); alert('Error: ' + error.message); return; }
    setWO(prev => prev.map(w => w.work_order_id === wo.work_order_id ? { ...w, status: 'COMPLETE', completed_at: now, edit_history: log } : w));
    setSelectedWO((prev: any) => prev ? { ...prev, status: 'COMPLETE', completed_at: now, edit_history: log } : prev);
  };

  // cancelWO — lines 208–217 of [id].tsx
  const cancelWO = async (wo: any) => {
    const reason = prompt('Cancel reason:');
    if (!reason) return;
    const log = appendLog(wo, 'CANCELLED by admin: ' + reason, 'admin');
    const { error } = await supabase.from('work_orders').update({ status: 'CANCELLED', cancelled_at: new Date().toISOString(), cancel_reason: reason, edit_history: log }).eq('work_order_id', wo.work_order_id);
    if (error) { console.error('Cancel WO error:', error.message); return; }
    setWO(prev => prev.map(w => w.work_order_id === wo.work_order_id ? { ...w, status: 'CANCELLED', edit_history: log } : w));
    setSelectedWO((prev: any) => prev ? { ...prev, status: 'CANCELLED', edit_history: log } : prev);
  };

  // JSX block — lines 700–892 of [id].tsx
  if (!selectedWO) return null;

  return (
    <div className="ov" onClick={e => { if (e.target === e.currentTarget) setSelectedWO(null); }}>
      <div style={{ margin: 'auto', background: 'var(--k1)', border: '.5px solid var(--ln)', padding: '40px', maxWidth: '720px', width: '95%', maxHeight: '92vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '10px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--d2)', marginBottom: '4px' }}>Work Order</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '22px', color: 'var(--wh)' }}>{selectedWO.title}</div>
          </div>
          <span style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '.17em', textTransform: 'uppercase', padding: '4px 9px', background: STATUS_COLORS[selectedWO.status]?.bg, color: STATUS_COLORS[selectedWO.status]?.color }}>{selectedWO.status}</span>
        </div>

        {/* Admin address — SEND TO THIS ADDRESS */}
        {adminInfo && (
          <div style={{ marginBottom: '16px', padding: '18px', background: 'var(--k0)', border: '.5px solid var(--ln)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d2)' }}>Admin Address</div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent)' }}>← CLIENT SENDS ITEM HERE</div>
            </div>
            <div style={{ fontSize: '15px', color: 'var(--text)', lineHeight: 2 }}>
              <div style={{ color: 'var(--gl)', fontWeight: 600, fontSize: '16px' }}>{adminInfo.business_name}</div>
              <div>{adminInfo.full_name}</div>
              <div style={{ fontWeight: 600, color: 'rgba(var(--text-rgb, 238,238,238),0.85)' }}>{adminInfo.address}</div>
              <div>{adminInfo.contact_email}</div>
              <div>{adminInfo.phone}</div>
            </div>
          </div>
        )}

        {/* Client address — RETURN TO THIS ADDRESS (admin editable) */}
        {user && (
          <div style={{ marginBottom: '20px', padding: '18px', background: 'var(--k0)', border: '.5px solid var(--ln)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d2)' }}>Client Return Address</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent)' }}>RETURN ITEM HERE →</div>
                <button onClick={() => { setEditingWOAddr(true); setWoClientAddrEdit(selectedWO.wo_shipping_address || user.shipping_address || ''); setWoAdminAddrEdit(adminInfo?.address || ''); }}
                  style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '3px 8px', cursor: 'pointer' }}>
                  Edit
                </button>
              </div>
            </div>
            {editingWOAddr ? (
              <div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--d2)', display: 'block', marginBottom: '4px' }}>Admin Address (send to)</label>
                  <input value={woAdminAddrEdit} onChange={e => setWoAdminAddrEdit(e.target.value)}
                    style={{ width: '100%', background: 'var(--k2)', border: '1px solid var(--ln)', color: 'var(--tx)', padding: '8px 10px', fontSize: '13px', fontFamily: 'var(--sans)', outline: 'none', marginBottom: '8px' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--d2)', display: 'block', marginBottom: '4px' }}>Client Return Address</label>
                  <input value={woClientAddrEdit} onChange={e => setWoClientAddrEdit(e.target.value)}
                    style={{ width: '100%', background: 'var(--k2)', border: '1px solid var(--ln)', color: 'var(--tx)', padding: '8px 10px', fontSize: '13px', fontFamily: 'var(--sans)', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="bp" onClick={async () => {
                    const log = appendLog(selectedWO, 'Addresses updated by admin', 'admin');
                    await supabase.from('work_orders').update({ wo_shipping_address: woClientAddrEdit.trim(), edit_history: log }).eq('work_order_id', selectedWO.work_order_id);
                    if (woAdminAddrEdit.trim() !== adminInfo?.address) {
                      await supabase.from('admin_users').update({ address: woAdminAddrEdit.trim() }).eq('admin_user_id', session?.user?.id);
                    }
                    setSelectedWO((prev: any) => ({ ...prev, wo_shipping_address: woClientAddrEdit.trim(), edit_history: log }));
                    setWO(prev => prev.map(w => w.work_order_id === selectedWO.work_order_id ? { ...w, wo_shipping_address: woClientAddrEdit.trim() } : w));
                    setEditingWOAddr(false);
                  }}>Save</button>
                  <button className="bg" onClick={() => setEditingWOAddr(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '15px', color: 'var(--text)', lineHeight: 2 }}>
                <div style={{ color: 'var(--accent)', fontSize: '16px' }}>{user.name}</div>
                <div>{user.email}</div>
                {user.phone && <div>{user.phone}</div>}
                <div style={{ fontWeight: 600, color: 'rgba(var(--text-rgb, 238,238,238),0.85)' }}>{selectedWO.wo_shipping_address || user.shipping_address || 'No address on file'}</div>
                {selectedWO.wo_shipping_address && selectedWO.wo_shipping_address !== user.shipping_address && (
                  <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '4px', fontStyle: 'italic' }}>* Custom address for this work order only</div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ height: '1px', background: 'var(--ln)', margin: '14px 0' }} />

        {/* WO details */}
        {[
          { label: 'Service Type',     val: selectedWO.service_type },
          { label: 'Gem Type',         val: selectedWO.gem_type },
          { label: 'Est. Turnaround',  val: selectedWO.estimated_turnaround },
          { label: 'Created',          val: fmtDate(selectedWO.created_at) + ' · ' + fmtTime(selectedWO.created_at) },
          { label: 'Accepted',         val: selectedWO.accepted_at  ? fmtDate(selectedWO.accepted_at)  + ' · ' + fmtTime(selectedWO.accepted_at)  : null },
          { label: 'Confirmed',        val: selectedWO.confirmed_at ? fmtDate(selectedWO.confirmed_at) + ' · ' + fmtTime(selectedWO.confirmed_at) : null },
          { label: 'Completed',        val: selectedWO.completed_at ? fmtDate(selectedWO.completed_at) + ' · ' + fmtTime(selectedWO.completed_at) : null },
          { label: 'Cancelled',        val: selectedWO.cancelled_at ? fmtDate(selectedWO.cancelled_at) : null },
        ].filter(r => r.val).map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', letterSpacing: '.17em', textTransform: 'uppercase', color: 'var(--d2)' }}>{r.label}</span>
            <span style={{ fontSize: '15px', color: 'var(--text)' }}>{r.val}</span>
          </div>
        ))}

        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--d2)', marginBottom: '8px' }}>Description</div>
          <p style={{ fontSize: '15px', color: 'var(--text)', lineHeight: 1.8 }}>{selectedWO.description}</p>
        </div>

        {selectedWO.notes && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--d2)', marginBottom: '8px' }}>Internal Notes</div>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8 }}>{selectedWO.notes}</p>
          </div>
        )}

        {selectedWO.estimated_price && (
          <div style={{ marginTop: '19px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px', background: 'var(--k0)', border: '1px solid var(--ln)' }}>
            <span style={{ fontSize: '11px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--d2)' }}>Quoted Price</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', color: 'rgb(34, 158, 114)' }}>{formatMoney(selectedWO.estimated_price)}</span>
          </div>
        )}

        {/* Payment section — only when COMPLETED */}
        {selectedWO.status === 'COMPLETE' && (
          <div style={{ marginTop: '16px', padding: '16px', background: 'var(--k0)', border: '.5px solid var(--ln)' }}>
            <div style={{ fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d2)', marginBottom: '12px' }}>Payment</div>
            {selectedWO.paid_outside_site ? (
              <div style={{ fontSize: '13px', color: 'var(--accent)' }}>✓ Marked as paid outside site</div>
            ) : selectedWO.stripe_payment_link ? (
              <div>
                <div style={{ fontSize: '11px', color: 'var(--d2)', marginBottom: '6px' }}>Stripe payment link:</div>
                <a href={selectedWO.stripe_payment_link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gl)', fontSize: '13px', wordBreak: 'break-all' }}>{selectedWO.stripe_payment_link}</a>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <input
                    placeholder="Paste Stripe payment link..."
                    style={{ ...inputStyle, marginBottom: '8px' }}
                    onBlur={async e => {
                      if (e.target.value.trim()) {
                        const log = appendLog(selectedWO, 'Payment link added', 'admin');
                        await supabase.from('work_orders').update({ stripe_payment_link: e.target.value.trim(), edit_history: log }).eq('work_order_id', selectedWO.work_order_id);
                        setSelectedWO((prev: any) => ({ ...prev, stripe_payment_link: e.target.value.trim(), edit_history: log }));
                        setWO(prev => prev.map(w => w.work_order_id === selectedWO.work_order_id ? { ...w, stripe_payment_link: e.target.value.trim() } : w));
                      }
                    }}
                  />
                </div>
                <button className="bg" style={{ whiteSpace: 'nowrap' }} onClick={async () => {
                  const log = appendLog(selectedWO, 'Marked as paid outside site', 'admin');
                  await supabase.from('work_orders').update({ paid_outside_site: true, edit_history: log }).eq('work_order_id', selectedWO.work_order_id);
                  setSelectedWO((prev: any) => ({ ...prev, paid_outside_site: true, edit_history: log }));
                  setWO(prev => prev.map(w => w.work_order_id === selectedWO.work_order_id ? { ...w, paid_outside_site: true } : w));
                }}>Paid Outside Site</button>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '7px', marginTop: '25px', flexWrap: 'wrap' }}>
          {selectedWO.status === 'ACCEPTED' && (
            <button className="bp" onClick={() => confirmWO(selectedWO)}>Confirm Order</button>
          )}
          {selectedWO.status === 'CONFIRMED' && (
            <button className="bp" onClick={() => completeWO(selectedWO)}>Mark Complete</button>
          )}
          {(selectedWO.status === 'CREATED' || selectedWO.status === 'ACCEPTED' || selectedWO.status === 'CONFIRMED') && (
            <button className="bg arc" onClick={() => { cancelWO(selectedWO); }}>Cancel Order</button>
          )}
          <button className="bg" onClick={() => setSelectedWO(null)} style={{ marginLeft: 'auto' }}>Close</button>
        </div>

        {/* Edit History Log */}
        {selectedWO.edit_history && selectedWO.edit_history.length > 0 && (
          <div style={{ marginTop: '28px', borderTop: '1px solid var(--ln)', paddingTop: '16px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d2)', marginBottom: '10px' }}>Activity Log</div>
            {[...selectedWO.edit_history].reverse().map((entry: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border)', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', padding: '2px 6px', background: entry.by === 'admin' ? 'var(--gold)' : 'rgba(45,212,191,0.1)', color: entry.by === 'admin' ? '#cfb040' : 'rgba(45,212,191,0.9)' }}>{entry.by}</span>
                  <span style={{ fontSize: '13px', color: 'var(--tx)' }}>{entry.action}</span>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--d2)', whiteSpace: 'nowrap', flexShrink: 0 }}>{fmtDate(entry.at)} · {fmtTime(entry.at)}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
