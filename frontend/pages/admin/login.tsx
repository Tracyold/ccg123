import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if already logged in as admin
  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: adminCheck } = await supabase
          .from('admin_users')
          .select('admin_user_id')
          .eq('admin_user_id', session.user.id)
          .single();
        if (adminCheck) {
          router.push('/admin/dashboard');
          return;
        }
      }
      setCheckingSession(false);
    }
    check();
  }, [router]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError('Email and password are required'); return; }
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (authError) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }

    // Verify admin status
    const { data: adminCheck } = await supabase
      .from('admin_users')
      .select('admin_user_id')
      .eq('admin_user_id', data.user!.id)
      .single();

    if (!adminCheck) {
      await supabase.auth.signOut();
      setError('Access denied.');
      setLoading(false);
      return;
    }

    router.push('/admin/dashboard');
  };

  if (checkingSession) {
    return <div style={{ background: 'transparent', minHeight: '100vh' }} />;
  }

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div
        style={{
          background: '#111111',
          border: '0.5px solid rgba(214,180,70,0.55)',
          padding: '40px',
          maxWidth: '480px',
          width: '100%',
          animation: 'adminGlow 4s ease-in-out infinite',
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes adminGlow {
            0%, 100% { box-shadow: 0 0 40px rgba(214,180,70,0.08); }
            50% { box-shadow: 0 0 60px rgba(214,180,70,0.18); }
          }
          @keyframes adminFadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}} />
        <div style={{ animation: 'adminFadeIn 400ms ease-out forwards' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
            CUTTING CORNERS GEMS
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--text)', marginBottom: '28px' }}>
            Admin
          </h1>

          <label style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', height: '40px', padding: '0 10px', color: 'var(--gold)', fontFamily: 'var(--font-body)', fontSize: '14px', marginBottom: '16px', outline: 'none', transition: 'border 200ms ease, box-shadow 200ms ease' }}
            onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
          />

          <label style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            PASSWORD
          </label>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', height: '40px', padding: '0 40px 0 10px', color: 'var(--gold)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none', transition: 'border 200ms ease, box-shadow 200ms ease' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(214,180,70,0.55)'; e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', background: 'transparent', border: '1px solid rgba(214,180,70,0.9)', color: 'var(--gold)', fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', height: '44px', cursor: 'pointer', boxShadow: '0 0 14px rgba(214,180,70,0.35)', transition: 'all 200ms ease' }}
          >
            {loading ? '...' : 'SIGN IN'}
          </button>
        </div>
      </div>
    </div>
  );
}
