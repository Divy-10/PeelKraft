import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiTruck, FiBox, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { orderApi } from '../../api';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Status updates
  const [status, setStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await orderApi.getAdminById(id);
      const data = res.data;
      setOrder(data);
      setStatus(data.status);
      setTrackingNumber(data.trackingNumber || '');
      setCourierName(data.courierName || '');
      setAdminNotes(data.adminNotes || '');
    } catch (err) {
      console.error(err);
      toast.error('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await orderApi.updateStatus(id, {
        status,
        trackingNumber,
        courierName,
        adminNotes,
      });
      toast.success('Order status updated successfully!');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order.');
    } finally {
      setUpdating(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found.</p>
        <button onClick={() => navigate('/admin/orders')} className="mt-4 text-primary-500 hover:underline">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-inter print:p-0 print:space-y-4">
      {/* Header section (hide during print) */}
      <div className="flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate('/admin/orders')}
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-dark font-semibold text-sm transition"
        >
          <FiArrowLeft /> Back to Orders
        </button>
        <button
          onClick={printInvoice}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:border-gray-300 rounded-lg text-sm font-semibold text-dark font-poppins transition bg-white"
        >
          <FiPrinter /> Print Invoice / Label
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Order Details (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-poppins font-bold text-dark mb-4">
              Order Details <span className="text-gray-400 font-normal">#{order.orderNumber}</span>
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex gap-4 items-center">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-gray-100 bg-gray-50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-dark text-sm line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Price: ₹{item.price} • Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-dark text-sm">₹{item.total}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-6 pt-4 space-y-2 text-sm font-inter text-gray-600 max-w-xs ml-auto">
              <div className="flex justify-between"><span>Subtotal:</span><span className="font-semibold text-dark">₹{order.subtotal}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount:</span><span>-₹{order.discount}</span></div>}
              <div className="flex justify-between"><span>Shipping:</span><span className="font-semibold text-dark">₹{order.shippingCharge}</span></div>
              <hr className="border-gray-100" />
              <div className="flex justify-between text-dark font-bold text-base"><span>Total:</span><span>₹{order.grandTotal}</span></div>
            </div>
          </div>

          {/* Delivery and Customer Information */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-poppins font-bold text-dark mb-3 text-sm">Shipping Address</h3>
              <div className="text-xs text-gray-600 space-y-1 font-inter">
                <p className="font-semibold text-dark text-sm">{order.shippingAddress?.fullName}</p>
                <p>Phone: {order.shippingAddress?.phone}</p>
                <p>{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-poppins font-bold text-dark mb-3 text-sm">Customer Info</h3>
              <div className="text-xs text-gray-600 space-y-1 font-inter">
                <p className="font-semibold text-dark text-sm">{order.user?.firstName} {order.user?.lastName}</p>
                <p>Email: {order.user?.email}</p>
                <p>Phone: {order.user?.phone}</p>
                {order.deliveryNotes && (
                  <div className="mt-3 p-2 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="font-semibold text-dark block mb-0.5">Notes:</span>
                    {order.deliveryNotes}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fulfill / Action Box (Right Column) (hide during print) */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6 sticky top-28 print:hidden">
          <h3 className="font-poppins font-bold text-dark text-base">Fulfill Order</h3>
          
          <form onSubmit={handleUpdate} className="space-y-4 text-sm font-inter">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Courier Name</label>
              <input
                type="text"
                placeholder="e.g. BlueDart, Delhivery"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Tracking Number</label>
              <input
                type="text"
                placeholder="Awb number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Internal Notes</label>
              <textarea
                placeholder="Internal packaging notes..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md shadow-primary-500/10 transition font-poppins text-xs disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Save Updates'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
