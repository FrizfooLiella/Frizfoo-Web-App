// Script For Product Details Picture
let productDisplay = document.querySelector("[data-product-display]");
let productThumbnails = document.querySelectorAll("[data-product-thumbnail]");

for (let i = 0; i < productThumbnails.length; i++) {

    productThumbnails[i].addEventListener("click", function (e) { // ksh event ke tiap gambar yang ada di dalam productThumbnails
        productDisplay.src = e.target.src;
        productDisplay.classList.add("fade-propicture");

        // Kasih Timing Function, jadi jika sudah 0.5 detik menunggu, maka class fade yang ada di productDisplay, akan terhapus
        setTimeout(function () {
            productDisplay.classList.remove("fade-propicture");
        }, 500);

        // Looping untuk jika ada class=active maka nanti akan kita hilangkan dgn looping ini
        productThumbnails.forEach(function (productThumbnails) {
            // jika di elemen itu ada class dgn value active maka remove value itu
            if (productThumbnails.classList.contains('active')) {
                productThumbnails.classList.remove('active');
            }
            // Atau bisa jg pakai cara paksa gini
            // thumb.className = 'thumb';
        });

        // Jika kita klik salah satu gambar yang kecil, maka tambahkan class active ke dalam elemen itu
        e.target.classList.add('active');

    });

}