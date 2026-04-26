import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface EditUserModalProps {
  showEditUser: boolean;
  setShowEditUser: (v: boolean) => void;
  user: any;
  id: string;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

export default function EditUserModal({ showEditUser, setShowEditUser, user, id, setUser }: EditUserModalProps) {
  // editUser state — lines 55 of [id].tsx (initialized from user, synced on open)
  const [editUser, setEditUser] = useState<any>(user ? { ...user } : null);

  // Re-sync editUser each time the modal opens — mirrors line 352: setEditUser({ ...user })
  useEffect(() => {
    if (showEditUser && user) setEditUser({ ...user });
  }, [showEditUser]);

  // inputStyle — line 320 of [id].tsx
  const inputStyle: React.CSSProperties = { background: 'var(--k2)', border: '1px solid var(--ln)', color: 'var(--tx)', padding: '10px 12px', fontFamily: 'var(--sans)', fontSize: '0.9375rem', width: '100%', outline: 'none', height: '39px' };

  // Save user edit — lines 219–227 of [id].tsx
  const saveUser = async () => {
    if (!editUser || !id) return;
    await supabase.from('account_users').update({
      name: editUser.name, email: editUser.email, phone: editUser.phone,
      shipping_address: editUser.shipping_address, business_name: editUser.business_name, status: editUser.status,
    }).eq('account_user_id', id);
    setUser({ ...editUser }); setShowEditUser(false);
  };

  // JSX block — lines 588–620 of [id].tsx
  if (!showEditUser || !editUser) return null;

  return (
    <div className="ov" onClick={e => { if (e.target === e.currentTarget) setShowEditUser(false); }}>
      <div style={{ margin: 'auto', background: 'var(--k1)', border: '1px solid var(--ln)', padding: '29px', maxWidth: '480px', width: '90%' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '1.4375rem', color: 'var(--wh)', marginBottom: '21px' }}>Edit User</div>
        {[
          { label: 'Name', key: 'name' }, { label: 'Email', key: 'email' },
          { label: 'Phone', key: 'phone' }, { label: 'Business Name', key: 'business_name' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: '13px' }}>
            <label style={{ fontSize: '0.9375rem', fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--d1)', display: 'block', marginBottom: '5px' }}>{f.label}</label>
            <input value={editUser[f.key] || ''} onChange={e => setEditUser({ ...editUser, [f.key]: e.target.value })} style={inputStyle} />
          </div>
        ))}
        <div style={{ marginBottom: '13px' }}>
          <label style={{ fontSize: '0.9375rem', fontWeight: 500, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--d1)', display: 'block', marginBottom: '5px' }}>Shipping Address</label>
          <textarea value={editUser.shipping_address || ''} onChange={e => setEditUser({ ...editUser, shipping_address: e.target.value })} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
        </div>
        <div style={{ marginBottom: '17px' }}>
          <label style={{ fontSize: '0.9375rem', fontWeight: 500, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--d1)', display: 'block', marginBottom: '5px' }}>Status</label>
          <select value={editUser.status || 'ACTIVE'} onChange={e => setEditUser({ ...editUser, status: e.target.value })}
            style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '9px' }}>
          <button className="bp" onClick={saveUser}>Save</button>
          <button className="bg" onClick={() => setShowEditUser(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
