import { useRef, memo, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import Tilt from 'react-parallax-tilt';
import './Work.css';

const projects = [
  {
    id: '01',
    title: 'SkillForge — AI Platform',
    description: 'Platform pembelajaran interaktif berbasis AI untuk menguasai pemrograman web melalui hands-on coding, tantangan gamifikasi, dan bimbingan mentor AI.',
    tags: ['React', 'Tailwind', 'Framer Motion', 'AI-Mentor'],
    image: '/lomba.webp',
    link: 'https://lomba.hdprestige.my.id',
  },
  {
    id: '02',
    title: 'Digital Wedding Invitation',
    description: 'Undangan pernikahan digital premium dengan desain elegan yang interaktif, fitur RSVP, dan galeri galeri momen.',
    tags: ['React', 'Framer Motion', 'Tailwind'],
    image: '/undangan-wedding.webp',
    link: 'https://undangan.hdprestige.my.id',
  }
];

const revealVariant = {
  hidden: { opacity: 0, y: 50, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
  }
};

const ProjectCard = memo(({ project, index }) => {
  const cardRef = useRef(null);
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

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], isMobile ? [0, 0] : [50, -50]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], isMobile ? [1, 1, 1] : [1.1, 1, 1.1]);
  const isEven = index % 2 === 0;

  return (
    <div className={`project-card ${isEven ? 'project-card--even' : 'project-card--odd'}`} ref={cardRef}>
      
      {/* 3D Tilt Image */}
      <Tilt
        className="project-tilt-wrapper"
        perspective={1500}
        glareEnable={!isMobile}
        glareMaxOpacity={0.3}
        glarePosition="all"
        tiltEnable={!isMobile}
        scale={isMobile ? 1 : 1.02}
        transitionSpeed={2000}
        tiltMaxAngleX={5}
        tiltMaxAngleY={5}
      >
        <motion.div 
          className="project-image-container hover-trigger"
          variants={revealVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px" }}
        >
          <div className="project-image-overlay" />
          <motion.img 
            src={project.image} 
            alt={project.title} 
            className="project-image"
            style={{ y, scale }}
            loading="lazy"
          />
          <a href={project.link} className="project-view-btn">
            View Project <FiArrowRight />
          </a>
        </motion.div>
      </Tilt>

      {/* Floating Info */}
      <motion.div 
        className="project-info"
        initial={{ opacity: 0, x: isEven ? -50 : 50, rotateX: 20 }}
        whileInView={{ opacity: 1, x: 0, rotateX: 0 }}
        viewport={{ once: true, margin: "0px" }}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="project-number">{project.id}</div>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-description">{project.description}</p>
        <div className="project-tags">
          {project.tags.map(tag => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
});

ProjectCard.displayName = 'ProjectCard';

const Work = () => {
  return (
    <section className="work section-padding" id="work">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="section-label">Selected Works</div>
          <h2 className="section-title">
            Digital <span className="gradient-text-shimmer">Crafts</span>
          </h2>
        </motion.div>

        <div className="projects-grid">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Work;
