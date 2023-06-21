// Kita akan Install Service Worker, tapi ada beberapa hal yang harus diperhatikan :

// Mendaftarkan Cache name dan dokumen apa saja yang ingin kita simpan kedalam cache, sehingga kita bisa menggunakan dokumen yg sdh kita simpan di cache secara offline.
var CACHE_NAME = 'frizfoo-cache-v1';
var urlsToCache = [  // Ini adalah dokumen yang akan kita simpan di cache, dan file js, css, gambar, merupakan file minimal yang harus kita simpan di cache agar web kita bisa berjalan dengan baik secara offline.
    '/', // Ini adalah halaman utama kita
    '/offline', // Ini adalah halaman offline page ketika tidak ada koneksi internet
    '/css/style.css', // file css yang akan kita simpan di cache
    '/js/navbarscript.js', // file JS yang akan kita simpan di cache
    '/js/scrolltotop.js', // file JS yang akan kita simpan di cache
    '/js/subscribeform.js', // file JS yang akan kita simpan di cache
    '/img/logo.webp', // Gambar logo web yang akan kita simpan di cache
    '/img/offline.gif', // Ini adalah file gambar offline page yang akan kita simpan di cache, ketika tidak ada koneksi internet
];


// Kita HRUS ksih tau browser untk install service worker.
self.addEventListener('install', function (event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});


// Setelah kita install Service Worker, kita akan melakukan Fetching dan Activate Cache, sehingga kita bisa menggunakan dokumen yg kita simpan di cache secara offline.
// Fetching (Kita Fetch/Ambil data dari cache storage yg sudah kita buat, jika ada kita ambil):
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                return fetch(event.request).then(
                    function (response) {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function (cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                )
            }).catch(function () {  // Untuk menampilkan route offline ketika tidak ada koneksi internet
                // If both fail, show a generic fallback:
                return caches.match('/offline');
                // However, in reality you'd have many different
                // fallbacks, depending on URL and headers.
                // Eg, a fallback silhouette image for avatars.
            })
    );
});



// Activate Cache (Setelah kita Fetch data dari cache storage, kita akan aktifkan dan menggunakan cache storage untuk web kita. Sehingga kita bisa menggunakan dokumen yg kita simpan di cache secara offline):
self.addEventListener('activate', function (event) {

    var cacheAllowlist = CACHE_NAME; // Cache yg kita inginkan untuk di aktifkan dan tidak akan dihapus.

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheAllowlist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});