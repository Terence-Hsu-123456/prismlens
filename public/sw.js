/*
 * PrismLens Service Worker kill-switch
 * ------------------------------------------------------------
 * 背景：站点历史版本注册过 Service Worker，缓存空间名为 prismlens-v1 / prismlens-v3，
 * 会把旧 HTML 与旧 /_next/static/chunks/* 资源固化在浏览器里。新部署改用
 * /_next/static/immutable/chunks/* 后，旧缓存引用的资源在线上已 404，导致已访问过的
 * 用户看到黑屏 / 空白页。
 *
 * 由于 /sw.js 曾在线上被删除（返回 404），已安装的旧 SW 无法被浏览器检查更新，
 * 于是长期驻留、持续返回陈旧 HTML。
 *
 * 本文件的作用：作为一个"自毁脚本"部署在 /sw.js，让浏览器发现 SW 脚本有更新 →
 * 装上本脚本 → 清空所有 Cache Storage → 注销自己 → 强制刷新受控页面。
 * 之后站点将不再有任何 Service Worker 接管请求。
 *
 * 本文件不注册任何新的离线能力，也不拦截任何请求。请勿删除。
 */

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    (async function () {
      // 1. 清空所有缓存（prismlens-v1 / prismlens-v3 等历史缓存全部移除）
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(function (k) { return caches.delete(k); }));
      } catch (e) {}

      // 2. 立即接管现有客户端
      try {
        await self.clients.claim();
      } catch (e) {}

      // 3. 注销自身，不再有任何 SW 控制本域
      try {
        await self.registration.unregister();
      } catch (e) {}

      // 4. 强制受控页面重新从网络加载，拿到新构建的 HTML / JS / CSS
      try {
        const clientList = await self.clients.matchAll({ type: 'window' });
        for (const client of clientList) {
          try {
            client.navigate(client.url);
          } catch (e) {}
        }
      } catch (e) {}
    })()
  );
});
