/* 票口示意圖（gate.html）離線快取
 * 更新 gate.html 後，把 VERSION 改一個新值（例如日期），使用者下次連線時就會取得新版。
 * 這個 Service Worker 只註冊在 gate.html，不會影響同資料夾的其他網頁（例如 index.html）。 */
const VERSION = "2026-09-28-3";
const CACHE = "gate-" + VERSION;
const PAGE = "./gate.html";
const FILES = [
  PAGE,
  "./gate.webmanifest",
  "./gate-icons/icon-192.png",
  "./gate-icons/icon-512.png",
  "./gate-icons/icon-maskable-512.png",
  "./gate-icons/apple-touch-icon.png",
  "./gate-icons/favicon-32.png"
];
const PAGE_URL = new URL(PAGE, self.location).href;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => (k.startsWith("gate-") && k !== CACHE) || k.startsWith("ticket-gate-")).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 先用快取立即顯示，同時在背景向網路抓新版更新快取 */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === "navigate" && new URL(req.url).pathname === new URL(PAGE_URL).pathname;
  const key = isPage ? PAGE_URL : req;
  if (req.mode === "navigate" && !isPage) return;   // 其他網頁一律不經手
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(key, { ignoreSearch: true });
      const fresh = fetch(req).then(res => {
        if (res && res.ok) cache.put(key, res.clone());
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
