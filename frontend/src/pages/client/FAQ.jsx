import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import { faqApi } from '../../api';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    faqApi.getAll().then(r => { setFaqs(r.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(faqs.map(f => f.category))];
  const filtered = activeCategory === 'All' ? faqs : faqs.filter(f => f.category === activeCategory);

  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) };

  return (
    <>
      <SEOHead title="FAQ" description="Find answers to frequently asked questions about PeelKraft products." canonicalUrl="/faq" schema={faqSchema} />

      <section className="pt-32 pb-12 bg-cream-50">
        <div className="container-custom w-full">
          <Breadcrumbs items={[{ label: 'FAQ' }]} />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <h1 className="text-page font-poppins font-bold text-dark mb-4">Frequently Asked <span className="text-primary-500">Questions</span></h1>
          </motion.div>
        </div>
      </section>

      <section className="py-6 md:py-10 bg-white">
        <div className="container-custom max-w-3xl">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat}</button>
            ))}
          </div>

          <div className="space-y-4">
            {filtered.map((faq, i) => (
              <motion.div key={faq._id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                className="border border-gray-100 rounded-2xl overflow-hidden">
                <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-poppins font-semibold text-dark pr-4">{faq.question}</span>
                  <span className={`text-primary-500 transition-transform duration-300 shrink-0 ${openIndex === i ? 'rotate-45' : ''}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </span>
                </button>
                <motion.div initial={false} animate={{ height: openIndex === i ? 'auto' : 0, opacity: openIndex === i ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <p className="px-6 pb-6 text-gray-500 leading-relaxed">{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQ;
