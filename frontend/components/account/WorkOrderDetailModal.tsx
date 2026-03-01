import { supabase } from '../../lib/supabase';
import { formatMoney, fmtDate, fmtTime } from '../../lib/utils';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  CREATED: { bg: 'rgba(212,175,55,0.12)', color: '#d4af37' },
  ACCEPTED: { bg: 'rgba(45,212,191,0.12)', color: 'rgba(45,212,191,1)' },
  COMPLETED: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' },
  CONFIRMED: { bg: 'rgba(120,80,200,0.12)', color: '#b388ff' },
  CANCELLED: { bg: 'rgba(181,64,64,0.1)', color: '#c07070' },
};

interface Props {
  selectedWO: any;
  adminInfo: any;
  profile: any;
  showAddressEdit: boolean;
  tempAddress: string;
  addressConfirmed: boolean;
  setSelectedWO: (fn: any) => void;
  setShowAddressEdit: (v: boolean) => void;
  setTempAddress: (v: string) => void;
  setAddressConfirmed: (v: boolean) => void;
  setWorkOrders: (fn: any) => void;
  acceptWO: (wo: any) => void;
}

export default function WorkOrderDetailModal({
  selectedWO, adminInfo, profile,
  showAddressEdit, tempAddress, addressConfirmed,
  setSelectedWO, setShowAddressEdit, setTempAddress, setAddressConfirmed,
  setWorkOrders, acceptWO,
}: Props) {
  if (!selectedWO) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) { setSelectedWO(null); setShowAddressEdit(false); setAddressConfirmed(false); } }}>
      <div style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.10)', padding: '40px', maxWidth: '680px', width: '100%', maxHeight: '92vh', overflowY: 'auto', borderRadius: '2px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>Work Order</div>
            <div style={{ fontFamily: "'Oranienbaum', serif", fontSize: '23px', color: 'rgba(255,255,255,0.88)' }}>{selectedWO.title}</div>
          </div>
          <span style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '4px 9px', background: STATUS_COLORS[selectedWO.status]?.bg, color: STATUS_COLORS[selectedWO.status]?.color }}>{selectedWO.status}</span>
        </div>

        {/* Admin address — SEND TO THIS ADDRESS */}
        {adminInfo && (
          <div style={{ marginBottom: '16px', padding: '17px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Send To</div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ffd700' }}>← SEND TO THIS ADDRESS</div>
            </div>
            <div style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 2 }}>
              <div style={{ color: '#d4af37', fontWeight: 600, fontSize: '16px' }}>{adminInfo.business_name}</div>
              <div>{adminInfo.full_name}</div>
              <div>{adminInfo.address}</div>
              <div>{adminInfo.contact_email}</div>
              <div>{adminInfo.phone}</div>
            </div>
          </div>
        )}

        {/* User address — RETURN TO THIS ADDRESS */}
        {profile && (
          <div style={{ marginBottom: '21px', padding: '17px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Return To</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ffd700' }}>RETURN TO THIS ADDRESS →</div>
                {selectedWO.status === 'CREATED' && (
                  <button onClick={() => { setTempAddress(selectedWO.wo_shipping_address || profile.shipping_address || ''); setShowAddressEdit(true); }}
                    style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', padding: '4px 8px', cursor: 'pointer' }}>
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 2 }}>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px' }}>{profile.name}</div>
              <div>{profile.email}</div>
              {profile.phone && <div>{profile.phone}</div>}
              <div style={{ color: '#FAFAFA' }}>{selectedWO.wo_shipping_address || profile.shipping_address || 'No address on file'}</div>
              {selectedWO.wo_shipping_address && selectedWO.wo_shipping_address !== profile.shipping_address && (
                <div style={{ fontSize: '10px', color: '#ffd700', marginTop: '4px', fontStyle: 'italic' }}>* Custom address for this work order only</div>
              )}
            </div>
          </div>
        )}

        {/* Address edit confirmation modal */}
        {showAddressEdit && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', padding: '16px', marginBottom: '16px', borderRadius: '4px' }}>
            {!addressConfirmed ? (
              <>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ffd700', marginBottom: '8px' }}>Update Return Address</p>
                <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginBottom: '12px', lineHeight: 1.6 }}>
                  This change applies to this work order only and does not update your profile. By confirming, you agree this is the address we will ship your item to upon completion.
                </p>
                <input value={tempAddress} onChange={e => setTempAddress(e.target.value)}
                  placeholder="Enter address for this work order..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', padding: '10px 12px', color: '#FAFAFA', fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', outline: 'none', marginBottom: '10px' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={async () => {
                    if (!tempAddress.trim()) return;
                    const log = [...(Array.isArray(selectedWO.edit_history) ? selectedWO.edit_history : []), { action: 'Return address updated by user', by: 'user', at: new Date().toISOString() }];
                    await supabase.from('work_orders').update({ wo_shipping_address: tempAddress.trim(), edit_history: log }).eq('work_order_id', selectedWO.work_order_id);
                    setSelectedWO((prev: any) => ({ ...prev, wo_shipping_address: tempAddress.trim(), edit_history: log }));
                    setWorkOrders((prev: any[]) => prev.map(w => w.work_order_id === selectedWO.work_order_id ? { ...w, wo_shipping_address: tempAddress.trim(), edit_history: log } : w));
                    setAddressConfirmed(true);
                  }}
                    style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', background: '#d4af37', color: '#050505', border: 'none', padding: '10px 16px', cursor: 'pointer' }}>
                    Confirm Address
                  </button>
                  <button onClick={() => setShowAddressEdit(false)}
                    style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'none', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.4)', padding: '10px 16px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', color: 'rgba(45,212,191,1)' }}>✓ Address updated for this work order.</p>
            )}
          </div>
        )}

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />

        {/* WO details */}
        {[
          { label: 'Service Type', val: selectedWO.service_type },
          { label: 'Gem Type', val: selectedWO.gem_type },
          { label: 'Est. Turnaround', val: selectedWO.estimated_turnaround },
          { label: 'Created', val: fmtDate(selectedWO.created_at) + ' · ' + fmtTime(selectedWO.created_at) },
          { label: 'Accepted', val: selectedWO.accepted_at ? fmtDate(selectedWO.accepted_at) + ' · ' + fmtTime(selectedWO.accepted_at) : null },
          { label: 'Confirmed', val: selectedWO.confirmed_at ? fmtDate(selectedWO.confirmed_at) + ' · ' + fmtTime(selectedWO.confirmed_at) : null },
          { label: 'Completed', val: selectedWO.completed_at ? fmtDate(selectedWO.completed_at) + ' · ' + fmtTime(selectedWO.completed_at) : null },
        ].filter(r => r.val).map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)' }}>{r.label}</span>
            <span style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.72)' }}>{r.val}</span>
          </div>
        ))}

        <div style={{ marginTop: '16px' }}>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>Description</div>
          <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.8 }}>{selectedWO.description}</p>
        </div>

        {selectedWO.notes && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>Notes</div>
            <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{selectedWO.notes}</p>
          </div>
        )}

        {selectedWO.estimated_price && (
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Quoted Price</span>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: '22px', color: 'rgba(45,212,191,1)' }}>{formatMoney(selectedWO.estimated_price)}</span>
          </div>
        )}

        {/* Payment — show stripe link if completed */}
        {selectedWO.status === 'COMPLETED' && selectedWO.stripe_payment_link && (
          <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '10px' }}>Payment</div>
            <a href={selectedWO.stripe_payment_link} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', background: '#d4af37', color: '#050505', padding: '12px 20px', textDecoration: 'none', display: 'inline-block' }}>
              Pay Now
            </a>
          </div>
        )}
        {selectedWO.status === 'COMPLETED' && selectedWO.paid_outside_site && (
          <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)' }}>
            <span style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', color: 'rgba(45,212,191,1)' }}>✓ Payment received — thank you!</span>
          </div>
        )}

        {/* CONFIRMED status notice */}
        {selectedWO.status === 'CONFIRMED' && (
          <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(179,136,255,0.06)', border: '1px solid rgba(179,136,255,0.2)' }}>
            <p style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', color: '#b388ff', lineHeight: 1.6 }}>
              Your work order has been confirmed! Please send your item to the address above. We'll notify you when we receive it.
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
          {selectedWO.status === 'CREATED' && (
            <button className="acc-btn-gold" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => { acceptWO(selectedWO); }}>
              Accept Work Order
            </button>
          )}
          <button className="acc-btn-ghost" onClick={() => { setSelectedWO(null); setShowAddressEdit(false); setAddressConfirmed(false); }} style={{ marginLeft: 'auto' }}>Close</button>
        </div>

        {/* Activity Log */}
        {selectedWO.edit_history && selectedWO.edit_history.length > 0 && (
          <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '10px' }}>Activity Log</div>
            {[...selectedWO.edit_history].reverse().map((entry: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '2px 6px', background: entry.by === 'admin' ? 'rgba(212,175,55,0.12)' : 'rgba(45,212,191,0.1)', color: entry.by === 'admin' ? '#d4af37' : 'rgba(45,212,191,0.9)' }}>{entry.by}</span>
                  <span style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{entry.action}</span>
                </div>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', flexShrink: 0 }}>{fmtDate(entry.at)} · {fmtTime(entry.at)}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
