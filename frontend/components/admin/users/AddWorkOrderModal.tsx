import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface AddWorkOrderModalProps {
  showAddWO: boolean;
  setShowAddWO: (v: boolean) => void;
  user: any;
  id: string;
  session: any;
  setWO: React.Dispatch<React.SetStateAction<any[]>>;
  setWoCount: (n: number) => void;
}

export default function AddWorkOrderModal({ showAddWO, setShowAddWO, user, id, session, setWO, setWoCount }: AddWorkOrderModalProps) {
  // Const block — lines 50–51 of [id].tsx
  const [woForm, setWoForm] = useState({ title: '', description: '', service_type: '', gem_type: '', estimated_price: '', estimated_turnaround: '', notes: '' });
  const [woSaving, setWoSaving] = useState(false);

  // inputStyle — line 320 of [id].tsx
  const inputStyle: React.CSSProperties = { background: 'var(--k2)', border: '1px solid var(--ln)', color: 'var(--tx)', padding: '10px 12px', fontFamily: 'var(--sans)', fontSize: '15px', width: '100%', outline: 'none', height: '39px' };

  // Create work order — lines 156–178 of [id].tsx
  const createWO = async () => {
    if (!woForm.title || !woForm.description || !session || !id) return;
    setWoSaving(true);
    await supabase.from('work_orders').insert({
      account_user_id: id as string,
      created_by_admin_id: session.user.id,
      title: woForm.title,
      description: woForm.description,
      service_type: woForm.service_type || null,
      gem_type: woForm.gem_type || null,
      estimated_price: woForm.estimated_price ? parseFloat(woForm.estimated_price) : null,
      estimated_turnaround: woForm.estimated_turnaround || null,
      notes: woForm.notes || null,
      wo_shipping_address: user?.shipping_address || null,
      edit_history: [{ action: 'CREATED', by: 'admin', at: new Date().toISOString() }],
      status: 'CREATED',
    });
    // DB triggers fire automatically — do NOT call edge functions
    setWoSaving(false); setShowAddWO(false);
    setWoForm({ title: '', description: '', service_type: '', gem_type: '', estimated_price: '', estimated_turnaround: '', notes: '' });
    const { data: wo } = await supabase.from('work_orders').select('*').eq('account_user_id', id).order('created_at', { ascending: false });
    setWO(wo || []); setWoCount(wo?.length || 0);
  };

  // JSX block — lines 534–586 of [id].tsx
  if (!showAddWO) return null;

  return (
    <div className="ov" onClick={e => { if (e.target === e.currentTarget) setShowAddWO(false); }}>
      <div style={{ margin: 'auto', background: 'var(--k1)', border: '.5px solid var(--ln)', padding: '29px', maxWidth: '479px', width: '90%' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '23px', color: 'var(--wh)', marginBottom: '21px' }}>New Work Order</div>
        {/* Service Type dropdown */}
        <div style={{ marginBottom: '13px' }}>
          <label style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', display: 'block', marginBottom: '5px' }}>Service Type</label>
          <select value={woForm.service_type} onChange={e => setWoForm({ ...woForm, service_type: e.target.value })}
            style={{ ...inputStyle, background: 'var(--k2)' }}>
            <option value="">Select service type</option>
            {[
              'Custom Rough Cut',
              'Re-Cut & Re-Polish',
              'Table Re-Polish',
              'Crown Re-Polish',
              'Pavilion Re-Polish',
              'Gemstone Material Cut Design',
              'Virtual Consultation',
            ].map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
        {[
          { label: 'Title *', key: 'title', placeholder: 'Work order title' },
          { label: 'Gem Type', key: 'gem_type', placeholder: 'e.g. Sapphire' },
          { label: 'Estimated Price ($)', key: 'estimated_price', placeholder: '0.00' },
          { label: 'Estimated Turnaround', key: 'estimated_turnaround', placeholder: 'e.g. 2-3 weeks after receiving stone' },
          { label: 'Notes', key: 'notes', placeholder: 'Internal notes' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: '13px' }}>
            <label style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', display: 'block', marginBottom: '5px' }}>{f.label}</label>
            <input value={(woForm as any)[f.key]} onChange={e => setWoForm({ ...woForm, [f.key]: e.target.value })} placeholder={f.placeholder} style={inputStyle} />
          </div>
        ))}
        <div style={{ marginBottom: '13px' }}>
          <label style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', display: 'block', marginBottom: '5px' }}>Description *</label>
          <textarea value={woForm.description} onChange={e => setWoForm({ ...woForm, description: e.target.value })} placeholder="Work order description"
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
        </div>
        {/* Shipping address preview */}
        {user?.shipping_address && (
          <div style={{ marginBottom: '13px', padding: '12px', background: 'var(--k0)', border: '.5px solid var(--ln)' }}>
            <div style={{ fontSize: '10px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d2)', marginBottom: '5px' }}>Return Address (from user profile)</div>
            <div style={{ fontSize: '13px', color: 'var(--tx)' }}>{user.shipping_address}</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '9px' }}>
          <button className="bp" onClick={createWO} disabled={woSaving || !woForm.title || !woForm.description}>{woSaving ? 'Creating...' : 'Create'}</button>
          <button className="bg" onClick={() => setShowAddWO(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
