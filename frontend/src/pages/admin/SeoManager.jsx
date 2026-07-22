import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiSave, FiSearch, FiGlobe } from 'react-icons/fi';
import { seoApi } from '../../api';

const SeoManager = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState('home');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      canonicalUrl: '',
      twitterCard: 'summary_large_image'
    }
  });

  const fetchSeo = async () => {
    setLoading(true);
    try {
      const res = await seoApi.getByPage(selectedPage);
      if (res.data) {
        const seoData = res.data;
        // Join keywords array for form input
        seoData.keywords = seoData.keywords?.join(', ') || '';
        reset(seoData);
      } else {
        reset({
          metaTitle: '',
          metaDescription: '',
          keywords: '',
          canonicalUrl: `/${selectedPage === 'home' ? '' : selectedPage}`,
          twitterCard: 'summary_large_image'
        });
      }
    } catch (err) {
      toast.error('Failed to load SEO data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeo();
  }, [selectedPage]);

  const onSubmit = async (data) => {
    // Parse keywords back to array
    const payload = {
      ...data,
      keywords: data.keywords.split(',').map(k => k.trim()).filter(k => k !== '')
    };

    try {
      await seoApi.update(selectedPage, payload);
      toast.success('SEO meta updated successfully!');
      fetchSeo();
    } catch (err) {
      toast.error('Failed to save SEO meta data');
    }
  };

  const clientPages = [
    { key: 'home', label: 'Home Page' },
    { key: 'about', label: 'About Us' },
    { key: 'products', label: 'Products Listing' },
    { key: 'sustainability', label: 'Sustainability' },
    { key: 'blogs', label: 'Blog Feed' },
    { key: 'contact', label: 'Contact Us' },
  ];

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Pages selector list */}
      <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6 self-start">
        <div className="border-b border-gray-50 pb-3">
          <h3 className="font-poppins font-bold text-dark text-base">Select Page</h3>
        </div>
        <div className="space-y-1">
          {clientPages.map((page) => (
            <button
              key={page.key}
              onClick={() => setSelectedPage(page.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold capitalize transition-all ${
                selectedPage === page.key
                  ? 'bg-primary-50 text-primary-500'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <FiGlobe className="w-5 h-5 shrink-0" />
              <span>{page.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SEO configuration fields form */}
      <div className="lg:col-span-3">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6">
          <div className="border-b border-gray-50 pb-3">
            <h3 className="font-poppins font-bold text-dark text-lg capitalize">
              SEO Settings — {clientPages.find(p => p.key === selectedPage)?.label}
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Meta TitleTag *</label>
                <input
                  type="text"
                  {...register('metaTitle', { required: 'Meta title is required' })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm font-inter"
                  placeholder="PeelKraft | Premium Sustainable Organic Orange Peel Food"
                />
                {errors.metaTitle && <p className="text-red-500 text-xs mt-1">{errors.metaTitle.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Meta DescriptionTag *</label>
                <textarea
                  {...register('metaDescription', { required: 'Meta description is required' })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm resize-none"
                  placeholder="Enter page meta description..."
                />
                {errors.metaDescription && <p className="text-red-500 text-xs mt-1">{errors.metaDescription.message}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins font-medium">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    {...register('keywords')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm"
                    placeholder="peelkraft, sustainable food, zero waste"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins font-medium">Canonical Link Path</label>
                  <input
                    type="text"
                    {...register('canonicalUrl')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm"
                    placeholder="/about"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins font-medium">Twitter Card Type</label>
                <select
                  {...register('twitterCard')}
                  className="w-full md:w-1/3 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm bg-white font-inter"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary with Large Image</option>
                </select>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="btn-primary py-3 px-8 rounded-xl flex items-center gap-2 text-sm text-white"
                >
                  <FiSave className="w-5 h-5" /> Save Metadata Settings
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeoManager;
