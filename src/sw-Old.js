import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

const SW_VERSION = '1.0.1';
console.log(`🚀 Custom Service Worker v${SW_VERSION} loaded`);

// ========================================
// CLEANUP OLD CACHES
// ========================================
cleanupOutdatedCaches();

// ========================================
// PRECACHE STATIC ASSETS
// ========================================
// This caches all your app's static files (HTML, JS, CSS, images)
precacheAndRoute(self.__WB_MANIFEST);

// ========================================
// INSTALL & ACTIVATE
// ========================================
self.addEventListener('install', (event) => {
  console.log(`✅ Installing SW v${SW_VERSION}`);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(`🟢 Activated SW v${SW_VERSION}`);
  event.waitUntil(clients.claim());
});

// ========================================
// NAVIGATION REQUESTS (HTML pages)
// ========================================
// This is KEY for offline functionality!
// When user navigates (types URL, refreshes), serve from cache
const navigationRoute = new NavigationRoute(
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);
registerRoute(navigationRoute);

// ========================================
// RUNTIME CACHING STRATEGIES
// ========================================

// API calls - Network First with timeout
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
    ],
  })
);

// Static assets (JS, CSS) - Stale While Revalidate
registerRoute(
  ({ request }) => 
    request.destination === 'script' || 
    request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Images - Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Fonts - Cache First
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
);

// ========================================
// OFFLINE FALLBACK
// ========================================
// If all else fails, show a custom offline page
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If network fails and cache fails, you could return a custom offline page
        // For now, Workbox will handle it with precached index.html
        return caches.match('/index.html');
      })
    );
  }
});

// ========================================
// BACKGROUND SYNC
// ========================================
self.addEventListener('sync', (event) => {
  console.log(`🔄 [v${SW_VERSION}] Background Sync triggered:`, event.tag);
  
  if (event.tag === 'syncTodos') {
    console.log('📝 Starting todo sync...');
    event.waitUntil(syncTodos());
  }
});

async function syncTodos() {
  ;
  console.log('🔍 Opening IndexedDB...');
  
  try {
    const db = await openDB('TodoAppDB', 61);
    console.log('✅ IndexedDB opened');
    
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    const jobs = await getAllFromStore(store);
    
    console.log(`📊 Found ${jobs.length} todos to sync`);

    if (jobs.length === 0) {
      console.log('✨ No pending syncs');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const job of jobs) {
      console.log('📤 Syncing job:', job.id, job.data);
      
      try {
        const response = await fetch('/api/todos', {
          method: 'POST',
          body: JSON.stringify(job.data),
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          await deleteFromStore(store, job.id);
          successCount++;
          console.log('✅ Synced job:', job.id);
        } else {
          console.error('❌ Sync failed:', job.id, response.status);
          failCount++;
        }
      } catch (err) {
        console.error('❌ Network error:', job.id, err);
        failCount++;
      }
    }

    console.log(`🎉 Sync complete! Success: ${successCount}, Failed: ${failCount}`);
    
    await notifyClients({
      type: 'SYNC_COMPLETE',
      success: successCount,
      failed: failCount,
    });
    
  } catch (error) {
    console.error('💥 Sync error:', error);
  }
}

// ========================================
// HELPERS
// ========================================
function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteFromStore(store, id) {
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => client.postMessage(message));
}

self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});