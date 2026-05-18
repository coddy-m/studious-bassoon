// app/auth/register/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { SessionProvider } from 'next-auth/react';

function RegisterFormInner() {
  const router = useRouter();
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    
    try {
      // ✅ Register user with selected role
      const res = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name'),
        phone: formData.get('phone'),
        role: role, // ✅ Use state value, not formData
        businessName: role === 'seller' ? formData.get('businessName') : undefined,
        location: role === 'seller' ? formData.get('location') : undefined,
        redirect: false,
      });
      
      if (res?.error) {
        setError(res.error);
      } else {
        // ✅ Redirect based on selected role (not session - avoids timing issues)
        if (role === 'seller') {
          router.push('/dashboard');
        } else {
          router.push('/products');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
        
        {/* Role Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
          <button 
            type="button"
            onClick={() => setRole('buyer')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              role === 'buyer' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Buyer
          </button>
          <button 
            type="button"
            onClick={() => setRole('seller')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              role === 'seller' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Seller
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input name="password" type="password" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input name="name" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (for M-Pesa)</label>
            <input name="phone" placeholder="+254712345678" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>
          
          {role === 'seller' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input name="businessName" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input name="location" placeholder="e.g. Westlands, Nairobi" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
            </>
          )}
          
          <button 
            disabled={loading} 
            className="w-full bg-green-600 text-white font-medium p-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? 'Creating...' : `Register as ${role === 'seller' ? 'Seller' : 'Buyer'}`}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/auth/login" className="text-green-600 font-medium hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}

// ✅ Wrap with SessionProvider
export default function RegisterForm() {
  return (
    <SessionProvider>
      <RegisterFormInner />
    </SessionProvider>
  );
}