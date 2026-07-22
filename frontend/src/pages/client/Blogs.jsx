import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiClock, FiEye } from 'react-icons/fi';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import { blogApi } from '../../api';
import { formatDate, truncateText, stripHtml, getImageUrl } from '../../utils';
import useDebounce from '../../hooks/useDebounce';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    blogApi.getCategories().then(r => setCategories(r.data || [])).catch(() => {});
    blogApi.getTags().then(r => setTags(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 9 };
        if (debouncedSearch) params.search = debouncedSearch;
        if (category) params.category = category;
        if (tag) params.tag = tag;
        const res = await blogApi.getAll(params);
        setBlogs(res.data || []);
        setPagination(res.pagination || null);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [debouncedSearch, category, tag, page]);

  return (
    <>
      <SEOHead title="Blog" description="Read the latest insights on health, sustainability, and recipes from PeelKraft." canonicalUrl="/blogs" />
      <section className="pt-32 pb-12 bg-cream-50">
        <div className="container-custom w-full">
          <Breadcrumbs items={[{ label: 'Blog' }]} />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <h1 className="text-page font-poppins font-bold text-dark mb-4">Our Blog</h1>
            <p className="text-gray-500 text-body max-w-2xl font-inter">Health tips, recipes, sustainability stories, and more.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-6 md:py-10 bg-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4 mb-10 items-start md:items-center">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search articles..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none transition-all font-inter" />
            </div>
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none font-inter text-sm bg-white">
              <option value="">All Categories</option>
              {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button onClick={() => { setTag(''); setPage(1); }} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!tag ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
              {tags.slice(0, 10).map(t => (
                <button key={t} onClick={() => { setTag(t); setPage(1); }} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${tag === t ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{[...Array(6)].map((_, i) => <div key={i} className="card-premium"><div className="aspect-video skeleton" /><div className="p-6 space-y-3"><div className="h-4 skeleton w-1/3" /><div className="h-6 skeleton w-3/4" /><div className="h-4 skeleton" /></div></div>)}</div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20"><p className="text-xl text-gray-400">No articles found</p></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, i) => (
                <motion.div key={blog._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/blogs/${blog.slug}`} className="card-premium group block h-full">
                    <div className="relative overflow-hidden aspect-video">
                      <img src={getImageUrl(blog.featuredImage)} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                      <span className="absolute top-3 left-3 px-3 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full">{blog.category}</span>
                    </div>
                    <div className="p-6">

                      <h3 className="font-poppins font-semibold text-lg text-dark mb-3 line-clamp-2 group-hover:text-primary-500 transition-colors">{blog.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-3">{blog.excerpt || truncateText(stripHtml(blog.content), 120)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-16">
              {[...Array(pagination.pages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded-xl font-inter font-semibold text-sm transition-all border ${page === i + 1 ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Blogs;
