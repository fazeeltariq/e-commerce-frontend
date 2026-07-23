import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Calendar,
  ChevronRight,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  PlusCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  // Fetch dashboard stats
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await adminApi.getStats();
      return response.data;
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="container-custom pt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-black/20 border-t-black rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-black/40">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="container-custom pt-24">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-black">Failed to load dashboard</h2>
            <p className="text-black/40 mt-2">{error.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Stats cards
  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      gradient: 'from-emerald-500/10 to-emerald-500/5',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-500/10',
      change: '+12.5%',
      trend: 'up',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      gradient: 'from-blue-500/10 to-blue-500/5',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-500/10',
      change: '+8.2%',
      trend: 'up',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      gradient: 'from-purple-500/10 to-purple-500/5',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-500/10',
      change: '+15.3%',
      trend: 'up',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      gradient: 'from-amber-500/10 to-amber-500/5',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-500/10',
      change: '+3.1%',
      trend: 'up',
    },
  ];

  // Order status
  const orderStats = [
    { label: 'Pending', count: stats?.pendingOrders || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Confirmed', count: stats?.confirmedOrders || 0, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Shipped', count: stats?.shippedOrders || 0, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Delivered', count: stats?.deliveredOrders || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Cancelled', count: stats?.cancelledOrders || 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="pt-20 pb-16">
        <div className="container-custom">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-black/40 text-sm">Store overview</p>
                <span className="w-1 h-1 rounded-full bg-black/20" />
                <div className="flex items-center gap-1.5 text-xs text-black/30">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Live</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <div className="flex items-center gap-1.5 text-xs text-black/40 bg-white px-3 py-1.5 rounded-lg border border-black/5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Last 30 days</span>
              </div>
              <button className="text-xs bg-black text-white px-4 py-1.5 rounded-lg font-medium hover:bg-black/80 transition-colors">
                Export
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}
                  className="bg-white rounded-2xl p-5 border border-black/5 hover:border-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-black/40 font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold text-black mt-1 tracking-tight">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-black/30">vs last month</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions - NOW ABOVE RECENT ORDERS */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            <Link 
              to="/admin/products" 
              className="group bg-white rounded-2xl p-5 border border-black/5 hover:border-black/15 transition-all hover:-translate-y-0.5 hover:shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <Package className="w-5 h-5 text-black/40 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-black">Products</p>
                  <p className="text-xs text-black/30">Manage your catalog</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link 
              to="/admin/orders" 
              className="group bg-white rounded-2xl p-5 border border-black/5 hover:border-black/15 transition-all hover:-translate-y-0.5 hover:shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <ShoppingBag className="w-5 h-5 text-black/40 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-black">Orders</p>
                  <p className="text-xs text-black/30">Track & manage</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link 
              to="/admin/categories" 
              className="group bg-white rounded-2xl p-5 border border-black/5 hover:border-black/15 transition-all hover:-translate-y-0.5 hover:shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <PlusCircle className="w-5 h-5 text-black/40 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-black">Categories</p>
                  <p className="text-xs text-black/30">Organize products</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
            </Link>
          </motion.div>

          {/* Order Status & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Status */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="lg:col-span-1 bg-white rounded-2xl p-6 border border-black/5 hover:border-black/10 transition-all"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-black uppercase tracking-wider">Order Status</h3>
                <span className="text-xs text-black/30 bg-black/5 px-2 py-0.5 rounded-full">
                  {stats?.totalOrders || 0} total
                </span>
              </div>
              <div className="space-y-4">
                {orderStats.map((stat) => {
                  const Icon = stat.icon;
                  const total = stats?.totalOrders || 1;
                  const percentage = Math.round((stat.count / total) * 100);
                  
                  return (
                    <div key={stat.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
                            <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                          </div>
                          <span className="text-sm font-medium text-black/60">{stat.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-black">{stat.count}</span>
                          <span className="text-xs text-black/30">{percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${
                            stat.label === 'Pending' ? 'bg-yellow-500' :
                            stat.label === 'Confirmed' ? 'bg-blue-500' :
                            stat.label === 'Shipped' ? 'bg-purple-500' :
                            stat.label === 'Delivered' ? 'bg-green-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="lg:col-span-2 bg-white rounded-2xl p-6 border border-black/5 hover:border-black/10 transition-all"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-black uppercase tracking-wider">Recent Orders</h3>
                <Link to="/admin/orders" className="text-xs text-black/40 hover:text-black transition-colors flex items-center gap-1 group">
                  View All
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="space-y-2">
                  {stats.recentOrders.slice(0, 5).map((order, index) => (
                    <div key={index} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-black/5 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-xs font-medium text-black/60 shrink-0">
                          {order.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-black truncate">
                            {order.user?.name || 'Customer'}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-black/40">
                              #{order._id.slice(-8).toUpperCase()}
                            </p>
                            <span className="w-1 h-1 rounded-full bg-black/10" />
                            <span className="text-xs text-black/30">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          order.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
                          order.status === 'Confirmed' ? 'bg-blue-50 text-blue-600' :
                          order.status === 'Shipped' ? 'bg-purple-50 text-purple-600' :
                          order.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {order.status}
                        </span>
                        <span className="text-sm font-semibold text-black">
                          ${order.totalPrice?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-black/30 text-sm">No recent orders</div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;