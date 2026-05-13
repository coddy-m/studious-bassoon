'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Package, ShoppingBag, TrendingUp, Plus, LogOut, Copy } from 'lucide-react';

type Props = {
  session: any;
  initialProducts: any[];
  initialOrders: any[];
};

export default function DashboardClient({ session, initialProducts, initialOrders }: Props) {
  const [products] = useState(initialProducts);
  const [orders] = useState(initialOrders);

  const shopUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/shop/${session.user.shopId}`;
  const paidOrders = orders.filter((o: any) => ['paid', 'shipped', 'delivered'].includes(o.status));
  const totalEarned = paidOrders.reduce((a: number, o: any) => a + (o.sellerPayout || 0), 0);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">My Shop</h1>
        <button onClick={() => signOut()} className="text-gray-500 p-2 hover:bg-gray-100 rounded">
          <LogOut size={20} />
        </button>
      </div>

      {/* Shop Link */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm font-medium text-green-800">Your Shop Link</p>
        <div className="flex gap-2 mt-2">
          <input readOnly value={shopUrl} className="flex-1 bg-white border rounded-lg px-3 py-2 text-sm text-gray-700" />
          <button
            onClick={() => {
              navigator.clipboard.writeText(shopUrl);
              alert('Copied!');
            }}
            className="bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 hover:bg-green-800"
          >
            <Copy size={14} /> Copy
          </button>
        </div>
        <p className="text-xs text-green-600 mt-2">Share this in WhatsApp groups!</p>
      </div>

      {/* Stats Grid - NOW CLICKABLE */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/dashboard/products" className="p-4 bg-white border rounded-lg text-center cursor-pointer hover:bg-gray-50 transition">
          <Package size={20} className="mx-auto text-gray-600 mb-1" />
          <p className="text-xl font-bold">{products.length}</p>
          <p className="text-xs text-gray-500">Products</p>
        </Link>
        
        <Link href="/dashboard/orders" className="p-4 bg-white border rounded-lg text-center cursor-pointer hover:bg-gray-50 transition">
          <ShoppingBag size={20} className="mx-auto text-blue-600 mb-1" />
          <p className="text-xl font-bold">{orders.length}</p>
          <p className="text-xs text-gray-500">Orders</p>
        </Link>
        
        <Link href="/dashboard/orders" className="p-4 bg-white border rounded-lg text-center cursor-pointer hover:bg-gray-50 transition">
          <TrendingUp size={20} className="mx-auto text-purple-600 mb-1" />
          <p className="text-xl font-bold">KES {(totalEarned / 1000).toFixed(1)}K</p>
          <p className="text-xs text-gray-500">Earned</p>
        </Link>
      </div>

      {/* Add Product Button */}
      <Link href="/dashboard/products/new" className="block w-full bg-green-600 text-white font-medium py-3 rounded-lg text-center hover:bg-green-700 transition">
        <span className="flex items-center justify-center gap-2">
          <Plus size={18} /> Add Product
        </span>
      </Link>

      {/* Recent Orders */}
      <h2 className="font-bold text-sm text-gray-500 uppercase tracking-wide">Recent Orders</h2>
      <div className="space-y-2">
        {orders.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No orders yet</p>
        ) : (
          orders.slice(0, 5).map((order: any) => (
            <div key={order.orderId} className="p-4 bg-white border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{order.orderId}</p>
                <p className="text-xs text-gray-500">{order.buyerName || order.buyerPhone}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">KES {order.total}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${['paid', 'delivered'].includes(order.status) ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}