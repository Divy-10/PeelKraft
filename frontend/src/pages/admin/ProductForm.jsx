import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiPlus, FiTrash2, FiSave, FiUploadCloud } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { productApi, categoryApi, mediaApi } from '../../api';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editorVal, setEditorVal] = useState('');
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      category: '',
      shortDescription: '',
      amazonLink: '',
      status: 'draft',
      featured: false,
      isUpcoming: false,
      weight: '',
      shelfLife: '',
      storage: '',
      benefits: [''],
      ingredients: [''],
      nutrition: {
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        sugar: '',
        vitaminC: ''
      },
      thumbnail: { url: '' },
      featuredImage: { url: '' },
      seoTitle: '',
      seoDescription: '',
    }
  });

  const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({
    control,
    name: 'benefits'
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await categoryApi.getAll();
        setCategories(catRes.data || []);
      } catch (e) {
        console.error(e);
      }

      if (isEdit) {
        setLoading(true);
        try {
          const res = await productApi.getBySlug(id);
          const product = res.data;
          let galleryList = product.gallery || [];
          if (!galleryList.length && (product.featuredImage?.url || product.thumbnail?.url)) {
            const mainUrl = product.featuredImage?.url || product.thumbnail?.url;
            galleryList = [{ url: mainUrl, publicId: product.featuredImage?.publicId || '' }];
          }
          product.gallery = galleryList;
          if (product.category && typeof product.category === 'object') {
            product.category = product.category._id;
          }
          reset(product);
          setEditorVal(product.description || '');
        } catch (e) {
          toast.error('Failed to load product details');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [id, isEdit, reset]);

  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      const uploadPromises = files.map((file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'products');
        return mediaApi.upload(formData);
      });

      const responses = await Promise.all(uploadPromises);
      const newImages = responses.map((res) => ({
        url: res.data.url,
        publicId: res.data.publicId,
        alt: watch('name') || 'Product Image',
      }));

      const currentGallery = watch('gallery') || [];
      const updatedGallery = [...currentGallery, ...newImages];
      setValue('gallery', updatedGallery);

      if (updatedGallery.length > 0) {
        setValue('thumbnail', { url: updatedGallery[0].url, publicId: updatedGallery[0].publicId });
        setValue('featuredImage', { url: updatedGallery[0].url, publicId: updatedGallery[0].publicId });
      }

      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (err) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const currentGallery = watch('gallery') || [];
    const updatedGallery = currentGallery.filter((_, i) => i !== indexToRemove);
    setValue('gallery', updatedGallery);

    if (updatedGallery.length > 0) {
      setValue('thumbnail', { url: updatedGallery[0].url, publicId: updatedGallery[0].publicId });
      setValue('featuredImage', { url: updatedGallery[0].url, publicId: updatedGallery[0].publicId });
    } else {
      setValue('thumbnail', { url: '' });
      setValue('featuredImage', { url: '' });
    }
  };

  const onSubmit = async (data) => {
    data.description = editorVal;
    // Clean up empty fields
    data.benefits = data.benefits.filter(b => b.trim() !== '');
    data.ingredients = data.ingredients.filter(i => i.trim() !== '');

    setLoading(true);
    try {
      if (isEdit) {
        await productApi.update(data._id, data);
        toast.success('Product updated successfully');
      } else {
        await productApi.create(data);
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
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

  const thumbnailVal = watch('thumbnail.url');
  const featuredImageVal = watch('featuredImage.url');
  const galleryVal = watch('gallery') || [];
  const productName = watch('name');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/admin/products" className="flex items-center gap-2 text-gray-500 hover:text-dark transition-colors font-medium">
          <FiArrowLeft /> Back to Products
        </Link>
        <h1 className="text-xl font-poppins font-bold text-dark">
          {isEdit ? `Edit Product: ${productName || 'Product'}` : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Core details */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6">
          <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3">Basic Information</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Product Name *</label>
              <input
                type="text"
                {...register('name', { required: 'Product name is required' })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm font-inter"
                placeholder="PeelKraft Orange Peel Powder"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Category *</label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm font-inter bg-white"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Weight / Pack Size</label>
              <input
                type="text"
                {...register('weight')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm font-inter"
                placeholder="200g"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Shelf Life</label>
              <input
                type="text"
                {...register('shelfLife')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm font-inter"
                placeholder="12 months"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Amazon Redirect Link</label>
              <input
                type="url"
                {...register('amazonLink')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm font-inter"
                placeholder="https://amazon.in/dp/..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Short Description</label>
            <textarea
              {...register('shortDescription')}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm font-inter resize-none"
              placeholder="Enter brief teaser description..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase font-poppins font-medium">Full Description</label>
            <ReactQuill theme="snow" value={editorVal} onChange={setEditorVal} />
          </div>
        </div>

        {/* Multi-Image Product Media Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-poppins font-bold text-dark">Product Images</h3>
            <span className="text-xs text-gray-500 font-medium">
              {galleryVal.length} {galleryVal.length === 1 ? 'image' : 'images'} uploaded
            </span>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-primary-500 transition-colors relative bg-gray-50/50">
            <div className="space-y-3">
              <FiUploadCloud className="w-10 h-10 mx-auto text-[#7BA639]" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Click to select & upload Product Image(s)</p>
                <p className="text-xs text-gray-400 mt-1">Select one or multiple images (PNG, JPG, WEBP)</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Uploaded Images Grid */}
          {galleryVal.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase font-poppins">Uploaded Images (First image is Cover)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {galleryVal.map((img, idx) => {
                  const imgUrl = typeof img === 'string' ? img : img.url;
                  return (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-white shadow-sm">
                      <img src={imgUrl} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#7BA639] text-white text-[10px] font-bold rounded-md shadow-sm">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
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

        {/* Dynamic Arrays for Ingredients and Benefits */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-poppins font-bold text-dark">Ingredients</h3>
              <button
                type="button"
                onClick={() => appendIngredient('')}
                className="text-xs text-primary-500 font-bold flex items-center gap-1 hover:underline"
              >
                <FiPlus /> Add Ingredient
              </button>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {ingredientFields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    {...register(`ingredients.${idx}`)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm"
                    placeholder="e.g. 100% Organic Orange Peel"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(idx)}
                    className="p-2 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-poppins font-bold text-dark">Benefits</h3>
              <button
                type="button"
                onClick={() => appendBenefit('')}
                className="text-xs text-primary-500 font-bold flex items-center gap-1 hover:underline"
              >
                <FiPlus /> Add Benefit
              </button>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {benefitFields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    {...register(`benefits.${idx}`)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm"
                    placeholder="e.g. Boosts immunity & Vitamin C"
                  />
                  <button
                    type="button"
                    onClick={() => removeBenefit(idx)}
                    className="p-2 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nutritional Facts */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6">
          <h3 className="font-poppins font-bold text-dark border-b border-gray-100 pb-3">Nutrition Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Calories</label>
              <input type="text" {...register('nutrition.calories')} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm" placeholder="97 kcal" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Protein</label>
              <input type="text" {...register('nutrition.protein')} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm" placeholder="1.5g" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Carbs</label>
              <input type="text" {...register('nutrition.carbs')} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm" placeholder="25g" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Fat</label>
              <input type="text" {...register('nutrition.fat')} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm" placeholder="0.2g" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Fiber</label>
              <input type="text" {...register('nutrition.fiber')} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm" placeholder="10g" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Sugar</label>
              <input type="text" {...register('nutrition.sugar')} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm" placeholder="8g" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Vitamin C</label>
              <input type="text" {...register('nutrition.vitaminC')} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm" placeholder="136mg" />
            </div>
          </div>
        </div>

        {/* Status / Publish Options */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card flex flex-wrap gap-8 items-center">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" {...register('featured')} className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
            <label htmlFor="featured" className="text-sm font-semibold text-gray-700">Feature this product on Homepage</label>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isUpcoming" {...register('isUpcoming')} className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
            <label htmlFor="isUpcoming" className="text-sm font-semibold text-gray-700">Mark as Upcoming Product</label>
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
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">SEO Title</label>
              <input
                type="text"
                {...register('seoTitle')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm"
                placeholder="Product SEO meta title tag..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">SEO Description</label>
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
          <Link to="/admin/products" className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={uploading || loading}
            className="btn-primary py-3 px-8 rounded-xl flex items-center gap-2 text-sm text-white disabled:opacity-50"
          >
            <FiSave className="w-5 h-5" /> Save Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
