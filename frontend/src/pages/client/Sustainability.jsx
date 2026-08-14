import { motion } from 'framer-motion';
import { FiRefreshCw, FiDroplet, FiSun, FiGlobe, FiTrendingUp, FiHeart } from 'react-icons/fi';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';

const sections = [
  {
    icon: FiRefreshCw,
    title: 'Circular Economy',
    desc: 'We create a closed-loop system where orange peel waste from juice manufacturers becomes the raw material for premium food products. Nothing goes to waste.',
    color: 'bg-green-100 text-green-600',
    image: '/images/circular_economy.jpg'
  },

  {
    icon: FiSun,
    title: 'Food Innovation',
    desc: 'Our R&D team has developed proprietary processes to extract maximum nutrition from orange peels while maintaining taste and texture that consumers love.',
    color: 'bg-primary-100 text-primary-600',
    image: '/images/food_innovation.png'
  },
  {
    icon: FiGlobe,
    title: 'Environmental Impact',
    desc: 'PeelKraft transforms discarded orange peels into premium food products, reducing food waste through innovative upcycling. By giving natural resources a second life, we promote sustainability, support responsible production, and contribute to a cleaner, more circular economy.',
    color: 'bg-emerald-100 text-emerald-600',
    image: '/images/environmental_impact.png'
  },
  {
    icon: FiTrendingUp,
    title: 'Sustainable Growth',
    desc: 'Our business model proves that sustainability and profitability can coexist. We create value for manufacturers, consumers, and the environment.',
    color: 'bg-gold-100 text-gold-600',
    image: '/images/sustainable_growth.png'
  },
];

const Sustainability = () => (
  <>
    <SEOHead title="Sustainability" description="Learn how PeelKraft is creating a circular economy by transforming orange peel waste into premium food products." canonicalUrl="/sustainability" />

    {/* Header Section */}
    <section className="pt-36 pb-16 bg-cream-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/20 rounded-full blur-3xl -z-10" />
      <div className="container-custom w-full">
        <Breadcrumbs items={[{ label: 'Sustainability' }]} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-8 max-w-3xl"
        >
          <span className="inline-block px-4 py-1.5 bg-cream-100 border border-cream-200 text-primary-500 font-sans font-bold text-[10px] uppercase tracking-wider rounded-full mb-4">
            Zero Waste Commitment
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-dark mb-6 leading-tight">
            Our <span className="text-primary-500 italic font-normal">Sustainability</span> Commitment
          </h1>
          <p className="text-gray-500 font-sans text-base md:text-lg leading-relaxed">
            Building a zero-waste future through food innovation. Discover how every step of our process supports rural communities and heals our planet.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Zigzag Content Sections */}
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="space-y-24 md:space-y-36">
          {sections.map((item, i) => {
            const isEven = i % 2 === 0;
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${isEven ? '' : 'lg:flex-row-reverse'}`}
              >
                {/* Image Block */}
                <div className="w-full lg:w-1/2 relative">
                  <div className="absolute -inset-4 bg-cream-100/50 rounded-3xl blur-2xl -z-10 transform -rotate-2" />
                  <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-premium border border-cream-200/50 bg-cream-50">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  {/* Floating Metric Badge */}
                  <div className="absolute -bottom-6 -right-2 md:-right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-premium border border-cream-100 flex items-center gap-4 z-10 font-sans">
                    <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-semibold text-gray-400">Pillar {i + 1}</p>
                      <p className="text-dark font-bold text-xs mt-1 leading-none">{item.title}</p>
                    </div>
                  </div>
                </div>

                {/* Text Block */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500 font-sans mb-3 block">
                    Focus Area
                  </span>
                  <h2 className="text-3xl md:text-4xl font-serif text-dark mb-6 leading-tight">
                    {item.title}
                  </h2>
                  <p className="text-gray-500 font-sans text-xs sm:text-sm leading-relaxed tracking-wide mb-8">
                    {item.desc}
                  </p>
                  <div className="w-16 h-0.5 bg-primary-500 rounded-full" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>

    {/* Orange Peel Recycling Process */}
    <section className="py-24 bg-dark text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-900/10 rounded-full blur-3xl -z-10" />
      <div className="container-custom relative z-10 text-center max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6">The Orange Peel Journey</h2>
          <p className="text-gray-400 font-sans text-xs sm:text-sm tracking-wide mb-16 max-w-2xl mx-auto">From juice manufacturer waste to your table — every peel has a purpose.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {['Juice Tap Machines → Peel Collection', 'Cleaning & Sanitization', 'Dehydration & Processing', 'Premium Product'].map((step, i) => (
              <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm group hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 mx-auto rounded-full bg-white/10 flex items-center justify-center font-bold mb-6 text-primary-500 font-sans text-lg">{i + 1}</div>
                <p className="text-xs sm:text-sm font-sans text-gray-300 group-hover:text-white transition-colors leading-relaxed tracking-wide">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    {/* Impact Numbers */}
    <section className="py-20 bg-white border-y border-cream-200/40">
      <div className="container-custom text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-serif text-dark mb-16">Our <span className="text-primary-500 italic font-normal">Impact</span></h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto items-center justify-items-center">
          {[
            { num: '500+', label: 'KG of Peels Recycled' },
            { num: '20+', label: 'Jobs Created' },
            { num: '5,000+', label: 'Customers Served' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 text-center w-full">
              <p className="text-4xl md:text-5xl font-serif text-dark mb-3">{item.num}</p>
              <p className="text-gray-400 text-xs font-sans tracking-widest uppercase font-semibold">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default Sustainability;
