import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiTruck, FiBox, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
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
  const [trackingUrl, setTrackingUrl] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('pending');

  const fetchOrder = async () => {
    try {
      const res = await orderApi.getAdminById(id);
      const data = res.data;
      setOrder(data);
      setStatus(data.status);
      setTrackingNumber(data.trackingNumber || '');
      setCourierName(data.courierName || '');
      setAdminNotes(data.adminNotes || '');
      setTrackingUrl(data.trackingUrl || '');
      setDispatchDate(data.dispatchDate ? data.dispatchDate.split('T')[0] : '');
      setEstimatedDelivery(data.estimatedDelivery ? data.estimatedDelivery.split('T')[0] : '');
      setDeliveryStatus(data.deliveryStatus || 'pending');
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

    // Frontend validations (Step 8)
    if (status === 'shipped') {
      if (!trackingNumber.trim()) {
        return toast.error('Tracking ID is required when status is Shipped.');
      }
      if (!courierName.trim()) {
        return toast.error('Courier Service Name is required when status is Shipped.');
      }
    }

    if (trackingUrl.trim()) {
      try {
        new URL(trackingUrl);
      } catch (err) {
        return toast.error('Courier Tracking URL must be a valid URL.');
      }
    }

    setUpdating(true);
    try {
      await orderApi.updateStatus(id, {
        status,
        trackingNumber,
        courierName,
        trackingUrl,
        dispatchDate: dispatchDate || null,
        estimatedDelivery: estimatedDelivery || null,
        deliveryStatus,
        adminNotes,
      });
      toast.success('Order status updated successfully!');
      fetchOrder();
    } catch (err) {
      toast.error(err.message || 'Failed to update order.');
    } finally {
      setUpdating(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const sendToWhatsApp = () => {
    const customerWhatsApp = order.shippingAddress?.whatsapp || order.shippingAddress?.phone || order.user?.phone || '';
    if (!customerWhatsApp) {
      toast.error('No WhatsApp or phone number found for this customer.');
      return;
    }

    let cleanPhone = customerWhatsApp.replace(/\D/g, '');
    if (!cleanPhone) {
      toast.error('Invalid phone number format.');
      return;
    }

    if (cleanPhone.startsWith('91')) {
      // Keep country code
    } else {
      cleanPhone = '91' + cleanPhone;
    }

    if (cleanPhone.length < 12) {
      toast.error('WhatsApp number must contain at least a 10-digit phone number.');
      return;
    }

    const productsText = order.items.map((item, index) => {
      const itemSeparator = index > 0 ? `--------------------------------\n\n` : '';
      return `${itemSeparator}${item.name}\n\nQty: ${item.quantity}\n\n₹${item.price}\n\nSubtotal ₹${item.total}`;
    }).join('\n\n');

    const formatPaymentMethod = (method) => {
      if (!method) return 'N/A';
      if (method.toLowerCase() === 'razorpay') return 'Razorpay';
      if (method.toLowerCase() === 'cod') return 'Cash on Delivery';
      return method.charAt(0).toUpperCase() + method.slice(1);
    };

    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const taxVal = order.gst || 0;
    
    const liveStatus = status || order.status || 'Pending';
    const formattedStatus = liveStatus.charAt(0).toUpperCase() + liveStatus.slice(1);
    const formattedPaymentStatus = order.paymentStatus ? (order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)) : 'Pending';

    // Format dates for display
    const formatDateStr = (dateVal) => {
      if (!dateVal) return '';
      return new Date(dateVal).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    // Construct shipment details conditionally (Step 7 & 9)
    const hasShipmentDetails = order.courierName || order.trackingNumber || order.trackingUrl || order.dispatchDate || order.estimatedDelivery || order.status === 'shipped';

    let shipmentSection = '';
    if (hasShipmentDetails) {
      shipmentSection = 
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `🚚 Shipment Details\n\n` +
        (order.courierName ? `Courier Service:\n${order.courierName}\n\n` : '') +
        (order.trackingNumber ? `Tracking ID:\n${order.trackingNumber}\n\n` : '') +
        (order.trackingUrl ? `Tracking Link:\n${order.trackingUrl}\n\n` : '') +
        (order.dispatchDate ? `Dispatch Date:\n${formatDateStr(order.dispatchDate)}\n\n` : '') +
        (order.estimatedDelivery ? `Estimated Delivery:\n${formatDateStr(order.estimatedDelivery)}\n\n` : '') +
        `Order Status:\n${formattedStatus}\n\n`;
    }

    // Dynamic public PDF invoice link (Step 5)
    let apiBase = import.meta.env.VITE_API_URL || '/api';
    if (apiBase.startsWith('/')) {
      apiBase = window.location.origin + apiBase;
    }
    const invoiceDownloadUrl = `${apiBase}/orders/invoice/${order.orderNumber}`;

    let message = 
      `🧾 PeelKraft Order Confirmation & Shipment Details\n\n` +
      `Hello ${order.shippingAddress?.fullName?.split(' ')[0] || 'Customer'},\n\n` +
      `Thank you for shopping with PeelKraft ❤️\n\n` +
      `Your order has been processed successfully.\n\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `📦 Order Details\n\n` +
      `Order ID:\n` +
      `#${order.orderNumber}\n\n` +
      `Order Date:\n` +
      `${orderDate}\n\n` +
      `Payment Method:\n` +
      `${formatPaymentMethod(order.paymentMethod)}\n\n` +
      `Payment Status:\n` +
      `${formattedPaymentStatus}\n\n` +
      shipmentSection +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `📍 Shipping Address\n\n` +
      `${order.shippingAddress?.fullName || 'N/A'}\n\n` +
      `${order.shippingAddress?.phone || 'N/A'}\n\n` +
      `${order.shippingAddress?.addressLine1 || ''}\n\n` +
      (order.shippingAddress?.addressLine2 ? `${order.shippingAddress.addressLine2}\n\n` : '') +
      `${order.shippingAddress?.city || ''}\n\n` +
      `${order.shippingAddress?.state || ''}\n\n` +
      `${order.shippingAddress?.pincode || ''}\n\n` +
      `${order.shippingAddress?.country || 'India'}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `🛒 Products\n\n` +
      `${productsText}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `💰 Invoice Summary\n\n` +
      `Subtotal: ₹${order.subtotal}\n` +
      `Shipping: ₹${order.shippingCharge}\n` +
      `Tax (GST): ₹${taxVal}\n` +
      `Discount: -₹${order.discount}\n` +
      `Grand Total: ₹${order.grandTotal}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `📄 Invoice\n\n` +
      `Please find your invoice below:\n` +
      `${invoiceDownloadUrl}\n\n` +
      `Thank you for supporting PeelKraft 🌿`;

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(url, '_blank');
    toast.success('WhatsApp invoice message opened successfully!');
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
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice-container, #printable-invoice-container * {
            visibility: visible !important;
          }
          #printable-invoice-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}} />
      {/* Header section (hide during print) */}
      <div className="flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate('/admin/orders')}
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-dark font-semibold text-sm transition"
        >
          <FiArrowLeft /> Back to Orders
        </button>
        <div className="flex gap-2">
          <button
            onClick={sendToWhatsApp}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-sm font-semibold font-poppins transition shadow-sm shadow-emerald-500/10"
          >
            <FaWhatsapp className="w-4.5 h-4.5" /> Send to WhatsApp
          </button>
          <button
            onClick={printInvoice}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:border-gray-300 rounded-lg text-sm font-semibold text-dark font-poppins transition bg-white"
          >
            <FiPrinter /> Print Invoice / Label
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Order Details (Left Column) */}
        <div id="printable-invoice-container" className="lg:col-span-2 space-y-6 print:w-full">
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
                    {item.packageName && (
                      <p className="text-xs text-primary-600 font-semibold font-poppins mt-0.5">{item.packageName}</p>
                    )}
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
                {order.shippingAddress?.whatsapp && <p>WhatsApp: {order.shippingAddress.whatsapp}</p>}
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
              <label className="block text-xs font-semibold text-gray-500 mb-1">Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="dispatch">Dispatch</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Delivery Status</label>
              <select
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
              >
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="returned">Returned</option>
                <option value="failed">Failed</option>
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
              <label className="block text-xs font-semibold text-gray-500 mb-1">Courier Tracking URL</label>
              <input
                type="text"
                placeholder="https://tracking.link"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Dispatch Date</label>
              <input
                type="date"
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Estimated Delivery Date</label>
              <input
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
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
