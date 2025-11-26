// src/sw.js

// Import necessary Workbox modules
import { precacheAndRoute } from 'workbox-precache';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// 1. Inject the Precache Manifest (This line is MANDATORY)
// The plugin replaces 'self.__WB_MANIFEST' with the list of bundled files (JS, CSS, HTML, etc.)
precacheAndRoute(self.__WB_MANIFEST || []);

// 2. Implement the Runtime Caching Rule (based on your old config)
registerRoute(
  // Match requests for your local /api/ routes
  ({ url }) => url.origin === self.location.origin && url.pathname.includes('/api/'),
  
  // Apply the NetworkFirst strategy
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
    ],
  })
);

// Optional: Add the skipWaiting logic for faster updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});