import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiCheck, FiMessageCircle, FiGithub, FiInstagram, FiArrowUpRight } from 'react-icons/fi';
import MagneticButton from './MagneticButton';
import './Footer.css';

const socialLinks = [
  { icon: FiGithub, label: 'GitHub', href: 'https://github.com/hamdan-sgpt' },
  { icon: FiInstagram, label: 'Instagram', href: 'https://www.instagram.com/hamdunnnn_ham/' },
  { icon: FiMessageCircle, label: 'WhatsApp', href: 'https://wa.me/6285648752799' },
];

const Footer = memo(() => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText('hamdanriyadh1303@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <footer className="footer" id="contact">
      <div className="container">
        {/* Social Links Row */}
        <motion.div 
          className="footer-socials"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="section-label">Find Me</div>
          <div className="social-grid">
            {socialLinks.map((social) => (
              <MagneticButton
                key={social.label}
                href={social.href}
                className="social-card hover-trigger"
              >
                <div className="social-card-inner">
                  <social.icon className="social-card-icon" />
                  <span className="social-card-label">{social.label}</span>
                  <FiArrowUpRight className="social-card-arrow" />
                </div>
              </MagneticButton>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <div className="footer-content">
          <motion.p 
            className="footer-label"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Project in mind?
          </motion.p>
          
          <motion.a 
            href="mailto:hamdanriyadh1303@gmail.com"
            className="footer-title"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            LET'S TALK
          </motion.a>

          <motion.div 
            className="footer-actions"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button 
              className={`action-btn email-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? <FiCheck /> : <FiCopy />}
              <span>{copied ? 'COPIED!' : 'hamdanriyadh1303@gmail.com'}</span>
            </button>
            
            <a 
              href="https://wa.me/6285648752799" 
              target="_blank" 
              rel="noopener noreferrer"
              className="action-btn wa-btn"
            >
              <FiMessageCircle />
              <span>WhatsApp</span>
            </a>
          </motion.div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">© 2026 Hams Digital</div>
          <div className="footer-bottom-socials">
            <a href="https://github.com/hamdan-sgpt" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FiGithub />
            </a>
            <a href="https://www.instagram.com/hamdunnnn_ham/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FiInstagram />
            </a>
          </div>
          <div className="footer-location">Indonesia, Earth</div>
        </div>
      </div>
      
      {/* Background glow */}
      <div className="footer-glow" />
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
