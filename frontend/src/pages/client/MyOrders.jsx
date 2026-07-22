import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiTruck, FiCheck, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';
import { orderApi } from '../../api';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';

const MyOrders = () => {
  const { token, logout, user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getMyOrders();
        setOrders(res.data.data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token, navigate]);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const res = await orderApi.cancel(orderId, { reason: 'Cancelled by customer' });
        setOrders(orders.map((o) => (o._id === orderId ? res.data.data : o)));
        toast.success('Order cancelled successfully.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to cancel order.');
      }
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <SEOHead title="My Orders" description="View and track your PeelKraft orders." canonicalUrl="/my-orders" />
      <section className="pt-32 pb-8 bg-cream-50">
        <div className="container-custom">
          <Breadcrumbs items={[{ label: 'Orders' }]} />
          <h1 className="text-3xl font-poppins font-bold text-dark mt-4">My Account</h1>
        </div>
      </section>

      <section className="py-8 bg-cream-50 min-h-[60vh]">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sidebar navigation */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
                <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold font-poppins uppercase">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <h2 className="text-lg font-poppins font-bold text-dark">{user?.firstName} {user?.lastName}</h2>
                <p className="text-gray-500 text-sm font-inter">{user?.email}</p>
                <button onClick={logout} className="mt-6 w-full py-2.5 border border-red-200 text-red-500 hover:bg-red-50 font-semibold rounded-xl transition text-sm font-poppins">
                  Logout
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
                <button className="w-full text-left px-4 py-3 rounded-xl bg-primary-50 text-primary-600 font-semibold text-sm font-poppins transition">
                  My Orders
                </button>
                <button onClick={() => navigate('/my-profile')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 font-semibold text-dark text-sm font-poppins transition">
                  Profile & Addresses
                </button>
              </div>
            </div>

            {/* Orders list */}
            <div className="lg:col-span-2 space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400 font-inter">Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                  <FiShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-poppins font-bold text-dark mb-1">No Orders Found</h3>
                  <p className="text-gray-500 font-inter mb-6">You haven't placed any orders yet.</p>
                  <button onClick={() => navigate('/products')} className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition text-sm font-poppins">
                    Shop Our Products
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                      {/* Header block */}
                      <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center text-sm font-inter">
                        <div>
                          <p className="text-gray-400 text-xs uppercase font-semibold">Order Placed</p>
                          <p className="font-semibold text-dark mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs uppercase font-semibold">Total Amount</p>
                          <p className="font-bold text-dark mt-0.5">₹{order.grandTotal}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs uppercase font-semibold">Order Number</p>
                          <p className="font-semibold text-dark mt-0.5">#{order.orderNumber}</p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                            order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {order.status === 'delivered' && <FiCheck />}
                            {order.status === 'cancelled' && <FiXCircle />}
                            {order.status === 'shipped' && <FiTruck />}
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="p-6 space-y-4">
                        {order.items.map((item) => (
                          <div key={item._id} className="flex gap-4 items-center">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl bg-gray-50 border border-gray-100" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-dark text-sm line-clamp-1 font-inter">{item.name}</p>
                              <p className="text-xs text-gray-500 font-inter mt-0.5">Qty: {item.quantity} • Price: ₹{item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer tracking / cancellation */}
                      <div className="bg-gray-50/20 px-6 py-4 border-t border-gray-100 flex flex-wrap gap-4 justify-between items-center text-sm">
                        {order.trackingNumber ? (
                          <div className="font-inter text-xs text-gray-500">
                            <span className="font-semibold text-dark">Shipped via {order.courierName}</span>: Tracking #{order.trackingNumber}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 font-inter">No tracking info available yet.</div>
                        )}
                        {['pending', 'confirmed'].includes(order.status) && (
                          <button onClick={() => handleCancelOrder(order._id)} className="text-red-500 hover:text-red-600 font-semibold font-poppins text-xs transition">
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MyOrders;
