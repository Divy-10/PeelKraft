import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import { FiArrowRight, FiShoppingCart, FiStar, FiHeart, FiAward, FiRefreshCw, FiTrendingUp, FiUsers, FiPackage } from 'react-icons/fi';
import { FaLeaf as FiLeaf } from 'react-icons/fa';
import SEOHead from '../../components/seo/SEOHead';
import { productApi, blogApi, faqApi, testimonialApi } from '../../api';
import { formatDate, truncateText, stripHtml, getImageUrl } from '../../utils';
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
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-poppins font-bold gradient-text">
        {count}{suffix}
      </p>
      <p className="text-gray-500 font-inter mt-2">{label}</p>
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
      <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-500 font-poppins font-semibold text-sm rounded-full mb-4">
        {badge}
      </span>
    )}
    <h2 className={`text-3xl md:text-4xl lg:text-5xl font-poppins font-bold text-balance ${light ? 'text-white' : 'text-dark'}`}>
      {title}
    </h2>
    {subtitle && (
      <p className={`font-inter mt-4 max-w-2xl mx-auto text-lg ${light ? 'text-gray-400' : 'text-gray-500'}`}>
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
    logo: `${import.meta.env.VITE_SITE_URL}/favicon.svg`,
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
    { num: '01', title: 'Collection', desc: 'Premium orange peels sourced from certified juice manufacturers' },
    { num: '02', title: 'Sent to Manufacturing', desc: 'Safely transported to our advanced facility for processing.' },
    { num: '03', title: 'Processing', desc: 'Washed, dehydrated, and precision ground into premium products' },
    { num: '04', title: 'Packaging', desc: 'Eco-friendly packaging that keeps products fresh' },
    { num: '05', title: 'Distribution', desc: 'Delivered nationwide to health-conscious consumers' },
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

  return (
    <>
      <SEOHead
        title="Home"
        description="PeelKraft by JuiceTap Global converts premium orange peels into nutritious food products. Discover our range of organic, sustainable foods."
        canonicalUrl="/"
        schema={orgSchema}
      />

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[92vh] flex items-center bg-cream-50 pt-24 pb-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl" />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm mb-8">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 font-poppins">100% Organic & Sustainable</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.1] font-poppins font-bold text-dark mb-6 tracking-tight text-balance">
                Pure Organic <br />
                <span className="text-primary-500 relative inline-block">
                  Fruit of Nature
                  <svg className="absolute -bottom-2 left-0 w-full text-primary-200" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="transparent" /></svg>
                </span>
              </h1>

              <p className="text-lg text-gray-500 font-inter mb-10 max-w-lg leading-relaxed">
                PeelKraft transforms discarded organic orange peels into delicious, nutrient-rich sustainable food products for your healthy lifestyle.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <a
                  href="https://www.amazon.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-amazon text-base px-8 py-3.5 shadow-xl shadow-amber-500/20 hover:-translate-y-1 transition-all duration-300"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  Buy on Amazon
                </a>
                <Link
                  to="/products"
                  className="btn-secondary text-base px-8 py-3.5 bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300 shadow-sm"
                >
                  Explore Products
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex items-center gap-6 border-t border-gray-200/60 pt-8">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white overflow-hidden"><img src="https://ui-avatars.com/api/?name=Alice&background=random" alt="user" className="w-full h-full object-cover" /></div>
                  <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white overflow-hidden"><img src="https://ui-avatars.com/api/?name=Bob&background=random" alt="user" className="w-full h-full object-cover" /></div>
                  <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white overflow-hidden"><img src="https://ui-avatars.com/api/?name=Carol&background=random" alt="user" className="w-full h-full object-cover" /></div>
                </div>
                <div>
                  <div className="flex gap-1 text-amber-400 text-sm mb-1">
                    <span className="text-dark font-semibold mr-2">4.9/5</span>
                    {'★'.repeat(5)}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Loved by 10,000+ customers</p>
                </div>
              </div>
            </motion.div>

            {/* Premium Product Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-xl aspect-[4/3] lg:aspect-[3/2] rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 border border-white/60 group bg-gray-50">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  poster="/images/peelkraft-hero-oranges.jpg"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                >
                  <source src="/videos/hero-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Floating element */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -left-8 top-1/4 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-gray-100 hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p className="text-dark font-bold font-poppins text-sm">100% Natural</p>
                    <p className="text-gray-500 text-xs">No Preservatives</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS (Live & Wild Harvest) ===== */}
      <section className="section-padding bg-white border-b border-gray-100 overflow-hidden">
        <div className="container-custom">
          <SectionHeading
            badge="Our Products"
            title="Live & Wild Harvest"
            subtitle="Discover our range of premium organic food products made from carefully selected orange peels."
          />
        </div>

        {products.length > 0 ? (
          products.length === 1 ? (
            (() => {
              const singleProduct = products[0];
              const rawImages = getProductImages(singleProduct);
              let slides = [...rawImages];
              if (slides.length === 1) {
                slides = [slides[0], slides[0], slides[0]];
              } else if (slides.length === 2) {
                slides = [slides[0], slides[1], slides[0]];
              }

              return (
                <div className="w-full flex flex-col items-center">
                  <div className="w-full overflow-hidden mb-6">
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
                      autoplay={{ delay: 2500, disableOnInteraction: false }}
                      coverflowEffect={{
                        rotate: 0,
                        stretch: 0,
                        depth: 100,
                        modifier: 2.5,
                        slideShadows: false,
                      }}
                      pagination={{ clickable: true }}
                      className="single-product-swiper"
                    >
                      {slides.map((img, index) => (
                        <SwiperSlide key={index}>
                          <div className="w-full h-full relative group">
                            <img
                              src={getImageUrl(img)}
                              alt={singleProduct.name}
                              className="w-full h-full object-cover rounded-3xl"
                              loading="lazy"
                            />
                            {singleProduct.isUpcoming && (
                              <span className="absolute top-4 left-4 z-10 bg-[#7BA639] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm font-poppins">
                                Upcoming
                              </span>
                            )}
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
                      className="text-center mt-4 max-w-xl mx-auto"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary-500 font-poppins mb-2 block">
                        {singleProduct.category && typeof singleProduct.category === 'object' ? singleProduct.category.name : 'Orange Peel Snacks'}
                      </span>
                      <h3 className="font-poppins font-bold text-dark text-2xl md:text-3xl mb-3">
                        {singleProduct.name}
                      </h3>
                      <p className="text-sm md:text-base text-gray-500 font-inter mb-6 leading-relaxed">
                        {singleProduct.shortDescription || 'Pure, organic orange peel product carefully processed for health.'}
                      </p>
                      <Link
                        to={`/products/${singleProduct.slug}`}
                        className="btn-primary px-8 py-3"
                      >
                        View Details →
                      </Link>
                    </motion.div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="container-custom">
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {products.slice(0, 3).map((product, i) => (
                  <motion.div
                    key={product._id || i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="card-premium group text-center"
                  >
                    <div className="w-full aspect-[4/5] overflow-hidden rounded-xl mb-6 bg-gray-50 relative">
                      {product.isUpcoming && (
                        <span className="absolute top-3 left-3 z-10 bg-[#7BA639] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm font-poppins">
                          Upcoming
                        </span>
                      )}
                      <img
                        src={getImageUrl(product.thumbnail)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="font-poppins font-semibold text-dark text-lg mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-inter mb-6 line-clamp-2">
                      {product.shortDescription || 'Pure, organic orange peel product carefully processed for health.'}
                    </p>
                    <Link
                      to={`/products/${product.slug}`}
                      className="mt-auto text-sm font-poppins font-semibold text-primary-500 hover:text-dark transition-colors"
                    >
                      View Details →
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="container-custom">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card-premium items-center">
                  <div className="w-full aspect-[4/5] skeleton rounded-xl mb-6" />
                  <div className="h-5 skeleton w-3/4 mb-3" />
                  <div className="h-4 skeleton w-full mb-6" />
                  <div className="h-4 skeleton w-1/2 mt-auto" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="container-custom mt-12 text-center">
          <Link
            to="/products"
            className="btn-outline"
          >
            View All Products
          </Link>
        </div>
      </section>




      {/* ===== OUR STORY ===== */}
      <section className="section-padding bg-cream-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                <img
                  src="/images/peelkraft-waste-to-wonder-orange-peel-story.jpg"
                  alt="PeelKraft JuiceTap Global - From Waste to Wonder Organic Orange Peel Products"
                  title="PeelKraft JuiceTap Global - Sustainable Orange Peel Upcycling"
                  className="rounded-2xl shadow-sm w-full object-cover border border-gray-100 hover:scale-[1.02] transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-3 py-1 bg-primary-50 text-primary-500 font-poppins font-semibold text-xs uppercase tracking-widest rounded-full mb-6">
                Our Story
              </span>
              <h2 className="text-page font-poppins font-bold text-dark mb-6">
                From Waste to <span className="text-primary-500">Wonder</span>
              </h2>
              <p className="text-gray-500 font-inter leading-relaxed mb-6">
                PeelKraft was born from a simple yet powerful idea — what if the orange peels that juice manufacturers throw away could become premium food products? Founded by JuiceTap Global Pvt Ltd, we saw an opportunity to create value from waste while promoting health and sustainability.
              </p>
              <p className="text-gray-500 font-inter leading-relaxed mb-10">
                Today, PeelKraft transforms thousands of kilograms of orange peels into delicious, nutritious products that are loved by health-conscious consumers across India.
              </p>
              <Link to="/about" className="btn-secondary">
                Read Our Story
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== WHY PEELKRAFT ===== */}
      <section className="section-padding bg-white border-t border-gray-100">
        <div className="container-custom">
          <SectionHeading
            badge="Why PeelKraft"
            title={<>What Makes Us <span className="text-primary-500">Different</span></>}
            subtitle="We're not just another food brand. We're building a sustainable food ecosystem."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card-premium group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-6 group-hover:bg-primary-500 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-primary-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg text-dark mb-2">{item.title}</h3>
                  <p className="text-gray-500 font-inter text-sm">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== MANUFACTURING PROCESS ===== */}
      <section className="section-padding bg-gray-50 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <SectionHeading
            badge="Our Process"
            title={<>How We <span className="text-primary-500">Craft</span> Perfection</>}
            subtitle="Every PeelKraft product goes through a meticulous 5-step process"
          />

          <div className="flex flex-wrap justify-center gap-6 lg:gap-8 max-w-6xl mx-auto">
            {processSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <span className="text-5xl font-poppins font-bold text-gray-100 absolute top-4 right-6 transition-colors group-hover:text-primary-50">
                  {step.num}
                </span>
                <h3 className="font-poppins font-semibold text-dark text-xl mb-3 relative z-10">{step.title}</h3>
                <p className="text-gray-500 font-inter text-sm relative z-10">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATISTICS ===== */}
      <section className="section-padding bg-white border-y border-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Counter end={10000} suffix="+" label="Happy Customers" />
            <Counter end={50} suffix="+" label="Products" />
            <Counter end={500} suffix="T" label="Peels Recycled" />
            <Counter end={4.9} suffix="/5" label="Average Rating" />
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      {testimonials.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-custom">
            <SectionHeading
              badge="Testimonials"
              title={<>What Our Customers <span className="text-primary-500">Say</span></>}
            />

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
              className="pb-14"
            >
              {testimonials.map((t, i) => (
                <SwiperSlide key={t._id || i}>
                  <div className="card-premium h-full">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, s) => (
                        <FiStar key={s} className={`w-4 h-4 ${s < t.rating ? 'text-gold-500 fill-gold-500' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-gray-500 font-inter italic mb-6 line-clamp-4 text-sm">"{t.content}"</p>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-dark font-bold text-sm">
                        {t.name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-dark font-poppins">{t.name}</p>
                        <p className="text-xs text-gray-400 font-inter">{t.designation}</p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* ===== LATEST BLOGS ===== */}
      <section className="section-padding bg-white border-t border-gray-100">
        <div className="container-custom">
          <SectionHeading
            badge="From Our Blog"
            title={<>Latest <span className="gradient-text">Insights</span></>}
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
                <Link to={`/blogs/${blog.slug}`} className="card-premium group block h-full">
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={getImageUrl(blog.featuredImage)}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full">
                      {blog.category}
                    </span>
                  </div>
                  <div className="pt-4">

                    <h3 className="font-poppins font-semibold text-lg text-dark mb-3 line-clamp-2 group-hover:text-primary-500 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-3">
                      {blog.excerpt || truncateText(stripHtml(blog.content), 120)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/blogs" className="btn-outline">
              Read All Articles <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section-padding bg-cream-50 border-t border-gray-100">
        <div className="container-custom max-w-3xl">
          <SectionHeading
            badge="FAQ"
            title={<>Frequently Asked <span className="text-primary-500">Questions</span></>}
          />

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq._id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-gray-100 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-poppins font-semibold text-dark pr-4">{faq.question}</span>
                  <span className={`text-primary-500 transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-gray-500 font-inter leading-relaxed text-sm">{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/faq" className="btn-secondary">
              View All FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* ===== AMAZON STORE SHOWCASE SECTION ===== */}
      <section className="py-20 bg-dark text-white relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Left Column: Heading & Branding */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-primary-500 font-poppins font-semibold text-xs uppercase tracking-widest rounded-full border border-white/10">
                <FiShoppingCart className="w-3.5 h-3.5" />
                Official Amazon Store
              </span>
              <h2 className="text-page font-poppins font-bold text-white leading-tight">
                Shop PeelKraft™ on Amazon
              </h2>
              <p className="text-gray-400 font-inter text-body max-w-md mx-auto lg:mx-0">
                Get fast & reliable delivery directly to your doorstep. Experience 100% natural, premium citrus peel products with Amazon Prime delivery.
              </p>
              <div className="pt-4 flex flex-wrap gap-4 justify-center lg:justify-start">
                <a
                  href={settings?.amazonStoreUrl || "https://www.amazon.in"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-amazon"
                >
                  <FiShoppingCart className="w-4 h-4" />
                  Visit Amazon Store
                </a>
              </div>
            </div>

            {/* Right Column: Featured Products Available on Amazon */}
            <div className="lg:col-span-6">
              {products.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {products.slice(0, 2).map((prod) => (
                    <div key={prod._id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between group hover:border-primary-500/30 transition-colors duration-300">
                      <div className="flex items-center gap-4 mb-6">
                        <img
                          src={getImageUrl(prod.thumbnail || prod.featuredImage)}
                          alt={prod.name}
                          className="w-16 h-16 object-contain rounded-xl bg-white p-2"
                        />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-primary-500 tracking-wider">
                            Amazon Fulfilled
                          </span>
                          <h4 className="font-poppins font-semibold text-sm text-white line-clamp-1 mt-1">
                            {prod.name}
                          </h4>
                          <p className="text-xs text-gray-400 font-inter mt-1">{prod.weight || 'Premium Pack'}</p>
                        </div>
                      </div>
                      <a
                        href={prod.amazonLink || settings?.amazonStoreUrl || "https://www.amazon.in"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-white hover:bg-gray-100 text-dark font-poppins font-semibold text-xs rounded-full flex items-center justify-center gap-2 transition-colors"
                      >
                        <FiShoppingCart className="w-3.5 h-3.5" />
                        Buy Now
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-gray-400 font-inter text-sm">Explore all PeelKraft products on Amazon</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
