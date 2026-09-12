'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Blueprint from '@/components/Blueprint';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [fullName, setFullName] = useState('');
  const [level, setLevel] = useState('GCSE');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, level, role: 'student' } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <nav className="nav" style={{ paddingInline: 'clamp(20px,5vw,64px)' }}>
        <Link href="/" className="nav-brand" style={{ color: 'var(--color-text)' }}>Podium</Link>
        <Link href="/">Back to site</Link>
      </nav>

      <div style={{ maxWidth: 420, margin: '64px auto', padding: '0 20px' }}>
        <div className="seg" style={{ marginBottom: 24 }}>
          <button type="button" className="seg-opt" aria-pressed={mode === 'signup'} onClick={() => setMode('signup')}>
            Sign up
          </button>
          <button type="button" className="seg-opt" aria-pressed={mode === 'login'} onClick={() => setMode('login')}>
            Log in
          </button>
        </div>

        <Blueprint style={{ padding: 40 }}>
          <h1 style={{ fontSize: 24, margin: '0 0 8px' }}>
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p style={{ fontSize: 14, margin: '0 0 24px', opacity: 0.78 }}>
            {mode === 'signup'
              ? 'Free to join. Built for GCSE and A-Level maths.'
              : 'Log in to pick up where you left off.'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'signup' && (
              <>
                <div className="field">
                  <label htmlFor="name">Full name</label>
                  <input className="input" id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Morgan" required />
                </div>
                <div className="field">
                  <label htmlFor="level">Exam level</label>
                  <select className="input" id="level" value={level} onChange={(e) => setLevel(e.target.value)}>
                    <option>GCSE</option>
                    <option>A-Level</option>
                  </select>
                </div>
              </>
            )}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input className="input" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input className="input" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} />
            </div>

            {error && <p style={{ fontSize: 13, color: '#a33', margin: 0 }}>{error}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Log in'}
            </button>
          </form>
          <p style={{ fontSize: 13, margin: '20px 0 0', textAlign: 'center', opacity: 0.7 }}>
            Tutor? <Link href="/tutor">Go to the tutor dashboard</Link>
          </p>
        </Blueprint>
      </div>
    </div>
  );
}
