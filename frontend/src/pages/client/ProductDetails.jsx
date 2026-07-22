import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiCheck, FiClock, FiBox, FiStar, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import { productApi, reviewApi, wishlistApi } from '../../api';
import { getImageUrl } from '../../utils';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useUser();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await productApi.getBySlug(slug);
        setProduct(res.data);
        setQuantity(1);

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
          const revRes = await reviewApi.getByProduct(res.data._id);
          setReviews(revRes.data || []);
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
    if (!product || product.stock <= 0) return;
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product || product.stock <= 0) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please login to write a review.');
      navigate('/login');
      return;
    }
    setReviewLoading(true);
    try {
      const res = await reviewApi.create({
        productId: product._id,
        ...newReview,
      });
      setReviews([res.data, ...reviews]);
      setNewReview({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
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

  let adminImages = [];
  if (product.gallery && product.gallery.length > 0) {
    adminImages = product.gallery.map(img => (typeof img === 'string' ? { url: img, alt: product.name } : img));
  } else if (product.featuredImage?.url || product.thumbnail?.url) {
    const mainUrl = product.featuredImage?.url || product.thumbnail?.url;
    adminImages = [{ url: mainUrl, alt: product.name }];
  }
  const images = adminImages.length > 0 ? adminImages : [{ url: '/images/logo.png', alt: product.name }];

  const price = product.sellingPrice || product.mrp || 0;
  const isOutOfStock = product.stock <= 0;

  return (
    <>
      <SEOHead title={product.seoTitle || product.name} description={product.seoDescription || product.shortDescription} canonicalUrl={`/products/${product.slug}`} ogImage={images[0]?.url} />

      <section className="pt-28 pb-16 md:pt-32 md:pb-24 bg-white">
        <div className="container-custom">
          <Breadcrumbs items={[{ label: 'Products', path: '/products' }, { label: product.name }]} />

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Gallery */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="sticky top-28">
                <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 p-8 mb-4">
                  <img src={getImageUrl(images[selectedImage])} alt={images[selectedImage]?.alt || product.name} className="w-full aspect-square object-contain mix-blend-multiply" />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, i) => (
                      <button key={i} onClick={() => setSelectedImage(i)} className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all p-2 bg-gray-50 ${selectedImage === i ? 'border-primary-500 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-200'}`}>
                        <img src={getImageUrl(img)} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex gap-2 items-center mb-3">
                {product.category?.name && (
                  <span className="inline-block px-3 py-1 bg-primary-50 text-primary-500 text-sm font-semibold rounded-full">{product.category.name}</span>
                )}
                {product.isUpcoming && (
                  <span className="inline-block px-3 py-1 bg-[#7BA639]/10 text-[#7BA639] text-sm font-semibold rounded-full">Upcoming</span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-poppins font-bold text-dark mb-2">{product.name}</h1>
              
              {/* Ratings preview */}
              <div className="flex items-center gap-1.5 mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className={`w-4 h-4 ${i < Math.round(product.avgRating || 0) ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-dark font-poppins mt-0.5">{product.avgRating || 0}</span>
                <span className="text-xs text-gray-400 font-inter">({reviews.length} customer reviews)</span>
              </div>

              {/* Product Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-poppins font-bold text-dark">₹{price}</span>
                {product.mrp > price && (
                  <>
                    <span className="text-lg text-gray-400 line-through font-inter">₹{product.mrp}</span>
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md font-poppins">
                      {product.discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="text-gray-600 text-base leading-relaxed mb-6 font-inter">{product.shortDescription}</p>

              {/* Stock Status & SKU */}
              <div className="space-y-2 mb-8 font-inter text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Availability:</span>
                  {isOutOfStock ? (
                    <span className="text-red-500 font-semibold flex items-center gap-1"><FiAlertCircle /> Out of Stock</span>
                  ) : product.stock <= product.lowStockAlert ? (
                    <span className="text-amber-500 font-semibold flex items-center gap-1"><FiAlertCircle /> Low Stock (Only {product.stock} left)</span>
                  ) : (
                    <span className="text-green-600 font-semibold">In Stock</span>
                  )}
                </div>
                {product.sku && (
                  <div>
                    <span className="text-gray-400">SKU:</span> <span className="text-dark font-medium">{product.sku}</span>
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
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  {/* Quantity selector */}
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
                        onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                        className="p-2.5 text-gray-500 hover:text-dark transition"
                      >
                        +
                      </button>
                    </div>
                  )}

                  {isOutOfStock ? (
                    <button disabled className="w-full py-3.5 bg-gray-200 text-gray-400 font-semibold rounded-xl cursor-not-allowed font-poppins">
                      Out of Stock
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 py-3.5 border border-primary-500 text-primary-500 font-semibold rounded-xl hover:bg-primary-50 transition-all font-poppins text-sm"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={handleBuyNow}
                        className="flex-1 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/20 transition-all font-poppins text-sm"
                      >
                        Buy Now
                      </button>
                    </>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3.5 rounded-xl border transition flex items-center justify-center shrink-0 ${
                      wishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 hover:bg-gray-50 text-gray-400'
                    }`}
                  >
                    <FiHeart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-gray-100 mb-6">
                <div className="flex gap-1 overflow-x-auto">
                  {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-3 font-inter font-medium text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-dark'}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[200px]">
                {activeTab === 'description' && (
                  <div className="prose-content font-inter text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
                )}
                {activeTab === 'ingredients' && (
                  <ul className="space-y-3 font-inter">{product.ingredients?.map((ing, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600"><FiCheck className="text-green-500 shrink-0" />{ing}</li>
                  ))}</ul>
                )}
                {activeTab === 'nutrition' && product.nutrition && (
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(product.nutrition).filter(([_, v]) => v).map(([key, val]) => (
                      <div key={key} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-400 capitalize font-inter">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="font-semibold text-dark font-poppins">{val}</p>
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
                    {/* Add Review Form */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <h4 className="font-poppins font-bold text-dark mb-4 text-base">Write a Customer Review</h4>
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-500">Rating:</span>
                          <select
                            value={newReview.rating}
                            onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                            className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold"
                          >
                            <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                            <option value={4}>⭐⭐⭐⭐ (4)</option>
                            <option value={3}>⭐⭐⭐ (3)</option>
                            <option value={2}>⭐⭐ (2)</option>
                            <option value={1}>⭐ (1)</option>
                          </select>
                        </div>
                        <div>
                          <input
                            placeholder="Review title"
                            value={newReview.title}
                            onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm font-inter"
                          />
                        </div>
                        <div>
                          <textarea
                            placeholder="Share your experience..."
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            required
                            rows={3}
                            className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm font-inter"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={reviewLoading}
                          className="px-6 py-2 bg-dark text-white font-semibold rounded-xl text-xs hover:bg-gray-800 transition font-poppins disabled:opacity-50"
                        >
                          {reviewLoading ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {reviews.length === 0 ? (
                        <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
                      ) : (
                        reviews.map((rev) => (
                          <div key={rev._id} className="border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-dark text-sm">{rev.user?.firstName} {rev.user?.lastName}</span>
                              {rev.isVerifiedPurchase && (
                                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-amber-400 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <FiStar key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : ''}`} />
                              ))}
                              <span className="text-dark font-semibold text-xs mt-0.5 ml-1">{rev.title}</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed">{rev.comment}</p>
                          </div>
                        ))
                      )}
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
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-24 border-t border-gray-100 pt-16">
              <h2 className="text-2xl font-poppins font-bold text-dark mb-8">Related <span className="text-primary-500">Products</span></h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 4).map((p) => (
                  <Link key={p._id} to={`/products/${p.slug}`} className="card-premium group text-center block h-full">
                    <div className="relative w-full h-48 overflow-hidden rounded-xl mb-4 flex items-center justify-center bg-gray-50 p-4">
                      {p.isUpcoming && (
                        <span className="absolute top-2 left-2 z-10 bg-[#7BA639] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm font-poppins">
                          Upcoming
                        </span>
                      )}
                      <img src={getImageUrl(p.thumbnail)} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" loading="lazy" />
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
    </>
  );
};

export default ProductDetails;
