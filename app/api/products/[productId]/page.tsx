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

  // ✅ Get seller info
  const seller = await User.findOne({ _id: product.sellerId }).select('_id name businessName').lean();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/products" className="text-green-600 hover:underline mb-4 inline-block">
          ← Back to Marketplace
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-100">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-96 object-cover" />
              ) : (
                <div className="w-full h-96 flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>

            <div className="p-6">
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-3xl text-green-600 font-bold mb-4">KES {product.price?.toLocaleString()}</p>
              
              <div className="space-y-2 mb-6 border-t border-b py-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="capitalize">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock:</span>
                  <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                    {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
                  </span>
                </div>
                {seller && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seller:</span>
                    <span>{seller.businessName || seller.name}</span>
                  </div>
                )}
              </div>

              {product.description && (
                <p className="text-gray-600 mb-6">{product.description}</p>
              )}

              {/* ✅ Pass BOTH productId AND seller._id to checkout */}
              {seller ? (
                <Link 
                  href={`/checkout?productId=${product.productId}&sellerId=${seller._id}`}
                  className="block w-full bg-green-600 text-white text-center py-4 rounded-lg font-bold text-lg hover:bg-green-700"
                >
                  📱 Buy Now with M-Pesa
                </Link>
              ) : (
                <button disabled className="w-full bg-gray-300 text-gray-500 py-4 rounded-lg font-bold text-lg cursor-not-allowed">
                  Seller not found
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}