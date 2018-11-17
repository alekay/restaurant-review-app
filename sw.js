let staticCacheName = 'restaurant-static';

let urlsToCache = [
  'index.html',
  'restaurant.html',
  'css/styles.css',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js',
  'data/restaurants.json',
  'img/1.jpg',
  'img/2.jpg',
  'img/3.jpg',
  'img/4.jpg',
  'img/5.jpg',
  'img/6.jpg',
  'img/7.jpg',
  'img/8.jpg',
  'img/9.jpg',
  'img/10.jpg'
];

self.addEventListener('install', function(event) {
  console.log('SW is installed');

  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      console.log('SW is caching');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurant-') && cacheName !== staticCacheName;
        }).map(function(cacheName) {
          return cache.delete(cacheName);
        })
      ).then(function() {
        console.log('SW is activated');
      });
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log('found ', event.request, ' in cache');
        return response;
      } else {
        console.log('could not find ', event.request, ' in cache, fetching');
        return fetch(event.request)
        .then(function(response) {
          // fixes issue of using response twice
          const clonedResponse = response.clone();
          caches.open('restaurant-static').then(function(cache) {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(function(err) {
          console.log(err);
        });
      }
    })
  );
});
    

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});