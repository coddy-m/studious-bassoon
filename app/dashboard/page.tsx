import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import DashboardClient from './DashboardClient';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';

// Add these at the TOP of the file (after imports, before component)
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/seller/start');
  }

  try {
    await connectDB();
    
    const [products, orders] = await Promise.all([
      Product.find({ sellerId: session.user.id }).lean(),
      Order.find({ sellerId: session.user.id }).sort({ createdAt: -1 }).limit(50).lean()
    ]);

    return (
      <DashboardClient 
        session={session} 
        initialProducts={JSON.parse(JSON.stringify(products))} 
        initialOrders={JSON.parse(JSON.stringify(orders))} 
      />
    );
  } catch (error) {
    console.error('Dashboard Load Error:', error);
    return <div className="p-8 text-center text-red-500">Failed to load dashboard.</div>;
  }
}