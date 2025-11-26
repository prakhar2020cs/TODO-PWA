import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // 1. Import the plugin
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // 2. Configure the VitePWA plugin
    VitePWA({


     strategies: 'generateSW',
      
      // 2. **DEFINE SOURCE:** Point the plugin to your custom SW file.
      //    We assume your file is named 'src/sw.js'
      // injectManifest: {
      //   swSrc: './src/sw.js', // <-- Path to your custom SW file
        
      //   // This is the string placeholder used in your sw.js 
      //   // for injecting the list of cached assets.
      //   injectionPoint: 'self.__WB_MANIFEST', 
      // },
      registerType: 'autoUpdate', // Automatically update the Service Worker
      
      // 3. Configure the Manifest (manifest.json content)
      manifest: {
        name: 'React PWA Starter',
        short_name: 'PWA',
        description: 'My first React PWA application.',
        theme_color: '#ffffff',
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

      // 4. Configure the Service Worker (Caching Strategy)
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // Cache all these file types
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin && url.pathname.includes('/api/'),
            handler: 'NetworkFirst', // Use NetworkFirst for API calls
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
        ],
      },
    }),
  ],
});

