import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPackage, FiTag, FiFileText, FiBookOpen, FiHelpCircle,
  FiMessageSquare, FiMail, FiStar, FiChevronRight, FiTrendingUp, FiMousePointer, FiUsers
} from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { dashboardApi } from '../../api';
import { formatDateShort } from '../../utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
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
        setStats(statsRes.data);
        setCharts(chartsRes.data);
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
    { title: 'Total Products', value: stats?.products || 0, icon: FiPackage, color: 'bg-blue-500', link: '/admin/products' },
    { title: 'Categories', value: stats?.categories || 0, icon: FiTag, color: 'bg-emerald-500', link: '/admin/categories' },
    { title: 'Blog Articles', value: stats?.blogs || 0, icon: FiFileText, color: 'bg-purple-500', link: '/admin/blogs' },
    { title: 'Website Visitors', value: stats?.visitors || 0, icon: FiUsers, color: 'bg-indigo-500', link: '#' },
    { title: 'Amazon Clicks', value: stats?.amazonClicks || 0, icon: FiMousePointer, color: 'bg-orange-500', link: '#' },
    { title: 'Newsletter Subscribers', value: stats?.subscribers || 0, icon: FiMail, color: 'bg-rose-500', link: '/admin/newsletter' },
    { title: 'Inquiries Inbox', value: stats?.unreadMessages || 0, icon: FiMessageSquare, color: 'bg-teal-500', link: '/admin/contacts' },
  ];

  const chartData = {
    labels: charts?.monthly?.months || [],
    datasets: [
      {
        fill: true,
        label: 'Page Views',
        data: charts?.monthly?.pageViews || [],
        borderColor: '#1E7A34',
        backgroundColor: 'rgba(30, 122, 52, 0.1)',
        tension: 0.4,
      },
      {
        fill: true,
        label: 'Amazon Redirect Clicks',
        data: charts?.monthly?.amazonClicks || [],
        borderColor: '#F7931E',
        backgroundColor: 'rgba(247, 147, 30, 0.1)',
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { fontFamily: 'Inter' } }
      },
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="space-y-8">
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
                <p className="text-3xl font-poppins font-bold text-dark">{card.value}</p>
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

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100">
        <h3 className="text-lg font-poppins font-bold text-dark mb-6">Traffic & Engagement Analytics</h3>
        <div className="h-64 sm:h-80 md:h-96">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Split grid for lists */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Performing Products */}
        <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100">
          <h3 className="text-lg font-poppins font-bold text-dark mb-4">Popular Products</h3>
          <div className="divide-y divide-gray-100">
            {charts?.topProducts?.map((product) => (
              <div key={product._id} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={product.thumbnail?.url || 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=100'}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-sm text-dark line-clamp-1">{product.name}</h4>
                    <p className="text-xs text-gray-400">{product.views} Product Views</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary-500">{product.amazonClicks}</p>
                  <p className="text-xs text-gray-400">Amazon Clicks</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Contact Messages */}
        <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100">
          <h3 className="text-lg font-poppins font-bold text-dark mb-4 flex items-center justify-between">
            <span>Recent Inquiries</span>
            <Link to="/admin/contacts" className="text-xs text-primary-500 hover:underline">View Inbox</Link>
          </h3>
          <div className="divide-y divide-gray-100">
            {charts?.recentContacts?.map((message) => (
              <div key={message._id} className="py-4 space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm text-dark">{message.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    message.status === 'unread' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
                  }`}>
                    {message.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{message.email} • {formatDateShort(message.createdAt)}</p>
                <p className="text-sm text-gray-600 line-clamp-1 italic">"{message.message}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
