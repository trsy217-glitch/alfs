/* 알프스 재고관리 앱(alfs.kr/stock) 전용 서비스 워커
   - 범위(scope)는 /stock 하나로 제한되어 공개 사이트에는 관여하지 않습니다.
   - 네트워크 우선: 늘 최신 화면을 쓰고, 연결이 끊기면 마지막 화면을 보여 줍니다. */
const CACHE = 'alfs-stock-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (!url.pathname.startsWith('/stock')) return
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {})
        }
        return res
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('/stock')))
  )
})
