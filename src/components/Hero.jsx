import { useRef, memo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import MagneticButton from './MagneticButton';
import { FiArrowDown, FiGithub, FiInstagram } from 'react-icons/fi';
import './Hero.css';

// Static animation configs hoisted outside component
const containerVariants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 2.2 + i * 0.1 },
  }),
};

const childVariants = {
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100,
    },
  },
  hidden: {
    opacity: 0,
    y: 50,
    rotateX: -90,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      delay: delay,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const AnimatedText = memo(({ text, className }) => {
  const letters = Array.from(text);

  return (
    <motion.span
      className={`animated-text ${className}`}
      style={{ display: 'flex', overflow: 'hidden' }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span variants={childVariants} key={index} style={{ display: 'inline-block' }}>
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.span>
  );
});

AnimatedText.displayName = 'AnimatedText';

const Hero = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 5]);

  const handleScroll = () => {
    document.querySelector('#work').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className="hero" id="hero">
      <motion.div className="hero-content container" style={{ y, opacity, scale, rotateX: rotate }}>
        
        {/* Floating badge */}
        <motion.div
          className="hero-badge"
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="badge-glow"></div>
          <span className="status-dot" />
          <span>Creative Developer — Based in Indonesia</span>
        </motion.div>

        {/* Main title */}
        <div className="hero-title-wrapper">
          <h1 className="hero-title">
            <div className="hero-line-wrapper">
              <AnimatedText text="CRAFTING" className="hero-line" />
            </div>
            <div className="hero-line-wrapper">
              <AnimatedText text="DIGITAL" className="hero-line hero-line--accent" />
            </div>
            <div className="hero-line-wrapper">
              <AnimatedText text="EXPERIENCES." className="hero-line" />
            </div>
          </h1>
        </div>

        {/* Bottom meta */}
        <motion.div
          className="hero-meta"
          custom={3.2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <p className="hero-description">
            Membangun pengalaman web yang <strong>interaktif</strong>,{' '}
            <strong>halus</strong>, dan memukau — menghidupkan visi menjadi realita digital.
          </p>

          <MagneticButton className="hero-scroll-btn hover-trigger" onClick={handleScroll}>
            <div className="scroll-btn-inner">
              <FiArrowDown className="scroll-icon" />
              <span className="scroll-text">DISCOVER</span>
            </div>
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Floating Social Sidebar */}
      <motion.div 
        className="hero-social-sidebar"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 3.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="social-line" />
        <MagneticButton 
          href="https://github.com/hamdan-sgpt" 
          className="social-sidebar-link hover-trigger"
        >
          <FiGithub />
        </MagneticButton>
        <MagneticButton 
          href="https://www.instagram.com/hamdunnnn_ham/" 
          className="social-sidebar-link hover-trigger"
        >
          <FiInstagram />
        </MagneticButton>
        <div className="social-line" />
      </motion.div>

      {/* CSS Marquee */}
      <motion.div 
        className="hero-marquee-wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 1 }}
      >
        <div className="css-marquee">
          <div className="marquee-content">
            <span>FRONTEND DEVELOPER</span><span className="marquee-dot">•</span>
            <span>UI/UX DESIGNER</span><span className="marquee-dot">•</span>
            <span>CREATIVE CODER</span><span className="marquee-dot">•</span>
            <span>WEB GL ENTHUSIAST</span><span className="marquee-dot">•</span>
            <span>FRONTEND DEVELOPER</span><span className="marquee-dot">•</span>
            <span>UI/UX DESIGNER</span><span className="marquee-dot">•</span>
            <span>CREATIVE CODER</span><span className="marquee-dot">•</span>
            <span>WEB GL ENTHUSIAST</span><span className="marquee-dot">•</span>
          </div>
        </div>
      </motion.div>

      {/* Decorative elements — now pure CSS animations instead of Framer Motion infinite loops */}
      <div className="hero-decoration">
        <div className="hero-orb hero-orb--1" />
        <div className="hero-orb hero-orb--2" />
        <div className="hero-grid-pattern" />
        <div className="floating-shape shape-triangle" />
        <div className="floating-shape shape-circle" />
      </div>
    </section>
  );
};

export default Hero;
