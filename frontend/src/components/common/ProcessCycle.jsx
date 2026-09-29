import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Fresh Juice Extraction',
    subtitle: 'At JuiceTap Vending Machines',
    desc: 'Premium Valencia oranges are freshly squeezed in JuiceTap vending machines, and the fresh orange peels are collected immediately after every juice is served.',
  },
  {
    num: '02',
    title: 'Peel Collection',
    subtitle: 'Collected with Care',
    desc: 'The freshly generated peels are hygienically collected from JuiceTap machines and transported to our processing facility.',
  },
  {
    num: '03',
    title: 'Cleaning & Processing',
    subtitle: 'Prepared Naturally',
    desc: 'The peels are thoroughly washed, sanitized, and gently dehydrated to preserve their natural goodness and citrus aroma.',
  },
  {
    num: '04',
    title: 'Crafted into Products',
    subtitle: 'From Peel to Premium',
    desc: 'Processed orange peels are carefully crafted into Zest Mint Orange Peels, Orangettes, and Orange Peel Powder, bringing new value to every peel.',
  },
  {
    num: '05',
    title: 'Packed & Delivered',
    subtitle: 'Freshness in Every Pack',
    desc: 'Every product is hygienically packed and quality-checked to ensure it reaches you fresh, safe, and ready to enjoy.',
  },
];

// Clockwise step placement starting from top:
// 01 -> Top (270 deg)
// 02 -> Top-Right (342 deg)
// 03 -> Bottom-Right (54 deg)
// 04 -> Bottom-Left (126 deg)
// 05 -> Top-Left (198 deg)
const STEP_ANGLES = [270, 342, 54, 126, 198];

export const ProcessCycle = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  
  const sectionRef = useRef(null);
  const resumeTimeoutRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);

  const shouldReduceMotion = useReducedMotion();

  // Intersection Observer for scroll animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Continuous smooth clockwise rotation & particle movement
  useEffect(() => {
    if (shouldReduceMotion || !isInView || isHovered) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const ROTATION_SPEED = 12; // degrees per second

    const animate = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setRotationAngle((prevAngle) => {
        const nextAngle = (prevAngle + ROTATION_SPEED * deltaTime) % 360;
        
        // Particle starts at 270 (Step 01) and moves clockwise (270 -> 342 -> 54 -> 126 -> 198 -> 270)
        const particlePos = (270 + nextAngle) % 360;

        let closestIdx = 0;
        let minDiff = 360;

        STEP_ANGLES.forEach((angle, idx) => {
          let diff = Math.abs(particlePos - angle);
          if (diff > 180) diff = 360 - diff;
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = idx;
          }
        });

        if (minDiff < 30) {
          setActiveIndex(closestIdx);
        }

        return nextAngle;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isInView, isHovered, shouldReduceMotion]);

  const handleStepHover = (index) => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    setIsHovered(true);
    setActiveIndex(index);
  };

  const handleStepLeave = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 1500);
  };

  const activeStep = PROCESS_STEPS[activeIndex];

  // Calculated particle position moving clockwise on the orbiting ring
  const particleAngle = (270 + rotationAngle) % 360;
  const particleRad = (particleAngle * Math.PI) / 180;
  const particleX = 50 + 43 * Math.cos(particleRad);
  const particleY = 50 + 43 * Math.sin(particleRad);

  return (
    <section 
      ref={sectionRef}
      className="py-10 md:py-14 bg-[#FCFAF6] border-t border-cream-200/40 relative overflow-hidden select-none"
      aria-label="Our Process - The PeelKraft Cycle"
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10 max-w-5xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-8"
        >
          <span className="inline-block px-3.5 py-1 bg-white border border-cream-200/80 text-primary-500 font-sans font-semibold text-[10px] uppercase tracking-widest rounded-full mb-2 shadow-xs">
            OUR PROCESS
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-dark leading-tight">
            How We <span className="text-primary-500 italic font-normal">Craft</span> Perfection
          </h2>
          <p className="font-sans mt-1.5 max-w-xl mx-auto text-[11px] md:text-xs tracking-wider uppercase text-gray-500 font-medium">
            Every PeelKraft product goes through a meticulous 5-step process
          </p>
        </motion.div>

        {/* DESKTOP & TABLET ORBITAL VISUALIZATION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden md:block max-w-4xl mx-auto"
        >
          <div className="relative w-full aspect-square max-w-[440px] lg:max-w-[480px] mx-auto flex items-center justify-center mb-4">
            
            {/* SVG Orbit Ring & Particle */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
            >
              {/* Outer Dashed Orbit Line */}
              <circle
                cx="50"
                cy="50"
                r="43"
                fill="none"
                stroke="#EFEBE4"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
              
              {/* Main Orbit Line */}
              <circle
                cx="50"
                cy="50"
                r="43"
                fill="none"
                stroke="#E6DFD5"
                strokeWidth="0.8"
              />

              {/* Active Segment Accent Highlight */}
              {!shouldReduceMotion && (
                <circle
                  cx="50"
                  cy="50"
                  r="43"
                  fill="none"
                  stroke="#F7931E"
                  strokeWidth="1.2"
                  strokeDasharray="15 260"
                  strokeDashoffset={-rotationAngle * 0.75}
                  className="transition-all duration-300 opacity-60"
                />
              )}

              {/* Traveling Citrus Particle Dot */}
              {!shouldReduceMotion && (
                <circle
                  cx={particleX}
                  cy={particleY}
                  r="2.5"
                  fill="#F7931E"
                />
              )}
            </svg>

            {/* CENTER STATIONARY LOGO */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center text-center">
              <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-white border border-cream-200/80 shadow-premium flex flex-col items-center justify-center p-4 transition-all duration-500">
                <img
                  src="/images/logo.png"
                  alt="PeelKraft Logo"
                  className="max-h-11 lg:max-h-14 w-auto object-contain pointer-events-none select-none"
                />
                <span className="mt-1 text-[8px] font-sans font-bold tracking-widest text-primary-500 uppercase">
                  PeelKraft Cycle
                </span>
              </div>
            </div>

            {/* 5 ORBITAL PROCESS NODES (CLOCKWISE 01 -> 02 -> 03 -> 04 -> 05) */}
            {PROCESS_STEPS.map((step, index) => {
              const baseAngle = STEP_ANGLES[index];
              const angleRad = (baseAngle * Math.PI) / 180;
              
              const radiusPercent = 43;
              const xPos = 50 + radiusPercent * Math.cos(angleRad);
              const yPos = 50 + radiusPercent * Math.sin(angleRad);

              const isActive = activeIndex === index;

              return (
                <div
                  key={step.num}
                  style={{
                    left: `${xPos}%`,
                    top: `${yPos}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute z-30 flex flex-col items-center cursor-pointer group"
                  onMouseEnter={() => handleStepHover(index)}
                  onMouseLeave={handleStepLeave}
                  onClick={() => handleStepHover(index)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Process step ${step.num}: ${step.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleStepHover(index);
                    }
                  }}
                >
                  {/* Orbit Node Dot */}
                  <div className="relative flex items-center justify-center mb-1">
                    <div
                      className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center font-serif text-xs font-semibold transition-all duration-500 border ${
                        isActive
                          ? 'bg-primary-500 text-white border-primary-500 shadow-md scale-110'
                          : 'bg-white text-gray-500 border-cream-200 group-hover:border-primary-500 group-hover:text-primary-500'
                      }`}
                    >
                      {step.num}
                    </div>
                  </div>

                  {/* Upright Label Header */}
                  <div className={`text-center max-w-[110px] lg:max-w-[130px] transition-all duration-300 ${
                    isActive ? 'scale-105' : 'opacity-85 group-hover:opacity-100'
                  }`}>
                    <h3 className={`font-serif text-[11px] lg:text-xs leading-tight ${
                      isActive ? 'text-dark font-bold' : 'text-gray-600 font-medium'
                    }`}>
                      {step.title}
                    </h3>
                  </div>
                </div>
              );
            })}

          </div>

          {/* ACTIVE STEP DESCRIPTION CONTAINER */}
          <div className="min-h-[90px] flex items-center justify-center">
            <motion.div
              key={activeStep.num}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl mx-auto text-center px-5 py-4 rounded-2xl bg-white border border-cream-200/80 shadow-premium"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xs font-serif font-bold text-primary-500">
                  STEP {activeStep.num}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-primary-500">
                  {activeStep.subtitle}
                </span>
              </div>
              <h4 className="font-serif text-base text-dark mb-1 font-medium">
                {activeStep.title}
              </h4>
              <p className="text-gray-600 font-sans text-xs leading-relaxed max-w-lg mx-auto">
                {activeStep.desc}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* MOBILE ADAPTATION */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="block md:hidden max-w-md mx-auto"
        >
          {/* Central Upright Logo Header for Mobile */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-white border border-cream-200 shadow-md flex flex-col items-center justify-center p-3">
              <img
                src="/images/logo.png"
                alt="PeelKraft Logo"
                className="max-h-10 w-auto object-contain"
              />
              <span className="mt-1 text-[7px] font-sans font-bold tracking-widest text-primary-500 uppercase">
                Process Cycle
              </span>
            </div>
          </div>

          {/* Interactive Steps List for Mobile */}
          <div className="space-y-2.5 px-2">
            {PROCESS_STEPS.map((step, index) => {
              const isActive = activeIndex === index;

              return (
                <motion.div
                  key={step.num}
                  onClick={() => handleStepHover(index)}
                  className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-white border-primary-500 shadow-md'
                      : 'bg-white/60 border-cream-200/70 hover:border-cream-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-serif text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-primary-500 text-white'
                          : 'bg-cream-100 text-gray-500'
                      }`}
                    >
                      {step.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-serif text-xs md:text-sm ${isActive ? 'text-dark font-bold' : 'text-gray-700'}`}>
                        {step.title}
                      </h3>
                      {step.subtitle && (
                        <p className="text-[9px] font-sans font-semibold text-primary-500 uppercase tracking-wider">
                          {step.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.25 }}
                      className="mt-2.5 pt-2.5 border-t border-cream-100 text-xs text-gray-600 font-sans leading-relaxed"
                    >
                      {step.desc}
                    </motion.p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </section>
  );
};
