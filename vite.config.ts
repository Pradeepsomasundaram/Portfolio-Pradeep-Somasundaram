import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-particles': ['@tsparticles/react', '@tsparticles/slim', '@tsparticles/engine'],
          'vendor-icons': ['react-icons'],
          'vendor-zustand': ['zustand'],
        },
      },
    },
  },
});
