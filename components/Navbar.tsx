// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const {  session, status } = useSession();
  const isSeller = session?.user?.role === 'seller';

  return (
    <nav className="navbar-glass px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/products" className="text-2xl font-bold text-gradient">
          MtaaDuka
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          {isSeller ? (
            <>
              <Link href="/dashboard" className="hidden sm:block text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/products/new" className="btn-dramatic px-4 py-2 rounded-lg text-sm">
                + Add Product
              </Link>
            </>
          ) : status === 'authenticated' ? (
            <button 
              onClick={() => signOut({ callbackUrl: '/products' })}
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              Sign Out
            </button>
          ) : (
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors text-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}