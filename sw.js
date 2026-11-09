/* Contractor Nexus V7.16 — ตัวรับแจ้งเตือนของแอปบนมือถือ (Service Worker)
   ไม่เก็บไฟล์ไว้ในเครื่อง: เปิดแอปแล้วโหลดเวอร์ชันล่าสุดจากลิงก์เดิมเสมอ (อัป index.html ใหม่ได้ทันที)
   V7.16: แจ้งเตือนมีเสียงมาตรฐานของเครื่อง (ปิดเสียงได้ทีละเครื่องในแอป — ค่าเก็บไว้ใน Cache Storage ชื่อ cn-cfg) · เลขบนไอคอนแอป = ตัวเลขที่ Server ส่งมา (งานที่รอท่านทำ) */
function soundOn() {
  try {
    return caches.open('cn-cfg').then(function (c) { return c.match(self.registration.scope + 'cn-sound'); })
      .then(function (r) { return r ? r.text() : '1'; }).then(function (t) { return t !== '0'; }).catch(function () { return true; });
  } catch (_e) { return Promise.resolve(true); }
}
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_e) { d = { title: 'Contractor Nexus', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(soundOn().then(function (snd) {
    var jobs = [self.registration.showNotification(d.title || 'Contractor Nexus', {
      body: d.body || '', tag: d.tag || undefined, renotify: !!d.tag, silent: !snd,
      icon: 'icons/icon-192.png', badge: 'icons/badge-96.png', lang: 'th', data: { url: d.url || '#/' }
    })];
    var nav = self.navigator;
    if (typeof d.badge === 'number' && nav && nav.setAppBadge) jobs.push(d.badge > 0 ? nav.setAppBadge(d.badge) : nav.clearAppBadge());
    return Promise.all(jobs.map(function (p) { return Promise.resolve(p).catch(function () {}); }));
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var hash = (e.notification.data && e.notification.data.url) || '#/';
  var url = self.registration.scope + hash;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if (c.url.indexOf(self.registration.scope) === 0) { c.postMessage({ type: 'cn-nav', hash: hash }); return c.focus(); }
    }
    return self.clients.openWindow(url);
  }));
});
