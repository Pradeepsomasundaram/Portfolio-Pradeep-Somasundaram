import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { HiDownload, HiEye, HiSparkles } from 'react-icons/hi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Button, CounterAnimation, ResumeModal, TiltCard, DoodleUnderline, DoodleCircle } from '../ui';
import { useAppStore } from '../../stores/appStore';
import { visitContext } from '../../lib/visitContext';

const roles = [
  'Agentic AI & MLOps Lead',
  2000,
  'Data Scientist',
  2000,
  'Data Engineer',
  2000,
  'AI/ML Engineer',
  2000,
  'Full-Stack Developer',
  2000,
];

export const Hero = () => {
  const [showResume, setShowResume] = useState(false);
  const { setChatbotOpen } = useAppStore();
  const sectionRef = useRef<HTMLElement>(null);

  // Classic cinematic opening move: as the next section scrolls in, the
  // camera pulls back — Hero content scales down, drifts and fades rather
  // than snapping away, like Apple's product-page transitions.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center px-4 pt-24 overflow-hidden"
    >
      {/* Circuit-grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-[0.07] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 90%)',
        }}
      />

      <motion.div
        className="max-w-7xl mx-auto w-full"
        style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Text Content */}
          <motion.div
            className="flex-1 text-center md:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {(visitContext.company || visitContext.persona) && (
              <p className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-xs text-primary font-medium">
                <HiSparkles className="w-3.5 h-3.5" />
                {visitContext.company ? `Hi ${visitContext.company} team` : 'Welcome'}
                {visitContext.persona ? ` — curated for ${visitContext.persona} roles` : ''}
              </p>
            )}
            <p className="font-mono text-sm text-secondary mb-3 tracking-wide">
              <span className="opacity-70">const greeting =</span> "Hello, I'm"
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-4 heading-shimmer break-words">
              Pradeep Somasundaram
            </h1>
            <div className="font-mono text-xl md:text-2xl text-secondary font-medium h-12 mb-6 flex items-center gap-1">
              <span className="text-primary">&gt;</span>
              <TypeAnimation
                sequence={roles}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </div>
            <DoodleUnderline className="w-36 h-4 text-accent -mt-4 mb-4 hidden md:block" />
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
              MS in Data Science graduate from The George Washington University.
              Agentic AI & MLOps Lead at Cognizant, specializing in Machine Learning,
              AI Engineering, and scalable data solutions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Button
                href="/assets/Pradeep_Somasundaram_Res.pdf"
                download="Pradeep_Somasundaram_Resume.pdf"
                icon={<HiDownload />}
              >
                Download Resume
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowResume(true)}
                icon={<HiEye />}
              >
                View Resume
              </Button>
              <Button
                variant="outline"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Contact Me
              </Button>
              <div className="relative inline-block">
                <DoodleCircle className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] text-accent pointer-events-none hidden md:block" />
                <motion.button
                  onClick={() => setChatbotOpen(true)}
                  className="relative inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white bg-gradient-to-r from-primary via-secondary to-accent shadow-md hover:shadow-glow transition-shadow bg-[length:200%_auto] hover:bg-right"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <HiSparkles className="w-4 h-4" />
                  Ask my AI Assistant
                </motion.button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-6 mt-8 justify-center md:justify-start">
              <motion.a
                href="https://github.com/PradeepSomasundaram1512"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                whileHover={{ scale: 1.2 }}
                aria-label="GitHub profile"
              >
                <FaGithub className="w-8 h-8" />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/pradeep-somasundaram-835230192/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                whileHover={{ scale: 1.2 }}
                aria-label="LinkedIn profile"
              >
                <FaLinkedin className="w-8 h-8" />
              </motion.a>
            </div>
          </motion.div>

          {/* Profile Image */}
          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="relative group"
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Animated outer ring */}
              <div className="absolute -inset-3 rounded-full border-2 border-dashed border-secondary/40 animate-spin-slow" />
              <div className="absolute -inset-6 rounded-full border border-primary/10 group-hover:border-primary/25 transition-colors duration-500" />
              <motion.div
                className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-primary via-secondary to-accent opacity-70 blur-md"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              <div style={{ perspective: '1400px' }}>
                <motion.div
                  animate={{ rotateY: [0, 22, 0, -22, 0], rotateZ: [0, 2, 0, -2, 0] }}
                  transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <TiltCard className="rounded-full" maxTilt={10} scale={1.04}>
                    <div className="photo-grade-frame w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white dark:border-void shadow-2xl">
                      <picture>
                        <source srcSet="/assets/profile.webp" type="image/webp" />
                        <img
                          src="/assets/profile.png"
                          alt="Pradeep Somasundaram"
                          loading="lazy"
                          className="photo-grade w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/profile.svg';
                          }}
                        />
                      </picture>
                    </div>
                  </TiltCard>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Counters */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-12 border-t border-gray-200 dark:border-white/10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <CounterAnimation end={6} suffix="+" label="Years Experience" />
          <CounterAnimation end={15} suffix="+" label="Projects" />
          <CounterAnimation end={2} label="Publications" />
          <CounterAnimation end={6} label="Certifications" />
        </motion.div>
      </motion.div>

      <ResumeModal isOpen={showResume} onClose={() => setShowResume(false)} />
    </section>
  );
};
