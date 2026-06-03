import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Preloader.css';

const Preloader = ({ onComplete }) => {
  const [text, setText] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const target = 'HAMS.';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*<>{}[]';

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setText(
        target
          .split('')
          .map((letter, index) => {
            if (index < iteration) return target[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );
      if (iteration >= target.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => onComplete(), 800);
        }, 400);
      }
      iteration += 1 / 3;
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="preloader"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="preloader-content">
            <motion.div
              className="preloader-text-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="preloader-text">{text || '.....'}</span>
            </motion.div>

            <motion.div
              className="preloader-bar-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="preloader-bar"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </motion.div>

            <div className="preloader-meta">
              <span className="preloader-label">INITIALIZING</span>
              <span className="preloader-label">2026</span>
            </div>
          </div>

          {/* Animated background lines */}
          <div className="preloader-lines">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="preloader-line"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
