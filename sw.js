const CACHE = 'mowazze-v2';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// ── INSTALL: كاش كل الملفات الأساسية عشان التطبيق يشتغل أوفلاين بالكامل ──
// (خط Tajawal من Google Fonts بيتكاش لوحده أول ما يتحمل بنجاح مرة،
// عن طريق فرع "fetch" تحت، مش هنا، عشان ده cross-origin وممكن يفشل
// التثبيت كله لو الإنترنت بطيء وقت أول تحميل) ──
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE)
            .then(c => c.addAll(ASSETS))
            .catch(err => console.warn('SW install cache error:', err))
    );
    self.skipWaiting();
});

// ── ACTIVATE: امسح أي كاش قديم من نسخة سابقة ──
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// ── FETCH: استراتيجية Cache-First مع تحديث في الخلفية (stale-while-revalidate)
// كده التطبيق يشتغل فوراً من الكاش (حتى أوفلاين تماماً)، وفي نفس
// الوقت لو فيه إنترنت بيحدّث الكاش بالنسخة الأحدث بهدوء في الخلفية
// من غير ما يعطّل تحميل الصفحة. لو الطلب فشل (أوفلاين) وملقيناهوش
// في الكاش، نرجع index.html كـ fallback عشان التطبيق يفضل شغال. ──
self.addEventListener('fetch', e => {
    // تجاهل طلبات غير GET (زي أي API calls مستقبلية) عشان الكاش يفضل سليم
    if (e.request.method !== 'GET') return;

    e.respondWith(
        caches.match(e.request).then(cached => {
            const networkFetch = fetch(e.request)
                .then(response => {
                    // كاش الردود الناجحة من نفس الأصل (basic)، وكمان ردود
                    // الخطوط من Google Fonts (opaque، مينفعش نتأكد من status
                    // بتاعها بس لسه نافعة تتكاش وتتقرأ من المتصفح لاحقاً)
                    const isCacheable = response && (response.type === 'basic' || response.type === 'opaque');
                    if (isCacheable && (response.status === 200 || response.type === 'opaque')) {
                        const clone = response.clone();
                        caches.open(CACHE).then(c => c.put(e.request, clone));
                    }
                    return response;
                })
                .catch(() => null);

            // رجّع النسخة المخزنة فوراً لو موجودة، وحدّثها في الخلفية
            if (cached) {
                networkFetch; // نسيبها تحدّث الكاش بهدوء من غير ما ننتظرها
                return cached;
            }

            // مفيش نسخة مخزنة → استنى الشبكة، ولو فشلت (أوفلاين) رجّع index.html
            return networkFetch.then(res => res || caches.match('./index.html'));
        })
    );
});
