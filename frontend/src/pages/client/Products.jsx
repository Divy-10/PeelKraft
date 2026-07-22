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
          <div className="flex flex-col md:flex-row gap-4 mb-10 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-inter" />
            </div>
            <div className="flex gap-3 flex-wrap w-full md:w-auto">
              <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none font-inter text-sm bg-white">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [f, o] = e.target.value.split('-'); setSortBy(f); setSortOrder(o); setPage(1); }} className="w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none font-inter text-sm bg-white">
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
                <option value="views-desc">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card-premium">
                  <div className="w-full aspect-[4/5] skeleton rounded-xl mb-4" />
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
            <div className={`grid gap-6 ${products.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
              {products.map((product, i) => (
                <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/products/${product.slug}`} className="card-premium group text-center block h-full">
                    <div className="w-full aspect-[4/5] overflow-hidden rounded-xl mb-6 bg-gray-50 relative">
                      {product.isUpcoming && (
                        <span className="absolute top-3 left-3 z-10 bg-[#7BA639] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm font-poppins">
                          Upcoming
                        </span>
                      )}
                      <img src={getImageUrl(product.thumbnail)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">{product.category?.name || 'Product'}</p>
                    <h3 className="font-poppins font-semibold text-dark text-lg mb-2 group-hover:text-primary-500 transition-colors line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 font-inter mb-4 line-clamp-2">{product.shortDescription}</p>
                    
                    {/* Catalog Price */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="font-poppins font-bold text-dark text-base">₹{product.sellingPrice || product.mrp}</span>
                      {product.mrp > product.sellingPrice && (
                        <span className="text-xs text-gray-400 line-through font-inter">₹{product.mrp}</span>
                      )}
                    </div>

                    <span className="mt-auto text-sm font-poppins font-semibold text-primary-500">View Details →</span>
                  </Link>
                </motion.div>
              ))}
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
