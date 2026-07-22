import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiPackage, FiTag, FiFileText, FiBookOpen, FiHelpCircle,
  FiMessageSquare, FiMail, FiStar, FiImage, FiSearch, FiSettings,
  FiLogOut, FiMenu, FiX, FiChevronDown, FiUsers, FiShoppingCart, FiPercent
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const sidebarItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
  { name: 'Orders', path: '/admin/orders', icon: FiShoppingCart },
  { name: 'Products', path: '/admin/products', icon: FiPackage },
  { name: 'Categories', path: '/admin/categories', icon: FiTag },
  { name: 'Coupons', path: '/admin/coupons', icon: FiPercent },
  { name: 'Blogs', path: '/admin/blogs', icon: FiFileText },
  { name: 'FAQs', path: '/admin/faqs', icon: FiHelpCircle },
  { name: 'Testimonials', path: '/admin/testimonials', icon: FiStar },
  { name: 'Messages', path: '/admin/contacts', icon: FiMessageSquare },
  { name: 'Newsletter', path: '/admin/newsletter', icon: FiMail },
  { name: 'SEO', path: '/admin/seo', icon: FiSearch },
  { name: 'Settings', path: '/admin/settings', icon: FiSettings },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const getPageTitle = (path) => {
    if (path.includes('/admin/products/edit')) return 'Edit Product';
    if (path.includes('/admin/products/new')) return 'Add New Product';
    if (path.includes('/admin/blogs/edit')) return 'Edit Blog';
    if (path.includes('/admin/blogs/new')) return 'Add New Blog';
    const lastSeg = path.split('/').pop().replace(/-/g, ' ');
    return lastSeg || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-dark text-white shadow-xl z-50 transition-transform duration-300 overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-white font-poppins font-bold">
              P
            </div>
            <span className="font-poppins font-bold text-lg">
              Peel<span className="text-primary-500">Kraft</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:text-primary-500">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-inter font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary-500/20 text-primary-500'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* View Site Link */}
        <div className="p-4 border-t border-white/10 mt-auto">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            🌐 View Website
          </a>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <FiMenu className="w-5 h-5" />
              </button>
              <h2 className="font-poppins font-semibold text-lg text-dark capitalize">
                {getPageTitle(location.pathname)}
              </h2>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors"
              >
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                  {admin?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-dark">{admin?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-400 capitalize">{admin?.role || 'admin'}</p>
                </div>
                <FiChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                  >
                    <div className="p-3 border-b border-gray-50">
                      <p className="text-sm font-medium">{admin?.name}</p>
                      <p className="text-xs text-gray-400">{admin?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
