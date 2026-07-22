import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiUploadCloud } from 'react-icons/fi';
import { categoryApi, mediaApi } from '../../api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      image: { url: '' },
      status: 'active',
      order: 0,
    }
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCancelEdit = () => {
    setEditingId(null);
    reset({
      name: '',
      description: '',
      status: 'active',
      order: 0,
    });
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await categoryApi.update(editingId, data);
        toast.success('Category updated successfully');
      } else {
        await categoryApi.create(data);
        toast.success('Category created successfully');
      }
      handleCancelEdit();
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? This might affect products under it.')) return;
    try {
      await categoryApi.delete(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  const imageUrl = watch('image.url');

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Category List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-poppins font-bold text-dark text-lg">Product Categories</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              No categories found. Create one now.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <div key={cat._id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-poppins font-bold text-dark">{cat.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{cat.slug}</p>
                      {cat.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{cat.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                      cat.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {cat.status}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditClick(cat)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary-500 transition-colors"
                      >
                        <FiEdit className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inline Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card sticky top-28 space-y-6">
          <h3 className="font-poppins font-bold text-dark text-lg border-b border-gray-50 pb-3">
            {editingId ? 'Edit Category' : 'Create Category'}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Category Name *</label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm"
                placeholder="e.g. Orange Peel Powder"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm resize-none"
                placeholder="Enter category description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Order</label>
                <input
                  type="number"
                  {...register('order')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <FiX /> Cancel
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

export default Categories;
