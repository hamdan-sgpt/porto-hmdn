import { useCallback, memo, useState, useEffect } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// Static config hoisted outside component to prevent recreation on every render
const PARTICLES_OPTIONS = {
  background: {
    color: {
      value: "transparent",
    },
  },
  fpsLimit: 30, // Reduced from 60 — particles don't need high fps
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "grab",
      },
      resize: {
        enable: true,
        delay: 0.5, // debounce resize events
      },
    },
    modes: {
      grab: {
        distance: 120, // Slightly reduced for less calculation
        links: {
          opacity: 0.2,
        },
      },
    },
  },
  particles: {
    color: {
      value: "#ffffff",
    },
    links: {
      color: "#ffffff",
      distance: 120, // Reduced from 150 — fewer link calculations
      enable: true,
      opacity: 0.05,
      width: 1,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: {
        default: "bounce",
      },
      random: false,
      speed: 0.3, // Slower movement = fewer redraws
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 1200, // Increased from 800 — fewer particles per area
      },
      value: 25, // Reduced from 40
    },
    opacity: {
      value: 0.1,
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 2 },
    },
  },
  detectRetina: false, // Disable retina detection — halves canvas resolution on HiDPI
};

const PARTICLES_STYLE = {
  position: "absolute",
  zIndex: 0,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
};

const ParticlesBackground = memo(() => {
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

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  if (isMobile) return null;

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={PARTICLES_OPTIONS}
      style={PARTICLES_STYLE}
    />
  );
});

ParticlesBackground.displayName = "ParticlesBackground";

export default ParticlesBackground;
