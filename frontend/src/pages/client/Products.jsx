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

      <section className="pt-32 pb-12 bg-cream-50">
        <div className="container-custom">
          <Breadcrumbs items={[{ label: 'Products' }]} />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <h1 className="text-page font-poppins font-bold text-dark mb-4">Our Products</h1>
            <p className="text-gray-500 text-body max-w-2xl font-inter">Discover our complete range of premium food products crafted from orange peels.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-6 md:py-10 bg-white">
        <div className="container-custom">
          {/* Filters */}
          <div className="flex flex-row gap-2 mb-8 items-center justify-between">
            <div className="relative flex-1 min-w-0">
              <FiSearch className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input 
                type="text" 
                value={search} 
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
                placeholder="Search..." 
                className="w-full pl-9 md:pl-12 pr-2 md:pr-4 py-2.5 md:py-3 text-xs md:text-sm input-premium" 
              />
            </div>
            <div className="flex gap-1.5 w-auto shrink-0">
              <select 
                value={category} 
                onChange={(e) => { setCategory(e.target.value); setPage(1); }} 
                className="w-[90px] sm:w-auto px-1.5 md:px-4 py-2.5 md:py-3 text-xs md:text-sm input-premium bg-white cursor-pointer min-w-0"
              >
                <option value="">Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <select 
                value={`${sortBy}-${sortOrder}`} 
                onChange={(e) => { const [f, o] = e.target.value.split('-'); setSortBy(f); setSortOrder(o); setPage(1); }} 
                className="w-[78px] sm:w-auto px-1.5 md:px-4 py-2.5 md:py-3 text-xs md:text-sm input-premium bg-white cursor-pointer min-w-0"
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
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card-premium">
                  <div className="product-image-container skeleton rounded-xl mb-4" />
                  <div className="h-5 skeleton w-3/4 mb-3" />
                  <div className="h-4 skeleton w-full mb-4" />
                  <div className="h-4 skeleton w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-lg text-dark font-poppins font-semibold mb-2">No products found</p>
              <p className="text-gray-500 font-inter text-sm">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${products.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
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
                    <Link to={`/products/${product.slug}`} className="card-premium group text-center block h-full !p-3 md:!p-6">
                      <div className="product-image-container rounded-xl mb-3 md:mb-6 relative">
                        {product.isUpcoming && (
                          <span className="hidden md:inline-block absolute top-3 left-3 z-10 bg-[#7BA639] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm font-poppins">
                            Upcoming
                          </span>
                        )}
                        {isOutOfStock && !product.isUpcoming && (
                          <span className="hidden md:inline-block absolute top-3 right-3 z-10 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm font-poppins">
                            Sold Out
                          </span>
                        )}
                        <img 
                          src={getImageUrl(product.thumbnail)} 
                          alt={product.name} 
                          className={`product-image group-hover:scale-105 ${isOutOfStock && !product.isUpcoming ? 'opacity-50 grayscale-[40%]' : ''}`} 
                          loading="lazy" 
                        />
                      </div>
                    <p className="hidden md:block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">{product.category?.name || 'Product'}</p>
                    <h3 className="font-poppins font-semibold text-dark text-sm md:text-lg mb-1 md:mb-2 group-hover:text-primary-500 transition-colors line-clamp-2 md:line-clamp-1">{product.name}</h3>
                    <p className="hidden md:block text-sm text-gray-500 font-inter mb-4 line-clamp-2">{product.shortDescription}</p>
                    
                    {/* Catalog Price */}
                    <div className="flex items-center justify-center gap-2 mb-1 md:mb-4">
                      <span className="font-poppins font-bold text-dark text-sm md:text-base">₹{product.sellingPrice || product.mrp}</span>
                      {product.mrp > product.sellingPrice && (
                        <span className="text-xs text-gray-400 line-through font-inter">₹{product.mrp}</span>
                      )}
                    </div>

                    <span className="hidden md:block mt-auto text-sm font-poppins font-semibold text-primary-500">View Details →</span>
                  </Link>
                </motion.div>
              )})}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-16">
              {[...Array(pagination.pages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded-xl font-inter font-semibold text-sm transition-all border ${page === i + 1 ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
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
