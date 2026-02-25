import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminIndex() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/login'); }, [router]);
  return <div style={{ background: '#050505', minHeight: '100vh' }} />;
}
