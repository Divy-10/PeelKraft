import { motion } from 'framer-motion';
import { FiRefreshCw, FiDroplet, FiSun, FiGlobe, FiTrendingUp, FiHeart } from 'react-icons/fi';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';

const sections = [
  { icon: FiRefreshCw, title: 'Circular Economy', desc: 'We create a closed-loop system where orange peel waste from juice manufacturers becomes the raw material for premium food products. Nothing goes to waste.', color: 'bg-green-100 text-green-600' },
  { icon: FiDroplet, title: 'Waste Reduction', desc: 'India generates over 4 million tonnes of citrus peel waste annually. PeelKraft diverts hundreds of tonnes from landfills each year, reducing methane emissions and soil contamination.', color: 'bg-blue-100 text-blue-600' },
  { icon: FiSun, title: 'Food Innovation', desc: 'Our R&D team has developed proprietary processes to extract maximum nutrition from orange peels while maintaining taste and texture that consumers love.', color: 'bg-primary-100 text-primary-600' },
  { icon: FiGlobe, title: 'Environmental Impact', desc: 'By recycling orange peels instead of sending them to landfills, we prevent the release of greenhouse gases and reduce the need for additional agricultural land.', color: 'bg-emerald-100 text-emerald-600' },
  { icon: FiTrendingUp, title: 'Sustainable Growth', desc: 'Our business model proves that sustainability and profitability can coexist. We create value for farmers, manufacturers, consumers, and the environment.', color: 'bg-gold-100 text-gold-600' },
  { icon: FiHeart, title: 'Community Impact', desc: 'PeelKraft creates employment opportunities in rural areas, supports local farmers, and promotes health awareness through our products and educational content.', color: 'bg-rose-100 text-rose-600' },
];

const Sustainability = () => (
  <>
    <SEOHead title="Sustainability" description="Learn how PeelKraft is creating a circular economy by transforming orange peel waste into premium food products." canonicalUrl="/sustainability" />

    <section className="pt-32 pb-12 bg-cream-50">
      <div className="container-custom w-full">
        <Breadcrumbs items={[{ label: 'Sustainability' }]} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <h1 className="text-page font-poppins font-bold text-dark mb-4">Our <span className="text-primary-500">Sustainability</span> Commitment</h1>
          <p className="text-gray-500 font-inter text-body max-w-2xl">Building a zero-waste future through food innovation.</p>
        </motion.div>
      </div>
    </section>

    <section className="py-6 md:py-10 bg-white">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-premium group">
                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-semibold text-lg text-dark mb-3">{item.title}</h3>
                <p className="text-gray-500 font-inter text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>

    {/* Orange Peel Recycling Process */}
    <section className="section-padding bg-dark text-white relative overflow-hidden">
      <div className="container-custom relative z-10 text-center max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-section font-poppins font-bold mb-6">The Orange Peel Journey</h2>
          <p className="text-gray-400 font-inter text-lg mb-12">From juice manufacturer waste to your table — every peel has a purpose.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Juice Tap Machines → Peel Collection', 'Cleaning & Sanitization', 'Dehydration & Processing', 'Premium Product'].map((step, i) => (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm group hover:border-primary-500/30 transition-colors">
                <div className="w-12 h-12 mx-auto rounded-full bg-white/10 flex items-center justify-center font-bold mb-4 text-primary-500 font-poppins">{i + 1}</div>
                <p className="text-sm font-inter text-gray-300 group-hover:text-white transition-colors">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    {/* Impact Numbers */}
    <section className="section-padding bg-white border-y border-gray-100">
      <div className="container-custom text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-section font-poppins font-bold text-dark mb-12">Our <span className="text-primary-500">Impact</span></h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { num: '500+', label: 'Tonnes of Peels Recycled' },
            { num: '200+', label: 'Tonnes of CO₂ Saved' },
            { num: '100+', label: 'Jobs Created' },
            { num: '10,000+', label: 'Customers Served' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6">
              <p className="text-4xl font-poppins font-bold text-dark">{item.num}</p>
              <p className="text-gray-500 text-sm mt-2 font-inter">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default Sustainability;
