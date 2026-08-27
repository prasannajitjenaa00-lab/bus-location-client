// Service Worker for persistent background location tracking
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Periodic background sync event handler
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'location-sync') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'TRIGGER_LOCATION_UPDATE' });
        });
      })
    );
  }
});

// Keep-alive ping handler for background execution
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PING') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ type: 'PONG', timestamp: Date.now() });
    }
  }
});
