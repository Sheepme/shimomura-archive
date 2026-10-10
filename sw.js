/* 作品目録：外出先など電波の弱いところでも開けるように、アプリの画面（index.html）を端末に控えておく（10/10 開発 v18）
   いつもネットを先に見て、4秒たっても届かない・つながらないときだけ控えを出す（届いた新しい画面は控えに入れておく）。
   アプリのページを開くときだけ働く。データ（Google 側）・写真・ほかのページには何もしない */
const C = 'smr-shell-1', ROOT = new URL('./', self.location).pathname, KEY = ROOT + 'index.html';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => { for (const k of await caches.keys()) if (k !== C) await caches.delete(k); await self.clients.claim(); })()));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || r.mode !== 'navigate') return;
  const u = new URL(r.url); if (u.origin !== self.location.origin || (u.pathname !== ROOT && u.pathname !== KEY)) return;
  const cacheP = caches.open(C), net = fetch(u.href.split('#')[0], { cache: 'no-store', credentials: 'same-origin' });
  e.waitUntil(net.then(res => { if (!res || !res.ok) return; const c = res.clone(); return cacheP.then(cache => cache.put(KEY, c)); }).catch(() => {}));
  e.respondWith((async () => {
    const old = await (await cacheP).match(KEY); if (!old) return net;
    try { const res = await Promise.race([net, new Promise(ok => setTimeout(() => ok(null), 4000))]); if (res && res.ok) return res; } catch (err) {}
    return old;
  })());
});
