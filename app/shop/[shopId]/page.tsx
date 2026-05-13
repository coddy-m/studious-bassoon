import { notFound } from 'next/navigation';
import Link from 'next/link';

interface ShopData {
  seller: {
    businessName: string;
    location: string;
    county: string;
    bio?: string;
    totalSales: number;
  };
  products: Array<{
    productId: string;
    name: string;
    price: number;
    comparePrice?: number;
    images: string[];
    stock: number;
    sold: number;
  }>;
}

async function getShop(shopId: string): Promise<ShopData | null> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/products?shopId=${shopId}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ShopPage({ params }: { params: { shopId: string } }) {
  const data = await getShop(params.shopId);
  if (!data) return notFound();

  const { seller, products } = data;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-mtaa-100 text-mtaa-700 flex items-center justify-center text-2xl font-bold">
              {seller.businessName[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold">{seller.businessName}</h1>
              <p className="text-sm text-gray-500">{seller.location}, {seller.county}</p>
              <p className="text-xs text-mtaa-600 mt-1">
                {seller.totalSales > 0 ? `${(seller.totalSales / 1000).toFixed(1)}K sold` : 'New seller'} • M-Pesa Accepted
              </p>
            </div>
          </div>
          {seller.bio && <p className="text-sm text-gray-600 mt-3">{seller.bio}</p>}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <Link key={product.productId} href={`/shop/${params.shopId}/product/${product.productId}`} 
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <div className="aspect-square bg-gray-100 relative">
                {product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                )}
                {product.stock < 3 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Low Stock</div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm truncate">{product.name}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-mtaa-700 font-bold">KES {product.price.toLocaleString()}</span>
                  {product.comparePrice && (
                    <span className="text-xs text-gray-400 line-through">KES {product.comparePrice.toLocaleString()}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{product.sold} sold</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-mtaa-700 text-white p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">Sell on MtaaDuka</p>
            <p className="text-xs text-mtaa-100">Your own shop link in 3 minutes</p>
          </div>
          <Link href="/seller/start" className="bg-white text-mtaa-700 px-4 py-2 rounded-full text-sm font-bold">Start Free</Link>
        </div>
      </div>
    </div>
  );
}