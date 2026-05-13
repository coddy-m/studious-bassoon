'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, RefreshCw, Phone } from 'lucide-react';

type Props = {
  initialOrders: any[];
};

export default function OrdersClient({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [refreshing, setRefreshing] = useState(false);

  // Function to update status locally
  const updateStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
    );
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <p className="text-gray-500">No orders yet. Share your shop link!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">Order History</h1>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
          disabled={refreshing}
        >
          <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order: any) => (
          <div key={order.orderId} className="bg-white border rounded-xl p-4 space-y-3">
            {/* Top Row: ID & Status */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg">{order.orderId}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                order.status === 'paid' || order.status === 'delivered'
                  ? 'bg-emerald-100 text-emerald-700'
                  : order.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {order.status}
              </span>
            </div>

            {/* Customer Info */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone size={14} />
              <span>{order.buyerName || order.buyerPhone}</span>
            </div>

            {/* Items List */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span className="font-medium">KES {item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Total & Actions */}
            <div className="flex justify-between items-center pt-2 border-t">
              <p className="font-bold text-xl">KES {order.total}</p>
              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <button 
                    onClick={() => updateStatus(order.orderId, 'paid')}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    Mark Paid
                  </button>
                )}
                {order.status === 'paid' && (
                  <button 
                    onClick={() => updateStatus(order.orderId, 'delivered')}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}