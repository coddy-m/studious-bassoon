import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import DashboardClient from './DashboardClient';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';

// Add these at the TOP of the file (after imports, before component)
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function SellerDashboardPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || 'Seller';

  // 📊 Stats Data (Replace with real DB queries later)
  const stats = [
    { label: 'Total Revenue', value: 'KES 245,000', change: '+12.5%', icon: '💰', bg: 'from-indigo-500/20 to-purple-500/20' },
    { label: 'Active Products', value: '24', change: '+3', icon: '📦', bg: 'from-blue-500/20 to-cyan-500/20' },
    { label: 'Pending Orders', value: '8', change: '+2', icon: '📋', bg: 'from-orange-500/20 to-red-500/20' },
    { label: 'Total Sales', value: '156', change: '+18%', icon: '📈', bg: 'from-green-500/20 to-emerald-500/20' },
  ];

  const recentOrders = [
    { id: 'ORD-1786', product: 'Samsung S25 Ultra', amount: 'KES 136,500', status: 'Paid', time: '2m ago' },
    { id: 'ORD-1785', product: 'iPhone 15 Pro', amount: 'KES 185,000', status: 'Pending', time: '1h ago' },
    { id: 'ORD-1784', product: 'MacBook Air M3', amount: 'KES 145,000', status: 'Shipped', time: '3h ago' },
    { id: 'ORD-1783', product: 'Sony WH-1000XM5', amount: 'KES 42,000', status: 'Paid', time: '5h ago' },
  ];

  return (
    <div className="space-y-8 fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gradient text-shadow-lg">Welcome back, {userName}</h2>
          <p className="text-gray-400 mt-1">Here's what's happening with your shop today.</p>
        </div>
        <Link 
          href="/dashboard/products/new" 
          className="btn-dramatic px-6 py-3 rounded-xl font-semibold text-center whitespace-nowrap"
        >
          + Add New Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-50 group-hover:opacity-70 transition-opacity`} />
            <div className="relative z-10">
              <div className="text-3xl mb-3">{stat.icon}</div>
              <p className="text-gray-300 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              <span className="text-green-400 text-xs font-semibold bg-green-500/10 px-2 py-1 rounded-full mt-2 inline-block">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-6">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="text-gray-300 hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="py-4 font-mono text-sm text-indigo-400">{order.id}</td>
                    <td className="py-4">{order.product}</td>
                    <td className="py-4 font-semibold text-white">{order.amount}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'Paid' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-500">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: Quick Actions & Progress */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/dashboard/products" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/15 rounded-xl text-gray-300 hover:text-white transition-all text-center font-medium border border-white/10">
                Manage Products
              </Link>
              <Link href="/dashboard/orders" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/15 rounded-xl text-gray-300 hover:text-white transition-all text-center font-medium border border-white/10">
                View All Orders
              </Link>
              <Link href="/dashboard/settings" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/15 rounded-xl text-gray-300 hover:text-white transition-all text-center font-medium border border-white/10">
                Shop Settings
              </Link>
            </div>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border-indigo-500/20">
            <h3 className="text-lg font-bold text-white mb-2">Shop Performance</h3>
            <p className="text-gray-400 text-sm mb-4">Your shop is performing well! Consider adding more products to boost sales.</p>
            <div className="w-full bg-gray-700/50 rounded-full h-2.5 mb-2">
              <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: '72%' }}></div>
            </div>
            <p className="text-xs text-gray-500">72% of monthly target reached</p>
          </div>
        </div>
      </div>
    </div>
  );
}