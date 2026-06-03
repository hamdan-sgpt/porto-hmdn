import { useState, useCallback, memo } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { FiGithub, FiInstagram } from 'react-icons/fi';
import MagneticButton from './MagneticButton';
import './Navbar.css';

const navItems = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

const Navbar = memo(() => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);
  });

  const handleNavClick = useCallback((e, href) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  return (
    <>
      <motion.nav
        className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 2.5 }}
      >
        <div className="navbar-inner container">
          <MagneticButton href="#" className="navbar-logo hover-trigger">
            hams<span className="text-accent">.</span>
          </MagneticButton>

          <div className="navbar-links">
            {navItems.map((item) => (
              <MagneticButton
                key={item.label}
                href={item.href}
                className="navbar-link hover-trigger"
                onClick={(e) => handleNavClick(e, item.href)}
              >
                <span className="navbar-link-text">{item.label}</span>
                <span className="navbar-link-dot" />
              </MagneticButton>
            ))}
          </div>

          <div className="navbar-right">
            <div className="navbar-socials">
              <MagneticButton href="https://github.com/hamdan-sgpt" className="navbar-social-link hover-trigger">
                <FiGithub />
              </MagneticButton>
              <MagneticButton href="https://www.instagram.com/hamdunnnn_ham/" className="navbar-social-link hover-trigger">
                <FiInstagram />
              </MagneticButton>
            </div>

            <MagneticButton href="mailto:hamdanriyadh1303@gmail.com" className="navbar-cta hover-trigger">
              <span className="status-dot" />
              <span>Available for work</span>
            </MagneticButton>
          </div>

          {/* Mobile toggle */}
          <button
            className={`navbar-burger hover-trigger ${mobileOpen ? 'active' : ''}`}
            onClick={toggleMobile}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        className="mobile-menu"
        initial={false}
        animate={mobileOpen ? { x: 0, opacity: 1 } : { x: '100%', opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="mobile-menu-content">
          {navItems.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              className="mobile-menu-link"
              onClick={(e) => handleNavClick(e, item.href)}
              initial={{ opacity: 0, x: 50 }}
              animate={mobileOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ delay: mobileOpen ? 0.3 + i * 0.1 : 0 }}
            >
              <span className="mobile-menu-index">0{i + 1}</span>
              {item.label}
            </motion.a>
          ))}

          {/* Mobile Social Links */}
          <motion.div 
            className="mobile-menu-socials"
            initial={{ opacity: 0 }}
            animate={mobileOpen ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: mobileOpen ? 0.6 : 0 }}
          >
            <a href="https://github.com/hamdan-sgpt" target="_blank" rel="noopener noreferrer" className="mobile-social-link">
              <FiGithub />
              <span>GitHub</span>
            </a>
            <a href="https://www.instagram.com/hamdunnnn_ham/" target="_blank" rel="noopener noreferrer" className="mobile-social-link">
              <FiInstagram />
              <span>Instagram</span>
            </a>
          </motion.div>

          <motion.a 
            href="mailto:hamdanriyadh1303@gmail.com" 
            className="mobile-menu-email"
            initial={{ opacity: 0 }}
            animate={mobileOpen ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: mobileOpen ? 0.7 : 0 }}
          >
            hamdanriyadh1303@gmail.com
          </motion.a>
        </div>
      </motion.div>
    </>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
