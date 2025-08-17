// Define a name for our cache
const CACHE_NAME = 'ingredimap-v1';

// List all the files that our app needs to function offline
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/recipes.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js'
];

// The 'install' event is fired when the service worker is first installed.
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install');

    // We block the installation process until our cache is pre-filled.
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Pre-caching offline page');
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

// The 'activate' event is fired when the service worker is activated.
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate');

    // This logic removes old caches to save space.
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );

    self.clients.claim();
});

// The 'fetch' event is fired for every network request the page makes.
self.addEventListener('fetch', (event) => {
    // We only want to handle GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    // For requests to external resources (like the vis.js CDN), use a network-first strategy.
    if (event.request.url.startsWith('http')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // If we get a valid response, clone it and put it in the cache.
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // If the network fails, try to get it from the cache.
                    return caches.match(event.request);
                })
        );
    } else {
        // For local assets, use a cache-first strategy.
        event.respondWith(
            caches.match(event.request).then((response) => {
                // If the resource is in the cache, return it. Otherwise, fetch it from the network.
                return response || fetch(event.request);
            })
        );
    }
});
