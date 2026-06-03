import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/@tsparticles') || id.includes('node_modules/tsparticles')) {
            return 'vendor-particles';
          }
          if (id.includes('node_modules/react-parallax-tilt') || id.includes('node_modules/react-icons') || id.includes('node_modules/lenis')) {
            return 'vendor-ui';
          }
        },
      },
    },
    target: 'es2020',
    cssCodeSplit: true,
  },
})
