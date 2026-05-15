import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import Link from 'next/link';

export default async function ProductsPage() {
  await connectDB();
  const products = await Product.find({ active: true })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">MtaaDuka Marketplace</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p: any) => (
          <Link key={p._id} href={`/products/${p.productId}`} className="block border rounded-lg overflow-hidden hover:shadow-lg transition">
            {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-48 object-cover" />}
            <div className="p-4">
              <h2 className="font-semibold text-lg">{p.name}</h2>
              <p className="text-green-600 font-bold">KES {p.price.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{p.category}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}