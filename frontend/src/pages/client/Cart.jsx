import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiTrash2, FiPlus, FiMinus, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { productApi } from '../../api';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, updateCartStocks, getSubtotal, getItemCount } = useCart();
  const { settings } = useSettings();
  const [freshStocks, setFreshStocks] = useState({});
  const [checkingStock, setCheckingStock] = useState(true);

  useEffect(() => {
    const checkStock = async () => {
      try {
        const results = await Promise.all(
          items.map(item => productApi.getBySlug(item.slug)
            .then(res => ({ id: item._id, fresh: res.data }))
            .catch(() => ({ id: item._id, fresh: null }))
          )
        );
        const stockMap = {};
        results.forEach(({ id, fresh }) => {
          stockMap[id] = fresh;
        });
        setFreshStocks(stockMap);
        updateCartStocks(stockMap);
      } catch (err) {
        console.error('Error checking stock:', err);
      } finally {
        setCheckingStock(false);
      }
    };
    if (items.length > 0) {
      checkStock();
    } else {
      setCheckingStock(false);
    }
  }, []);

  const getMaxAvailableStock = (item) => {
    const fresh = freshStocks[item._id];
    if (!fresh) return item.stock || 999;
    const trackInventory = fresh.trackInventory !== false;
    if (!trackInventory) return 999;
    if (item.packageOptionId && fresh.packageOptions && fresh.packageOptions.length > 0) {
      const opt = fresh.packageOptions.find(o => o._id.toString() === item.packageOptionId);
      return opt ? (opt.stock ?? 0) : 0;
    }
    return fresh.stock ?? 0;
  };

  const getIsItemOutOfStock = (item) => {
    const maxStock = getMaxAvailableStock(item);
    return maxStock <= 0 || item.quantity > maxStock;
  };

  const hasOutOfStockItems = items.some(item => getIsItemOutOfStock(item));

  const subtotal = getSubtotal();
  const threshold = settings?.freeShippingMinAmount !== undefined ? Number(settings.freeShippingMinAmount) : 499;
  const defaultShipping = settings?.shippingCharge !== undefined ? Number(settings.shippingCharge) : 49;
  const shipping = subtotal >= threshold ? 0 : defaultShipping;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <>
        <SEOHead title="Shopping Cart" description="View items in your PeelKraft shopping cart." canonicalUrl="/cart" />
        <section className="min-h-[70vh] flex items-center justify-center bg-cream-50 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h1 className="text-2xl font-serif text-dark mb-3">Your Cart is Empty</h1>
            <p className="text-gray-400 font-sans text-xs tracking-wide mb-8">Add some products to get started!</p>
            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3.5 bg-dark text-white rounded-full text-xs font-semibold font-sans tracking-widest uppercase hover:bg-green-800 transition shadow-premium">
              <FiArrowLeft className="w-4 h-4" /> Browse Products
            </Link>
          </motion.div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Shopping Cart" description="Review your cart items before checkout." canonicalUrl="/cart" />
      <section className="pt-36 pb-8 bg-cream-50 border-b border-cream-200/30">
        <div className="container-custom">
          <Breadcrumbs items={[{ label: 'Cart' }]} />
          <h1 className="text-3xl font-serif text-dark mt-4">Shopping Cart <span className="text-gray-400 text-sm font-sans font-normal uppercase tracking-wider">({getItemCount()} items)</span></h1>
        </div>
      </section>

      <section className="py-12 bg-cream-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-cream-200/50 p-5 flex gap-4 md:gap-6 items-center shadow-sm"
                >
                  <Link to={`/products/${item.slug}`} className="shrink-0 w-20 h-20 md:w-24 md:h-24 bg-cream-50 rounded-xl border border-cream-200/60 overflow-hidden flex items-center justify-center p-2">
                    <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.slug}`} className="font-serif text-dark hover:text-primary-500 transition-colors text-base line-clamp-1">{item.name}</Link>
                    {item.packageName && (
                      <span className="inline-block mt-1 px-2.5 py-0.5 bg-cream-50 border border-cream-200 text-primary-500 font-sans font-bold text-[9px] uppercase tracking-wider rounded-full">{item.packageName}</span>
                    )}
                    {getIsItemOutOfStock(item) ? (
                      <p className="text-xs text-red-500 font-semibold font-sans mt-1">This product is sold out.</p>
                    ) : getMaxAvailableStock(item) < item.quantity ? (
                      <p className="text-xs text-red-500 font-semibold font-sans mt-1">Only {getMaxAvailableStock(item)} available.</p>
                    ) : null}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-sans font-bold text-dark text-sm md:text-base">₹{item.price}</span>
                      {item.mrp > item.price && (
                        <span className="text-xs text-gray-400 line-through font-sans">₹{item.mrp}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-cream-200 rounded-full bg-cream-50 p-0.5">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1} className="px-2.5 py-1 hover:bg-white rounded-full disabled:opacity-30 transition text-xs font-bold">
                          -
                        </button>
                        <span className="px-3 py-1 font-semibold text-xs font-sans text-center min-w-[30px]">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)} 
                          disabled={item.quantity >= getMaxAvailableStock(item)}
                          className="px-2.5 py-1 hover:bg-white rounded-full disabled:opacity-30 transition text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item._id)} className="text-gray-400 hover:text-red-500 transition ml-auto p-2" title="Remove">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="hidden md:block text-right">
                    <span className="font-sans font-bold text-dark text-base">₹{item.price * item.quantity}</span>
                  </div>
                </motion.div>
              ))}

              <Link to="/products" className="inline-flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-widest text-primary-500 hover:text-dark transition-colors mt-4">
                <FiArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-2xl border border-cream-200/60 p-6 shadow-premium sticky top-28">
                <h2 className="text-base font-sans font-bold uppercase tracking-widest text-dark mb-6">Order Summary</h2>
                <div className="space-y-3.5 text-xs font-sans tracking-wide">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal ({getItemCount()} items)</span>
                    <span className="font-bold text-dark">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className={`font-bold ${shipping === 0 ? 'text-green-800' : 'text-dark'}`}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-[10px] text-primary-500 font-sans">Add ₹{threshold - subtotal} more for free shipping!</p>
                  )}
                  <hr className="border-cream-100 my-2" />
                  <div className="flex justify-between text-dark font-bold text-sm">
                    <span>Total</span>
                    <span className="font-sans text-base">₹{total}</span>
                  </div>
                </div>
                {hasOutOfStockItems ? (
                  <button
                    disabled
                    className="block w-full text-center mt-6 py-3.5 bg-cream-100 text-gray-400 font-semibold rounded-full cursor-not-allowed font-sans text-xs tracking-widest uppercase"
                  >
                    Unavailable Items in Cart
                  </button>
                ) : (
                  <Link
                    to="/checkout"
                    className="block w-full text-center mt-6 py-3.5 bg-dark text-white hover:bg-green-800 font-semibold rounded-full font-sans text-xs tracking-widest uppercase transition shadow-premium"
                  >
                    Proceed to Checkout
                  </Link>
                )}
                <p className="text-center text-[10px] text-gray-400 mt-4 font-sans">🔒 Secure checkout with Razorpay</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Cart;
