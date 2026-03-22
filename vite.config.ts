import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const isDev = mode === 'development';
  
  return {
    plugins: [react(), tailwindcss()],
    
    // GitHub Pages deployment base path
    // Change 'asrorepo-frontend' to your repository name
    base: isDev ? '/' : '/asrorepo-frontend/',
    
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    
    build: {
      outDir: 'dist',
      sourcemap: false, // Disable source maps in production for security
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: !isDev, // Remove console logs in production
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom'],
            'motion': ['motion'],
            'icons': ['lucide-react'],
          },
        },
      },
    },
    
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      port: 5173,
    },
  };
});
