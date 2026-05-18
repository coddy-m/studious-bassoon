'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectRole = searchParams.get('role') as 'buyer' | 'seller' | null;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false,
      });
      
      if (res?.error) {
        setError(res.error);
      } else {
        if (redirectRole === 'seller') {
          router.push('/dashboard');
        } else {
          router.push('/products');
        }
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="glass-card p-10 fade-in-up">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold mb-3 text-gradient-gold text-shadow-lg">
              Welcome Back
            </h1>
            <p className="text-gray-400">Sign in to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-500 rounded-xl text-red-200 animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input 
                name="email" 
                type="email" 
                required 
                className="input-dramatic"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input 
                name="password" 
                type="password" 
                required 
                className="input-dramatic"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="btn-dramatic w-full py-4 text-lg mt-8"
            >
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

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              New here?{' '}
              <a href="/auth/register" className="text-gradient font-bold hover:underline">
                Create Account
              </a>
            </p>
          </div>
        </div>

        {/* Decorative Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">🔒 Secure Authentication</p>
        </div>
      </div>
    </div>
  );
}