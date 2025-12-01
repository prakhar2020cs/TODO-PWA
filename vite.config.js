import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      
      manifest: {
        name: 'React PWA Starter',
        short_name: 'PWA',
        description: 'My first React PWA application.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      injectManifest: {
        // Include all static assets
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,json,vue,txt,woff,woff2}'
        ],
        maximumFileSizeToCacheInBytes: 5000000,
        
        // Important: Include index.html explicitly
        globIgnores: ['**/node_modules/**/*'],
      },

      devOptions: {
        enabled: true,
        type: 'module',
        // navigateFallback: 'index.html',
      },
    }),
  ],
});