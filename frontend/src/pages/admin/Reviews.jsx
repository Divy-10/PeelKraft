import { useState, useEffect } from 'react';
import { 
  FiTrash2, FiCheck, FiX, FiStar, FiFilter, FiSearch, 
  FiRefreshCw, FiAlertOctagon, FiUser, FiInfo 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { reviewApi } from '../../api';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedReview, setExpandedReview] = useState(null);

  const fetchReviews = async () => {
    try {
      const params = {};
      if (search) params.keyword = search;
      if (statusFilter) params.status = statusFilter;

      const res = await reviewApi.getAll(params);
      setReviews(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [search, statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await reviewApi.updateStatus(id, { status });
      toast.success(`Review status set to ${status}.`);
      fetchReviews();
    } catch (err) {
      toast.error('Failed to update review status.');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const res = await reviewApi.toggleFeatured(id);
      toast.success(res.message || 'Featured status updated.');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to toggle featured status.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this review?')) {
      try {
        await reviewApi.delete(id);
        toast.success('Review deleted.');
        fetchReviews();
      } catch (err) {
        toast.error('Failed to delete review.');
      }
    }
  };

  return (
    <div className="space-y-6 font-inter">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-poppins font-bold text-dark">Customer Reviews</h1>
        <p className="text-xs text-gray-500 mt-1">
          Moderate submitted product and brand experience reviews. Approved featured reviews appear on the Home Page testimonials list.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 w-full md:w-auto items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <FiSearch className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by customer name, email, or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-dark font-medium placeholder-gray-400"
          />
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 md:flex-none">
            <FiFilter className="text-gray-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none font-medium text-dark w-full"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="spam">Spam</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
            }}
            className="px-3 py-2 hover:bg-gray-50 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 flex items-center gap-1.5 transition shrink-0"
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
            Loading customer reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No reviews found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Target Product</th>
                  <th className="px-6 py-4">Rating & Title</th>
                  <th className="px-6 py-4">Message Comment</th>
                  <th className="px-6 py-4">Submission Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-dark">
                {reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50/50 transition">
                    {/* Featured star toggle */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(review._id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          review.featured 
                            ? 'text-amber-500 hover:text-amber-600 bg-amber-50' 
                            : 'text-gray-300 hover:text-gray-400 hover:bg-gray-50'
                        }`}
                        title={review.featured ? 'Featured on Home Slider' : 'Mark as Featured'}
                      >
                        <FiStar className={`w-5 h-5 ${review.featured ? 'fill-amber-500' : ''}`} />
                      </button>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50 shrink-0">
                          {review.profilePhoto ? (
                            <img src={review.profilePhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FiUser className="text-gray-400 w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <span className="font-poppins font-bold block leading-tight text-gray-800">{review.customerName}</span>
                          <span className="text-xs text-gray-400 font-inter block">{review.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Target Product */}
                    <td className="px-6 py-4">
                      {review.product ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700">{review.product.name}</span>
                          {review.isVerifiedPurchase && (
                            <span className="text-[10px] text-emerald-600 font-bold uppercase mt-0.5 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full self-start">
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 border rounded-lg">General Experience</span>
                      )}
                    </td>

                    {/* Rating & Title */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <span className="font-bold text-gray-800 text-xs mt-1 line-clamp-1">{review.title || 'Untitled'}</span>
                      </div>
                    </td>

                    {/* Message comment */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex flex-col gap-1.5">
                        <p className="text-gray-500 font-inter text-xs line-clamp-2 leading-relaxed">
                          {review.comment}
                        </p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-1.5">
                            {review.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt=""
                                className="w-8 h-8 rounded border border-gray-200 object-cover cursor-pointer hover:opacity-80 transition"
                                onClick={() => setExpandedReview(review)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Submission Date */}
                    <td className="px-6 py-4 text-xs font-inter text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full border ${
                        review.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        review.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                        review.status === 'spam' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {review.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {review.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(review._id, 'approved')}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Approve Review"
                          >
                            <FiCheck className="w-4.5 h-4.5" />
                          </button>
                        )}
                        {review.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(review._id, 'rejected')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Reject Review"
                          >
                            <FiX className="w-4.5 h-4.5" />
                          </button>
                        )}
                        {review.status !== 'spam' && (
                          <button
                            onClick={() => handleUpdateStatus(review._id, 'spam')}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Mark as Spam"
                          >
                            <FiAlertOctagon className="w-4.5 h-4.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Review"
                        >
                          <FiTrash2 className="w-4.5 h-4.5" />
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

      {/* Expanded Images Lightbox */}
      {expandedReview && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            onClick={() => setExpandedReview(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
          />
          <div className="relative bg-white p-6 rounded-3xl max-w-2xl w-full z-10 space-y-4">
            <button 
              onClick={() => setExpandedReview(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all"
            >
              <FiX className="w-4 h-4 text-gray-500" />
            </button>
            <h4 className="font-poppins font-bold text-lg">{expandedReview.customerName}'s Uploaded Images</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {expandedReview.images.map((img, idx) => (
                <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-2xl overflow-hidden border border-gray-100">
                  <img src={img} alt="" className="w-full h-full object-cover hover:scale-102 transition" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
