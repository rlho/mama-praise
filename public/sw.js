const CACHE_NAME = 'mama-praise-v2';
const urlsToCache = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).then((fetchResponse) => {
        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
          return fetchResponse;
        }
        const responseToCache = fetchResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return fetchResponse;
      }).catch(() => {
        return new Response('オフラインです。でも大丈夫、あなたは今日も頑張ってるよ。', {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});

// --- 通知 ---
const nightMessages = [
  '今日もおつかれさま。あなたは十分がんばったよ',
  '今日一日をちゃんと過ごしたね。えらいよ',
  '夜だね。今日の自分をぎゅってしてあげてね',
  '今日もいろいろあったよね。おつかれさま',
  'こんな時間まで関わってるあなた、すごいよ',
  '今日も赤ちゃんのために頑張ったね',
  '温かいもの飲んでゆっくりしてね',
  '一日の終わりに。あなたはよくやってるよ',
  '疲れたよね。今日はもう休んでいいよ',
  '明日のことは明日考えよう。今日はおしまい',
];

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleNightNotification();
  }
});

function scheduleNightNotification() {
  const now = new Date();
  const target = new Date();
  target.setHours(22, 0, 0, 0);
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }
  const delay = target.getTime() - now.getTime();

  setTimeout(() => {
    showNightNotification();
    // 次の日もスケジュール
    scheduleNightNotification();
  }, delay);
}

function showNightNotification() {
  const msg = nightMessages[Math.floor(Math.random() * nightMessages.length)];
  self.registration.showNotification('ほめぽめ', {
    body: msg,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'night-praise',
    renotify: true,
  });
}

// 通知クリックでアプリを開く
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
