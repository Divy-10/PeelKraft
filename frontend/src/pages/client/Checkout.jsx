import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCreditCard } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import { orderApi, paymentApi, couponApi } from '../../api';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';

const Checkout = () => {
  const { items, getSubtotal, clearCart, getItemCount } = useCart();
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
    phone: user?.phone || '',
    addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India',
  });
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const subtotal = getSubtotal();
  const shipping = subtotal >= 499 ? 0 : 49;
  const total = subtotal - discount + shipping;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    } else if (items.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, items.length, navigate]);

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await couponApi.validate({ code: couponCode, subtotal });
      setDiscount(res.data.discount);
      setAppliedCoupon(res.data.code);
      toast.success(`Coupon applied! You save ₹${res.data.discount}`);
    } catch (err) {
      toast.error(err.message || 'Invalid coupon.');
      setDiscount(0);
      setAppliedCoupon('');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) return resolve(true);
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const placeOrder = async () => {
    if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.pincode) {
      return toast.error('Please fill all address fields.');
    }
    if (!agreeTerms) return toast.error('Please agree to the terms and conditions.');

    setLoading(true);
    try {
      if (paymentMethod === 'razorpay') {
        const rpRes = await paymentApi.createRazorpayOrder({ amount: total });
        const { orderId, keyId, isMock } = rpRes.data;

        if (isMock) {
          toast.info('Razorpay credentials not configured. Simulating successful checkout...');
          setTimeout(async () => {
            try {
              const orderRes = await orderApi.create({
                items: items.map((i) => ({ product: i._id, quantity: i.quantity })),
                shippingAddress: address,
                paymentMethod: 'razorpay',
                couponCode: appliedCoupon,
                deliveryNotes,
                razorpayOrderId: orderId,
                razorpayPaymentId: `pay_mock_${Date.now()}`,
                razorpaySignature: 'mock_signature',
              });

              await paymentApi.verifyPayment({
                razorpay_order_id: orderId,
                razorpay_payment_id: `pay_mock_${Date.now()}`,
                razorpay_signature: 'mock_signature',
                orderId: orderRes.data._id,
              });

              clearCart();
              navigate(`/order-success/${orderRes.data._id}`);
            } catch (err) {
              console.error('Simulation error:', err);
              toast.error(err.message || 'Order creation failed in simulation mode.');
            }
          }, 1500);
          return;
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) { toast.error('Failed to load payment gateway.'); setLoading(false); return; }

        const options = {
          key: keyId,
          amount: total * 100,
          currency: 'INR',
          name: 'PeelKraft',
          description: `Order - ${getItemCount()} items`,
          image: '/images/logo.png',
          order_id: orderId,
          handler: async (response) => {
            try {
              // Create order after payment
              const orderRes = await orderApi.create({
                items: items.map((i) => ({ product: i._id, quantity: i.quantity })),
                shippingAddress: address,
                paymentMethod: 'razorpay',
                couponCode: appliedCoupon,
                deliveryNotes,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              // Verify payment
              await paymentApi.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderRes.data._id,
              });

              clearCart();
              navigate(`/order-success/${orderRes.data._id}`);
            } catch (err) {
              console.error('Order creation error:', err);
              toast.error(err.message || 'Order creation failed after payment. Contact support.');
            }
          },
          prefill: { name: address.fullName, email: user?.email, contact: address.phone },
          theme: { color: '#F59E0B' },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', () => { toast.error('Payment failed. Please try again.'); setLoading(false); });
        razorpay.open();
        setLoading(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order.');
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition font-inter text-sm';

  return (
    <>
      <SEOHead title="Checkout" description="Complete your PeelKraft order." canonicalUrl="/checkout" />
      <section className="pt-32 pb-8 bg-cream-50">
        <div className="container-custom">
          <Breadcrumbs items={[{ label: 'Cart', path: '/cart' }, { label: 'Checkout' }]} />
          <h1 className="text-3xl font-poppins font-bold text-dark mt-4">Checkout</h1>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-cream-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left — Address & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-poppins font-bold text-dark mb-4 flex items-center gap-2"><FiMapPin className="text-primary-500" /> Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-medium text-gray-500 mb-1 font-inter">Full Name *</label><input name="fullName" value={address.fullName} onChange={handleAddressChange} required className={inputCls} /></div>
                  <div><label className="block text-xs font-medium text-gray-500 mb-1 font-inter">Phone *</label><input name="phone" value={address.phone} onChange={handleAddressChange} required className={inputCls} /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1 font-inter">Address Line 1 *</label><input name="addressLine1" value={address.addressLine1} onChange={handleAddressChange} required className={inputCls} /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1 font-inter">Address Line 2</label><input name="addressLine2" value={address.addressLine2} onChange={handleAddressChange} className={inputCls} /></div>
                  <div><label className="block text-xs font-medium text-gray-500 mb-1 font-inter">City *</label><input name="city" value={address.city} onChange={handleAddressChange} required className={inputCls} /></div>
                  <div><label className="block text-xs font-medium text-gray-500 mb-1 font-inter">State *</label><input name="state" value={address.state} onChange={handleAddressChange} required className={inputCls} /></div>
                  <div><label className="block text-xs font-medium text-gray-500 mb-1 font-inter">Pincode *</label><input name="pincode" value={address.pincode} onChange={handleAddressChange} required className={inputCls} /></div>
                  <div><label className="block text-xs font-medium text-gray-500 mb-1 font-inter">Country</label><input name="country" value={address.country} onChange={handleAddressChange} className={inputCls} /></div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1 font-inter">Delivery Notes (optional)</label>
                  <textarea value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} rows={2} className={inputCls} placeholder="Any special instructions..." />
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-poppins font-bold text-dark mb-4 flex items-center gap-2"><FiCreditCard className="text-primary-500" /> Payment Method</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-primary-500 bg-primary-50/50">
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                    <div>
                      <p className="font-semibold text-dark text-sm font-poppins">Pay Online (Razorpay)</p>
                      <p className="text-xs text-gray-500 font-inter">UPI, Credit/Debit Card, Net Banking, Wallets</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right — Order Summary */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-28">
                <h2 className="text-lg font-poppins font-bold text-dark mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-gray-50" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dark line-clamp-1 font-inter">{item.name}</p>
                        <p className="text-xs text-gray-500 font-inter">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-dark font-poppins">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="flex gap-2 mb-4">
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-inter focus:border-primary-500 outline-none" />
                  <button onClick={applyCoupon} className="px-4 py-2 bg-dark text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition font-poppins">Apply</button>
                </div>

                <div className="space-y-2 text-sm font-inter border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal}</span></div>
                  {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount}</span></div>}
                  <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                  <hr className="border-gray-100" />
                  <div className="flex justify-between text-dark font-bold text-base"><span>Total</span><span className="font-poppins text-lg">₹{total}</span></div>
                </div>

                <label className="flex items-start gap-2 mt-4 cursor-pointer">
                  <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-0.5 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                  <span className="text-xs text-gray-500 font-inter">I agree to the <a href="/terms-conditions" target="_blank" className="text-primary-500 underline">Terms & Conditions</a> and <a href="/privacy-policy" target="_blank" className="text-primary-500 underline">Privacy Policy</a></span>
                </label>

                <button onClick={placeOrder} disabled={loading || !agreeTerms} className="w-full mt-4 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20 font-poppins disabled:opacity-50">
                  {loading ? 'Processing...' : paymentMethod === 'razorpay' ? `Pay ₹${total}` : 'Place Order (COD)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Checkout;
