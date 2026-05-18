'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {  session, status } = useSession();
  
  const productId = searchParams.get('productId');
  const sellerId = searchParams.get('sellerId');
  
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState(session?.user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!sellerId || sellerId === 'undefined') {
      setError('❌ Seller information missing');
      return;
    }
    if (productId) {
      fetch(`/api/products/${productId}`)
        .then(res => res.json())
        .then(data => setProduct(data))
        .catch(() => setError('Failed to load product'));
    }
  }, [productId, sellerId]);

  const handleSTKPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerId || sellerId === 'undefined') { setError('Seller ID invalid'); return; }
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?._id,
          sellerId,
          quantity,
          phone,
          totalAmount: product?.price * quantity,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('✅ Payment initiated! Check your phone.');
        setTimeout(() => router.push('/orders'), 3000);
      } else {
        setError(data.error || 'Payment failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-dramatic mx-auto mb-4" />
          <p className="text-xl text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient-sunset text-shadow-lg">
            Checkout
          </h1>
          <p className="text-xl text-gray-300">Complete Your Purchase</p>
        </div>

        {/* Order Summary Card */}
        <div className="checkout-card mb-8 fade-in-up">
          <h2 className="text-3xl font-bold mb-6 text-gradient-gold">Order Summary</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
              <span className="text-gray-300">Product</span>
              <span className="font-bold text-xl">{product.name}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
              <span className="text-gray-300">Unit Price</span>
              <span className="font-bold text-2xl text-gradient">KES {product.price?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
              <span className="text-gray-300">Quantity</span>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="input-dramatic w-24 text-center"
              />
            </div>
            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl border-2 border-purple-500/30">
              <span className="text-2xl font-bold">Total</span>
              <span className="text-4xl font-bold text-gradient-gold pulse-glow">
                KES {(product.price * quantity).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="checkout-card fade-in-up">
          <h2 className="text-3xl font-bold mb-6 text-gradient">M-Pesa Payment</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-500 rounded-xl text-red-200 animate-pulse">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border-2 border-green-500 rounded-xl text-green-200">
              {success}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              placeholder="254712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="input-dramatic"
            />
          </div>

          <button
            onClick={handleSTKPush}
            disabled={loading}
            className="btn-dramatic w-full text-xl py-6 mb-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              `Pay KES ${(product.price * quantity).toLocaleString()} with M-Pesa`
            )}
          </button>

          <button
            onClick={() => router.back()}
            className="w-full py-4 text-gray-400 hover:text-white transition-colors font-semibold"
          >
            Cancel Order
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 text-center">
          <div className="inline-block p-6 glass-card">
            <p className="text-gray-400 text-sm mb-2">🔒 Secure Payment</p>
            <p className="text-xs text-gray-500">Your transaction is encrypted and secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}