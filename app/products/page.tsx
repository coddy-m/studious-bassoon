// app/products/page.tsx
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  let products: any[] = [];
  const session = await getServerSession(authOptions);
  const isSeller = session?.user?.role === 'seller';
  
  try {
    await connectDB();
    products = await Product.find({ active: true }).sort({ createdAt: -1 }).limit(20).lean();
  } catch (err) {
    console.error('Error:', err);
  }

  return (
    <div className="min-h-screen py-20 px-4">
      {/* Header with Conditional Seller Dashboard Link */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-5xl md:text-7xl font-bold mb-2 text-gradient text-shadow-lg">
            MtaaDuka
          </h1>
          <p className="text-xl text-gray-300">Discover Amazing Products</p>
        </div>
        
        {/* ✅ Seller Dashboard Link - Only shows for sellers */}
        <div className="flex items-center gap-4">
          {isSeller ? (
            <Link 
              href="/dashboard" 
              className="btn-dramatic px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
            >
              🏪 Seller Dashboard
            </Link>
          ) : session?.user ? (
            // Show buyer profile link if logged in as buyer
            <span className="text-gray-400 text-sm">
              Welcome, {session.user.name}
            </span>
          ) : (
            // Show login link for guests
            <Link 
              href="/auth/login" 
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any, index: number) => (
            <Link 
              key={product._id} 
              href={`/products/${product.productId}`}
              className="block fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="product-card-dramatic h-full">
                <div className="relative h-56 overflow-hidden">
                  {product.images?.[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="product-image w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-600/30 to-gray-700/30 flex items-center justify-center">
                      <span className="text-5xl">📦</span>
                    </div>
                  )}
                  {product.stock < 10 && product.stock > 0 && (
                    <div className="absolute top-3 right-3 badge-dramatic">
                      Only {product.stock} left
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 capitalize">
                    {product.category}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">
                      KES {product.price?.toLocaleString()}
                    </span>
                    {product.stock > 0 ? (
                      <span className="text-green-400 text-xs font-semibold">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-red-400 text-xs font-semibold">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 float-animation">🛍️</div>
            <p className="text-xl text-gray-300">No products yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}