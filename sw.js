/* 舊版離線快取的「清除用」檔案：
 * 先前的 sw.js 會接管整個 /sticker/ 資料夾，這個版本會在手機下次連線時自動移除它並清掉舊快取。
 * 等大家都更新過（約一兩週）後，這個檔案可以從 repo 刪除。 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("ticket-gate-")) await caches.delete(k);
    await self.registration.unregister();
    for (const c of await self.clients.matchAll({ type: "window" })) c.navigate(c.url);
  })());
});
