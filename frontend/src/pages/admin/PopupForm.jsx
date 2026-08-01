import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  FiArrowLeft, FiSave, FiUploadCloud, FiTrash2, FiEye, 
  FiSettings, FiSliders, FiLayout, FiClock, FiCalendar 
} from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { popupApi, mediaApi } from '../../api';
import PopupModal from '../../components/common/PopupModal';

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-inter outline-none focus:border-primary-500 transition-colors';

const PopupForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [editorVal, setEditorVal] = useState('');
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [previewTab, setPreviewTab] = useState('editor'); // editor or preview

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      shortDescription: '',
      desktopImage: '',
      mobileImage: '',
      couponCode: '',
      buttonText: 'Shop Now',
      buttonUrl: '',
      buttonAction: 'open_external',
      offerType: 'Discount',
      priority: 0,
      status: true,
      startDate: new Date().toISOString().substring(0, 16), // YYYY-MM-DDTHH:mm
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
      showAfter: 0,
      popupSize: 'medium',
      popupPosition: 'center',
      animation: 'zoom',
      targetAudience: 'everyone',
      deviceTarget: 'all',
      displayFrequency: 'every-visit',
      customFrequencyDays: 1,
      pageTarget: 'all',
      customPages: '',
      countdownEnabled: false,
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      buttonColor: '#f97316',
      buttonTextColor: '#ffffff',
    }
  });

  // Watch fields to render dynamic live preview
  const watchedFields = watch();

  useEffect(() => {
    if (isEdit) {
      const getPopup = async () => {
        setFetching(true);
        try {
          const res = await popupApi.getAll(); // get all and find matches or create a dedicated getByID if needed
          const popup = res.data.find(p => p._id === id);
          if (!popup) {
            toast.error('Popup advertisement not found');
            navigate('/admin/popups');
            return;
          }

          // Format dates for datetime-local input fields
          const startFmt = popup.startDate ? new Date(popup.startDate).toISOString().substring(0, 16) : '';
          const endFmt = popup.endDate ? new Date(popup.endDate).toISOString().substring(0, 16) : '';

          reset({
            ...popup,
            startDate: startFmt,
            endDate: endFmt,
            customPages: popup.customPages ? popup.customPages.join(', ') : '',
          });
          setEditorVal(popup.longDescription || '');
        } catch (err) {
          toast.error('Failed to load popup details');
        } finally {
          setFetching(false);
        }
      };
      getPopup();
    }
  }, [id, isEdit, reset, navigate]);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'desktop') setUploadingDesktop(true);
    else setUploadingMobile(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'popups');

    try {
      const res = await mediaApi.upload(formData);
      setValue(type === 'desktop' ? 'desktopImage' : 'mobileImage', res.data.url);
      toast.success(`${type === 'desktop' ? 'Desktop' : 'Mobile'} banner uploaded successfully!`);
    } catch (err) {
      toast.error('Failed to upload banner image.');
    } finally {
      if (type === 'desktop') setUploadingDesktop(false);
      else setUploadingMobile(false);
    }
  };

  const onSubmit = async (data) => {
    data.longDescription = editorVal;
    
    // Parse custom pages comma-separated list into array
    if (data.customPages) {
      data.customPages = data.customPages.split(',').map(p => p.trim()).filter(p => p !== '');
    } else {
      data.customPages = [];
    }

    setLoading(true);
    try {
      if (isEdit) {
        await popupApi.update(id, data);
        toast.success('Popup advertisement updated successfully');
      } else {
        await popupApi.create(data);
        toast.success('Popup advertisement created successfully!');
      }
      navigate('/admin/popups');
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Inject rich text inside watched object for preview
  const livePreviewData = {
    ...watchedFields,
    longDescription: editorVal,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-inter">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <Link to="/admin/popups" className="flex items-center gap-2 text-gray-500 hover:text-dark transition-colors font-medium">
          <FiArrowLeft /> Back to List
        </Link>
        <h1 className="text-xl font-poppins font-bold text-dark">
          {isEdit ? 'Edit Promotional Popup' : 'Create Promotional Popup'}
        </h1>
      </div>

      {/* Tabs for Form Editor vs Live Preview */}
      <div className="border-b border-gray-100 flex gap-4">
        <button
          onClick={() => setPreviewTab('editor')}
          className={`pb-3 font-poppins font-bold text-sm tracking-wide border-b-2 transition-all ${
            previewTab === 'editor' 
              ? 'border-primary-500 text-primary-500' 
              : 'border-transparent text-gray-400 hover:text-dark'
          }`}
        >
          📝 Form Editor
        </button>
        <button
          onClick={() => setPreviewTab('preview')}
          className={`pb-3 font-poppins font-bold text-sm tracking-wide border-b-2 transition-all flex items-center gap-1.5 ${
            previewTab === 'preview' 
              ? 'border-primary-500 text-primary-500' 
              : 'border-transparent text-gray-400 hover:text-dark'
          }`}
        >
          <FiEye /> Interactive Live Preview
        </button>
      </div>

      {previewTab === 'preview' ? (
        <div className="bg-gray-100/50 rounded-3xl min-h-[550px] relative p-8 border border-gray-200/50 flex items-center justify-center overflow-hidden">
          <div className="text-center absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/40 text-xs font-semibold text-gray-500">
            Preview Mode: Interact with buttons, countdowns, and styles.
          </div>
          <PopupModal isPreview={true} previewData={livePreviewData} />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form Fields: Title, description, imagery */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Core Info */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3 flex items-center gap-2">
                <FiSliders className="text-primary-500" /> Basic Details
              </h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Advertisement Title *</label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className={inputCls}
                  placeholder="e.g. End of Season Megastore Sale"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Short Subtitle / Subtext</label>
                <input
                  type="text"
                  {...register('shortDescription')}
                  className={inputCls}
                  placeholder="e.g. Save flat 20% off on all organic orange-peel based products."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Long Description (Rich Text Layout)</label>
                <ReactQuill
                  value={editorVal}
                  onChange={setEditorVal}
                  className="rounded-xl overflow-hidden border border-gray-200"
                  theme="snow"
                  placeholder="Design a rich marketing message here..."
                />
              </div>
            </div>

            {/* Banners & Images */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3 flex items-center gap-2">
                <FiLayout className="text-primary-500" /> Banner Creative Images
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Desktop banner */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Desktop Creative Image *</label>
                  <div className="border-2 border-dashed border-gray-200 hover:border-primary-400 rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-gray-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'desktop')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {uploadingDesktop ? (
                      <p className="text-sm text-gray-400 py-6">Uploading desktop image...</p>
                    ) : watchedFields.desktopImage ? (
                      <div className="space-y-2">
                        <img src={watchedFields.desktopImage} alt="" className="h-32 mx-auto rounded-lg object-cover" />
                        <p className="text-xs text-emerald-500 font-semibold">Change desktop image</p>
                      </div>
                    ) : (
                      <div className="py-6 space-y-2">
                        <FiUploadCloud className="w-8 h-8 text-gray-400 mx-auto" />
                        <p className="text-xs text-gray-500">Upload high-res desktop creative (min 800x800)</p>
                      </div>
                    )}
                  </div>
                  <input type="hidden" {...register('desktopImage', { required: 'Desktop image is required' })} />
                  {errors.desktopImage && <p className="text-red-500 text-xs mt-1">{errors.desktopImage.message}</p>}
                </div>

                {/* Mobile banner */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Mobile Creative Image (Optional)</label>
                  <div className="border-2 border-dashed border-gray-200 hover:border-primary-400 rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-gray-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'mobile')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {uploadingMobile ? (
                      <p className="text-sm text-gray-400 py-6">Uploading mobile image...</p>
                    ) : watchedFields.mobileImage ? (
                      <div className="space-y-2">
                        <img src={watchedFields.mobileImage} alt="" className="h-32 mx-auto rounded-lg object-cover" />
                        <p className="text-xs text-emerald-500 font-semibold">Change mobile image</p>
                      </div>
                    ) : (
                      <div className="py-6 space-y-2">
                        <FiUploadCloud className="w-8 h-8 text-gray-400 mx-auto" />
                        <p className="text-xs text-gray-500">Upload portrait mobile banner (optional)</p>
                      </div>
                    )}
                  </div>
                  <input type="hidden" {...register('mobileImage')} />
                </div>
              </div>
            </div>

            {/* Actions & Buttons */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3 flex items-center gap-2">
                <FiSliders className="text-primary-500" /> Interactive Actions & Coupons
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Button Action</label>
                  <select {...register('buttonAction')} className={inputCls}>
                    <option value="open_external">Open URL / Route Link</option>
                    <option value="copy_coupon">Copy Coupon & Notify</option>
                    <option value="close_popup">Close Popup Overlay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Button URL / Path</label>
                  <input
                    type="text"
                    {...register('buttonUrl')}
                    className={inputCls}
                    placeholder="e.g. /category/powder or https://..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Button CTA Text</label>
                  <input
                    type="text"
                    {...register('buttonText')}
                    className={inputCls}
                    placeholder="e.g. Shop Collection"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Promo Coupon Code (Optional)</label>
                  <input
                    type="text"
                    {...register('couponCode')}
                    className={`${inputCls} uppercase font-mono`}
                    placeholder="e.g. PEELKRAFT20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Rules, display targeting, design styling */}
          <div className="space-y-6">
            
            {/* Display & Schedule Settings */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3 flex items-center gap-2">
                <FiCalendar className="text-primary-500" /> Display & Scheduling
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Offer Type *</label>
                <select {...register('offerType', { required: true })} className={inputCls}>
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

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Active Start Date & Time *</label>
                <input type="datetime-local" {...register('startDate', { required: true })} className={inputCls} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Active End Date & Time *</label>
                <input type="datetime-local" {...register('endDate', { required: true })} className={inputCls} />
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700">Enable Countdown</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Show active remaining hours ticker</span>
                </div>
                <input type="checkbox" {...register('countdownEnabled')} className="w-5 h-5 accent-primary-500" />
              </div>
            </div>

            {/* Targeting Rules */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3 flex items-center gap-2">
                <FiSettings className="text-primary-500" /> Targeting Rules
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Show To Audience</label>
                <select {...register('targetAudience')} className={inputCls}>
                  <option value="everyone">Everyone (All Visitors)</option>
                  <option value="guests">Guests Only</option>
                  <option value="users">Logged-in Users Only</option>
                  <option value="first-time">First-time Visitors Only</option>
                  <option value="returning">Returning Visitors Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Device Target</label>
                <select {...register('deviceTarget')} className={inputCls}>
                  <option value="all">All Devices</option>
                  <option value="desktop">Desktop Only</option>
                  <option value="mobile">Mobile Only</option>
                  <option value="tablet">Tablet Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Display Frequency</label>
                <select {...register('displayFrequency')} className={inputCls}>
                  <option value="every-visit">Every Visit</option>
                  <option value="once">Once Ever (Per User)</option>
                  <option value="daily">Once Per Day</option>
                  <option value="three-days">Once Every 3 Days</option>
                  <option value="weekly">Once Per Week</option>
                  <option value="custom">Custom Days Interval</option>
                </select>
              </div>

              {watchedFields.displayFrequency === 'custom' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Custom Days Interval</label>
                  <input type="number" {...register('customFrequencyDays')} className={inputCls} min="1" />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Page Targeting</label>
                <select {...register('pageTarget')} className={inputCls}>
                  <option value="all">Entire Website</option>
                  <option value="home">Home Page Only</option>
                  <option value="category">Category Pages Only</option>
                  <option value="product">Product Details Pages Only</option>
                  <option value="cart">Cart Page</option>
                  <option value="checkout">Checkout Page</option>
                  <option value="custom">Custom URLs / Paths</option>
                </select>
              </div>

              {watchedFields.pageTarget === 'custom' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Custom URLs (comma-separated)</label>
                  <input
                    type="text"
                    {...register('customPages')}
                    className={inputCls}
                    placeholder="e.g. /about, /sustainability, /contact"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Use wildcards like /recipes/* if necessary.</p>
                </div>
              )}
            </div>

            {/* Design & Position Options */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3 flex items-center gap-2">
                <FiLayout className="text-primary-500" /> UI Styles & Layout
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Popup Size</label>
                  <select {...register('popupSize')} className={inputCls}>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="xl">Extra Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Position</label>
                  <select {...register('popupPosition')} className={inputCls}>
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Entry Animation</label>
                  <select {...register('animation')} className={inputCls}>
                    <option value="zoom">Zoom</option>
                    <option value="fade">Fade</option>
                    <option value="slideUp">Slide Up</option>
                    <option value="slideDown">Slide Down</option>
                    <option value="bounce">Bounce</option>
                    <option value="rotate">Rotate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Display Delay (Seconds)</label>
                  <select {...register('showAfter')} className={inputCls}>
                    <option value={0}>Immediately</option>
                    <option value={2}>2 Seconds</option>
                    <option value={5}>5 Seconds</option>
                    <option value={10}>10 Seconds</option>
                  </select>
                </div>
              </div>

              {/* Color Customizations */}
              <div className="space-y-4 border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-700">Visual Color Palette</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Background</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        value={watchedFields.backgroundColor || '#ffffff'} 
                        onChange={(e) => setValue('backgroundColor', e.target.value)} 
                        className="w-8 h-8 rounded border cursor-pointer shrink-0" 
                      />
                      <input type="text" {...register('backgroundColor')} className="text-xs font-mono w-full border rounded px-1.5 py-1" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Main Text</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        value={watchedFields.textColor || '#1f2937'} 
                        onChange={(e) => setValue('textColor', e.target.value)} 
                        className="w-8 h-8 rounded border cursor-pointer shrink-0" 
                      />
                      <input type="text" {...register('textColor')} className="text-xs font-mono w-full border rounded px-1.5 py-1" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Button Color</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        value={watchedFields.buttonColor || '#f97316'} 
                        onChange={(e) => setValue('buttonColor', e.target.value)} 
                        className="w-8 h-8 rounded border cursor-pointer shrink-0" 
                      />
                      <input type="text" {...register('buttonColor')} className="text-xs font-mono w-full border rounded px-1.5 py-1" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Button Text</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        value={watchedFields.buttonTextColor || '#ffffff'} 
                        onChange={(e) => setValue('buttonTextColor', e.target.value)} 
                        className="w-8 h-8 rounded border cursor-pointer shrink-0" 
                      />
                      <input type="text" {...register('buttonTextColor')} className="text-xs font-mono w-full border rounded px-1.5 py-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Priority */}
              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Priority Rank</label>
                  <input type="number" {...register('priority')} className={inputCls} min="0" />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Status</label>
                  <label className="inline-flex items-center gap-2 cursor-pointer py-2">
                    <input type="checkbox" {...register('status')} className="w-5 h-5 accent-primary-500" />
                    <span className="text-xs font-bold text-gray-700">Active (Published)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Action Card */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 text-white font-poppins font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-primary-500/20 active:scale-98 transition-all"
              >
                <FiSave /> {loading ? 'Saving Changes...' : 'Save Advertisement'}
              </button>
            </div>

          </div>
        </form>
      )}
    </div>
  );
};

export default PopupForm;
