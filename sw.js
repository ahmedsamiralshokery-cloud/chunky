/* Service worker: يخلي الكاشير يفتح بدون إنترنت بعد أول زيارة.
   غيّر رقم VERSION عند كل تحديث للملفات علشان الكاش القديم يتمسح. */
const VERSION = 'casher-v1';
const CORE = ['./', 'index.html', 'css/style.css', 'js/app.js', 'js/tailwind-config.js', 'manifest.webmanifest',
              'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'img/logo.png'];
const CDN = ['cdn.tailwindcss.com', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION)
    .then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // ملفات الموقع نفسه: الشبكة أولاً (علشان التحديثات توصل) ثم الكاش لو مفيش إنترنت
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true })
        .then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
    );
    return;
  }

  // مكتبات الواجهة (Tailwind / خطوط / أيقونات) و Firebase SDK: الكاش أولاً
  const isCdn = CDN.includes(url.hostname) || (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/'));
  if (isCdn) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
  }
  // أي طلب تاني (Firestore / Auth ...) يعدي على الشبكة مباشرة من غير كاش
});
