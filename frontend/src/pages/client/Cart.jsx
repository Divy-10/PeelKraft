import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiTrash2, FiPlus, FiMinus, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getSubtotal, getItemCount } = useCart();
  const subtotal = getSubtotal();
  const shipping = subtotal >= 499 ? 0 : 49;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <>
        <SEOHead title="Shopping Cart" description="View items in your PeelKraft shopping cart." canonicalUrl="/cart" />
        <section className="min-h-[60vh] flex items-center justify-center bg-cream-50 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <FiShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h1 className="text-2xl font-poppins font-bold text-dark mb-2">Your Cart is Empty</h1>
            <p className="text-gray-500 font-inter mb-8">Add some products to get started!</p>
            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/20 font-poppins">
              <FiArrowLeft className="w-5 h-5" /> Browse Products
            </Link>
          </motion.div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Shopping Cart" description="Review your cart items before checkout." canonicalUrl="/cart" />
      <section className="pt-32 pb-8 bg-cream-50">
        <div className="container-custom">
          <Breadcrumbs items={[{ label: 'Cart' }]} />
          <h1 className="text-3xl font-poppins font-bold text-dark mt-4">Shopping Cart <span className="text-gray-400 text-lg font-normal">({getItemCount()} items)</span></h1>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-cream-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 flex gap-4 md:gap-6 items-center shadow-sm"
                >
                  <Link to={`/products/${item.slug}`} className="shrink-0">
                    <img src={item.image} alt={item.name} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl bg-gray-50" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.slug}`} className="font-poppins font-semibold text-dark hover:text-primary-500 transition-colors line-clamp-1">{item.name}</Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-dark font-poppins">₹{item.price}</span>
                      {item.mrp > item.price && (
                        <span className="text-sm text-gray-400 line-through font-inter">₹{item.mrp}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1} className="px-2.5 py-1.5 hover:bg-gray-50 disabled:opacity-30 transition">
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1.5 font-semibold text-sm font-inter border-x border-gray-200 min-w-[40px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-2.5 py-1.5 hover:bg-gray-50 transition">
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-600 transition ml-auto p-2" title="Remove">
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="hidden md:block text-right">
                    <span className="text-lg font-bold text-dark font-poppins">₹{item.price * item.quantity}</span>
                  </div>
                </motion.div>
              ))}

              <Link to="/products" className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold font-inter text-sm mt-4 transition">
                <FiArrowLeft className="w-4 h-4" /> Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-28">
                <h2 className="text-lg font-poppins font-bold text-dark mb-6">Order Summary</h2>
                <div className="space-y-3 text-sm font-inter">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({getItemCount()} items)</span>
                    <span className="font-semibold text-dark">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-dark'}`}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-primary-500 font-inter">Add ₹{499 - subtotal} more for free shipping!</p>
                  )}
                  <hr className="border-gray-100 my-2" />
                  <div className="flex justify-between text-dark font-bold text-base">
                    <span>Total</span>
                    <span className="font-poppins text-lg">₹{total}</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="block w-full text-center mt-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20 font-poppins"
                >
                  Proceed to Checkout
                </Link>
                <p className="text-center text-xs text-gray-400 mt-3 font-inter">🔒 Secure checkout with Razorpay</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Cart;
