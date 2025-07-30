const CACHE_NAME = "kidcheck-v1"
const urlsToCache = ["/", "/index.html", "/styles.css", "/app.js", "/manifest.json"]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

// Handle background sync for offline requests
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(syncRequests())
  }
})

async function syncRequests() {
  // Sync offline requests when back online
  const requests = JSON.parse(localStorage.getItem("checkinRequests") || "[]")
  console.log("Syncing requests:", requests)
}
