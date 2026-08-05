import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiCheck, FiClock, FiBox, FiStar, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import { productApi, reviewApi, wishlistApi } from '../../api';
import { getImageUrl, getInitials } from '../../utils';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import WriteReviewModal from '../../components/common/WriteReviewModal';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useUser();

  const [product, setProduct] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    setQuantity(1);
  }, [selectedPackage]);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await productApi.getBySlug(slug);
        setProduct(res.data);
        setQuantity(1);
        setSelectedPackage(res.data.packageOptions && res.data.packageOptions.length > 0 ? res.data.packageOptions.find(o => o.stock > 0 && o.status !== 'disabled') || res.data.packageOptions[0] : null);

        // Load wishlist status
        if (isAuthenticated) {
          try {
            const wishRes = await wishlistApi.get();
            const inWishlist = (wishRes.data || []).some(
              (item) => item.product?._id === res.data?._id || item.product === res.data?._id
            );
            setWishlisted(inWishlist);
          } catch (e) {
            console.error('Error fetching wishlist status:', e);
          }
        }

        // Load reviews
        try {
          const revRes = await reviewApi.getByProduct(res.data._id, { sortBy });
          setReviews(revRes.data?.reviews || []);
          setReviewStats(revRes.data?.stats || null);
        } catch (e) {
          console.error('Error loading reviews:', e);
        }

        // Load related products
        if (res.data?.category?._id) {
          const relRes = await productApi.getAll({ category: res.data.category._id, limit: 4 });
          setRelatedProducts((relRes.data.data || relRes.data || []).filter(p => p._id !== res.data._id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug, isAuthenticated]);

  // Refetch reviews when sorting changes
  useEffect(() => {
    if (product?._id) {
      const reloadReviews = async () => {
        try {
          const revRes = await reviewApi.getByProduct(product._id, { sortBy });
          setReviews(revRes.data?.reviews || []);
          setReviewStats(revRes.data?.stats || null);
        } catch (e) {
          console.error('Error re-sorting reviews:', e);
        }
      };
      reloadReviews();
    }
  }, [sortBy, product?._id]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to save products in your wishlist.');
      navigate('/login', { state: { from: `/products/${slug}` } });
      return;
    }

    try {
      if (wishlisted) {
        await wishlistApi.remove(product._id);
        setWishlisted(false);
        toast.success('Removed from wishlist.');
      } else {
        await wishlistApi.add({ productId: product._id });
        setWishlisted(true);
        toast.success('Added to wishlist.');
      }
    } catch (err) {
      toast.error('Failed to update wishlist.');
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to your cart.');
      navigate('/login', { state: { from: `/products/${slug}` } });
      return;
    }
    if (isOutOfStock) return;
    addToCart(product, selectedPackage, quantity);
    toast.success(`${product.name}${selectedPackage ? ` (${selectedPackage.name})` : ''} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.info('Please login to purchase products.');
      navigate('/login', { state: { from: `/products/${slug}` } });
      return;
    }
    if (isOutOfStock) return;
    addToCart(product, selectedPackage, quantity);
    navigate('/checkout');
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await reviewApi.markHelpful(reviewId);
      toast.success('Thank you for your feedback!');
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r));
    } catch (err) {
      toast.error('Failed to register helpful feedback.');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-poppins font-bold mb-2">Product Not Found</h2>
        <Link to="/products" className="text-primary-500">← Back to Products</Link>
      </div>
    </div>
  );

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
  ];

  let mediaList = [];
  
  // 1. Add featured/cover image as the first item
  if (product.featuredImage?.url) {
    mediaList.push({ type: 'image', url: product.featuredImage.url, alt: product.name });
  } else if (product.thumbnail?.url) {
    mediaList.push({ type: 'image', url: product.thumbnail.url, alt: product.name });
  }

  // 2. Add unique gallery images (filtering duplicates of the cover image)
  if (product.gallery && product.gallery.length > 0) {
    product.gallery.forEach(img => {
      const url = typeof img === 'string' ? img : img.url;
      if (url) {
        const isDuplicate = mediaList.some(item => item.url === url);
        if (!isDuplicate) {
          mediaList.push({ type: 'image', url: url, alt: product.name });
        }
      }
    });
  }

  // 3. Fallback if no images are present
  if (mediaList.length === 0) {
    mediaList.push({ type: 'image', url: '/images/logo.png', alt: product.name });
  }

  // 4. Add product video
  if (product.video?.url) {
    mediaList.push({ type: 'video', url: product.video.url, alt: `${product.name} Video` });
  }

  const hasOptions = product?.packageOptions && product.packageOptions.length > 0;
  const currentPackage = hasOptions ? selectedPackage : null;
  const price = currentPackage ? currentPackage.sellingPrice : (product.sellingPrice || product.mrp || 0);
  const mrp = currentPackage ? currentPackage.mrp : (product.mrp || 0);
  const discountPercent = currentPackage ? currentPackage.discountPercent : (product.discountPercent || 0);
  const stock = currentPackage ? currentPackage.stock : (product.stock || 0);
  const trackInventory = product.trackInventory !== false;
  const isOutOfStock = trackInventory
    ? (selectedPackage 
        ? ((selectedPackage.stock ?? 0) <= 0 || selectedPackage.status === 'disabled')
        : ((product.stock ?? 0) <= 0)
      )
    : false;
  const sku = currentPackage ? currentPackage.sku : product.sku;

  const renderTabsAndDetails = () => (
    <>
      {/* Tabs */}
      <div className="border-b border-gray-100 mb-6 w-full max-w-full overflow-hidden">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide w-full max-w-full pb-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-3.5 py-2.5 sm:px-5 sm:py-3 font-inter font-medium text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-dark'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === 'description' && (
          <div className="prose-content font-inter text-gray-600 leading-relaxed overflow-x-auto break-words w-full max-w-full" dangerouslySetInnerHTML={{ __html: product.description }} />
        )}
        {activeTab === 'ingredients' && (
          <ul className="space-y-3 font-inter">{product.ingredients?.map((ing, i) => (
            <li key={i} className="flex items-center gap-3 text-gray-600"><FiCheck className="text-green-500 shrink-0" />{ing}</li>
          ))}</ul>
        )}
        {activeTab === 'nutrition' && product.nutrition && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(product.nutrition).filter(([_, v]) => v).map(([key, val]) => (
              <div key={key} className="p-3.5 sm:p-5 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 capitalize font-inter">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="font-semibold text-dark font-poppins text-sm sm:text-base mt-1">{val}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'benefits' && (
          <ul className="space-y-3 font-inter">{product.benefits?.map((ben, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-600"><span className="w-6 h-6 shrink-0 rounded-full bg-green-100 flex items-center justify-center mt-0.5"><FiCheck className="w-3.5 h-3.5 text-green-600" /></span>{ben}</li>
          ))}</ul>
        )}
        {activeTab === 'reviews' && (
          <div className="space-y-8 font-inter">
            <div className="grid grid-cols-1 gap-6">
              {/* Left: Overall Rating stats & breakdown */}
              <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 h-fit">
                <h4 className="font-poppins font-bold text-dark text-base">Customer Reviews</h4>
                {reviewStats ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="font-poppins font-bold text-4xl text-dark">
                        {reviewStats.averageRating || '0.0'}
                      </span>
                      <div>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar key={i} className={`w-4 h-4 ${i < Math.round(reviewStats.averageRating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          {reviewStats.totalReviews} total ratings
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Loading breakdown metrics...</p>
                )}

                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="w-full mt-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-poppins font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-primary-500/10 active:scale-98"
                >
                  Write a Review
                </button>
              </div>

              {/* Right: Reviews List with sorting */}
              <div className="space-y-6">
                {/* Sort bar */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <h4 className="font-poppins font-bold text-dark text-base">Reviews ({reviews.length})</h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400 font-semibold uppercase tracking-wider">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 font-bold text-dark outline-none focus:border-primary-500 transition-colors"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                      <option value="helpful">Most Helpful</option>
                    </select>
                  </div>
                </div>

                {/* Individual Review cards */}
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50/30 rounded-2xl border border-gray-100">
                      <p className="text-gray-400 text-sm">No reviews yet. Be the first to share your thoughts!</p>
                      <button
                        onClick={() => setReviewModalOpen(true)}
                        className="mt-4 px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-poppins font-semibold text-xs rounded-xl transition"
                      >
                        Write a Review
                      </button>
                    </div>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev._id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0 space-y-3">
                        {/* Profile Name & verified */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center shrink-0 bg-gray-50">
                              {rev.profilePhoto ? (
                                <img src={rev.profilePhoto} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-dark font-bold text-sm">{getInitials(rev.customerName)}</span>
                              )}
                            </div>
                            <div>
                              <span className="font-poppins font-bold block text-sm text-dark">{rev.customerName}</span>
                              <span className="text-[10px] text-gray-400 font-inter block">{new Date(rev.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {rev.isVerifiedPurchase && (
                            <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-100">
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          ))}
                          <span className="text-dark font-semibold text-xs mt-0.5 ml-1">{rev.title}</span>
                        </div>

                        {/* Message */}
                        <p className="text-gray-500 text-sm leading-relaxed font-inter">{rev.comment}</p>

                        {/* Gallery images list */}
                        {rev.images && rev.images.length > 0 && (
                          <div className="flex gap-2 pt-1 flex-wrap">
                            {rev.images.map((img, idx) => (
                              <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-lg overflow-hidden border border-gray-100 block shrink-0">
                                <img src={img} alt="" className="w-full h-full object-cover hover:opacity-95 transition" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Helpful count button */}
                        <div className="flex items-center gap-2 pt-2 text-xs">
                          <button
                            onClick={() => handleMarkHelpful(rev._id)}
                            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-gray-600 font-bold transition flex items-center gap-1 active:scale-98"
                          >
                            Helpful ({rev.helpfulCount || 0})
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Storage */}
      {product.storage && (
        <div className="mt-8 p-6 bg-gray-50 border border-gray-100 rounded-2xl font-inter">
          <h4 className="font-poppins font-semibold text-dark mb-2">Storage Instructions</h4>
          <p className="text-gray-500 text-sm leading-relaxed">{product.storage}</p>
        </div>
      )}
    </>
  );

  return (
    <>
      <SEOHead title={product.seoTitle || product.name} description={product.seoDescription || product.shortDescription} canonicalUrl={`/products/${product.slug}`} ogImage={mediaList[0]?.url} />

      <section className="pt-16 pb-8 md:pt-32 md:pb-24 bg-white overflow-hidden max-w-full">
        <div className="container-custom">
          <Breadcrumbs items={[{ label: 'Products', path: '/products' }, { label: product.name }]} />

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-16">
            {/* Gallery */}
            <motion.div className="w-full text-center lg:text-left" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="w-full max-w-md mx-auto lg:mx-0">
                <div className="w-full max-h-[460px] aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 mb-4 relative flex items-center justify-center shadow-sm">
                  {mediaList[selectedImage]?.type === 'video' ? (
                    <video 
                      src={mediaList[selectedImage].url} 
                      controls 
                      className="w-full h-full object-contain bg-black" 
                    />
                  ) : (
                    <img 
                      src={getImageUrl(mediaList[selectedImage])} 
                      alt={mediaList[selectedImage]?.alt || product.name} 
                      className="w-full h-full object-contain p-2 sm:p-6 mix-blend-multiply" 
                    />
                  )}
                </div>
                {mediaList.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin justify-start sm:justify-center lg:justify-start">
                    {mediaList.map((item, i) => (
                      <button 
                        key={i} 
                        onClick={() => setSelectedImage(i)} 
                        className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all p-1 bg-gray-50 relative ${
                          selectedImage === i 
                            ? 'border-primary-500 shadow-md ring-2 ring-primary-100' 
                            : 'border-transparent opacity-75 hover:opacity-100 hover:border-gray-200'
                        }`}
                      >
                        {item.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-black relative">
                            <span className="absolute z-10 w-6.5 h-6.5 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-md text-[10px] font-bold pl-0.5">
                              ▶
                            </span>
                            <video src={item.url} className="w-full h-full object-cover opacity-60" />
                          </div>
                        ) : (
                          <img src={getImageUrl(item)} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabs for desktop (laptop) - aligned right below the gallery */}
              <div className="hidden lg:block mt-8 w-full max-w-md mx-auto lg:mx-0">
                {renderTabsAndDetails()}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div className="w-full min-w-0 max-w-full lg:pr-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="flex gap-2 items-center mb-3">
                {product.category?.name && (
                  <span className="inline-block px-3 py-1 bg-primary-50 text-primary-500 text-sm font-semibold rounded-full">{product.category.name}</span>
                )}
                {product.isUpcoming && (
                  <span className="inline-block px-3 py-1 bg-green-900 text-white text-sm font-semibold rounded-full uppercase tracking-wider font-poppins">Upcoming</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-dark mb-2">{product.name}</h1>
              
              {/* Ratings preview */}
              <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className={`w-4 h-4 ${i < Math.round(product.avgRating || 0) ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-dark font-poppins mt-0.5">{product.avgRating || 0}</span>
                <span className="text-xs text-gray-400 font-inter">({reviews.length} customer reviews)</span>
              </div>

              {/* Product Price */}
              <div className="flex items-baseline gap-2 sm:gap-3 mb-5 sm:mb-6 flex-wrap">
                <span className="text-2xl sm:text-3xl font-poppins font-bold text-dark">₹{price}</span>
                {mrp > price && (
                  <>
                    <span className="text-base sm:text-lg text-gray-400 line-through font-inter">₹{mrp}</span>
                    <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 rounded-md font-poppins">
                      {discountPercent || Math.round(((mrp - price)/mrp)*100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Choose Package (Amazon & D2C Style Selection Grid) */}
              {hasOptions && (
                <div className="mb-6 w-full">
                  <h3 className="text-xs font-bold text-gray-500 font-poppins uppercase tracking-wider mb-3">
                    Choose Your Package
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1 w-full">
                    {product.packageOptions.map((opt) => {
                      const isOptSelected = selectedPackage?._id === opt._id;
                      const isOptOutOfStock = opt.stock <= 0 || opt.status === 'disabled';
                      const optDiscount = opt.discountPercent || (opt.mrp > opt.sellingPrice ? Math.round(((opt.mrp - opt.sellingPrice)/opt.mrp)*100) : 0);
                      const amountSaved = opt.mrp > opt.sellingPrice ? (opt.mrp - opt.sellingPrice) : 0;
                      
                      return (
                        <div
                          key={opt._id}
                          onClick={() => {
                            if (!isOptOutOfStock) {
                              setSelectedPackage(opt);
                            }
                          }}
                          className={`relative p-3 sm:p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between h-auto min-h-[130px] w-full ${
                            isOptOutOfStock
                              ? 'border-gray-100 bg-gray-50/50 opacity-40 cursor-not-allowed shadow-none'
                              : isOptSelected
                                ? 'border-primary-500 bg-primary-50/15 shadow-md shadow-primary-500/5 translate-y-[-4px]'
                                : 'border-gray-200 hover:border-gray-300 hover:translate-y-[-2px] cursor-pointer bg-white shadow-sm'
                          }`}
                        >
                          {/* Badge Tag */}
                          {opt.badge && (
                            <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-primary-500 text-white text-[10px] font-bold rounded-full font-poppins shadow-sm">
                              {opt.badge}
                            </span>
                          )}

                          {/* Top part: Name & Selection Indicator */}
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-bold text-xs sm:text-sm text-dark font-poppins line-clamp-2 leading-snug">{opt.name}</span>
                            {isOptSelected ? (
                              <span className="w-4.5 h-4.5 rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0">
                                <FiCheck className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              !isOptOutOfStock && (
                                <span className="w-4.5 h-4.5 rounded-full border-2 border-gray-200 bg-transparent shrink-0" />
                              )
                            )}
                          </div>

                          {/* Pricing details */}
                          <div className="mt-2">
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="text-lg sm:text-xl font-bold text-dark font-poppins">₹{opt.sellingPrice}</span>
                              {opt.mrp > opt.sellingPrice && (
                                <span className="text-[10px] sm:text-xs text-gray-400 line-through font-inter">₹{opt.mrp}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {optDiscount > 0 && (
                                <span className="text-[9px] sm:text-[10px] font-bold text-green-600 bg-green-50 px-1 py-0.5 rounded font-poppins">
                                  {optDiscount}% OFF
                                </span>
                              )}
                              {amountSaved > 0 && (
                                <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 font-inter">
                                  Save ₹{amountSaved}!
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stock status indicator */}
                          <div className="text-[9px] sm:text-[10px] font-semibold font-inter mt-1.5 border-t border-gray-550 pt-1.5">
                            {isOptOutOfStock ? (
                              <span className="text-red-500 flex items-center gap-1"><FiAlertCircle /> Sold Out</span>
                            ) : (
                              <span className="text-green-600 flex items-center gap-1"><FiCheck className="w-3 h-3 text-green-600" /> In Stock</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pricing & Delivery Summary Card (Dynamic updates based on chosen variant) */}
              {hasOptions && (
                <div className="bg-cream-50/50 rounded-2xl border border-gray-100 p-3.5 sm:p-5 mb-6 space-y-3 font-inter text-xs sm:text-sm text-gray-600">
                  <div className="flex justify-between items-start text-dark font-semibold text-xs sm:text-sm gap-3 flex-wrap">
                    <span className="shrink-0">Selected Option:</span>
                    <span className="font-poppins text-primary-600 text-xs sm:text-sm font-bold text-right break-all sm:break-normal max-w-[60%] sm:max-w-none">
                      {selectedPackage ? selectedPackage.name : 'Standard Product (Single)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
                    <span>Unit Price:</span>
                    <span className="font-poppins font-bold text-dark text-sm sm:text-base">₹{price}</span>
                  </div>
                  {mrp > price && (
                    <>
                      <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
                        <span>Original Price (MRP):</span>
                        <span className="line-through text-gray-400 font-poppins">₹{mrp}</span>
                      </div>
                      <div className="flex justify-between items-start text-green-600 font-semibold text-xs sm:text-sm gap-3 flex-wrap">
                        <span className="shrink-0">Discount / Savings:</span>
                        <span className="text-right font-poppins font-bold">₹{mrp - price} ({discountPercent || Math.round(((mrp - price)/mrp)*100)}% OFF)</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
                    <span>Inventory Stock:</span>
                    <span className="text-right">
                      {isOutOfStock ? (
                        <span className="text-red-500 font-bold">Sold Out</span>
                      ) : (
                        <span className="text-green-600 font-bold">In Stock</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-start text-[10px] sm:text-xs text-gray-400 border-t border-gray-100 pt-3 gap-3 flex-wrap">
                    <span className="shrink-0">Estimated Delivery:</span>
                    <span className="font-semibold text-gray-600 text-right max-w-[65%] sm:max-w-none">Standard Delivery (3-5 days)</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-100 pt-3 text-dark font-bold text-sm sm:text-base gap-2">
                    <span>Subtotal:</span>
                    <span className="font-poppins text-base sm:text-lg text-primary-600 font-bold">₹{price * quantity}</span>
                  </div>
                </div>
              )}

              <p className="text-gray-600 text-base leading-relaxed mb-6 font-inter">{product.shortDescription}</p>

              {/* Stock Status */}
              <div className="space-y-2 mb-8 font-inter text-sm">
                {!hasOptions && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Availability:</span>
                    {isOutOfStock ? (
                      <span className="text-red-500 font-semibold flex items-center gap-1"><FiAlertCircle /> Sold Out</span>
                    ) : (
                      <span className="text-green-600 font-semibold">In Stock</span>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 mb-8">
                {product.weight && <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-sm font-inter"><FiBox className="text-primary-500" />{product.weight}</div>}
                {product.shelfLife && <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-sm font-inter"><FiClock className="text-primary-500" />{product.shelfLife}</div>}
              </div>

              {/* Purchase Flow */}
              {!product.isUpcoming && (
                <div className="flex flex-col gap-4 mb-8">
                  {/* Stepper & Wishlist Row */}
                  <div className="flex items-center gap-3 w-full">
                    {!isOutOfStock && (
                      <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 justify-between p-1 select-none shrink-0 w-32">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-2.5 text-gray-500 hover:text-dark transition"
                        >
                          -
                        </button>
                        <span className="font-semibold text-dark font-poppins">{quantity}</span>
                        <button
                          onClick={() => {
                            if (quantity >= stock) {
                              toast.warning(`Only ${stock} units available in stock.`);
                            } else {
                              setQuantity(quantity + 1);
                            }
                          }}
                          className="p-2.5 text-gray-500 hover:text-dark transition"
                        >
                          +
                        </button>
                      </div>
                    )}
                    
                    {/* Wishlist Button inline */}
                    <button
                      onClick={handleWishlistToggle}
                      className={`p-3.5 rounded-xl border transition flex items-center justify-center shrink-0 ${
                        wishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 hover:bg-gray-50 text-gray-400'
                      }`}
                    >
                      <FiHeart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    {isOutOfStock ? (
                      <button disabled className="w-full py-3.5 bg-gray-200 text-gray-400 font-semibold rounded-xl cursor-not-allowed font-poppins">
                        Sold Out
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleAddToCart}
                          className="btn-outline !rounded-xl w-full sm:flex-1 py-3.5 text-sm font-semibold"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={handleBuyNow}
                          className="btn-primary !rounded-xl w-full sm:flex-1 py-3.5 text-sm font-semibold"
                        >
                          Buy Now
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Product Tabs & Details - Mobile only (hidden on desktop/laptop where it renders under the gallery) */}
          <div className="lg:hidden mt-8 pt-8 border-t border-gray-100 w-full">
            {renderTabsAndDetails()}
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-24 border-t border-gray-100 pt-16">
              <h2 className="text-2xl font-poppins font-bold text-dark mb-8">Related <span className="text-primary-500">Products</span></h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 4).map((p) => (
                  <Link key={p._id} to={`/products/${p.slug}`} className="card-premium group text-center block h-full">
                    <div className="product-image-container rounded-xl mb-4 relative">
                      {p.isUpcoming && (
                        <span className="absolute top-2 left-2 z-10 bg-[#7BA639] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm font-poppins">
                          Upcoming
                        </span>
                      )}
                      <img src={getImageUrl(p.thumbnail)} alt={p.name} className="product-image group-hover:scale-105" loading="lazy" />
                    </div>
                    <div className="p-2">
                      <h3 className="font-poppins font-semibold text-dark group-hover:text-primary-500 transition-colors line-clamp-2">{p.name}</h3>
                      <p className="font-poppins font-bold text-dark text-sm mt-1">₹{p.sellingPrice || p.mrp}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      {product && (
        <WriteReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          productId={product._id}
          productName={product.name}
          onSuccess={() => {
            // Reload reviews on successful submit
            if (product?._id) {
              const reloadReviews = async () => {
                const revRes = await reviewApi.getByProduct(product._id, { sortBy });
                setReviews(revRes.data?.reviews || []);
                setReviewStats(revRes.data?.stats || null);
              };
              reloadReviews();
            }
          }}
        />
      )}
    </>
  );
};

export default ProductDetails;
