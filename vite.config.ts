import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { compression } from 'vite-plugin-compression2';
import type { Plugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/',
  plugins: [
    react(),
    // Visualizar el tamaño del bundle
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
    }) as Plugin,
    // Compresión gzip/brotli
    compression({
      algorithms: ['gzip'],
      exclude: [/\\.(br)$/, /\\.(gz)$/],
    }),
    compression({
      algorithms: ['brotliCompress'],
      exclude: [/\\.(br)$/, /\\.(gz)$/],
    })
  ],
  server: {
    allowedHosts: ['vertical-gather-develop-prev.trycloudflare.com'],
    host: true,
    proxy: {
      '/api': {
        target: env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: true,
        configure: (proxy, options) => {
          console.log('proxy', proxy);
          console.log('options', options);
      }
    },
    
  },
  build: {
    target: 'es2022',
    // Activar minificación avanzada
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    // Optimizar chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor code
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'utils-vendor': ['axios', 'date-fns'],
        },
      },
    },

    // Mejorar tree-shaking
    sourcemap: false,

    // Chunk size warnings
    chunkSizeWarningLimit: 500,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['lucide-react'],
  },
  }
  };
});
