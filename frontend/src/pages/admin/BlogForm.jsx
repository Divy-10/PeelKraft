import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave, FiUploadCloud, FiTrash2 } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { blogApi, mediaApi } from '../../api';

const BlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [editorVal, setEditorVal] = useState('');
  const [uploading, setUploading] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      category: 'General',
      excerpt: '',
      tags: [],
      featuredImage: { url: '' },
      status: 'draft',
      featured: false,
      seoTitle: '',
      seoDescription: '',
    }
  });

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      blogApi.getBySlug(id)
        .then(res => {
          const blog = res.data;
          reset(blog);
          setEditorVal(blog.content || '');
          setTagsInput(blog.tags?.join(', ') || '');
        })
        .catch(() => toast.error('Failed to load blog article'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, reset]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'blogs');

    try {
      const res = await mediaApi.upload(formData);
      setValue('featuredImage', { url: res.data.url, publicId: res.data.publicId });
      toast.success('Hero image uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload hero image');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    data.content = editorVal;
    data.tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    setLoading(true);
    try {
      if (isEdit) {
        await blogApi.update(data._id, data);
        toast.success('Article updated successfully');
      } else {
        await blogApi.create(data);
        toast.success('Article published successfully');
      }
      navigate('/admin/blogs');
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const featuredImageVal = watch('featuredImage.url');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/admin/blogs" className="flex items-center gap-2 text-gray-500 hover:text-dark transition-colors font-medium">
          <FiArrowLeft /> Back to Articles
        </Link>
        <h1 className="text-xl font-poppins font-bold text-dark">{isEdit ? 'Edit Article' : 'Write New Article'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6">
          <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3">Article Content</h3>
          
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins font-medium">Title *</label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm font-inter"
              placeholder="e.g. The Incredible Health Benefits of Orange Peels"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins font-medium">Category</label>
              <input
                type="text"
                {...register('category')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm font-inter"
                placeholder="e.g. Health & Wellness"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins font-medium">Tags (comma-separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm font-inter"
                placeholder="e.g. health, vitamin C, wellness"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins font-medium">Excerpt (Summary)</label>
            <textarea
              {...register('excerpt')}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm font-inter resize-none"
              placeholder="Enter teaser excerpt summarizing the post..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase font-poppins font-medium">Full Content</label>
            <ReactQuill theme="snow" value={editorVal} onChange={setEditorVal} />
          </div>
        </div>

        {/* Featured Image */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6">
          <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3">Cover Image</h3>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-primary-500 transition-colors relative max-w-lg mx-auto">
            {featuredImageVal ? (
              <div className="relative aspect-video max-h-52 mx-auto">
                <img src={featuredImageVal} alt="Hero preview" className="w-full h-full object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => setValue('featuredImage.url', '')}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <FiUploadCloud className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-sm text-gray-500">Upload Hero Cover Image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Status / Publish Options */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card flex flex-wrap gap-8 items-center">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" {...register('featured')} className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
            <label htmlFor="featured" className="text-sm font-semibold text-gray-700">Feature this post on Homepage</label>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Publishing Status:</span>
            <select {...register('status')} className="px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold text-gray-600 bg-white">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* SEO Manager section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6">
          <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3">Search Engine Optimization (SEO)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">SEO Meta Title</label>
              <input
                type="text"
                {...register('seoTitle')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm"
                placeholder="Product SEO meta title tag..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">SEO Meta Description</label>
              <textarea
                {...register('seoDescription')}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm resize-none"
                placeholder="Product SEO meta description tag..."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link to="/admin/blogs" className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={uploading || loading}
            className="btn-primary py-3 px-8 rounded-xl flex items-center gap-2 text-sm text-white disabled:opacity-50"
          >
            <FiSave className="w-5 h-5" /> Save Article
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
