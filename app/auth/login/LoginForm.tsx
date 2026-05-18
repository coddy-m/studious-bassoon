// app/auth/login/LoginForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession, SessionProvider } from 'next-auth/react';

function LoginFormContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Automatically redirect when session updates with role
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      console.log('🎯 [CLIENT] Session ready, role:', session.user.role);
      router.push(session.user.role === 'seller' ? '/dashboard' : '/products');
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false, // Let useEffect handle navigation
    });
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
    // If success, session status will change to 'authenticated' -> useEffect redirects
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md glass-card p-8 fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gradient text-shadow-lg">Welcome Back</h1>
          <p className="text-gray-400">Sign in to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input name="email" type="email" required className="input-dramatic" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input name="password" type="password" required className="input-dramatic" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-dramatic w-full py-4 text-lg mt-2">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            New here?{' '}
            <a href="/auth/register" className="text-indigo-400 font-semibold hover:underline">
              Create Account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginForm() {
  return (
    <SessionProvider>
      <LoginFormContent />
    </SessionProvider>
  );
}