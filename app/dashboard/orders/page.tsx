import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import OrdersClient from './OrdersClient';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/seller/start');
  }

  try {
    await connectDB();
    // Fetch orders for this seller, sorted by newest
    const orders = await Order.find({ sellerId: session.user.id }).sort({ createdAt: -1 }).lean();

    return <OrdersClient initialOrders={JSON.parse(JSON.stringify(orders))} />;
  } catch (error) {
    console.error('Error loading orders:', error);
    return <div className="p-8 text-center text-red-500">Failed to load orders.</div>;
  }
}