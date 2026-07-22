import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiDownload, FiTrash2, FiSearch, FiMail } from 'react-icons/fi';
import { newsletterApi } from '../../api';
import { formatDateShort } from '../../utils';

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await newsletterApi.getAll({
        page,
        limit: 15,
        search,
      });
      setSubscribers(res.data || []);
      setPagination(res.pagination || null);
    } catch (err) {
      toast.error('Failed to load newsletter subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [page, search]);

  const handleExportCSV = async () => {
    try {
      const blob = await newsletterApi.export();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'peelkraft-subscribers.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Subscribers list exported successfully!');
    } catch (err) {
      toast.error('Failed to export CSV file');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return;
    try {
      await newsletterApi.delete(id);
      toast.success('Subscriber removed');
      fetchSubscribers();
    } catch (err) {
      toast.error(err.message || 'Failed to remove subscriber');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-card">
        <div className="relative flex-1 max-w-md w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search email address..."
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none transition-all font-inter text-sm"
          />
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-primary py-2.5 px-6 rounded-xl flex items-center gap-2 text-sm text-white"
        >
          <FiDownload className="w-5 h-5" /> Export CSV List
        </button>
      </div>

      {/* Subscriber List Table */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        {loading && subscribers.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-inter">
            No subscribers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase font-poppins">
                  <th className="px-6 py-4">Subscriber Email</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Subscribed Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-inter text-sm text-gray-600">
                {subscribers.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50/55 transition-colors">
                    <td className="px-6 py-4 font-semibold text-dark">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-gray-400 w-4 h-4 shrink-0" />
                        {sub.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        sub.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDateShort(sub.subscribedAt || sub.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove Subscriber"
                      >
                        <FiTrash2 className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Showing page {page} of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-50 text-xs font-semibold"
              >
                Previous
              </button>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-50 text-xs font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Newsletter;
