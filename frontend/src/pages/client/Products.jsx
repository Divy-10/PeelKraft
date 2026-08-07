import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList, FiChevronDown, FiShoppingCart } from 'react-icons/fi';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import { productApi, categoryApi } from '../../api';
import { getImageUrl, truncateText } from '../../utils';
import useDebounce from '../../hooks/useDebounce';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    categoryApi.getAll().then(res => setCategories(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12, sortBy, sortOrder };
        if (debouncedSearch) params.search = debouncedSearch;
        if (category) params.category = category;
        const res = await productApi.getAll(params);
        setProducts(res.data || []);
        setPagination(res.pagination || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [debouncedSearch, category, sortBy, sortOrder, page]);

  return (
    <>
      <SEOHead title="Products" description="Explore PeelKraft's range of premium orange peel food products." canonicalUrl="/products" />

      <section className="pt-36 pb-16 bg-cream-50">
        <div className="container-custom">
          <Breadcrumbs items={[{ label: 'Products' }]} />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <h1 className="text-3xl md:text-5xl font-serif text-dark mb-4">Our Products</h1>
            <p className="text-gray-500 text-xs md:text-sm tracking-wide max-w-2xl font-sans">Discover our complete range of premium food products crafted from orange peels.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container-custom">
          {/* Filters */}
          <div className="flex flex-row gap-3 mb-10 items-center justify-between">
            <div className="relative flex-1 min-w-0">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                value={search} 
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
                placeholder="Search..." 
                className="w-full pl-11 pr-4 py-2.5 text-xs font-sans rounded-full border border-cream-200 focus:outline-none focus:border-primary-500 transition-colors" 
              />
            </div>
            <div className="flex gap-2 w-auto shrink-0">
              <select 
                value={category} 
                onChange={(e) => { setCategory(e.target.value); setPage(1); }} 
                className="px-4 py-2.5 text-xs font-sans rounded-full border border-cream-200 focus:outline-none focus:border-primary-500 bg-white cursor-pointer transition-colors"
              >
                <option value="">Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <select 
                value={`${sortBy}-${sortOrder}`} 
                onChange={(e) => { const [f, o] = e.target.value.split('-'); setSortBy(f); setSortOrder(o); setPage(1); }} 
                className="px-4 py-2.5 text-xs font-sans rounded-full border border-cream-200 focus:outline-none focus:border-primary-500 bg-white cursor-pointer transition-colors"
              >
                <option value="createdAt-desc">Newest</option>
                <option value="createdAt-asc">Oldest</option>
                <option value="name-asc">A–Z</option>
                <option value="name-desc">Z–A</option>
                <option value="views-desc">Popular</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-cream-200 bg-cream-50/20 rounded-2xl p-5 flex flex-col items-center">
                  <div className="aspect-square w-full skeleton rounded-xl mb-6" />
                  <div className="h-4 skeleton w-3/4 mb-3" />
                  <div className="h-3 skeleton w-full mb-6" />
                  <div className="h-3 skeleton w-1/2 mt-auto" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-cream-50/40 rounded-2xl border border-cream-200/50">
              <p className="text-sm font-serif text-dark mb-2">No products found</p>
              <p className="text-gray-500 font-sans text-xs">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className={products.length === 1 ? 'grid grid-cols-1 max-w-[380px] mx-auto gap-8' : products.length === 2 ? 'grid grid-cols-1 sm:grid-cols-2 max-w-[780px] mx-auto gap-8' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto gap-8'}>
              {products.map((product, i) => {
                const hasOptions = product.packageOptions && product.packageOptions.length > 0;
                const trackInventory = product.trackInventory !== false;
                const isOutOfStock = trackInventory
                  ? (hasOptions
                      ? product.packageOptions.every(opt => (opt.stock ?? 0) <= 0 || opt.status === 'disabled')
                      : ((product.stock ?? 0) <= 0)
                    )
                  : false;
                return (
                  <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/products/${product.slug}`} className="group block h-full bg-cream-50/30 border border-cream-200/50 rounded-2xl p-5 transition-all duration-500 hover:shadow-premium hover:-translate-y-1 hover:bg-white">
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
                      <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2 font-sans">{product.category?.name || 'Product'}</p>
                      <h3 className="font-serif text-dark text-base md:text-lg mb-2 group-hover:text-primary-500 transition-colors line-clamp-2 md:line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-gray-500 font-sans mb-4 line-clamp-2 leading-relaxed tracking-wide">{product.shortDescription}</p>
                      
                      {/* Catalog Price */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="font-sans font-bold text-dark text-sm md:text-base">₹{product.sellingPrice || product.mrp}</span>
                        {product.mrp > product.sellingPrice && (
                          <span className="text-xs text-gray-400 line-through font-sans">₹{product.mrp}</span>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-primary-500 uppercase tracking-widest group-hover:text-dark transition-colors">View Details</span>
                    </Link>
                  </motion.div>
                )})}
            </div>
          )}


          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-16">
              {[...Array(pagination.pages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-full font-sans font-semibold text-xs transition-all border ${page === i + 1 ? 'bg-dark border-dark text-white' : 'bg-white border-cream-200 text-gray-600 hover:border-dark'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Products;
