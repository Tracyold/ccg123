import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

export function useProfile(
  session: any,
  profile: any,
  setProfile: (p: any) => void,
  setSmsPrefs: (fn: any) => void
) {
  const [editProfile, setEditProfile] = useState<any>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFlash, setProfileFlash] = useState(false);

  // Mirror original: initialize editProfile the moment profile loads from DB
  useEffect(() => {
    if (profile && editProfile === null) {
      setEditProfile({ ...profile });
    }
  }, [profile]);

  const saveProfile = async () => {
    if (!editProfile || !session) return;
    setProfileSaving(true);
    const updates: any = {};
    if (editProfile.name !== profile.name) updates.name = editProfile.name;
    if (editProfile.email !== profile.email) updates.email = editProfile.email;
    if (editProfile.phone !== profile.phone) updates.phone = editProfile.phone;
    if (editProfile.shipping_address !== profile.shipping_address) updates.shipping_address = editProfile.shipping_address;
    if (editProfile.business_name !== profile.business_name) updates.business_name = editProfile.business_name;
    await supabase.from('account_users').update(updates).eq('account_user_id', session.user.id);
    if (updates.phone) await supabase.from('user_sms_preferences').update({ phone: updates.phone }).eq('user_id', session.user.id);
    setProfile({ ...profile, ...updates });
    setProfileSaving(false);
    setProfileFlash(true);
    setTimeout(() => setProfileFlash(false), 2000);
  };

  const hasProfileChanges = !!(editProfile && profile && (
    editProfile.name !== profile.name ||
    editProfile.email !== profile.email ||
    editProfile.phone !== profile.phone ||
    editProfile.shipping_address !== profile.shipping_address ||
    editProfile.business_name !== profile.business_name
  ));

  const toggleSms = async (col: string, val: boolean) => {
    if (!session) return;
    await supabase.from('user_sms_preferences').upsert(
      { user_id: session.user.id, phone: profile?.phone || '', [col]: val },
      { onConflict: 'user_id' }
    );
    setSmsPrefs((prev: any) => ({ ...prev, [col]: val }));
  };

  return {
    editProfile, setEditProfile,
    profileSaving, profileFlash,
    saveProfile, hasProfileChanges,
    toggleSms,
  };
}