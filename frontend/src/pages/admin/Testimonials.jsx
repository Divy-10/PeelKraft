import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiSave, FiEdit, FiTrash2, FiX, FiStar, FiUploadCloud } from 'react-icons/fi';
import { testimonialApi, mediaApi } from '../../api';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      designation: '',
      company: '',
      content: '',
      rating: 5,
      featured: false,
      status: 'active',
      avatar: { url: '' }
    }
  });

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await testimonialApi.getAll();
      setTestimonials(res.data || []);
    } catch (err) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleCancelEdit = () => {
    setEditingId(null);
    reset({
      name: '',
      designation: '',
      company: '',
      content: '',
      rating: 5,
      featured: false,
      status: 'active',
    });
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await testimonialApi.update(editingId, data);
        toast.success('Testimonial updated');
      } else {
        await testimonialApi.create(data);
        toast.success('Testimonial created');
      }
      handleCancelEdit();
      fetchTestimonials();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await testimonialApi.delete(id);
      toast.success('Testimonial deleted');
      fetchTestimonials();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const avatarUrl = watch('avatar.url');

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Testimonials List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-poppins font-bold text-dark text-lg">Customer Testimonials</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              No testimonials found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {testimonials.map((test) => (
                <div key={test._id} className="p-6 flex items-start justify-between hover:bg-gray-50/50 transition-colors gap-4">
                  <div className="flex items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-poppins font-bold text-dark text-sm">{test.name}</h4>
                        <span className="text-xs text-gray-400">{test.designation} {test.company ? `@ ${test.company}` : ''}</span>
                      </div>
                      <div className="flex text-amber-400 gap-0.5">
                        {[...Array(test.rating)].map((_, i) => <FiStar key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
                      </div>
                      <p className="text-sm text-gray-500 italic pt-1 leading-relaxed">"{test.content}"</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      test.featured ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'
                    }`}>
                      Featured
                    </span>
                    <button onClick={() => handleEditClick(test)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary-500 transition-colors">
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(test._id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card sticky top-28 space-y-6">
          <h3 className="font-poppins font-bold text-dark text-lg border-b border-gray-50 pb-3">
            {editingId ? 'Edit Testimonial' : 'Create Testimonial'}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Customer Name *</label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm"
                placeholder="Priya Sharma"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Designation</label>
                <input type="text" {...register('designation')} className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm" placeholder="Nutritionist" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Company</label>
                <input type="text" {...register('company')} className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm" placeholder="NutriLife Clinic" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Content *</label>
              <textarea
                {...register('content', { required: 'Content is required' })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm resize-none"
                placeholder="Write the review..."
              />
              {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Rating (1-5)</label>
                <select
                  {...register('rating')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm bg-white"
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" {...register('featured')} className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              <label htmlFor="featured" className="text-xs font-semibold text-gray-700">Feature on Home Carousel</label>
            </div>

            <div className="flex gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 btn-primary py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5"
              >
                <FiSave /> {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
