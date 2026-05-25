const CACHE_NAME = 'history-annals-cache-v1';

// 核心预缓存文件列表
const PRECACHE_RESOURCES = [
  './',
  './index.html',
  './favicon.svg',
  './icons.svg',
  './data/history-timeline.json'
];

// 将 1 至 20 世纪的数据文件全部加入预缓存，保障离线后整部长卷均可查阅
for (let c = 1; c <= 20; c++) {
  PRECACHE_RESOURCES.push(`./data/timeline/century-${c}.json`);
}

// 安装阶段：预缓存核心静态外壳与历史 JSON 数据
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching key timelines & shell');
        return Promise.allSettled(
          PRECACHE_RESOURCES.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`[Service Worker] Failed to pre-cache resource: ${url}`, err);
            });
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

// 激活阶段：清理过时的旧缓存版本
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Purging old cache storage:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 请求拦截阶段：优先从本地缓存读取（秒开），后台静默联网同步更新（Stale-While-Revalidate）
self.addEventListener('fetch', (event) => {
  // 只拦截同源的本站 GET 请求，排除 chrome-extension 等插件协议
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // 命中缓存：立即返回给用户（首开/二次秒开），并异步在后台获取最新内容更新缓存
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => { /* 静默失败，网络离线或不好时不影响本地缓存读取 */ });

        return cachedResponse;
      }

      // 未命中缓存（比如打包生成的动态哈希 CSS/JS/SVG）：拉取网络请求并存入本地缓存
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch((err) => {
        console.error('[Service Worker] Dynamic fetch and caching failed:', err);
      });
    })
  );
});
