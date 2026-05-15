import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'seller') {
    redirect('/auth/login?role=seller');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Seller Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{session.user.email}</span>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Seller</span>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}