import { useRef, useCallback, memo, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiMonitor, FiLayout, FiCode, FiGlobe, FiGithub, FiInstagram, FiArrowUpRight } from 'react-icons/fi';
import { FaReact, FaJs, FaHtml5, FaCss3Alt, FaNodeJs } from 'react-icons/fa';
import Tilt from 'react-parallax-tilt';
import './Bento.css';

const BentoCard = memo(({ children, className, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth <= 768 ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0
      );
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use direct DOM ref for spotlight – no useState re-renders
  const spotlightRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current || !spotlightRef.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.setProperty('--mouse-x', `${x}px`);
    spotlightRef.current.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (spotlightRef.current) spotlightRef.current.style.opacity = '1';
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (spotlightRef.current) spotlightRef.current.style.opacity = '0';
  }, []);

  return (
    <Tilt
      className={`bento-tilt-wrapper ${className}`}
      perspective={2000}
      glareEnable={false}
      tiltEnable={!isMobile}
      tiltMaxAngleX={3}
      tiltMaxAngleY={3}
      scale={isMobile ? 1 : 1.01}
      transitionSpeed={1500}
    >
      <motion.div
        ref={ref}
        className="glass-card bento-item"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          ref={spotlightRef}
          className="bento-spotlight" 
          style={{ opacity: 0 }} 
        />
        {children}
      </motion.div>
    </Tilt>
  );
});

BentoCard.displayName = 'BentoCard';

const Bento = () => {
  return (
    <section className="bento" id="about">
      {/* Premium Divider Marquee */}
      <div className="bento-divider">
        <div className="css-marquee">
          <div className="marquee-content divider-marquee">
            <span>THE ARCHITECT</span><span className="marquee-dot">•</span>
            <span>UI/UX DESIGNER</span><span className="marquee-dot">•</span>
            <span>FRONTEND MASTER</span><span className="marquee-dot">•</span>
            <span>CREATIVE DEVELOPER</span><span className="marquee-dot">•</span>
            <span>THE ARCHITECT</span><span className="marquee-dot">•</span>
            <span>UI/UX DESIGNER</span><span className="marquee-dot">•</span>
            <span>FRONTEND MASTER</span><span className="marquee-dot">•</span>
            <span>CREATIVE DEVELOPER</span><span className="marquee-dot">•</span>
          </div>
        </div>
      </div>

      <div className="container section-padding">
        <div className="section-header">
          <div className="section-label">System Specs</div>
          <div className="flex-between">
            <h2 className="section-title">
              About <span>Me</span>
            </h2>
            <div className="system-status hidden-mobile">
              <span className="status-dot"></span>
              SYSTEM_STATUS: ONLINE
            </div>
          </div>
        </div>

        <div className="bento-grid">
          {/* Main Bio Card */}
          <BentoCard className="bento-span-2 bento-row-2 bio-card" delay={0.1}>
            <div className="bio-content relative-z">
              <div className="bio-icon-wrapper">
                <FiMonitor className="bio-icon" />
              </div>
              <h3 className="bio-title">
                More than just code.<br />
                I build <span className="gradient-text">digital legacies.</span>
              </h3>
              <p className="bio-desc">
                Saya Hams, Web Developer yang fokus pada detail. Membangun arsitektur di Minecraft & Mobile Legends Strategy, dan menerapkannya dalam struktur kode yang solid serta interaktif.
              </p>
            </div>
            <div className="bio-footer relative-z">
              <span className="tag-pill">BASED IN INDONESIA</span>
              <div className="globe-wrapper">
                <FiGlobe className="icon-pulse" />
              </div>
            </div>
          </BentoCard>

          {/* Photo Card */}
          <BentoCard className="photo-card" delay={0.2}>
            <div className="photo-container relative-z">
              <img src="/poto.webp" alt="Hams" className="profile-photo" loading="lazy" />
              <div className="photo-overlay" />
              <div className="photo-info">
                <span className="tag-pill bg-dark">THE ARCHITECT</span>
                <h4>Hams.</h4>
              </div>
            </div>
          </BentoCard>

          {/* Focus Area Card */}
          <BentoCard className="focus-card hover-accent" delay={0.3}>
            <h4 className="card-subtitle relative-z">My Focus</h4>
            <ul className="focus-list relative-z">
              <li>
                <div className="focus-icon-box"><FiCode /></div> Frontend Dev
              </li>
              <li>
                <div className="focus-icon-box"><FiLayout /></div> UI/UX Design
              </li>
            </ul>
          </BentoCard>

          {/* Tech Stack Card */}
          <BentoCard className="tech-card" delay={0.4}>
            <h4 className="card-subtitle relative-z">Tech Arsenal</h4>
            <div className="tech-icons relative-z">
              <div className="tech-icon"><FaReact /></div>
              <div className="tech-icon"><FaJs /></div>
              <div className="tech-icon"><FaHtml5 /></div>
              <div className="tech-icon"><FaCss3Alt /></div>
              <div className="tech-icon"><FaNodeJs /></div>
            </div>
            <FiCode className="bg-icon" />
          </BentoCard>

          {/* Connect / Social Card — NEW */}
          <BentoCard className="connect-card" delay={0.45}>
            <h4 className="card-subtitle relative-z">Connect</h4>
            <div className="connect-links relative-z">
              <a 
                href="https://github.com/hamdan-sgpt" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="connect-link hover-trigger"
              >
                <div className="connect-icon-box"><FiGithub /></div>
                <span className="connect-label">GitHub</span>
                <FiArrowUpRight className="connect-arrow" />
              </a>
              <a 
                href="https://www.instagram.com/hamdunnnn_ham/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="connect-link hover-trigger"
              >
                <div className="connect-icon-box"><FiInstagram /></div>
                <span className="connect-label">Instagram</span>
                <FiArrowUpRight className="connect-arrow" />
              </a>
            </div>
          </BentoCard>

          {/* Stats Card */}
          <BentoCard className="bento-span-2 stats-card" delay={0.5}>
            <div className="stat-item relative-z">
              <div className="stat-number gradient-text-shimmer">2+</div>
              <div className="stat-label">Years Exp</div>
            </div>
            <div className="stat-divider relative-z" />
            <div className="stat-item relative-z">
              <div className="stat-number gradient-text-shimmer">10+</div>
              <div className="stat-label">Projects</div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
};

export default Bento;
