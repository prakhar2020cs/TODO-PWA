import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { 
  NetworkOnly,
  NetworkFirst,
  StaleWhileRevalidate,
  CacheFirst,
} from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { ExpirationPlugin } from 'workbox-expiration';
import { apiFetchTodosFromServer } from './db/apiService';

// ========================================
// PRECACHE STATIC ASSETS (HTML, CSS, JS, etc)
// ========================================
// Workbox will cache everything listed in __WB_MANIFEST automatically
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ========================================
// BACKGROUND SYNC FOR TODOS
// ========================================

const todoQueue = new BackgroundSyncPlugin('todoQueue', {
  maxRetentionTime: 24 * 60,
    onSync: async ({ queue }) => {
    console.log("🔥 onSync START — queue size:", await queue.size());

  
  },
});

self.addEventListener('sync', async (event) => {
  if (event.tag === 'workbox-background-sync:todoQueue') {
    console.log('🔄 Sync event fired for todoQueue');
  }else if(event.tag === 'test-fire'){
    console.log('🔄 Test sync event fired');
    let  data = await apiFetchTodosFromServer();
    console.log('Fetched todos from server during test sync:', data);
  }
});






// POST
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith( '/PWA/SaveTodo') &&
    request.method === 'POST',
  new NetworkOnly({ plugins: [todoQueue] }),
  'POST'
);


// PUT
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/PWA/ToggleCompleted') &&
    request.method === 'PUT',
  new NetworkOnly({ plugins: [todoQueue] }),
  'PUT'
);

// DELETE
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/PWA/DeleteTodo') &&
    request.method === 'DELETE',
  new NetworkOnly({ plugins: [todoQueue] }),
  'DELETE'
);

// ========================================
// PAGE NAVIGATION (HTML)
// ========================================
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 50 })],
  })
);

// ========================================
// SCRIPTS + STYLES (JS & CSS)
// ========================================
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-cache',
  })
);

// ========================================
// IMAGES
// ========================================
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 60 })],
  })
);





