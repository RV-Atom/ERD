import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // CRITICAL FIX: Set base path for GitHub Pages subdirectory
  base: '/',  // Must match your repository name exactly
  
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'reactflow-vendor': ['reactflow'],
        }
      }
    }
  }
});
