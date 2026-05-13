import Link from 'next/link';
import { ShoppingBag, MessageCircle, TrendingUp, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold text-mtaa-900 mb-2">MtaaDuka</h1>
        <p className="text-lg text-gray-600 mb-8">Your shop link. M-Pesa checkout. Zero hassle.</p>
        
        <div className="flex flex-col gap-3 mb-12">
          <Link href="/seller/start" className="btn-primary text-lg py-3">Start Selling Free</Link>
          <p className="text-sm text-gray-500">No app download. No monthly fees. Just 2% per sale.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="card">
            <ShoppingBag className="text-mtaa-600 mb-2" size={24} />
            <h3 className="font-bold text-sm">Your Shop Link</h3>
            <p className="text-xs text-gray-500 mt-1">Share anywhere. WhatsApp, SMS, Facebook.</p>
          </div>
          <div className="card">
            <MessageCircle className="text-mtaa-600 mb-2" size={24} />
            <h3 className="font-bold text-sm">M-Pesa Built-In</h3>
            <p className="text-xs text-gray-500 mt-1">Buyers pay in 2 taps. You get alerts on WhatsApp.</p>
          </div>
          <div className="card">
            <TrendingUp className="text-mtaa-600 mb-2" size={24} />
            <h3 className="font-bold text-sm">Track Everything</h3>
            <p className="text-xs text-gray-500 mt-1">Stock, orders, and payouts in one place.</p>
          </div>
          <div className="card">
            <Shield className="text-mtaa-600 mb-2" size={24} />
            <h3 className="font-bold text-sm">Trusted</h3>
            <p className="text-xs text-gray-500 mt-1">Reviews, receipts, and dispute protection.</p>
          </div>
        </div>
      </div>
    </div>
  );
}