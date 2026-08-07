import { motion } from 'framer-motion';
import { FiTarget, FiEye, FiAward, FiUsers, FiHeart, FiGlobe } from 'react-icons/fi';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';

const timeline = [
  { year: '2025', title: 'The Idea', desc: 'JuiceTap Global identifies the massive orange peel waste problem in India\'s juice industry.' },
  { year: '2025', title: 'R&D Phase', desc: 'Our food scientists develop the proprietary process to convert orange peels into food-grade products.' },
  { year: 'May 2026', title: 'PeelKraft Born', desc: 'PeelKraft launches as a sub-brand of JuiceTap Global with its first product — Orange Peel Powder.' },
  { year: 'July 2026', title: 'Scaling Up', desc: 'Product range expands to include snacks, tea blends, and seasonings. Amazon store goes live.' },
];

const values = [
  { icon: FiHeart, title: 'Health First', desc: 'Every product is designed to nourish your body with natural vitamins, fiber, and antioxidants.' },
  { icon: FiGlobe, title: 'Planet Positive', desc: 'We\'re committed to zero-waste manufacturing and reducing our environmental footprint.' },
  { icon: FiAward, title: 'Uncompromising Quality', desc: 'FSSAI certified, lab-tested, and produced in state-of-the-art facilities.' },
];

const About = () => (
  <>
    <SEOHead title="About Us" description="Learn about PeelKraft's mission to transform orange peel waste into premium food products." canonicalUrl="/about" />

    {/* Hero */}
    <section className="pt-36 pb-16 bg-cream-50">
      <div className="container-custom">
        <Breadcrumbs items={[{ label: 'About Us' }]} />
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mt-8">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 bg-cream-100 border border-cream-200 text-primary-500 font-sans font-bold text-[10px] uppercase tracking-wider rounded-full mb-6">About PeelKraft</span>
            <h1 className="text-4xl md:text-5xl font-serif text-dark mb-6 leading-tight">Turning Orange Peels into <span className="text-primary-500 italic font-normal">Gold</span></h1>
            <p className="text-gray-500 font-sans leading-relaxed mb-6 text-sm tracking-wide">PeelKraft is a sustainability-driven startup built on the principles of the circular economy. As a subbrand of JuiceTap, India's rapidly growing network of automated fresh orange juice vending machines, PeelKraft transforms premium orange peels into innovative, high-value consumer products.</p>
            <p className="text-gray-500 font-sans leading-relaxed text-sm tracking-wide">By leveraging a unique supply chain advantage, PeelKraft converts what is traditionally considered waste into differentiated products across the confectionery, wellness, and functional snacking categories.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <img
              src="/images/peelkraft-about-turning-orange-peels-to-gold.jpg"
              alt="PeelKraft JuiceTap Global - Turning Orange Peels into Gold Food Products"
              title="PeelKraft Sustainable Orange Peel Processing"
              className="rounded-3xl shadow-sm w-full object-cover border border-cream-200/50 hover:scale-[1.02] transition-transform duration-700"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>

    {/* Mission & Vision */}
    <section className="py-20 bg-white border-t border-cream-200/40">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-cream-50/20 border border-cream-200/50 rounded-3xl text-center p-10 shadow-sm hover:shadow-premium transition-all duration-300">
            <div className="w-14 h-14 mx-auto rounded-full bg-cream-50 border border-cream-200/60 flex items-center justify-center mb-6"><FiTarget className="w-6 h-6 text-primary-500" /></div>
            <h3 className="font-serif text-2xl text-dark mb-4">Our Mission</h3>
            <p className="text-gray-500 font-sans leading-relaxed text-xs sm:text-sm">To transform food waste into premium, nutritious products that promote health and sustainability, while creating a circular economy that benefits communities and the environment.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-cream-50/20 border border-cream-200/50 rounded-3xl text-center p-10 shadow-sm hover:shadow-premium transition-all duration-300">
            <div className="w-14 h-14 mx-auto rounded-full bg-cream-50 border border-cream-200/60 flex items-center justify-center mb-6"><FiEye className="w-6 h-6 text-primary-500" /></div>
            <h3 className="font-serif text-2xl text-dark mb-4">Our Vision</h3>
            <p className="text-gray-500 font-sans leading-relaxed text-xs sm:text-sm">To become India's leading sustainable food brand, proving that premium quality and environmental responsibility go hand in hand. We envision a future where no food by-product goes to waste.</p>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Timeline */}
    <section className="py-20 bg-cream-50/40 border-t border-cream-200/40">
      <div className="container-custom max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-cream-100 border border-cream-200 text-primary-500 font-sans font-bold text-[10px] uppercase tracking-wider rounded-full mb-6">Our Journey</span>
          <h2 className="text-3xl font-serif text-dark">The PeelKraft <span className="text-primary-500 italic font-normal">Timeline</span></h2>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-cream-200 hidden md:block" />
          {timeline.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-8 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                <div className="bg-white rounded-2xl border border-cream-200/50 p-6 shadow-sm">
                  <span className="text-primary-500 font-sans font-bold text-base">{item.year}</span>
                  <h3 className="font-serif text-lg text-dark mt-1 mb-2">{item.title}</h3>
                  <p className="text-gray-500 font-sans text-xs tracking-wide leading-relaxed">{item.desc}</p>
                </div>
              </div>
              <div className="hidden md:flex w-12 h-12 shrink-0 rounded-full bg-white border border-cream-200 items-center justify-center text-primary-500 font-sans font-bold text-xs shadow-sm z-10">
                {item.year.slice(-2)}
              </div>
              <div className="flex-1 hidden md:block" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="py-20 bg-white border-y border-cream-200/40">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-cream-100 border border-cream-200 text-primary-500 font-sans font-bold text-[10px] uppercase tracking-wider rounded-full mb-6">Our Values</span>
          <h2 className="text-3xl font-serif text-dark">What We <span className="text-primary-500 italic font-normal">Stand For</span></h2>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-cream-50/15 border border-cream-200/50 rounded-2xl p-8 text-center group hover:bg-white hover:shadow-premium transition-all duration-500">
                <div className="w-14 h-14 mx-auto rounded-full bg-cream-50 border border-cream-200/60 flex items-center justify-center mb-6 group-hover:bg-primary-500 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-serif text-lg text-dark mb-2">{item.title}</h3>
                <p className="text-gray-500 font-sans text-xs tracking-wide leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>

    {/* About JuiceTap */}
    <section className="py-24 bg-dark text-white overflow-hidden">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 text-primary-500 font-sans font-bold text-[10px] uppercase tracking-wider rounded-full mb-6">Powered by JuiceTap</span>
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-6">About <span className="text-primary-500 italic font-normal">JuiceTap</span></h2>
            <p className="text-gray-300 font-sans text-sm leading-relaxed tracking-wide mb-6">
              JuiceTap operates automated vending machines that dispense 100% freshly squeezed orange juice. The company imports premium Valencia oranges from South Africa, Egypt, and Australia to ensure consistent quality and taste.
            </p>
            <p className="text-gray-300 font-sans text-sm leading-relaxed tracking-wide mb-8">
              Our fully automated process guarantees that the oranges remain untouched by human hands throughout the juicing cycle. As a result, JuiceTap generates a continuous supply of exceptionally clean, high-quality orange peels.
            </p>
            <a 
              href="https://juicetap.in/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-500 hover:bg-green-800 text-white font-sans font-semibold text-xs uppercase tracking-widest rounded-full shadow-premium transition-all duration-300"
            >
              Visit JuiceTap Website →
            </a>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative flex justify-center lg:justify-end">
            <img 
              src="/images/juicetap-machines.jpg" 
              alt="JuiceTap Automated Vending Machines" 
              className="relative w-full max-w-md h-auto object-contain rounded-3xl border border-white/10 shadow-2xl"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  </>
);

export default About;
