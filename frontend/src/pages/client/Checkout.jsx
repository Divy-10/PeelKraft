import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCreditCard } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import { useSettings } from '../../context/SettingsContext';
import { orderApi, paymentApi, couponApi, productApi } from '../../api';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';

const Checkout = () => {
  const { items, getSubtotal, clearCart, getItemCount } = useCart();
  const { user, isAuthenticated } = useUser();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    whatsapp: '',
    addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India',
  });
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const userFullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      const userPhone = user.mobileNumber || user.phone || '';
      
      const baseAddr = {
        fullName: userFullName,
        phone: userPhone,
        whatsapp: userPhone,
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      };

      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses.find((addr) => addr.isDefault) || user.addresses[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
          setAddress({
            ...baseAddr,
            addressLine1: defaultAddr.addressLine1 || '',
            addressLine2: defaultAddr.addressLine2 || '',
            city: defaultAddr.city || '',
            state: defaultAddr.state || '',
            pincode: defaultAddr.pincode || '',
            country: defaultAddr.country || 'India',
          });
        }
      } else {
        setSelectedAddressId('new');
        setAddress(baseAddr);
      }
    }
  }, [user]);

  const subtotal = getSubtotal();
  const threshold = settings?.freeShippingMinAmount !== undefined ? Number(settings.freeShippingMinAmount) : 499;
  const defaultShipping = settings?.shippingCharge !== undefined ? Number(settings.shippingCharge) : 49;
  const shipping = subtotal >= threshold ? 0 : defaultShipping;
  const total = subtotal - discount + shipping;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    } else if (items.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, items.length, navigate]);

  useEffect(() => {
    const fetchActiveCoupons = async () => {
      try {
        const res = await couponApi.getActive();
        console.log('Active coupons API response:', res.data);
        setActiveCoupons(res.data || []);
      } catch (err) {
        console.error('Failed to fetch coupons:', err);
        toast.error(`Coupons fetch failure: ${err.response?.data?.message || err.message || err}`);
      } finally {
        setCouponsLoading(false);
      }
    };
    fetchActiveCoupons();
  }, []);

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const applyCoupon = async (codeOverride) => {
    const code = codeOverride || couponCode;
    if (!code.trim()) return;
    try {
      const res = await couponApi.validate({ code, subtotal });
      setDiscount(res.data.discount);
      setAppliedCoupon(res.data.code);
      toast.success(`Coupon applied! You save ₹${res.data.discount}`);
    } catch (err) {
      toast.error(err.message || 'Invalid coupon.');
      setDiscount(0);
      setAppliedCoupon('');
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon('');
    setCouponCode('');
    toast.info('Coupon removed successfully.');
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

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr._id);
    const userFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    const userPhone = user?.mobileNumber || user?.phone || '';
    setAddress({
      fullName: userFullName,
      phone: userPhone,
      whatsapp: userPhone,
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      country: addr.country || 'India',
    });
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressId('new');
    const userFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    const userPhone = user?.mobileNumber || user?.phone || '';
    setAddress({
      fullName: userFullName,
      phone: userPhone,
      whatsapp: userPhone,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    });
  };

  const placeOrder = async () => {
    const userFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    const userPhone = user?.mobileNumber || user?.phone || '';
    
    address.fullName = userFullName;
    address.phone = userPhone;
    address.whatsapp = userPhone;

    if (!address.addressLine1 || !address.city || !address.state || !address.pincode) {
      return toast.error('Please fill all address fields.');
    }
    if (!agreeTerms) return toast.error('Please agree to the terms and conditions.');

    setLoading(true);

    // Verify stock levels from the database in real-time before paying
    try {
      const freshProducts = await Promise.all(
        items.map(item => productApi.getBySlug(item.slug)
          .then(res => ({ item, fresh: res.data }))
          .catch(() => ({ item, fresh: null }))
        )
      );

      for (const { item, fresh } of freshProducts) {
        if (!fresh) {
          setLoading(false);
          return toast.error(`Product ${item.name} is no longer available.`);
        }
        if (fresh.packageOptions && fresh.packageOptions.length > 0 && item.packageOptionId) {
          const opt = fresh.packageOptions.find(o => o._id.toString() === item.packageOptionId);
          if (!opt) {
            setLoading(false);
            return toast.error(`Selected option for ${item.name} is no longer available.`);
          }
          if (opt.status === 'disabled') {
            setLoading(false);
            return toast.error(`${item.name} (${opt.name}) is currently unavailable.`);
          }
          if (fresh.trackInventory && opt.stock < item.quantity) {
            setLoading(false);
            return toast.error(`Insufficient stock for ${item.name} (${opt.name}). Available: ${opt.stock}`);
          }
        } else {
          if (fresh.trackInventory && fresh.stock < item.quantity) {
            setLoading(false);
            return toast.error(`Insufficient stock for ${item.name}. Available: ${fresh.stock}`);
          }
        }
      }
    } catch (err) {
      console.error('Stock verification failed:', err);
      setLoading(false);
      return toast.error('Could not verify product availability. Please try again.');
    }
    try {
      if (paymentMethod === 'razorpay') {
        const rpRes = await paymentApi.createRazorpayOrder({ amount: total });
        const { orderId, keyId, isMock } = rpRes.data;

        if (isMock) {
          toast.info('Razorpay credentials not configured. Simulating successful checkout...');
          setTimeout(async () => {
            try {
              const orderRes = await orderApi.create({
                items: items.map((i) => ({ 
                  product: i.product || i._id, 
                  packageOptionId: i.packageOptionId || '', 
                  quantity: i.quantity 
                })),
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
              const errMsg = err.errors && err.errors.length > 0 ? `${err.message}: ${err.errors.join(', ')}` : err.message;
              toast.error(errMsg || 'Order creation failed in simulation mode.');
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
                items: items.map((i) => ({ 
                  product: i.product || i._id, 
                  packageOptionId: i.packageOptionId || '', 
                  quantity: i.quantity 
                })),
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
              const errMsg = err.errors && err.errors.length > 0 ? `${err.message}: ${err.errors.join(', ')}` : err.message;
              toast.error(errMsg || 'Order creation failed after payment. Contact support.');
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
      console.error('Place order error:', err);
      const errMsg = err.errors && err.errors.length > 0 ? `${err.message}: ${err.errors.join(', ')}` : err.message;
      toast.error(errMsg || 'Failed to place order.');
      setLoading(false);
    }
  };  const inputCls = 'w-full px-4 py-2.5 text-xs font-sans rounded-xl border border-cream-200 focus:outline-none focus:border-primary-500 bg-white transition-colors';

  return (
    <>
      <SEOHead title="Checkout" description="Complete your PeelKraft order." canonicalUrl="/checkout" />
      <section className="pt-36 pb-8 bg-cream-50 border-b border-cream-200/30">
        <div className="container-custom">
          <Breadcrumbs items={[{ label: 'Cart', path: '/cart' }, { label: 'Checkout' }]} />
          <h1 className="text-3xl font-serif text-dark mt-4">Checkout</h1>
        </div>
      </section>

      <section className="py-12 bg-cream-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left — Address & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-cream-200/60 p-6 shadow-sm">
                <h2 className="text-base font-sans font-bold uppercase tracking-widest text-dark mb-5 flex items-center gap-2"><FiMapPin className="text-primary-500" /> Shipping Address</h2>
                
                {/* Customer Details Summary (Source of Truth) */}
                <div className="p-5 bg-cream-50/50 border border-cream-200/50 rounded-2xl mb-6 font-sans text-xs text-gray-550 space-y-1.5 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer Details</p>
                  <p className="font-serif text-dark text-base mt-1">{`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</p>
                  <p>Mobile: {user?.phoneDetails?.dialCode ? `${user.phoneDetails.dialCode} ` : ''}{user?.phoneDetails?.nationalNumber || user?.mobileNumber || user?.phone}</p>
                  <p>Email: {user?.email}</p>
                </div>

                {/* Saved Address Selector */}
                {user?.addresses && user.addresses.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Ship to Saved Address</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                      {user.addresses.map((addr) => (
                        <div
                          key={addr._id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition text-xs space-y-1 ${
                            selectedAddressId === addr._id
                              ? 'border-primary-500 bg-cream-50'
                              : 'border-cream-200/55 hover:border-gray-400 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-dark capitalize">{addr.label}</span>
                            {selectedAddressId === addr._id && <span className="text-primary-500 font-bold text-[10px] uppercase tracking-wide">✓ Selected</span>}
                          </div>
                          <p className="text-gray-500 truncate">{addr.addressLine1}, {addr.city}</p>
                        </div>
                      ))}
                      <div
                        onClick={handleSelectNewAddress}
                        className={`p-4 rounded-xl border-2 border-dashed cursor-pointer transition text-xs flex items-center justify-center gap-1.5 ${
                          selectedAddressId === 'new'
                            ? 'border-primary-500 bg-cream-50 text-primary-500 font-semibold'
                            : 'border-cream-200/60 hover:border-gray-400 text-gray-500 bg-white'
                        }`}
                      >
                        <span>+ Ship to New Address</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-sans">Address Line 1 *</label><input name="addressLine1" value={address.addressLine1} onChange={handleAddressChange} required className={inputCls} /></div>
                  <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-sans">Address Line 2</label><input name="addressLine2" value={address.addressLine2} onChange={handleAddressChange} className={inputCls} /></div>
                  <div><label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-sans">City *</label><input name="city" value={address.city} onChange={handleAddressChange} required className={inputCls} /></div>
                  <div><label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-sans">State *</label><input name="state" value={address.state} onChange={handleAddressChange} required className={inputCls} /></div>
                  <div><label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-sans">Country *</label><input name="country" value={address.country} onChange={handleAddressChange} required className={inputCls} /></div>
                  <div><label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-sans">Pincode *</label><input name="pincode" value={address.pincode} onChange={handleAddressChange} required className={inputCls} /></div>
                </div>
                <div className="mt-4">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-sans">Delivery Notes (optional)</label>
                  <textarea value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 text-xs font-sans rounded-xl border border-cream-200 focus:outline-none focus:border-primary-500 bg-white transition-colors" placeholder="Any special instructions..." />
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-cream-200/60 p-6 shadow-sm">
                <h2 className="text-base font-sans font-bold uppercase tracking-widest text-dark mb-5 flex items-center gap-2"><FiCreditCard className="text-primary-500" /> Payment Method</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-primary-500/30 bg-cream-50/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    <div>
                      <p className="font-semibold text-dark text-xs font-sans uppercase tracking-wider">Pay Online (Razorpay)</p>
                      <p className="text-[10px] text-gray-500 font-sans mt-0.5">UPI, Credit/Debit Card, Net Banking, Wallets</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right — Order Summary */}
            <div>
              <div className="bg-white rounded-2xl border border-cream-200/60 p-6 shadow-premium sticky top-28">
                <h2 className="text-base font-sans font-bold uppercase tracking-widest text-dark mb-5">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item._id} className="flex items-start gap-3">
                      <div className="w-12 h-12 shrink-0 bg-cream-50 rounded-xl border border-cream-200 overflow-hidden flex items-center justify-center p-1.5">
                        <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0 font-sans">
                        <p className="text-xs font-bold text-dark line-clamp-1">{item.name}</p>
                        {item.packageName && (
                          <span className="inline-block mt-0.5 text-[9px] text-primary-500 font-semibold">{item.packageName}</span>
                        )}
                        <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-bold text-dark font-sans shrink-0 whitespace-nowrap text-right pl-2 pt-0.5">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="flex gap-2 mb-4">
                  <input 
                    value={couponCode} 
                    onChange={(e) => setCouponCode(e.target.value)} 
                    placeholder="Coupon code" 
                    disabled={!!appliedCoupon}
                    className="flex-1 px-4 py-2 text-xs font-sans rounded-full border border-cream-200 focus:outline-none focus:border-primary-500 disabled:bg-cream-50/50 disabled:text-gray-400" 
                  />
                  {appliedCoupon ? (
                    <button 
                      onClick={removeCoupon} 
                      className="px-5 py-2 bg-red-650 hover:bg-red-750 text-white rounded-full text-[10px] font-semibold font-sans tracking-widest uppercase transition-all"
                    >
                      Remove
                    </button>
                  ) : (
                    <button 
                      onClick={() => applyCoupon(couponCode)} 
                      className="px-5 py-2 bg-dark hover:bg-green-800 text-white rounded-full text-[10px] font-semibold font-sans tracking-widest uppercase transition-all shadow-premium"
                    >
                      Apply
                    </button>
                  )}
                </div>

                {/* Available Coupons */}
                {activeCoupons.length > 0 && (
                  <div className="mt-4 mb-4 border border-dashed border-cream-200 rounded-2xl p-4 bg-cream-50/20">
                    <p className="text-[10px] font-bold text-gray-400 mb-3 font-sans uppercase tracking-widest flex items-center gap-1.5">
                      🎟️ Available Offers
                    </p>
                    <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                      {activeCoupons.map((c) => {
                        const isSelected = couponCode.toUpperCase() === c.code.toUpperCase();
                        const isApplied = appliedCoupon.toUpperCase() === c.code.toUpperCase();
                        return (
                          <div 
                            key={c._id} 
                            onClick={() => setCouponCode(c.code)}
                            className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-center ${
                              isApplied 
                                ? 'border-green-500 bg-green-50/20' 
                                : isSelected 
                                  ? 'border-primary-500 bg-cream-50' 
                                  : 'border-cream-200 bg-white'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-[9px] px-2.5 py-0.5 rounded font-sans border tracking-wider ${
                                  isApplied 
                                    ? 'bg-green-50 text-green-800 border-green-200' 
                                    : 'bg-cream-100 text-primary-800 border-cream-200'
                                }`}>
                                  {c.code}
                                </span>
                                {c.minPurchase > 0 && (
                                  <span className="text-[9px] text-gray-400 font-sans font-semibold">
                                    Min: ₹{c.minPurchase}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1.5 font-sans leading-relaxed tracking-wide">
                                {c.description || `${c.discountValue}% Off your order`}
                              </p>
                            </div>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isApplied) {
                                  removeCoupon();
                                } else {
                                  setCouponCode(c.code);
                                  applyCoupon(c.code);
                                }
                              }}
                              className={`text-[9px] font-bold font-sans tracking-wider uppercase px-3 py-1.5 rounded-full transition shrink-0 ${
                                isApplied
                                  ? 'bg-red-650 text-white'
                                  : 'bg-dark text-white hover:bg-green-800'
                              }`}
                            >
                              {isApplied ? 'Remove' : 'Apply'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2.5 text-xs font-sans border-t border-cream-200/40 pt-4">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-semibold text-dark">₹{subtotal}</span></div>
                  {discount > 0 && <div className="flex justify-between text-green-800 font-semibold"><span>Discount</span><span>-₹{discount}</span></div>}
                  <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="font-semibold text-dark">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                  <hr className="border-cream-100" />
                  <div className="flex justify-between text-dark font-bold text-sm"><span>Total</span><span className="font-sans text-base">₹{total}</span></div>
                </div>

                <label className="flex items-start gap-2.5 mt-5 cursor-pointer">
                  <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-0.5 rounded border-cream-200 text-primary-500 focus:ring-primary-500 w-3.5 h-3.5" />
                  <span className="text-[10px] text-gray-400 font-sans leading-relaxed">I agree to the <a href="/terms-conditions" target="_blank" className="text-primary-500 underline">Terms & Conditions</a> and <a href="/privacy-policy" target="_blank" className="text-primary-500 underline">Privacy Policy</a></span>
                </label>

                <button onClick={placeOrder} disabled={loading || !agreeTerms} className="w-full mt-6 py-3.5 bg-dark hover:bg-green-800 text-white font-semibold rounded-full font-sans text-xs tracking-widest uppercase transition shadow-premium disabled:opacity-50 disabled:bg-cream-100 disabled:text-gray-400 disabled:cursor-not-allowed">
                  {loading ? 'Processing...' : paymentMethod === 'razorpay' ? `Pay ₹${total}` : 'Place Order'}
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
