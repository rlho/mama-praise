const CACHE_NAME = 'mama-praise-v3';

self.addEventListener('install', () => {
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

// ネットワーク優先: オンラインなら最新を取得、オフラインならキャッシュ
self.addEventListener('fetch', (event) => {
  // ナビゲーションリクエスト（HTMLページ）はネットワーク優先
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // その他のリクエスト（JS/CSS/画像）もネットワーク優先
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || new Response('オフラインです', {
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
    scheduleNightNotification();
  }, delay);
}

function showNightNotification() {
  const msg = nightMessages[Math.floor(Math.random() * nightMessages.length)];
  self.registration.showNotification('ほめぽめ', {
    body: msg,
    icon: '/icon.svg',
    badge: '/icon.svg',
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
