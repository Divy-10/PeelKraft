import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSearch, FiShoppingCart, FiUser, FiHeart } from 'react-icons/fi';
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm' : 'bg-transparent py-5'
        }`}
      >
        <div className="container-custom">
          <nav className="flex items-center justify-between h-12">
            {/* Official Logo */}
            <Link to="/" className="flex items-center group shrink-0">
              <img
                src="/images/logo.png"
                alt="PeelKraft"
                className="h-9 md:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Nav - Uncluttered, Spacious, Single Line */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative py-1 font-inter font-medium text-[15px] whitespace-nowrap transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'text-dark'
                      : 'text-gray-500 hover:text-dark'
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="active-nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F7931E] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                to="/search"
                className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
                aria-label="Search"
              >
                <FiSearch className="w-5 h-5" />
              </Link>

              {/* Wishlist Link */}
              {isAuthenticated && (
                <Link
                  to="/wishlist"
                  className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors hidden sm:flex"
                  aria-label="Wishlist"
                >
                  <FiHeart className="w-5 h-5" />
                </Link>
              )}

              {/* Cart link with badge */}
              <Link
                to="/cart"
                className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors relative"
                aria-label="Cart"
              >
                <FiShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-poppins">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Account / Login link */}
              {isAuthenticated ? (
                <div className="relative group hidden md:block">
                  <button
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:border-gray-300 rounded-xl text-sm font-semibold text-dark font-poppins transition bg-white"
                  >
                    <FiUser className="w-4 h-4 text-primary-500" />
                    <span>{user?.firstName || 'Account'}</span>
                  </button>
                  {/* Dropdown containing details */}
                  <div className="absolute right-0 pt-2 w-56 hidden group-hover:block z-50">
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl py-3 text-sm font-inter overflow-hidden">
                      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="font-poppins font-bold text-dark text-sm">{user?.firstName} {user?.lastName}</p>
                        <p className="text-gray-400 text-xs truncate mt-0.5">{user?.email}</p>
                      </div>
                      <div className="p-1.5 space-y-1">
                        <Link to="/my-profile" className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-primary-50 hover:text-primary-600 text-gray-700 font-medium transition">
                          <FiUser className="w-4 h-4" /> My Profile
                        </Link>
                        <Link to="/my-orders" className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-primary-50 hover:text-primary-600 text-gray-700 font-medium transition">
                          <FiShoppingCart className="w-4 h-4" /> My Orders
                        </Link>
                        <hr className="border-gray-100 my-1.5 mx-2" />
                        <button
                          onClick={logout}
                          className="flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-50 text-red-500 font-semibold transition"
                        >
                          <FiLogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-dark text-white rounded-xl text-sm font-semibold font-poppins hover:bg-gray-800 transition"
                >
                  <FiUser className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
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
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              />
              {/* Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl p-6 flex flex-col lg:hidden border-l border-gray-100"
              >
                {/* Header inside drawer */}
                <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                  <span className="font-poppins font-bold text-lg text-dark">Menu</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
                    aria-label="Close menu"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                {/* Links */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        className={`block px-4 py-3.5 rounded-xl font-poppins font-semibold transition-all text-base ${
                          isActive(link.path)
                            ? 'bg-primary-50 text-primary-500'
                            : 'text-gray-600 hover:bg-gray-50'
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
                        className={`block px-4 py-3.5 rounded-xl font-poppins font-semibold transition-all text-base ${
                          isActive('/wishlist') ? 'bg-primary-50 text-primary-500' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Wishlist
                      </Link>
                    </motion.div>
                  )}
                </div>
                {/* Action button at bottom */}
                <div className="pt-6 border-t border-gray-100 mt-auto">
                  {isAuthenticated ? (
                    <Link
                      to="/my-profile"
                      className="flex bg-dark text-white rounded-xl w-full justify-center py-3.5 text-base font-semibold font-poppins hover:bg-gray-800 transition"
                    >
                      My Profile
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="flex bg-dark text-white rounded-xl w-full justify-center py-3.5 text-base font-semibold font-poppins hover:bg-gray-800 transition"
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
