import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPackage, FiMail, FiMessageSquare, FiChevronRight, FiTrendingUp, FiShoppingCart, FiAlertTriangle, FiUsers
} from 'react-icons/fi';
import { dashboardApi } from '../../api';
import { formatDateShort } from '../../utils';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, chartsRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getCharts()
        ]);
        setStats(statsRes.data.data || statsRes.data);
        setCharts(chartsRes.data.data || chartsRes.data);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Sales Revenue', value: `₹${stats?.totalSales || 0}`, icon: FiTrendingUp, color: 'bg-emerald-500', link: '/admin/orders' },
    { title: 'Total Orders Placed', value: stats?.totalOrders || 0, icon: FiShoppingCart, color: 'bg-blue-500', link: '/admin/orders' },
    { title: 'Low Stock Products', value: stats?.lowStockProducts || 0, icon: FiAlertTriangle, color: 'bg-amber-500', link: '/admin/products' },
    { title: 'Registered Users', value: stats?.totalUsers || 0, icon: FiUsers, color: 'bg-purple-500', link: '#' },
  ];

  return (
    <div className="space-y-8 font-inter">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-lg transition-shadow border border-gray-100 flex items-center justify-between"
            >
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                <p className="text-2xl font-poppins font-bold text-dark">{card.value}</p>
                {card.link !== '#' && (
                  <Link to={card.link} className="inline-flex items-center gap-1 text-xs text-primary-500 font-semibold pt-2 hover:underline">
                    Manage <FiChevronRight />
                  </Link>
                )}
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.color} text-white flex items-center justify-center shadow-lg shadow-gray-100`}>
                <Icon className="w-6 h-6" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Split grid for lists */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100">
          <h3 className="text-lg font-poppins font-bold text-dark mb-4 flex justify-between items-center">
            <span>Recent Orders</span>
            <Link to="/admin/orders" className="text-xs text-primary-500 hover:underline">View All</Link>
          </h3>
          <div className="divide-y divide-gray-100">
            {charts?.recentOrders && charts.recentOrders.length > 0 ? (
              charts.recentOrders.map((order) => (
                <div key={order._id} onClick={() => navigate(`/admin/orders/${order._id}`)} className="py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 px-2 rounded-xl transition">
                  <div>
                    <h4 className="font-semibold text-sm text-dark">#{order.orderNumber}</h4>
                    <p className="text-xs text-gray-400 font-inter">{order.user?.firstName} {order.user?.lastName} • {formatDateShort(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-dark">₹{order.grandTotal}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm py-4">No recent orders.</p>
            )}
          </div>
        </div>

        {/* Low Stock Warning Products */}
        <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100">
          <h3 className="text-lg font-poppins font-bold text-dark mb-4">Stock Warning Alert</h3>
          <div className="divide-y divide-gray-100">
            {charts?.topProducts && charts.topProducts.length > 0 ? (
              charts.topProducts.map((product) => (
                <div key={product._id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.thumbnail?.url || '/images/logo.png'}
                      alt={product.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-100 bg-gray-50 p-1"
                    />
                    <div>
                      <h4 className="font-semibold text-sm text-dark line-clamp-1">{product.name}</h4>
                      <p className="text-xs text-gray-400 font-inter">Alert trigger limit: {product.lowStockAlert} units</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-500">{product.stock} left</p>
                    <p className="text-xs text-gray-400 font-inter">Available stock</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm py-4">All products have sufficient stock levels.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
