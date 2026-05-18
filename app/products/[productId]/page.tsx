// app/products/[productId]/page.tsx
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: { productId: string } }) {
  await connectDB();
  
  const product = await Product.findOne({ productId: params.productId, active: true }).lean();
  
  if (!product) {
    notFound();
  }

  // ✅ Try to get seller, but don't fail if not found
  let seller = null;
  try {
    seller = await User.findOne({ _id: product.sellerId, role: 'seller' })
      .select('_id name businessName phone')
      .lean();
  } catch (err) {
    console.warn('Could not fetch seller:', err);
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/products" className="text-indigo-400 hover:underline mb-4 inline-block">
          ← Back to Marketplace
        </Link>

        <div className="glass-card p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 rounded-xl overflow-hidden">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-80 object-cover" />
              ) : (
                <div className="w-full h-80 flex items-center justify-center text-gray-500">No Image</div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white mb-3">{product.name}</h1>
              <p className="text-3xl font-bold text-white mb-4">KES {product.price?.toLocaleString()}</p>
              
              <div className="space-y-2 mb-6 border-t border-b border-white/10 py-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Category:</span>
                  <span className="text-white capitalize">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stock:</span>
                  <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                    {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Seller:</span>
                  <span className="text-white">
                    {seller ? (seller.businessName || seller.name) : 'Unknown Seller'}
                  </span>
                </div>
              </div>

              {product.description && (
                <p className="text-gray-300 mb-6">{product.description}</p>
              )}

              {/* ✅ Only show Buy button if seller exists AND product in stock */}
              {seller && product.stock > 0 ? (
                <Link 
                  href={`/checkout?productId=${product.productId}&sellerId=${seller._id.toString()}`}
                  className="block w-full btn-dramatic text-center py-4 rounded-xl font-semibold"
                >
                  Buy Now with M-Pesa
                </Link>
              ) : (
                <button disabled className="w-full bg-gray-600 text-gray-400 py-4 rounded-xl font-semibold cursor-not-allowed">
                  {seller ? 'Out of Stock' : 'Seller Unavailable'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}