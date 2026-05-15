import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductsClient from './ProductsClient';



export default async function ProductsPage() {
  // 1. Check Auth on Server
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/seller/start');
  }

  // 2. Fetch Data on Server (Fast!)
  try {
    await connectDB();
    // Fetch only this seller's products
    const products = await Product.find({ sellerId: session.user.id }).lean();

    // 3. Pass data to Client Component
    return <ProductsClient initialProducts={JSON.parse(JSON.stringify(products))} />;
  } catch (error) {
    console.error('Error loading products:', error);
    return <div className="p-8 text-center text-red-500">Failed to load products.</div>;
  }
}