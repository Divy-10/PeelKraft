import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import { FiArrowRight, FiShoppingCart, FiStar, FiHeart, FiAward, FiRefreshCw, FiTrendingUp, FiUsers, FiPackage } from 'react-icons/fi';
import { FaLeaf as FiLeaf } from 'react-icons/fa';
import SEOHead from '../../components/seo/SEOHead';
import WriteReviewModal from '../../components/common/WriteReviewModal';
import { productApi, blogApi, faqApi, testimonialApi } from '../../api';
import { formatDate, truncateText, stripHtml, getImageUrl, getInitials } from '../../utils';
import { useSettings } from '../../context/SettingsContext';

// Animated Counter Component
const Counter = ({ end, suffix = '', label }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, end]);

  return (
    <div ref={ref} className="text-center p-6 border border-cream-200/30 rounded-2xl bg-white/40 backdrop-blur-sm">
      <p className="text-4xl md:text-5xl font-sans font-medium text-dark tracking-tight">
        {count}{suffix}
      </p>
      <p className="text-xs uppercase tracking-widest text-gray-500 font-sans mt-3">{label}</p>
    </div>
  );
};

// Section Heading Component
const SectionHeading = ({ badge, title, subtitle, center = true, light = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className={`mb-12 md:mb-16 ${center ? 'text-center' : ''}`}
  >
    {badge && (
      <span className="inline-block px-4 py-1.5 bg-cream-100 border border-cream-200/50 text-primary-500 font-sans font-semibold text-[10px] uppercase tracking-wider rounded-full mb-4">
        {badge}
      </span>
    )}
    <h2 className={`text-3xl md:text-4xl lg:text-5xl font-serif leading-tight ${light ? 'text-white' : 'text-dark'}`}>
      {title}
    </h2>
    {subtitle && (
      <p className={`font-sans mt-4 max-w-2xl mx-auto text-xs tracking-wider uppercase text-gray-400 ${light ? 'text-gray-400' : 'text-gray-500'}`}>
        {subtitle}
      </p>
    )}
  </motion.div>
);

const Home = () => {
  const { settings } = useSettings();
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, blogRes, faqRes, testRes] = await Promise.allSettled([
          productApi.getFeatured(),
          blogApi.getAll({ limit: 3 }),
          faqApi.getAll(),
          testimonialApi.getAll({ featured: 'true' }),
        ]);
        if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data || []);
        if (blogRes.status === 'fulfilled') setBlogs(blogRes.value.data || []);
        if (faqRes.status === 'fulfilled') setFaqs((faqRes.value.data || []).slice(0, 5));
        if (testRes.status === 'fulfilled') setTestimonials(testRes.value.data || []);
      } catch (err) {
        console.error('Home data load error:', err);
      }
    };
    loadData();
  }, []);

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PeelKraft',
    description: 'Premium sustainable food products from orange peels',
    url: import.meta.env.VITE_SITE_URL,
    logo: `${import.meta.env.VITE_SITE_URL}/favicon.png`,
    parentOrganization: { '@type': 'Organization', name: 'JuiceTap Global Pvt Ltd' },
    sameAs: ['https://facebook.com/peelkraft', 'https://instagram.com/peelkraft'],
  };

  const whyItems = [
    { icon: FiLeaf, title: '100% Natural', desc: 'Pure orange peels with zero artificial additives' },
    { icon: FiRefreshCw, title: 'Zero Waste', desc: 'Transforming food waste into premium nutrition' },
    { icon: FiHeart, title: 'Health First', desc: 'Packed with Vitamin C, fiber, and antioxidants' },
    { icon: FiAward, title: 'Premium Quality', desc: 'FSSAI certified, lab-tested for excellence' },
  ];

  const processSteps = [
    {
      num: '01',
      title: 'Fresh Juice Extraction',
      subtitle: 'At JuiceTap Vending Machines',
      desc: 'Premium Valencia oranges are freshly squeezed in JuiceTap vending machines, and the fresh orange peels are collected immediately after every juice is served.'
    },
    {
      num: '02',
      title: 'Peel Collection',
      subtitle: 'Collected with Care',
      desc: 'The freshly generated peels are hygienically collected from JuiceTap machines and transported to our processing facility.'
    },
    {
      num: '03',
      title: 'Cleaning & Processing',
      subtitle: 'Prepared Naturally',
      desc: 'The peels are thoroughly washed, sanitized, and gently dehydrated to preserve their natural goodness and citrus aroma.'
    },
    {
      num: '04',
      title: 'Crafted into Products',
      subtitle: 'From Peel to Premium',
      desc: 'Processed orange peels are carefully crafted into Zest Mint Orange Peels, Orangettes, and Orange Peel Powder, bringing new value to every peel.'
    },
    {
      num: '05',
      title: 'Packed & Delivered',
      subtitle: 'Freshness in Every Pack',
      desc: 'Every product is hygienically packed and quality-checked to ensure it reaches you fresh, safe, and ready to enjoy.'
    },
  ];

  const getProductImages = (product) => {
    const images = [];
    if (product.thumbnail) images.push(product.thumbnail);
    if (product.featuredImage && product.featuredImage.url) images.push(product.featuredImage);
    if (product.gallery && product.gallery.length > 0) {
      product.gallery.forEach(img => {
        if (img && img.url) images.push(img);
      });
    }

    // Deduplicate based on URL
    const uniqueImages = [];
    const urls = new Set();
    images.forEach(img => {
      const url = typeof img === 'string' ? img : img.url;
      if (url && !urls.has(url)) {
        urls.add(url);
        uniqueImages.push(img);
      }
    });

    return uniqueImages;
  };

  // Calculate real testimonials stats
  const totalTestimonials = testimonials.length;
  const avgRating = totalTestimonials > 0
    ? (testimonials.reduce((sum, item) => sum + (item.rating || 5), 0) / totalTestimonials).toFixed(1)
    : '4.9';
  const roundedStars = Math.round(Number(avgRating));

  const displayAvatars = totalTestimonials > 0
    ? testimonials.slice(0, 3).map((item) => ({
      name: item.name,
      url: item.avatar?.url || '',
    }))
    : [
      { name: 'Alice', url: '' },
      { name: 'Bob', url: '' },
      { name: 'Carol', url: '' },
    ];

  return (
    <>
      <SEOHead
        title="Home"
        description="PeelKraft by JuiceTap Global converts premium orange peels into nutritious food products. Discover our range of organic, sustainable foods."
        canonicalUrl="/"
        schema={orgSchema}
      />

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[80vh] lg:min-h-[85vh] flex items-center bg-cream-50 pt-28 pb-16 overflow-hidden">
        {/* Background subtle glowing circles */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-cream-200/40 rounded-full blur-3xl" />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 max-w-2xl order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-cream-200/50 shadow-sm mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-green-800 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-sans">100% Natural Innovation</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] leading-[1.1] font-serif text-dark mb-6 tracking-tight text-balance">
                Nature's <br />
                <span className="text-primary-500 italic relative inline-block font-normal">
                  Hidden Treasure
                </span>
              </h1>

              <p className="text-sm md:text-base text-gray-500 font-sans mb-10 max-w-md leading-relaxed tracking-wide">
                Discover the power of naturally crafted orange peel products made with sustainability, nutrition, and exceptional taste in every bite.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <Link
                  to="/products"
                  className="flex items-center gap-2 px-8 py-3.5 bg-dark text-white rounded-full text-xs font-semibold font-sans tracking-widest uppercase hover:bg-green-800 hover:-translate-y-0.5 transition-all duration-300 shadow-premium"
                >
                  <FiShoppingCart className="w-4 h-4" />
                  Shop Now
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-3.5 bg-transparent border border-cream-200 hover:border-dark hover:bg-cream-50 rounded-full text-xs font-semibold font-sans tracking-widest uppercase hover:-translate-y-0.5 transition-all duration-300"
                >
                  Our Story
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex items-center gap-6 border-t border-cream-200/50 pt-8">
                <div className="flex -space-x-3">
                  {displayAvatars.map((avatar, idx) => (
                    <div
                      key={idx}
                      className="w-9 h-9 rounded-full bg-white border border-cream-200 overflow-hidden shadow-sm flex items-center justify-center shrink-0"
                      title={avatar.name}
                    >
                      {avatar.url ? (
                        <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-dark font-bold text-[10px]">{getInitials(avatar.name)}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-amber-500 text-xs mb-0.5">
                    <span className="text-dark font-bold">{avgRating}/5</span>
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-sm">{i < roundedStars ? '★' : '☆'}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    {totalTestimonials > 0
                      ? `Based on ${totalTestimonials} verified reviews`
                      : 'Loved by 10,000+ customers'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Premium Product Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2"
            >
              <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden group bg-transparent border-4 border-white shadow-premium">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  poster=""
                  className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                >
                  <source src="/videos/hero-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-dark/20 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ===== FEATURED PRODUCTS (Live & Wild Harvest) ===== */}
      <section className="py-12 md:py-16 bg-white overflow-hidden">
        <div className="container-custom">
          <SectionHeading
            badge="Our Collection"
            title="Live & Wild Harvest"
            subtitle="Discover our range of premium organic food products made from carefully selected orange peels."
          />
        </div>

        {(products.length > 0 || (settings?.homeCarousel && settings.homeCarousel.length > 0)) ? (
          (products.length > 0 || (settings?.homeCarousel && settings.homeCarousel.length > 0)) ? (
            (() => {
              const singleProduct = products[0] || null;
              const rawImages = settings?.homeCarousel && settings.homeCarousel.length > 0
                ? settings.homeCarousel
                : getProductImages(singleProduct);
              let slides = [...rawImages];
              if (slides.length > 0) {
                while (slides.length < 6) {
                  slides = [...slides, ...rawImages];
                }
              }

              return (
                <div className="w-full flex flex-col items-center">
                  <div className="w-full max-w-7xl mx-auto overflow-hidden mb-6">
                    <Swiper
                      modules={[EffectCoverflow, Pagination, Autoplay]}
                      effect="coverflow"
                      grabCursor={true}
                      centeredSlides={true}
                      slidesPerView={1.2}
                      breakpoints={{
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                      }}
                      loop={true}
                      speed={1000}
                      autoplay={{ delay: 5000, disableOnInteraction: false }}
                      coverflowEffect={{
                        rotate: 35,
                        stretch: 10,
                        depth: 160,
                        modifier: 1,
                        slideShadows: false,
                      }}
                      pagination={{ clickable: true }}
                      className="single-product-swiper"
                    >
                      {slides.map((img, index) => (
                        <SwiperSlide key={index}>
                          <div className="w-full h-full relative group rounded-3xl overflow-hidden">
                            <img
                              src={getImageUrl(img)}
                              alt={singleProduct?.name || 'PeelKraft'}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>

                  <div className="container-custom">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-center mt-6 max-w-xl mx-auto"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500 font-sans mb-3 block">
                        {(singleProduct?.category && typeof singleProduct.category === 'object') ? singleProduct.category.name : 'Orange Peel Snacks'}
                      </span>
                      <h3 className="font-serif text-dark text-2xl md:text-3xl mb-4">
                        {singleProduct?.name || 'Our Premium Selection'}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 font-sans mb-8 leading-relaxed tracking-wide">
                        {singleProduct?.shortDescription || 'Discover our range of premium organic food products made from carefully selected orange peels.'}
                      </p>
                      <Link
                        to={singleProduct ? `/products/${singleProduct.slug}` : '/products'}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-dark text-white rounded-full text-xs font-semibold font-sans tracking-widest uppercase hover:bg-green-800 transition shadow-premium"
                      >
                        View Details
                      </Link>
                    </motion.div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="container-custom">
              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {products.slice(0, 3).map((product, i) => {
                  const hasOptions = product.packageOptions && product.packageOptions.length > 0;
                  const trackInventory = product.trackInventory !== false;
                  const isOutOfStock = trackInventory
                    ? (hasOptions
                      ? product.packageOptions.every(opt => (opt.stock ?? 0) <= 0 || opt.status === 'disabled')
                      : ((product.stock ?? 0) <= 0)
                    )
                    : false;
                  return (
                    <motion.div
                      key={product._id || i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="h-full"
                    >
                      <Link
                        to={`/products/${product.slug}`}
                        className="group block h-full bg-cream-50/30 border border-cream-200/50 rounded-2xl p-5 transition-all duration-500 hover:shadow-premium hover:-translate-y-1 hover:bg-white"
                      >
                        <div className="aspect-square bg-cream-50 rounded-xl mb-6 relative border border-cream-200/30 flex items-center justify-center p-4 overflow-hidden">
                          {product.isUpcoming && (
                            <span className="absolute top-3 left-3 z-10 bg-green-800 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm font-sans">
                              Upcoming
                            </span>
                          )}
                          {isOutOfStock && !product.isUpcoming && (
                            <span className="absolute top-3 right-3 z-10 bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm font-sans">
                              Sold Out
                            </span>
                          )}
                          <img
                            src={getImageUrl(product.thumbnail)}
                            alt={product.name}
                            className={`max-h-[85%] max-w-[85%] object-contain transition-transform duration-750 group-hover:scale-105 ${isOutOfStock && !product.isUpcoming ? 'opacity-50 grayscale-[40%]' : ''}`}
                            loading="lazy"
                          />
                        </div>
                        <h3 className="font-serif text-dark text-base md:text-lg mb-2 group-hover:text-primary-500 transition-colors line-clamp-2 md:line-clamp-1">
                          {product.name}
                        </h3>

                        {/* Price section */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <span className="font-sans font-bold text-dark text-sm md:text-base">₹{product.sellingPrice || product.mrp}</span>
                          {product.mrp > product.sellingPrice && (
                            <span className="text-xs text-gray-400 line-through font-sans">₹{product.mrp}</span>
                          )}
                        </div>

                        <p className="hidden md:block text-xs text-gray-500 font-sans mb-6 line-clamp-2 leading-relaxed tracking-wide">
                          {product.shortDescription || 'Pure, organic orange peel product carefully processed for health.'}
                        </p>
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-primary-500 uppercase tracking-widest group-hover:text-dark transition-colors"
                        >
                          View Details
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          <div className="container-custom">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border border-cream-200 bg-cream-50/20 rounded-2xl p-5 flex flex-col items-center">
                  <div className="aspect-square w-full skeleton rounded-xl mb-6" />
                  <div className="h-4 skeleton w-3/4 mb-3" />
                  <div className="h-3 skeleton w-full mb-6" />
                  <div className="h-3 skeleton w-1/2 mt-auto" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="container-custom mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-3 bg-transparent border border-cream-200 hover:border-dark rounded-full text-xs font-semibold font-sans tracking-widest uppercase transition-colors"
          >
            View All Products
          </Link>
        </div>
      </section>




      {/* ===== OUR STORY ===== */}
      <section className="py-12 md:py-16 bg-cream-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative p-2 bg-white border border-cream-200 rounded-3xl shadow-premium">
                <img
                  src="/images/peelkraft-waste-to-wonder-orange-peel-story.jpg"
                  alt="PeelKraft JuiceTap Global - From Waste to Wonder Organic Orange Peel Products"
                  title="PeelKraft JuiceTap Global - Sustainable Orange Peel Upcycling"
                  className="rounded-2xl w-full object-cover hover:scale-[1.01] transition-transform duration-750"
                  loading="lazy"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <span className="inline-block px-4 py-1.5 bg-white border border-cream-200 text-primary-500 font-sans font-semibold text-[10px] uppercase tracking-wider rounded-full">
                Our Story
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-dark leading-tight">
                From Waste to <span className="text-primary-500 italic">Wonder</span>
              </h2>
              <p className="text-gray-500 font-sans text-xs md:text-sm leading-relaxed tracking-wide">
                PeelKraft, powered by JuiceTap Global Pvt. Ltd., transforms orange peels collected from our fully automatic Valencia orange juice machines into premium natural products. Instead of creating waste, we give every peel a second life through Orange Peel Candy, Peel Powder, and Orange Tea—promoting sustainability, innovation, and a cleaner future.
              </p>
              <p className="text-gray-500 font-sans text-xs md:text-sm leading-relaxed tracking-wide">
                Today, PeelKraft transforms hundreds of kilograms of orange peels into delicious, nutritious products that are loved by health-conscious consumers across India.
              </p>
              <div className="pt-4">
                <Link to="/about" className="inline-flex px-8 py-3.5 bg-dark text-white hover:bg-green-800 rounded-full text-xs font-semibold font-sans tracking-widest uppercase transition">
                  Read Our Story
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== WHY PEELKRAFT ===== */}
      <section className="py-12 md:py-16 bg-white border-t border-cream-200/40">
        <div className="container-custom">
          <SectionHeading
            badge="Why PeelKraft"
            title={<>What Makes Us <span className="text-primary-500 italic font-normal">Different</span></>}
            subtitle="We're not just another food brand. We're building a sustainable food ecosystem."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-cream-50/20 border border-cream-200/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-premium hover:-translate-y-1 hover:bg-white group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center mb-6 group-hover:bg-primary-500 transition-colors duration-500">
                    <Icon className="w-5 h-5 text-primary-500 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="font-serif text-dark text-lg mb-3">{item.title}</h3>
                  <p className="text-gray-500 font-sans text-xs md:text-sm leading-relaxed tracking-wide">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== MANUFACTURING PROCESS ===== */}
      <section className="py-12 md:py-16 bg-cream-50/50 border-t border-cream-200/40 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <SectionHeading
            badge="Our Process"
            title={<>How We <span className="text-primary-500 italic font-normal">Craft</span> Perfection</>}
            subtitle="Every PeelKraft product goes through a meticulous 5-step process"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {processSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white border border-cream-200/50 rounded-2xl p-8 hover:shadow-premium transition-all duration-300 flex flex-col h-full group"
              >
                <span className="text-5xl font-serif text-cream-200/50 absolute top-4 right-6 transition-colors group-hover:text-primary-100/50">
                  {step.num}
                </span>
                <div className="flex-1">
                  <h3 className="font-serif text-dark text-lg mb-1 relative z-10">{step.title}</h3>
                  {step.subtitle && (
                    <p className="text-[10px] text-primary-500 font-semibold font-sans mb-3 relative z-10 uppercase tracking-wider">{step.subtitle}</p>
                  )}
                  <p className="text-gray-500 font-sans text-xs md:text-sm relative z-10 leading-relaxed mt-3">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATISTICS ===== */}
      <section className="py-10 md:py-12 bg-white border-y border-cream-200/40">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(() => {
              const parseStat = (val, defaultVal, defaultSuffix) => {
                if (!val) return { end: defaultVal, suffix: defaultSuffix };
                const numMatch = String(val).match(/^([\d.]+)/);
                const end = numMatch ? parseFloat(numMatch[1]) : defaultVal;
                const suffix = String(val).substring(numMatch ? numMatch[1].length : 0) || defaultSuffix;
                return { end, suffix };
              };
              const happy = parseStat(settings?.stats?.happyCustomers, 10000, '+');
              const peels = parseStat(settings?.stats?.peelsRecycled, 500, 'T');
              const rating = parseStat(settings?.stats?.averageRating, 4.9, '/5');
              return (
                <>
                  <Counter end={happy.end} suffix={happy.suffix} label="Happy Customers" />
                  <Counter end={peels.end} suffix={peels.suffix} label="Peels Recycled" />
                  <Counter end={rating.end} suffix={rating.suffix} label="Average Rating" />
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-12 md:py-16 bg-cream-50/50">
        <div className="container-custom">
          <SectionHeading
            badge="Testimonials"
            title={<>What Our Customers <span className="text-primary-500 italic font-normal">Say</span></>}
          />

          <div className="flex justify-center mt-2 mb-10">
            <button
              onClick={() => {
                console.log('Home: Clicked Write a Review, setting reviewModalOpen to true');
                setReviewModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-dark hover:bg-green-800 text-white font-sans font-semibold text-xs uppercase tracking-widest rounded-full transition shadow-premium"
            >
              Write a Review
            </button>
          </div>

          {testimonials.length > 0 ? (
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000 }}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="pb-8"
            >
              {testimonials.map((t, i) => (
                <SwiperSlide key={t._id || i}>
                  <div className="card-premium h-full flex flex-col">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, s) => (
                        <FiStar key={s} className={`w-4 h-4 ${s < t.rating ? 'text-gold-500 fill-gold-500' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-gray-500 font-inter italic mb-6 line-clamp-4 text-sm">"{t.content}"</p>
                    <div className="flex items-center gap-3 mt-auto">
                      <div>
                        <p className="font-semibold text-sm text-dark font-poppins">{t.name}</p>
                        <p className="text-xs text-gray-400 font-inter">{t.designation || 'Verified Reviewer'}</p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="text-center p-12 bg-white rounded-3xl border border-cream-200 max-w-xl mx-auto shadow-sm">
              <p className="text-gray-400 font-sans text-xs md:text-sm mb-6">No reviews featured yet. Share your experience with us!</p>
              <button
                onClick={() => {
                  console.log('Home (empty): Clicked Write First Review, setting reviewModalOpen to true');
                  setReviewModalOpen(true);
                }}
                className="px-6 py-3 bg-cream-50 hover:bg-cream-100 text-dark border border-cream-200 font-sans font-semibold text-xs uppercase tracking-widest rounded-full transition"
              >
                Write First Review
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== LATEST BLOGS ===== */}
      <section className="py-12 md:py-16 bg-white border-t border-cream-200/40">
        <div className="container-custom">
          <SectionHeading
            badge="From Our Blog"
            title={<>Latest <span className="text-primary-500 italic font-normal">Insights</span></>}
            subtitle="Stay updated with health tips, recipes, and sustainability stories"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, i) => (
              <motion.div
                key={blog._id || i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/blogs/${blog.slug}`} className="group block h-full bg-cream-50/20 border border-cream-200/50 rounded-2xl overflow-hidden hover:shadow-premium transition-all duration-300">
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={getImageUrl(blog.featuredImage)}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]"
                      loading="lazy"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-primary-500 text-white text-[9px] uppercase tracking-widest font-sans rounded-full">
                      {blog.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-dark text-base md:text-lg mb-3 line-clamp-2 group-hover:text-primary-500 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 font-sans line-clamp-3 leading-relaxed tracking-wide">
                      {blog.excerpt || truncateText(stripHtml(blog.content), 120)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/blogs" className="inline-flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-widest text-primary-500 hover:text-dark transition-colors">
              Read All Articles <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-12 md:py-16 bg-cream-50/30 border-t border-cream-200/40">
        <div className="container-custom max-w-3xl">
          <SectionHeading
            badge="FAQ"
            title={<>Frequently Asked <span className="text-primary-500 italic font-normal">Questions</span></>}
          />

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq._id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 bg-white ${openFaq === i ? 'border-primary-500/20 shadow-premium' : 'border-cream-200/60'}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-cream-50/20 transition-colors"
                >
                  <span className="font-serif text-dark text-sm md:text-base">{faq.question}</span>
                  <span className={`text-primary-500 transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-gray-500 font-sans leading-relaxed text-xs md:text-sm tracking-wide">{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/faq" className="inline-flex px-8 py-3.5 bg-transparent border border-cream-200 hover:border-dark rounded-full text-xs font-semibold font-sans tracking-widest uppercase transition">
              View All FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* ===== AMAZON STORE SHOWCASE SECTION ===== */}
      <section className="py-12 md:py-16 bg-dark text-white relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Heading & Branding */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 text-primary-500 font-sans font-semibold text-[10px] uppercase tracking-wider rounded-full border border-white/10">
                <FiShoppingCart className="w-3.5 h-3.5" />
                Official Amazon Store
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white leading-tight">
                Shop PeelKraft™ on Amazon
              </h2>
              <p className="text-gray-400 font-sans text-xs md:text-sm leading-relaxed tracking-wide max-w-md mx-auto lg:mx-0">
                Get fast & reliable delivery directly to your doorstep. Experience 100% natural, premium citrus peel products with Amazon Prime delivery.
              </p>
              <div className="pt-4 flex flex-wrap gap-4 justify-center lg:justify-start">
                <a
                  href={settings?.amazonStoreUrl || "https://www.amazon.in"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full px-6 py-3.5 text-xs font-semibold font-sans tracking-wider uppercase transition shadow-md"
                >
                  <FiShoppingCart className="w-4 h-4" />
                  Visit Amazon Store
                </a>
              </div>
            </div>

            {/* Right Column: Featured Products Available on Amazon */}
            <div className="lg:col-span-6">
              {products.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {products.slice(0, 2).map((prod) => (
                    <div key={prod._id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between group hover:border-primary-500/20 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-6">
                        <img
                          src={getImageUrl(prod.thumbnail || prod.featuredImage)}
                          alt={prod.name}
                          className="w-14 h-14 object-contain rounded-xl bg-white p-2"
                        />
                        <div>
                          <span className="text-[9px] uppercase font-bold text-primary-500 tracking-wider">
                            Amazon Fulfilled
                          </span>
                          <h4 className="font-serif text-sm text-white line-clamp-1 mt-1">
                            {prod.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-sans uppercase tracking-wider mt-1">{prod.weight || 'Premium Pack'}</p>
                        </div>
                      </div>
                      <a
                        href={prod.amazonLink || settings?.amazonStoreUrl || "https://www.amazon.in"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-white hover:bg-cream-100 text-dark font-sans font-semibold text-[10px] uppercase tracking-wider rounded-full flex items-center justify-center gap-2 transition-colors"
                      >
                        <FiShoppingCart className="w-3.5 h-3.5" />
                        Buy Now
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-gray-400 font-sans text-xs md:text-sm">Explore all PeelKraft products on Amazon</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <WriteReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} />
    </>
  );
};

export default Home;
