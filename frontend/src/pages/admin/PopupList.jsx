import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiPlus, FiTrash2, FiEdit, FiCopy, FiEye, FiActivity, 
  FiSearch, FiFilter, FiCheck, FiX, FiRefreshCw, FiTrendingUp 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { popupApi } from '../../api';
import PopupModal from '../../components/common/PopupModal';

const PopupList = () => {
  const [popups, setPopups] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewPopup, setPreviewPopup] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [offerFilter, setOfferFilter] = useState('');

  const fetchPopups = async () => {
    try {
      const params = {};
      if (search) params.keyword = search;
      if (statusFilter !== '') params.status = statusFilter;
      if (offerFilter) params.offerType = offerFilter;

      const res = await popupApi.getAll(params);
      setPopups(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load popup advertisements.');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await popupApi.getAnalytics();
      setAnalytics(res.data || null);
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchPopups(), fetchAnalytics()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter, offerFilter]);

  const handleToggleStatus = async (id) => {
    try {
      const res = await popupApi.toggleStatus(id);
      toast.success(res.message || 'Status updated.');
      fetchPopups();
      fetchAnalytics();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this popup?')) {
      try {
        await popupApi.delete(id);
        toast.success('Popup advertisement deleted.');
        fetchPopups();
        fetchAnalytics();
      } catch (err) {
        toast.error('Failed to delete popup.');
      }
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await popupApi.duplicate(id);
      toast.success(res.message || 'Popup duplicated successfully!');
      fetchPopups();
      fetchAnalytics();
    } catch (err) {
      toast.error('Failed to duplicate popup.');
    }
  };

  const getCtr = (clicks, views) => {
    if (!views) return '0.00%';
    return `${((clicks / views) * 100).toFixed(2)}%`;
  };

  const getCopyCtr = (copies, views) => {
    if (!views) return '0.00%';
    return `${((copies / views) * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-6 font-inter">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-dark">Promotional Popups</h1>
          <p className="text-xs text-gray-500 mt-1">
            Create, schedule, target, and monitor overlay popups.
          </p>
        </div>
        <Link
          to="/admin/popups/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md shadow-primary-500/10 transition font-poppins text-xs"
        >
          <FiPlus /> Create Popup
        </Link>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Advertisements</p>
              <h3 className="text-2xl font-poppins font-bold text-dark mt-2">{analytics.stats?.totalPopups || 0}</h3>
              <p className="text-xs text-gray-500 mt-1">{analytics.stats?.activePopups || 0} active currently</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <FiActivity className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Views</p>
              <h3 className="text-2xl font-poppins font-bold text-dark mt-2">{analytics.stats?.totalViews?.toLocaleString() || 0}</h3>
              <p className="text-xs text-gray-500 mt-1">Impressions counted</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <FiEye className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Click-Through Rate (CTR)</p>
              <h3 className="text-2xl font-poppins font-bold text-dark mt-2">{analytics.stats?.ctr || '0.00'}%</h3>
              <p className="text-xs text-gray-500 mt-1">{analytics.stats?.totalClicks || 0} total interactions</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Coupon Copy Rate</p>
              <h3 className="text-2xl font-poppins font-bold text-dark mt-2">{analytics.stats?.copyRate || '0.00'}%</h3>
              <p className="text-xs text-gray-500 mt-1">{analytics.stats?.totalCopies || 0} codes copied</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <FiCopy className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 w-full md:w-auto items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 font-inter text-sm">
          <FiSearch className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by title, description, or coupon code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-dark font-medium placeholder-gray-400"
          />
        </div>
        
        <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <FiFilter className="text-gray-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none font-medium text-dark"
            >
              <option value="">All Statuses</option>
              <option value="true">Active (Enabled)</option>
              <option value="false">Inactive (Disabled)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <FiFilter className="text-gray-400 shrink-0" />
            <select
              value={offerFilter}
              onChange={(e) => setOfferFilter(e.target.value)}
              className="bg-transparent outline-none font-medium text-dark"
            >
              <option value="">All Offers</option>
              <option value="Discount">Discount</option>
              <option value="Festival">Festival</option>
              <option value="Free Shipping">Free Shipping</option>
              <option value="Announcement">Announcement</option>
              <option value="Flash Sale">Flash Sale</option>
              <option value="New Arrival">New Arrival</option>
              <option value="Season Sale">Season Sale</option>
              <option value="Limited Offer">Limited Offer</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setOfferFilter('');
            }}
            className="px-3 py-2 hover:bg-gray-50 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 flex items-center gap-1.5 transition"
          >
            <FiRefreshCw /> Reset
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
            Loading advertisements...
          </div>
        ) : popups.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No popup advertisements found. Try widening your search or create a new one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Image & Title</th>
                  <th className="px-6 py-4">Offer Details</th>
                  <th className="px-6 py-4">Priority & Device</th>
                  <th className="px-6 py-4">Validity Schedule</th>
                  <th className="px-6 py-4 text-center">Stats (Views / Clicks / Copies)</th>
                  <th className="px-6 py-4 text-center">CTR / copy CTR</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-dark">
                {popups.map((popup) => (
                  <tr key={popup._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <img
                        src={popup.desktopImage}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                      />
                      <div>
                        <span className="font-poppins font-bold text-gray-800 line-clamp-1">{popup.title}</span>
                        <span className="text-xs text-gray-400 font-inter line-clamp-1">{popup.shortDescription || 'No description'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="inline-block px-2.5 py-0.5 self-start text-[10px] uppercase font-bold rounded-full bg-primary-50 text-primary-600 border border-primary-100 mb-1">
                          {popup.offerType}
                        </span>
                        {popup.couponCode ? (
                          <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded self-start mt-0.5 border border-dashed border-gray-300">
                            🎟 {popup.couponCode}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No coupon code</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-600">Priority: <span className="font-bold">{popup.priority}</span></span>
                        <span className="text-xs text-gray-400 capitalize mt-0.5">💻 {popup.deviceTarget}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs font-inter text-gray-500">
                      <div className="flex flex-col">
                        <span>Start: {new Date(popup.startDate).toLocaleDateString()}</span>
                        <span>End: {new Date(popup.endDate).toLocaleDateString()}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                          👁 {popup.views}
                        </div>
                        <div className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-xs">
                          🖱 {popup.clicks}
                        </div>
                        <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs">
                          ✂ {popup.copies}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center font-mono font-bold">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-orange-600">CTR: {getCtr(popup.clicks, popup.views)}</span>
                        <span className="text-[10px] text-emerald-600 mt-0.5">Copy: {getCopyCtr(popup.copies, popup.views)}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(popup._id)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                          popup.status
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}
                      >
                        {popup.status ? (
                          <>
                            <FiCheck className="w-3.5 h-3.5" /> Enabled
                          </>
                        ) : (
                          <>
                            <FiX className="w-3.5 h-3.5" /> Disabled
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setPreviewPopup(popup)}
                          title="Preview Popup"
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(popup._id)}
                          title="Duplicate Popup"
                          className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/admin/popups/edit/${popup._id}`}
                          title="Edit Popup"
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        >
                          <FiEdit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(popup._id)}
                          title="Delete Popup"
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin live preview Overlay */}
      {previewPopup && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            onClick={() => setPreviewPopup(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
          />
          <div className="relative w-full max-w-5xl z-10">
            <PopupModal isPreview={true} previewData={previewPopup} />
            <button 
              onClick={() => setPreviewPopup(null)}
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white/40 text-white rounded-full p-2.5 font-bold transition shadow-lg flex items-center gap-1.5 text-xs border border-white/20"
            >
              <FiX className="w-4 h-4" /> Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupList;
