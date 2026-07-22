import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import SEOHead from '../../components/seo/SEOHead';
import { productApi, blogApi, recipeApi } from '../../api';
import { getImageUrl, truncateText, stripHtml, formatDate } from '../../utils';
import useDebounce from '../../hooks/useDebounce';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], blogs: [], recipes: [] });
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery) { setResults({ products: [], blogs: [], recipes: [] }); return; }
    const search = async () => {
      setLoading(true);
      try {
        const [p, b, r] = await Promise.allSettled([
          productApi.getAll({ search: debouncedQuery, limit: 6 }),
          blogApi.getAll({ search: debouncedQuery, limit: 6 }),
          recipeApi.getAll({ search: debouncedQuery, limit: 6 }),
        ]);
        setResults({
          products: p.status === 'fulfilled' ? (p.value.data || []) : [],
          blogs: b.status === 'fulfilled' ? (b.value.data || []) : [],
          recipes: r.status === 'fulfilled' ? (r.value.data || []) : [],
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    search();
  }, [debouncedQuery]);

  const totalResults = results.products.length + results.blogs.length + results.recipes.length;

  return (
    <>
      <SEOHead title="Search" noIndex canonicalUrl="/search" />

      <section className="pt-28 pb-8 md:pt-32 md:pb-10 bg-cream-100 flex items-center">
        <div className="container-custom w-full max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-dark mb-6">Search <span className="gradient-text">PeelKraft</span></h1>
          <div className="relative">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, blogs, recipes..." className="w-full pl-14 pr-6 py-5 rounded-2xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-lg font-inter shadow-soft bg-white" autoFocus />
          </div>
        </div>
      </section>

      <section className="section-padding bg-white min-h-[50vh]">
        <div className="container-custom max-w-4xl">
          {loading && <div className="text-center py-10"><div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>}

          {!loading && query && totalResults === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400 mb-2">No results found for "{query}"</p>
              <p className="text-gray-400">Try a different search term</p>
            </div>
          )}

          {!loading && totalResults > 0 && (
            <div className="space-y-12">
              {results.products.length > 0 && (
                <div>
                  <h2 className="text-xl font-poppins font-bold text-dark mb-4">Products ({results.products.length})</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {results.products.map(p => (
                      <Link key={p._id} to={`/products/${p.slug}`} className="card-premium flex gap-4 group overflow-hidden">
                        <div className="w-20 h-20 shrink-0 overflow-hidden"><img src={getImageUrl(p.thumbnail)} alt={p.name} className="w-full h-full object-cover" /></div>
                        <div className="p-3"><h3 className="font-semibold text-sm text-dark group-hover:text-primary-500 transition-colors line-clamp-2">{p.name}</h3><p className="text-xs text-gray-400 mt-1">{p.category?.name}</p></div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {results.blogs.length > 0 && (
                <div>
                  <h2 className="text-xl font-poppins font-bold text-dark mb-4">Articles ({results.blogs.length})</h2>
                  <div className="space-y-3">
                    {results.blogs.map(b => (
                      <Link key={b._id} to={`/blogs/${b.slug}`} className="block p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all">
                        <h3 className="font-semibold text-dark hover:text-primary-500">{b.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{b.excerpt || truncateText(stripHtml(b.content), 100)}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {results.recipes.length > 0 && (
                <div>
                  <h2 className="text-xl font-poppins font-bold text-dark mb-4">Recipes ({results.recipes.length})</h2>
                  <div className="space-y-3">
                    {results.recipes.map(r => (
                      <Link key={r._id} to={`/recipes/${r.slug}`} className="block p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all">
                        <h3 className="font-semibold text-dark hover:text-primary-500">{r.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{r.totalTime} • {r.difficulty}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Search;
