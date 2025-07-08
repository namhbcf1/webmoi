// Service Worker for Trường Phát PC Builder
const CACHE_NAME = 'tpc-builder-cache-v1';

// Assets to cache initially
const INITIAL_CACHED_RESOURCES = [
  './',
  './index.html',
  './main.html',
  './components-overview.html',
  './manifest.json',
  './truong-phat-pc-builder.js',
  './complete-pc-builder.js',
  './js/configs/index.js',
  './js/data/cpu.js',
  './js/data/mainboard.js',
  './js/data/vga.js',
  './js/data/ram.js',
  './js/data/ssd.js',
  './js/data/case.js',
  './js/data/psu.js',
  './js/data/cpuCooler.js',
  './js/data/hdd.js',
  './js/data/monitor.js'
];

// Install event - cache initial resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching initial resources');
        return cache.addAll(INITIAL_CACHED_RESOURCES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Removing old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network with cache update
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip browser-sync/chrome-extension requests
  if (event.request.url.includes('browser-sync') || 
      event.request.url.includes('chrome-extension')) {
    return;
  }

  // Special handling for HTML pages - network first, fallback to cache
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response for caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Fallback page if no cached page exists
              return caches.match('./index.html');
            });
        })
    );
    return;
  }

  // For images, use cache-first approach
  if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Return from cache if available, otherwise fetch from network
          const fetchPromise = fetch(event.request)
            .then(networkResponse => {
              // Update cache with new response
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, networkResponse.clone()));
              return networkResponse;
            })
            .catch(() => {
              // If both cache and network fail, return a fallback image
              if (event.request.url.includes('images/components/')) {
                return caches.match('./images/components/default.jpg');
              }
              return new Response('Image not found', { status: 404 });
            });
            
          return cachedResponse || fetchPromise;
        })
    );
    return;
  }

  // For JS and CSS files, use stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Update cache with new response
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, networkResponse.clone()));
            return networkResponse;
          });
          
        // Return cached response immediately, if available
        return cachedResponse || fetchPromise;
      })
  );
});

// Handle message events from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 