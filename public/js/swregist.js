// Inti Teknologi dari PWA, yaitu Service Worker (Engine pda website kita). SW nnti akan melakukan :  
// 1.) apakah user connect/tidak ke internet untuk akses website kita, klu offline maka user akan gunakan offline-first Mode.
// 2.) Cache Versioning, jadi tampilan website itu akan berbeda, tergantung sejauh mana user telah menggunakan website kita.
// 3.) Background Sync, biasanya kita pakai ketika kita ingin pakai notification APIs

// Kita Register Service Workernya dlu, documentasi di : https://developers.google.com/web/fundamentals/primers/service-workers#register_a_service_worker

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}