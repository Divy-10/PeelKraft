import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiStar, FiUploadCloud, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { reviewApi, mediaApi } from '../../api';
import { useUser } from '../../context/UserContext';

const WriteReviewModal = ({ isOpen, onClose, productId = null, productName = null, onSuccess }) => {
  const { user } = useUser();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [form, setForm] = useState({
    customerName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    email: user ? user.email : '',
    profilePhoto: '',
    title: '',
    comment: '',
    images: [],
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'reviews/avatars');

    try {
      const res = await mediaApi.upload(formData);
      setForm((prev) => ({ ...prev, profilePhoto: res.data.url }));
      toast.success('Profile photo uploaded.');
    } catch (err) {
      toast.error('Failed to upload profile photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'reviews/gallery');
        const res = await mediaApi.upload(formData);
        uploadedUrls.push(res.data.url);
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      toast.success('Review images uploaded.');
    } catch (err) {
      toast.error('Failed to upload review images.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.email || !form.comment) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...form,
        productId,
        rating,
      };

      await reviewApi.create(data);
      toast.success('Your review has been submitted successfully.');
      if (onSuccess) onSuccess();
      onClose();
      // Reset form
      setForm({
        customerName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
        email: user ? user.email : '',
        profilePhoto: '',
        title: '',
        comment: '',
        images: [],
      });
      setRating(5);
    } catch (err) {
      toast.error(err.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 font-inter">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-0 transition-opacity duration-200"
      />

      {/* Modal content */}
      <div
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl z-10 relative flex flex-col max-h-[90vh] border border-gray-100 transition-transform duration-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-poppins font-bold text-xl text-dark">
              {productName ? `Review ${productName}` : 'Write a General Review'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Share your authentic experience with the community.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form container */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-sm text-gray-800">
          {/* Stars rating selection */}
          <div className="text-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Overall Rating
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform active:scale-90"
                >
                  <FiStar
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Inputs name/email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Full Name *</label>
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                required
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Email Address *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="e.g. rahul@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* Title / Header */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Review Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Absolutely delicious & fresh!"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm"
            />
          </div>

          {/* Message content */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Your Message *</label>
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe your experience with our product or brand..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm resize-none"
            />
          </div>

          {/* Gallery images upload */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Upload Review Images (Optional)</label>
            <div className="relative border-2 border-dashed border-gray-200 hover:border-primary-400 p-6 text-center rounded-2xl cursor-pointer transition-colors bg-gray-50/50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImagesUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {uploadingImages ? (
                <p className="text-xs text-gray-400">Uploading gallery photos...</p>
              ) : (
                <div className="space-y-1">
                  <FiUploadCloud className="w-6 h-6 text-gray-400 mx-auto" />
                  <p className="text-xs text-gray-500 font-semibold">Upload product photos</p>
                  <p className="text-[10px] text-gray-400">Drag images or click to select multiple</p>
                </div>
              )}
            </div>

            {/* Uploaded images display */}
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {form.images.map((img, idx) => (
                  <div key={idx} className="w-16 h-16 rounded-lg relative overflow-hidden border border-gray-200 group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <FiTrash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-poppins font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-primary-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default WriteReviewModal;
