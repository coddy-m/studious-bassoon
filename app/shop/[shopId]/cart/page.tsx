'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useCartStore, { CartItem } from '@/store/cart';
import { Trash2, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { shopId } = useParams();
  const router = useRouter();
  const { items, removeItem, clearCart, total } = useCartStore();
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const shopItems = items.filter((i: CartItem) => i.shopId === shopId);
  const shopTotal = total(shopId as string);

  const handleCheckout = async () => {
    if (!buyerPhone || shopItems.length === 0) return;
    setLoading(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopId,
        buyerPhone,
        buyerName,
        items: shopItems.map((i: CartItem) => ({ productId: i.productId, quantity: i.quantity })),
        deliveryLocation: location,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      alert('M-Pesa STK Push sent! Enter PIN.');
      clearCart();
    } else {
      alert(data.error || 'Checkout failed');
    }
  };

  if (shopItems.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <button onClick={() => router.push(`/shop/${shopId}`)} className="mt-4 btn-primary">Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <h1 className="text-xl font-bold mb-4">Cart ({shopItems.length})</h1>
      <div className="space-y-3 mb-6">
        {shopItems.map((item: CartItem) => (
          <div key={item.productId} className="card flex justify-between items-center">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">Qty: {item.quantity} × KES {item.price}</p>
            </div>
            <button onClick={() => removeItem(item.productId)} className="text-red-500 p-2"><Trash2 size={18} /></button>
          </div>
        ))}
        <div className="text-right font-bold text-lg">Total: KES {shopTotal.toLocaleString()}</div>
      </div>

      <div className="card space-y-3">
        <input placeholder="Your Name" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        <input placeholder="M-Pesa Number (07XX XXX XXX)" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
        <input placeholder="Delivery Location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        <button onClick={handleCheckout} disabled={loading || !buyerPhone} className="w-full bg-mtaa-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
          {loading ? 'Processing...' : <>Pay KES {shopTotal.toLocaleString()} <ArrowRight size={18} /></>}
        </button>
      </div>
    </div>
  );
}