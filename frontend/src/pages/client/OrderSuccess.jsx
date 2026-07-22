import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { orderApi } from '../../api';
import SEOHead from '../../components/seo/SEOHead';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderApi.getById(orderId);
        setOrder(res.data.data);
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-inter">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Order Success" description="Thank you for shopping with PeelKraft." canonicalUrl={`/order-success/${orderId}`} />
      <section className="min-h-screen flex items-center justify-center bg-cream-50 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 text-center"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <FiCheckCircle className="w-12 h-12" />
          </div>

          <h1 className="text-3xl font-poppins font-bold text-dark mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 font-inter text-base mb-8">
            Thank you for your purchase. Your order has been placed successfully and is being processed.
          </p>

          {order && (
            <div className="bg-cream-50/50 rounded-2xl border border-gray-100 p-6 mb-8 text-left space-y-4 max-w-md mx-auto">
              <div className="flex justify-between text-sm font-inter">
                <span className="text-gray-500">Order Number</span>
                <span className="font-semibold text-dark">#{order.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm font-inter">
                <span className="text-gray-500">Payment Status</span>
                <span className="font-semibold text-green-600 uppercase tracking-wider text-xs bg-green-50 px-2.5 py-1 rounded-full">
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between text-sm font-inter">
                <span className="text-gray-500">Grand Total</span>
                <span className="font-bold text-dark font-poppins text-base">₹{order.grandTotal}</span>
              </div>
              <div className="flex justify-between text-sm font-inter">
                <span className="text-gray-500">Shipping to</span>
                <span className="font-semibold text-dark text-right truncate max-w-[200px]">
                  {order.shippingAddress?.fullName}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-50 text-primary-600 rounded-xl font-semibold hover:bg-primary-100 transition-all duration-300 font-poppins"
            >
              <FiShoppingBag className="w-5 h-5" /> Continue Shopping
            </Link>
            <Link
              to="/my-orders"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary-500/20 font-poppins"
            >
              Track Order <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default OrderSuccess;
