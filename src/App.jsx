import { useState, useEffect, Suspense, lazy } from 'react';
import { ReactLenis } from 'lenis/react';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';

// Lazy loading heavy components
const Work = lazy(() => import('./components/Work'));
const Bento = lazy(() => import('./components/Bento'));
const GitHubActivity = lazy(() => import('./components/GitHubActivity'));
const ParticlesBackground = lazy(() => import('./components/ParticlesBackground'));

// Lenis options hoisted outside component
const lenisOptions = { lerp: 0.07, smoothTouch: false, touchMultiplier: 1.5 };

function App() {
  const [loading, setLoading] = useState(true);

  // Scroll to top on load/refresh
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <ReactLenis root options={lenisOptions}>
      {loading ? (
        <Preloader onComplete={() => setLoading(false)} />
      ) : (
        <>
          <CustomCursor />
          <div className="noise-overlay" />
          <Suspense fallback={<div style={{height: '100vh', width: '100vw'}}></div>}>
            <ParticlesBackground />
          </Suspense>
          <Navbar />
          <main>
            <Hero />
            <Suspense fallback={<div className="container" style={{minHeight: '100vh'}}></div>}>
              <Work />
              <Bento />
              <GitHubActivity />
            </Suspense>
          </main>
          <Footer />
        </>
      )}
    </ReactLenis>
  );
}

export default App;
