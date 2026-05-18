// app/products/page.tsx
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  let products: any[] = [];
  try {
    await connectDB();
    products = await Product.find({ active: true }).sort({ createdAt: -1 }).limit(20).lean();
  } catch (err) {
    console.error('Error:', err);
  }

  return (
    <div className="min-h-screen py-20 px-4">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mb-16 text-center fade-in-up">
        <h1 className="text-6xl md:text-8xl font-bold mb-6 text-gradient-gold text-shadow-lg">
          MtaaDuka
        </h1>
        <p className="text-2xl text-gray-300 mb-8">
          Discover Amazing Products
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product: any, index: number) => (
            <Link 
              key={product._id} 
              href={`/products/${product.productId}`}
              className="block fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="product-card-dramatic h-full">
                <div className="relative h-64 overflow-hidden">
                  {product.images?.[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="product-image w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <span className="text-6xl">📦</span>
                    </div>
                  )}
                  {product.stock < 10 && (
                    <div className="absolute top-4 right-4 badge-dramatic">
                      Only {product.stock} left!
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 capitalize">
                    {product.category}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-gradient">
                      KES {product.price?.toLocaleString()}
                    </span>
                    {product.stock > 0 ? (
                      <span className="text-green-400 text-sm font-semibold">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-red-400 text-sm font-semibold">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6 float-animation">🛍️</div>
            <p className="text-2xl text-gray-300">No products yet. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Wave Decoration */}
      <div className="wave-bg mt-20">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
        </svg>
      </div>
    </div>
  );
}