import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiEye, FiTag, FiArrowLeft } from 'react-icons/fi';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import { blogApi } from '../../api';
import { formatDate, getImageUrl, truncateText, stripHtml } from '../../utils';

const BlogDetails = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await blogApi.getBySlug(slug);
        setBlog(res.data);
        const relRes = await blogApi.getRelated(slug);
        setRelated(relRes.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!blog) return <div className="min-h-screen flex items-center justify-center text-center"><h2 className="text-2xl font-poppins font-bold mb-2">Article Not Found</h2><Link to="/blogs" className="text-primary-500">← Back to Blog</Link></div>;

  const articleSchema = { '@context': 'https://schema.org', '@type': 'Article', headline: blog.title, description: blog.excerpt, image: getImageUrl(blog.featuredImage), datePublished: blog.createdAt, author: { '@type': 'Person', name: blog.author?.name || 'PeelKraft' } };

  return (
    <>
      <SEOHead title={blog.seoTitle || blog.title} description={blog.seoDescription || blog.excerpt} canonicalUrl={`/blogs/${blog.slug}`} ogImage={getImageUrl(blog.featuredImage)} ogType="article" schema={articleSchema} />

      <section className="pt-28 pb-16 md:pt-32 md:pb-24 bg-white">
        <div className="container-custom max-w-4xl">
          <Breadcrumbs items={[{ label: 'Blog', path: '/blogs' }, { label: blog.title }]} />

          <motion.article initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-500 text-sm font-semibold rounded-full mb-4">{blog.category}</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-poppins font-bold text-dark mb-6 leading-tight">{blog.title}</h1>



            <div className="rounded-2xl overflow-hidden mb-10">
              <img src={getImageUrl(blog.featuredImage)} alt={blog.title} className="w-full aspect-video object-cover" />
            </div>

            <div className="prose-content" dangerouslySetInnerHTML={{ __html: blog.content }} />


          </motion.article>

          {related.length > 0 && (
            <div className="mt-16 border-t border-gray-100 pt-16">
              <h2 className="text-2xl font-poppins font-bold text-dark mb-8">Related <span className="text-primary-500">Articles</span></h2>
              <div className="grid md:grid-cols-2 gap-6">
                {related.map(r => (
                  <Link key={r._id} to={`/blogs/${r.slug}`} className="card-premium group flex gap-4 overflow-hidden">
                    <div className="w-32 h-32 shrink-0 overflow-hidden"><img src={getImageUrl(r.featuredImage)} alt={r.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                    <div className="p-4 flex flex-col justify-center">
                      <p className="text-xs text-gray-400 mb-1">{formatDate(r.createdAt)}</p>
                      <h3 className="font-poppins font-semibold text-dark group-hover:text-primary-500 transition-colors line-clamp-2">{r.title}</h3>
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

export default BlogDetails;
