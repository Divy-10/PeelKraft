import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import { FiShoppingCart, FiHeart, FiShare2, FiCheck, FiClock, FiBox, FiChevronDown } from 'react-icons/fi';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import { productApi } from '../../api';
import { getImageUrl } from '../../utils';

const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await productApi.getBySlug(slug);
        setProduct(res.data);
        // Load related products
        if (res.data?.category?._id) {
          const relRes = await productApi.getAll({ category: res.data.category._id, limit: 4 });
          setRelatedProducts((relRes.data || []).filter(p => p._id !== res.data._id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  const handleAmazonClick = () => {
    if (product?._id) productApi.trackAmazonClick(product._id).catch(() => {});
    if (product?.amazonLink) window.open(product.amazonLink, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><h2 className="text-2xl font-poppins font-bold mb-2">Product Not Found</h2><Link to="/products" className="text-primary-500">← Back to Products</Link></div>
    </div>
  );

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'benefits', label: 'Benefits' },
  ];

  let adminImages = [];
  if (product.gallery && product.gallery.length > 0) {
    adminImages = product.gallery.map(img => (typeof img === 'string' ? { url: img, alt: product.name } : img));
  } else if (product.featuredImage?.url || product.thumbnail?.url) {
    const mainUrl = product.featuredImage?.url || product.thumbnail?.url;
    adminImages = [{ url: mainUrl, alt: product.name }];
  }
  const images = adminImages.length > 0 ? adminImages : [{ url: '/images/logo.png', alt: product.name }];

  const productSchema = {
    '@context': 'https://schema.org', '@type': 'Product', name: product.name,
    description: product.shortDescription, image: images[0]?.url,
    brand: { '@type': 'Brand', name: 'PeelKraft' },
  };

  return (
    <>
      <SEOHead title={product.seoTitle || product.name} description={product.seoDescription || product.shortDescription} canonicalUrl={`/products/${product.slug}`} ogImage={images[0]?.url} schema={productSchema} />

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
              <h1 className="text-3xl md:text-4xl font-poppins font-bold text-dark mb-4">{product.name}</h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{product.shortDescription}</p>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 mb-8">
                {product.weight && <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-sm"><FiBox className="text-primary-500" />{product.weight}</div>}
                {product.shelfLife && <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-sm"><FiClock className="text-primary-500" />{product.shelfLife}</div>}
              </div>

              {/* Amazon CTA */}
              {product.isUpcoming ? (
                <button disabled className="bg-gray-300 text-gray-500 border border-gray-200 w-full sm:w-auto px-8 py-3.5 rounded-xl font-poppins font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed mb-8">
                  <FiShoppingCart className="w-5 h-5" /> Coming Soon
                </button>
              ) : (
                <button onClick={handleAmazonClick} className="btn-amazon w-full sm:w-auto mb-8">
                  <FiShoppingCart className="w-5 h-5" /> Buy on Amazon
                </button>
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
                  <div className="prose-content" dangerouslySetInnerHTML={{ __html: product.description }} />
                )}
                {activeTab === 'ingredients' && (
                  <ul className="space-y-3">{product.ingredients?.map((ing, i) => (
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
                  <ul className="space-y-3">{product.benefits?.map((ben, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600"><span className="w-6 h-6 shrink-0 rounded-full bg-green-100 flex items-center justify-center mt-0.5"><FiCheck className="w-3.5 h-3.5 text-green-600" /></span>{ben}</li>
                  ))}</ul>
                )}
              </div>

              {/* Storage */}
              {product.storage && (
                <div className="mt-8 p-6 bg-gray-50 border border-gray-100 rounded-2xl">
                  <h4 className="font-poppins font-semibold text-dark mb-2">Storage Instructions</h4>
                  <p className="text-gray-500 text-sm font-inter">{product.storage}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-24 border-t border-gray-100 pt-16">
              <h2 className="text-2xl font-poppins font-bold text-dark mb-8">Related <span className="text-primary-500">Products</span></h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 4).map((p, i) => (
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
