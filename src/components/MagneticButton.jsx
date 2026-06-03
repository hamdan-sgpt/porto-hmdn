import { useRef } from 'react';
import { motion } from 'framer-motion';

const MagneticButton = ({ children, className, onClick, href }) => {
  const ref = useRef(null);

  const handleMouse = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    ref.current.style.transform = `translate3d(${middleX * 0.4}px, ${middleY * 0.4}px, 0)`;
  };

  const reset = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate3d(0, 0, 0)';
  };

  const Component = href ? 'a' : 'button';

  return (
    <Component
      ref={ref}
      href={href}
      onClick={onClick}
      className={className}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ 
        willChange: 'transform',
        transition: 'transform 0.2s cubic-bezier(0.33, 1, 0.68, 1)' 
      }}
    >
      {children}
    </Component>
  );
};

export default MagneticButton;
