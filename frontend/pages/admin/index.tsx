// start of pages/admin/index.tsx

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminIndex() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/login'); }, [router]);
  return <div style={{ background: 'transparent', minHeight: '100vh' }} />;
}
// end of pages/admin/index.tsx