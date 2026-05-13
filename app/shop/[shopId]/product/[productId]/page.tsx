'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, Share2, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import useCartStore from '@/store/cart';

interface ProductData {
  productId: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  stock: number;
}

export default function ProductPage() {
  const { shopId, productId } = useParams();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch(`/api/products?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      productId: product.productId,
      name: product.name,
      price: product.price,
      quantity: qty,
      shopId: shopId as string,
    });
    router.push(`/shop/${shopId}/cart`);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!product) return <div className="p-8 text-center">Product not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2"><ArrowLeft size={20} /></button>
          <span className="font-medium text-sm">Back to Shop</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="aspect-square bg-gray-100 relative">
            {product.images[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
            )}
          </div>
          <div className="p-4 space-y-3">
            <h1 className="text-xl font-bold">{product.name}</h1>
            {product.description && <p className="text-gray-600 text-sm">{product.description}</p>}
            <p className="text-2xl font-bold text-mtaa-700">KES {product.price.toLocaleString()}</p>

            <div className="flex items-center gap-3 py-2">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Minus size={16} />
              </button>
              <span className="font-bold w-8 text-center">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Plus size={16} />
              </button>
            </div>

            <button onClick={handleAddToCart} className="w-full bg-mtaa-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              <ShoppingCart size={18} /> Add to Cart
            </button>

            <button onClick={() => {
              if (navigator.share) navigator.share({ title: 'Check this product', url: window.location.href });
            }} className="w-full py-2 text-sm text-gray-500 flex items-center justify-center gap-2">
              <Share2 size={16} /> Share Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}