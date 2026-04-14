import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../lib/supabase';

export function useDeleteAccount(session: any) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setDeleteConfirmText('');
    setDeleteError('');
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') { setDeleteError('Type DELETE to confirm.'); return; }
    setDeleting(true);
    setDeleteError('');
    try {
      const { error } = await supabase.rpc('delete_account', { user_id: session.user.id });
      if (error) throw error;
      await supabase.auth.signOut();
      router.push('/');
    } catch (err: any) {
      setDeleteError(err.message || 'Something went wrong.');
      setDeleting(false);
    }
  };

  return {
    showDeleteModal, setShowDeleteModal,
    deleteConfirmText, setDeleteConfirmText,
    deleteError, deleting,
    openDeleteModal, deleteAccount,
  };
}