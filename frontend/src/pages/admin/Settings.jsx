import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiSave, FiUploadCloud, FiTrash2 } from 'react-icons/fi';
import { settingsApi, mediaApi } from '../../api';
import { useSettings } from '../../context/SettingsContext';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { updateSettings } = useSettings();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      companyName: '',
      tagline: '',
      email: '',
      phone: '',
      address: '',
      whatsapp: '',
      socialLinks: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        youtube: ''
      },
      footerText: '',
      amazonStoreUrl: '',
      logo: { url: '' },
      favicon: { url: '' },
      shippingCharge: 49,
      freeShippingMinAmount: 499,
      smtp: {
        host: '',
        port: 587,
        user: '',
        pass: ''
      },
      stats: {
        happyCustomers: '10000+',
        productsCount: '50+',
        peelsRecycled: '500T',
        averageRating: '4.9/5'
      },
      homeCarousel: []
    }
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsApi.get();
      if (res.data) {
        reset(res.data);
      }
    } catch (err) {
      toast.error('Failed to load website settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'settings');

    try {
      const res = await mediaApi.upload(formData);
      setValue(fieldName, { url: res.data.url, publicId: res.data.publicId });
      toast.success(`${fieldName} updated successfully`);
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleCarouselUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    const uploadedImages = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'settings');
      try {
        const res = await mediaApi.upload(formData);
        uploadedImages.push({ url: res.data.url, publicId: res.data.publicId });
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (uploadedImages.length > 0) {
      const currentCarousel = watch('homeCarousel') || [];
      setValue('homeCarousel', [...currentCarousel, ...uploadedImages]);
      toast.success('Carousel images uploaded successfully');
    }
    setUploading(false);
  };

  const handleRemoveCarouselImage = (indexToRemove) => {
    const currentCarousel = watch('homeCarousel') || [];
    const updatedCarousel = currentCarousel.filter((_, i) => i !== indexToRemove);
    setValue('homeCarousel', updatedCarousel);
    toast.success('Carousel image removed');
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await settingsApi.update(data);
      toast.success('Website settings updated successfully!');
      updateSettings(data);
      fetchSettings();
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const logoVal = watch('logo.url');
  const faviconVal = watch('favicon.url');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <h1 className="text-xl font-poppins font-bold text-dark">Website Settings</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Brand details */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6">
          <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3">Company Brand Identity</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins font-medium">Company Name *</label>
              <input
                type="text"
                {...register('companyName', { required: 'Name is required' })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins font-medium">Tagline</label>
              <input
                type="text"
                {...register('tagline')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase font-poppins">Brand Logo</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center relative h-28 flex items-center justify-center">
                {logoVal ? (
                  <div className="relative h-20">
                    <img src={logoVal} alt="Logo" className="h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setValue('logo.url', '')}
                      className="absolute -top-1 -right-4 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <FiUploadCloud className="w-6 h-6 mx-auto text-gray-400" />
                    <p className="text-xs text-gray-500">Logo Image</p>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                )}
              </div>
            </div>

            {/* Favicon */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase font-poppins">Favicon</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center relative h-28 flex items-center justify-center">
                {faviconVal ? (
                  <div className="relative h-10 w-10">
                    <img src={faviconVal} alt="Favicon" className="h-full w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setValue('favicon.url', '')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <FiUploadCloud className="w-6 h-6 mx-auto text-gray-400" />
                    <p className="text-xs text-gray-500">Favicon file</p>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'favicon')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact settings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6">
          <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3">Contact Channels</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Inquiry Email</label>
              <input type="email" {...register('email')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" placeholder="info@peelkraft.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Phone Number</label>
              <input type="text" {...register('phone')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" placeholder="+91 85115 33004" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">WhatsApp Number</label>
              <input type="text" {...register('whatsapp')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" placeholder="+91 85115 33004" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Corporate Address</label>
            <textarea 
              rows={3} 
              {...register('address')} 
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm resize-y" 
            />
          </div>
        </div>

        {/* Social channels */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6">
          <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3">Social Profiles</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">Instagram URL</label>
              <input type="url" {...register('socialLinks.instagram')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" placeholder="https://instagram.com/peelkraft" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">Amazon Brand Store Link</label>
              <input type="url" {...register('amazonStoreUrl')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" placeholder="https://www.amazon.in/stores/PeelKraft" />
            </div>
          </div>
        </div>

        {/* Shipping Configurations */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6">
          <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3">Shipping Configurations</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Standard Shipping Charge (₹) *</label>
              <input 
                type="number" 
                {...register('shippingCharge', { required: 'Shipping charge is required', min: { value: 0, message: 'Must be at least 0' } })} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm" 
                placeholder="49" 
              />
              {errors.shippingCharge && <p className="text-red-500 text-xs mt-1">{errors.shippingCharge.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Free Shipping Minimum Purchase (₹) *</label>
              <input 
                type="number" 
                {...register('freeShippingMinAmount', { required: 'Minimum purchase is required', min: { value: 0, message: 'Must be at least 0' } })} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm" 
                placeholder="499" 
              />
              {errors.freeShippingMinAmount && <p className="text-red-500 text-xs mt-1">{errors.freeShippingMinAmount.message}</p>}
            </div>
          </div>
        </div>

        {/* SMTP configs */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6">
          <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3">SMTP Mail Settings</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">SMTP Host</label>
              <input type="text" {...register('smtp.host')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">SMTP Port</label>
              <input type="number" {...register('smtp.port')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" placeholder="587" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Sender Email Address</label>
              <input type="email" {...register('smtp.user')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" placeholder="noreply@peelkraft.com" />
            </div>
          </div>
          <div className="md:w-1/3">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Sender Password / App Key</label>
            <input type="password" {...register('smtp.pass')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" placeholder="••••••••" />
          </div>
        </div>

        {/* Home Page Carousel Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-poppins font-bold text-dark">Home Page Carousel Images</h3>
            <span className="text-xs text-gray-500 font-medium">
              {(watch('homeCarousel') || []).length} {(watch('homeCarousel') || []).length === 1 ? 'image' : 'images'} uploaded
            </span>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-primary-500 transition-colors relative bg-gray-50/50">
            <div className="space-y-3">
              <FiUploadCloud className="w-10 h-10 mx-auto text-[#7BA639]" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Click to select & upload Carousel Image(s)</p>
                <p className="text-xs text-gray-400 mt-1">Select one or multiple images (PNG, JPG, WEBP)</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleCarouselUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Uploaded Images Grid */}
          {(watch('homeCarousel') || []).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase font-poppins">Uploaded Carousel Images</p>
                <span className="text-[10px] text-gray-400 font-sans">Images display on Home Page in 1:1 aspect ratio</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {(watch('homeCarousel') || []).map((img, idx) => {
                  const imgUrl = typeof img === 'string' ? img : img.url;
                  return (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50 shadow-sm">
                      <img src={imgUrl} alt={`Carousel ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-dark/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-sans">
                        #{idx + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCarouselImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-md opacity-90 hover:opacity-100 transition-opacity"
                        title="Remove Image"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Company Impact Statistics */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6">
          <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3">Impact Statistics</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Happy Customers</label>
              <input type="text" {...register('stats.happyCustomers')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" placeholder="10000+" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Peels Recycled</label>
              <input type="text" {...register('stats.peelsRecycled')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" placeholder="500T" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Average Rating</label>
              <input type="text" {...register('stats.averageRating')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" placeholder="4.9/5" />
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-4">
          <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3">Page Footer</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Copyright Text</label>
            <input type="text" {...register('footerText')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving || uploading}
            className="btn-primary py-3.5 px-10 rounded-xl flex items-center gap-2 text-sm text-white disabled:opacity-50"
          >
            <FiSave className="w-5 h-5" /> {saving ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
