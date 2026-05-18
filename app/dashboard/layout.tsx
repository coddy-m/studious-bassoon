// app/dashboard/layout.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'seller') {
    redirect('/auth/login?role=seller');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900">
      {/* Glass Navbar */}
      <nav className="navbar-glass px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/products" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            ← Marketplace
          </Link>
          <h1 className="text-xl font-bold text-white">Seller Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300 hidden sm:block">{session.user.email}</span>
          <span className="px-3 py-1 bg-indigo-600/30 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
            Seller
          </span>
        </div>
      </nav>
      
      <main className="p-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}