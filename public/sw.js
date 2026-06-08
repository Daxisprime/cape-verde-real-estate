// ProCV Service Worker - PWA and Offline Functionality
const CACHE_NAME = 'procv-v1.0.0';
const OFFLINE_PAGE = '/offline.html';

// Files to cache for offline functionality
const CACHE_FILES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add more static assets as needed
];

// API endpoints to cache for offline browsing
const API_CACHE_PATTERNS = [
  /\/api\/property\/.*/,
  /\/api\/market-data/,
  /\/api\/chat\/conversations/
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential files');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests with cache strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    // Handle navigation requests (pages)
    if (request.mode === 'navigate') {
      event.respondWith(handleNavigationRequest(request));
    }
    // Handle API requests
    else if (url.pathname.startsWith('/api/')) {
      event.respondWith(handleApiRequest(request));
    }
    // Handle static assets
    else if (request.destination === 'image' ||
             request.destination === 'script' ||
             request.destination === 'style' ||
             request.destination === 'font') {
      event.respondWith(handleStaticAssetRequest(request));
    }
    // Handle all other requests
    else {
      event.respondWith(handleGenericRequest(request));
    }
  }
});

// Navigation request handler (Cache First, fallback to offline page)
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If no cache, return offline page
    return caches.match(OFFLINE_PAGE);
  }
}

// API request handler (Network First, Cache as fallback)
async function handleApiRequest(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    // Always try network first for API requests
    const networkResponse = await fetch(request);

    // Cache successful GET requests for specific endpoints
    if (networkResponse.ok && shouldCacheApiRequest(request)) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log('[SW] Serving cached API response:', request.url);
        return cachedResponse;
      }
    }

    // Return error response
    return new Response(
      JSON.stringify({
        error: 'Network unavailable',
        message: 'Please check your connection and try again.',
        cached: false
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Static asset handler (Cache First)
async function handleStaticAssetRequest(request) {
  const cache = await caches.open(CACHE_NAME);

  // Try cache first for static assets
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Network fallback
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return placeholder or error response for assets
    if (request.destination === 'image') {
      return new Response('', { status: 204 });
    }
    throw error;
  }
}

// Generic request handler
async function handleGenericRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('', { status: 204 });
  }
}

// Check if API request should be cached
function shouldCacheApiRequest(request) {
  const url = new URL(request.url);
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const options = {
    body: 'You have a new message from ProCV',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/open-16x16.png'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/icons/close-16x16.png'
      }
    ],
    requireInteraction: true,
    silent: false
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      Object.assign(options, {
        title: payload.title || 'ProCV',
        body: payload.body || options.body,
        icon: payload.icon || options.icon,
        data: { ...options.data, ...payload.data }
      });
    } catch (error) {
      console.error('[SW] Error parsing push payload:', error);
      options.title = 'ProCV';
    }
  } else {
    options.title = 'ProCV';
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'close') {
    return;
  }

  // Default action or 'open' action
  const urlToOpen = data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }

        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'chat-messages') {
    event.waitUntil(syncPendingMessages());
  } else if (event.tag === 'property-favorites') {
    event.waitUntil(syncPropertyFavorites());
  }
});

// Sync pending chat messages when back online
async function syncPendingMessages() {
  try {
    // Get pending messages from IndexedDB or localStorage
    const pendingMessages = await getPendingMessages();

    for (const message of pendingMessages) {
      try {
        await fetch('/api/chat/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${message.token}`
          },
          body: JSON.stringify(message.data)
        });

        // Remove from pending after successful send
        await removePendingMessage(message.id);
      } catch (error) {
        console.error('[SW] Failed to sync message:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Error syncing messages:', error);
  }
}

// Sync property favorites
async function syncPropertyFavorites() {
  // Implementation for syncing favorites
  console.log('[SW] Syncing property favorites...');
}

// Helper functions for IndexedDB operations
async function getPendingMessages() {
  // In a real implementation, this would read from IndexedDB
  return [];
}

async function removePendingMessage(id) {
  // In a real implementation, this would remove from IndexedDB
  console.log('[SW] Removing pending message:', id);
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker registered successfully');
