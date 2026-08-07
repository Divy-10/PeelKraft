import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSearch, FiShoppingCart, FiUser, FiHeart, FiLogOut } from 'react-icons/fi';
import { useSettings } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Products', path: '/products' },
  { name: 'Sustainability', path: '/sustainability' },
  { name: 'Blog', path: '/blogs' },
  { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getItemCount } = useCart();
  const { isAuthenticated, user, logout } = useUser();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const cartCount = getItemCount();

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-500 bg-cream-50/90 backdrop-blur-md border-b border-cream-200/40 ${
          scrolled ? 'py-2.5 shadow-[0_4px_30px_rgba(30,37,30,0.03)]' : 'py-4'
        }`}
      >
        <div className="container-custom">
          <nav className="flex items-center justify-between h-12">
            {/* Official Logo */}
            <Link to="/" className="flex items-center group shrink-0">
              <img
                src="/images/logo.png"
                alt="PeelKraft"
                className="h-8 md:h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </Link>

            {/* Desktop Nav - Uncluttered, Spacious, Single Line */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative py-1 font-sans font-medium text-[14px] uppercase tracking-wider transition-colors duration-300 ${
                    isActive(link.path)
                      ? 'text-dark'
                      : 'text-gray-500 hover:text-dark'
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="active-nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-primary-500"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <Link
                to="/search"
                className="p-2.5 rounded-full hover:bg-cream-100 text-dark transition-colors hidden md:flex"
                aria-label="Search"
              >
                <FiSearch className="w-4.5 h-4.5" />
              </Link>

              {/* Wishlist Link */}
              {isAuthenticated && (
                <Link
                  to="/wishlist"
                  className="p-2.5 rounded-full hover:bg-cream-100 text-dark transition-colors flex"
                  aria-label="Wishlist"
                >
                  <FiHeart className="w-4.5 h-4.5" />
                </Link>
              )}

              {/* Cart link with badge */}
              <Link
                to="/cart"
                className="p-2.5 rounded-full hover:bg-cream-100 text-dark transition-colors relative"
                aria-label="Cart"
              >
                <FiShoppingCart className="w-4.5 h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-sans">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Account / Login link */}
              {isAuthenticated ? (
                <div className="relative group hidden md:block">
                  <button
                    className="flex items-center gap-2 px-4 py-2 border border-cream-200/60 hover:border-cream-200 rounded-full text-xs font-semibold text-dark font-sans tracking-wide uppercase transition bg-white"
                  >
                    <FiUser className="w-3.5 h-3.5 text-primary-500" />
                    <span>{user?.firstName || 'Account'}</span>
                  </button>
                  {/* Dropdown containing details */}
                  <div className="absolute right-0 pt-2 w-56 hidden group-hover:block z-50">
                    <div className="bg-white border border-cream-100 rounded-2xl shadow-premium py-2.5 text-xs font-sans overflow-hidden">
                      <div className="px-5 py-3 border-b border-cream-100 bg-cream-50/50">
                        <p className="font-semibold text-dark text-xs uppercase tracking-wide">{user?.firstName} {user?.lastName}</p>
                        <p className="text-gray-400 text-[11px] truncate mt-0.5">{user?.email}</p>
                      </div>
                      <div className="p-1 space-y-0.5">
                        <Link to="/my-profile" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-cream-50 text-gray-700 font-medium transition">
                          <FiUser className="w-3.5 h-3.5" /> My Profile
                        </Link>
                        <Link to="/my-orders" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-cream-50 text-gray-700 font-medium transition">
                          <FiShoppingCart className="w-3.5 h-3.5" /> My Orders
                        </Link>
                        <hr className="border-cream-100 my-1 mx-2" />
                        <button
                          onClick={logout}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 rounded-lg hover:bg-red-50 text-red-500 font-semibold transition"
                        >
                          <FiLogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-dark text-white rounded-full text-xs font-semibold font-sans tracking-wider uppercase hover:bg-green-800 transition-all duration-300"
                >
                  <FiUser className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 rounded-full hover:bg-cream-100 text-dark transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <FiX className="w-5.5 h-5.5" /> : <FiMenu className="w-5.5 h-5.5" />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Slide-in Drawer */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm lg:hidden"
              />
              {/* Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-screen h-[100dvh] z-[1001] w-80 max-w-[85vw] bg-cream-50 shadow-2xl p-6 flex flex-col lg:hidden border-l border-cream-200"
              >
                {/* Header inside drawer */}
                <div className="flex items-center justify-between pb-6 border-b border-cream-100 mb-6">
                  <span className="font-sans font-bold text-xs uppercase tracking-wider text-dark">Menu</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-cream-100 text-dark transition-colors"
                    aria-label="Close menu"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                {/* Search Bar inside Drawer */}
                <div className="mb-6 relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-cream-200/80 rounded-full text-xs font-sans focus:outline-none focus:border-primary-500 transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        navigate(`/search?q=${encodeURIComponent(e.target.value.trim())}`);
                        setIsOpen(false);
                      }
                    }}
                  />
                </div>
                {/* Links */}
                <div className="flex-1 space-y-1 overflow-y-auto">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        className={`block px-4 py-3 rounded-lg font-sans font-medium text-xs uppercase tracking-wider transition-all ${
                          isActive(link.path)
                            ? 'bg-white border-l-2 border-primary-500 text-primary-500 font-semibold'
                            : 'text-gray-600 hover:bg-white/50'
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                  
                  {isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navLinks.length * 0.05 }}
                    >
                      <Link
                        to="/wishlist"
                        className={`block px-4 py-3 rounded-lg font-sans font-medium text-xs uppercase tracking-wider transition-all ${
                          isActive('/wishlist') ? 'bg-white border-l-2 border-primary-500 text-primary-500 font-semibold' : 'text-gray-600 hover:bg-white/50'
                        }`}
                      >
                        Wishlist
                      </Link>
                    </motion.div>
                  )}
                </div>
                {/* Action button at bottom */}
                <div className="pt-6 border-t border-cream-200 mt-auto">
                  {isAuthenticated ? (
                    <Link
                      to="/my-profile"
                      className="flex bg-dark text-white rounded-full w-full justify-center py-3 text-xs font-semibold font-sans tracking-widest uppercase hover:bg-green-800 transition"
                    >
                      My Profile
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="flex bg-dark text-white rounded-full w-full justify-center py-3 text-xs font-semibold font-sans tracking-widest uppercase hover:bg-green-800 transition"
                    >
                      Login / SignUp
                    </Link>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Navbar;
