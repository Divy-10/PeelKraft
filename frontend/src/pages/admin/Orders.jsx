import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiSearch, FiFilter, FiDownload, FiX, FiTrendingUp, FiCheckCircle, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { orderApi } from '../../api';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  
  // Date Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Summary Metrics
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalSales: 0,
    paidOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getAll({
        page,
        limit: 15,
        status,
        search,
        sort,
        fromDate,
        toDate,
        month,
        year
      });
      setOrders(res.data || []);
      setTotalPages(res.pagination?.pages || 1);
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, status, sort, fromDate, toDate, month, year]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleClearFilters = () => {
    setStatus('');
    setSearch('');
    setSort('newest');
    setFromDate('');
    setToDate('');
    setMonth('');
    setYear('');
    setPage(1);
  };

  const handleExportExcel = async () => {
    try {
      const res = await orderApi.exportExcel({
        status,
        search,
        sort,
        fromDate,
        toDate,
        month,
        year
      });
      
      // Since response interceptor returns response.data, res is already the Blob
      const blob = res instanceof Blob ? res : new Blob([res], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      let filename = 'PeelKraft_Orders_All.xlsx';
      if (fromDate && toDate) {
        filename = `PeelKraft_Orders_${fromDate}_to_${toDate}.xlsx`;
      } else if (month && year) {
        filename = `PeelKraft_Orders_${month}_${year}.xlsx`;
      } else if (year) {
        filename = `PeelKraft_Orders_${year}.xlsx`;
      }
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export orders. Please try again.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    // Add 5.5 hours for IST to display consistently
    const offset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + offset);
    
    const day = String(istDate.getUTCDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[istDate.getUTCMonth()];
    const yearNum = istDate.getUTCFullYear();
    
    const hours = String(istDate.getUTCHours()).padStart(2, '0');
    const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
    
    return `${day} ${monthName} ${yearNum} - ${hours}:${minutes}`;
  };

  const getSummaryHeader = () => {
    if (month && year) {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const mName = isNaN(month) ? month : monthNames[parseInt(month) - 1];
      return `${mName} ${year}`;
    }
    if (fromDate && toDate) {
      return `${fromDate} to ${toDate}`;
    }
    if (year) {
      return `Year ${year}`;
    }
    return 'All Time';
  };

  return (
    <div className="space-y-6 font-inter text-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-dark">Order Management</h1>
          <p className="text-sm text-gray-500">Manage, filter, and analyze customer transactions</p>
        </div>
        
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition shadow-sm hover:shadow-md"
        >
          <FiDownload className="w-4 h-4" />
          Export Orders to Excel
        </button>
      </div>

      {/* Month-wise / Filtered Summary Cards */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h2 className="text-md font-bold mb-4 flex items-center gap-2 text-slate-700">
          <FiTrendingUp className="text-primary-500 w-5 h-5" />
          Summary Dashboard ({getSummaryHeader()})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs text-blue-600 font-semibold uppercase">Total Orders</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{summary.totalOrders}</p>
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <p className="text-xs text-emerald-600 font-semibold uppercase">Total Sales</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">₹{summary.totalSales.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
            <p className="text-xs text-green-600 font-semibold uppercase flex items-center gap-1">
              <FiCheckCircle className="w-3.5 h-3.5" /> Paid
            </p>
            <p className="text-2xl font-bold text-green-900 mt-1">{summary.paidOrders}</p>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs text-amber-600 font-semibold uppercase flex items-center gap-1">
              <FiClock className="w-3.5 h-3.5" /> Pending
            </p>
            <p className="text-2xl font-bold text-amber-900 mt-1">{summary.pendingOrders}</p>
          </div>
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl col-span-2 md:col-span-1">
            <p className="text-xs text-red-600 font-semibold uppercase flex items-center gap-1">
              <FiAlertTriangle className="w-3.5 h-3.5" /> Cancelled
            </p>
            <p className="text-2xl font-bold text-red-900 mt-1">{summary.cancelledOrders}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <FiFilter className="text-primary-500 w-5 h-5" />
          <h3 className="font-semibold text-slate-700">Filter & Sort Orders</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Search Order</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Order #, customer, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none text-sm font-inter"
              />
            </div>
          </form>

          {/* Status filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Order Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="dispatch">Dispatch</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out For Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          {/* Sort selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Sort By</label>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Month Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Month Filter</label>
            <select
              value={month}
              onChange={(e) => { setMonth(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-primary-500"
            >
              <option value="">All Months</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Year Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => { setYear(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-primary-500"
            >
              <option value="">All Years</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary-500"
            />
          </div>

          {/* Controls */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleClearFilters}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-semibold text-gray-600 transition"
            >
              <FiX className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No orders found matching the filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-4 w-[110px]">Order ID</th>
                  <th className="px-5 py-4 w-[250px]">Customer Details</th>
                  <th className="px-5 py-4 w-[180px]">Order Date & Time</th>
                  <th className="px-5 py-4">Products & Packages</th>
                  <th className="px-5 py-4 w-[120px]">Total Amount</th>
                  <th className="px-5 py-4 w-[130px]">Payment Status</th>
                  <th className="px-5 py-4 w-[130px]">Order Status</th>
                  <th className="px-5 py-4 w-[250px]">Shipping Address</th>
                  <th className="px-5 py-4 text-center w-[80px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      #{order.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {order.shippingAddress?.fullName || `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim()}
                        </p>
                        <p className="text-xs text-slate-400">{order.user?.email}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          📞 {order.shippingAddress?.phone || order.user?.phone || order.user?.mobileNumber || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-medium">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block mr-1">
                            <span className="font-medium text-slate-800">{item.name}</span> 
                            {item.packageName && <span className="text-emerald-600 font-semibold"> ({item.packageName})</span>} 
                            <span className="text-slate-400 font-bold"> x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      ₹{order.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs leading-relaxed max-w-[250px] truncate hover:text-clip hover:whitespace-normal">
                      {order.shippingAddress ? (
                        <>
                          {order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2 && `${order.shippingAddress.addressLine2}, `}
                          {order.shippingAddress.city}, {order.shippingAddress.state} - <span className="font-semibold">{order.shippingAddress.pincode}</span>
                        </>
                      ) : 'N/A'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-emerald-600 hover:text-emerald-700 transition"
                        title="View Details"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold border transition ${
                page === i + 1 ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-slate-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
