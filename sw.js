const CACHE_NAME = 'workout-app-v1'; // اگر کدها را تغییر دادید، این نام را v2 کنید تا آپدیت شود
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './workout.html',
  './tracker.html',
  './admin.html',
  './css/style.css',
  './js/app.js',
  './js/admin.js',
  './data/exercises.json',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// 1. نصب سرویس ورکر و ذخیره فایل‌های اولیه
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. فعال‌سازی و پاک کردن کش‌های قدیمی (برای آپدیت)
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. رهگیری درخواست‌ها (استراتژی Cache First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // اگر فایل در کش بود، همان را برگردان (اینترنت مصرف نکن)
      if (response) {
        return response;
      }

      // اگر نبود، از اینترنت بگیر
      return fetch(event.request).then((networkResponse) => {
        // بررسی صحت پاسخ
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // اگر فایل معتبر بود (مثلا ویدیویی که تازه لود شده)، یک کپی در کش بگذار
        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // اگر اینترنت نبود و فایل هم در کش نبود (آفلاین کامل)
        // اینجا می‌توان یک صفحه "آفلاین هستید" نمایش داد، اما فعلا نیازی نیست
        console.log('Fetch failed; returning offline page instead.');
      });
    })
  );
});