// Get all dropdowns from the document
const productContainer = document.querySelector('.pro-container');  // Kita ambil element dengan class pro-container
const dropdowns = document.querySelectorAll('.container-btn-filter-product .dropdown-btn');
let page = 0, urutkan = -1, idproduct;




document.addEventListener("DOMContentLoaded", async function () { // function yang akan dijalankan saat DOMContentLoaded yaitu untuk mengambil data dan tampilkan ke dalam container kalau ada data
    try { // klu sukses, maka...
        productContainer.innerHTML = "";  // Kita kosongkan dlu isi dari product container, sebelum di input data baru

        let dataProducts = await getProducts(page, urutkan); // kita ambil data products dari server

        if (dataProducts.pagination.has_next_page === false) { // klu next page nya false, maka ...
            btnLoadMore.style.display = 'none'; // kita hilangkan button load more
        }

        // cek, klu data products nya kosong, maka...
        if (dataProducts.products.length === 0) {
            productContainer.innerHTML = `<h2 style="text-align: center; color: rgba(255, 126, 126, 1);">Maaf Produk Anda Masih Kosong, Silahkan Tambahkan Produk Anda</h2>`
            return; // kita return supaya tidak lanjut ke function UpdateUI
        }

        UpdateUI(dataProducts.products); // kita tampilkan data products ke dalam container

    } catch (err) {  // klu gagal, maka...

        alert(err);

    }
});

document.addEventListener('click', async function (e) { // function untk klu button Delete di klik, maka akan hapus product seller yg di klik
    try { // klu sukses, maka...

        if (e.target.classList.contains('btn-deletepro')) { // Kita cek apakah yang diklik adalah tombol Delete

            e.target.classList.remove('fa-trash-alt'); // kita matikan icon trash
            e.target.classList.add('btn-pauseload'); // Tambah effect btn spya tidak bisa di klik lagi
            e.target.classList.add('fa-spinner', 'fa-spin'); // kita tambahkan class spinner dan spin


            // Ambil id product yg mau di delete
            idproduct = e.target.dataset.idproduct;
            // Ambil id product yg mau di delete


            window.location.href = await delProduct(idproduct); // panggil function delProduct untk hapus product dgn id tertentu dari database seller yg bersangkutan


            // e.target.classList.remove('btn-pauseload'); // Hapus effect btn spya tidak bisa di klik
            // e.target.classList.remove('fa-spin'); // Hapus effect loading spin

        }

    } catch (error) {  // klu gagal, maka...

        alert(error);

    }
});





function getProducts(page, urutkan) { // function untuk GET data Products dari server
    return fetch(`/api/v1/seller/seller-product?page=${page || 0}&urutkan=${urutkan || -1}`, {
        method: 'GET',
    })
        .then(status)  // cek status response pada function status
        .then((response) => {
            return response; // send data hasil fetch 
        })
};

function delProduct() {  // function untk DELETE atau Hapus product seller yg di klik
    return fetch(`/api/v1/seller/del-seller-product/${idproduct}`, {
        method: "DELETE",
    })
        .then((response) => {
            console.log(response);
            return response.url;
        });
}





// Script Untuk Button Load More Products
let btnLoadMore = document.querySelector('#btn-loadmore-product');  // Kita tambahkan event listener untuk button load more
let counter = 0;
function plus() {
    return counter = counter + 1;
}

btnLoadMore.addEventListener('click', async function () { // klu buton load more di klik maka akan menjalankan function ini
    try { // klu sukses, maka ...
        plus(); // kita tambahkan counter

        btnLoadMore.innerHTML = `<i class="fas fa-sync-alt fa-spin"></i>&ensp;  Please Wait... &ensp;<i class="fas fa-sync-alt fa-spin"></i>`; // kita ubah text button menjadi Please Wait

        let dataProducts = await getProducts(counter, urutkan);  // kita ambil data products dari server dgn page sesuai nilai counter

        if (dataProducts.pagination.has_next_page === false) { // klu next page nya false, maka ...
            btnLoadMore.style.display = 'none'; // kita hilangkan button load more
        }

        UpdateUI(dataProducts.products);  // kita tampilkan data products ke dalam container

        btnLoadMore.innerHTML = `<i class="fas fa-sync-alt"></i>&ensp;  Load More &ensp;<i class="fas fa-sync-alt"></i>`; // kita ubah text button menjadi Load More lagi

    } catch (err) {  // klu gagal, maka ...

        alert(err);

    }
});





function UpdateUI(data) {  // Function untuk memasukkan data products ke dalam container

    let products = ''; // inisialisasi variabel products

    data.forEach(function (item) {  // Kita looping data tiap array di products
        products = productFrags(item);  // hsil dri function productFrags kita masukkan ke dalam variabel products

        let productsNode = new DOMParser().parseFromString(products, 'text/html'); // kita ubah isi dari variabel products yg isinya string, menjadi DOM element agar bisa kita appendChild ke dalam container.


        productContainer.appendChild(productsNode.body.firstChild);  // Kita masukkan data products yg sdh dlm btk element node ke dalam container
    });

}

function productFrags(m) {   // Function yang berisi html fragment untuk setiap data prodct

    function rate(x) {
        let star = '';
        for (let i = 0; i < x; i++) {
            star += `<i class="fas fa-star"></i>`;
        }
        return star;
    }

    return `
        <div class="pro-card">
            <a href="/product-details/${m._id}">
                <!-- image product -->
                <div class="pro-image">
                    <img src="https://drive.google.com/uc?export=view&id=${m.productpicid[0]}" alt="${m.namaproduct}" class="pro-animation" loading="lazy">
                </div>

                <!-- product info -->
                <div class="des-pro">
                    <span><i class="fal fa-map-marker-alt"></i> ${m.kotapenjual}</span>
                    <h3>${m.namaproduct}</h3>
                    <div class="star">
                        ${rate(m.rating)}
                    </div>
                    <h4>${m.hargaproduct}</h4>
                </div>
            </a>

            <!-- input hidden untk id toko penjual, berat produk, no telp penjual -->
            <input type="hidden" name="idpenjual" value="${m.idpenjual}">
            <input type="hidden" name="beratproduct" value="${m.beratproduct[0]}">
            <input type="hidden" name="notelppenjual" value="${m.notelppenjual}">

            <!-- product button Cart -->
            <!-- <i class="fal fa-shopping-cart btn-cart" data-idproduct="${m._id}"></i> -->

            <!-- product button Edit -->
            <a class="fal fa-file-edit btn-editpro" href="/seller/update-seller-product/${m._id}" data-idproduct="${m._id}"></a>

            <!-- product button Delete -->
            <i class="far fa-trash-alt btn-deletepro" data-idproduct="${m._id}"></i>
        </div>
    `
};





// Bagian urusan Filter Products supaya bisa work dengan baik
dropdowns.forEach((dropdown) => {

    // Get inner elements from each dropdown
    const select = dropdown.querySelector('.select-filter');
    const caret = dropdown.querySelector('.caret');
    const menu = dropdown.querySelector('.menu-filter');
    const options = dropdown.querySelectorAll('.menu-filter li');
    const selected = dropdown.querySelector('.selected-filter');


    // we're using this method in order to have multiple dropdowns menu on the page work

    // Add a click event to select element
    select.addEventListener('click', () => {
        // Add the clicked select styles to the select element
        select.classList.toggle('select-filter-clicked');
        // Add the rotate styles to the caret element
        caret.classList.toggle('caret-rotate');
        // Add the open styles to the menu element
        menu.classList.toggle('menu-filter-open');
    });


    // Loop through all option elements
    options.forEach((option) => {
        // Add a click event to each option element
        option.addEventListener('click', async () => {
            // Change selected inner text to clicked option inner text
            selected.innerText = option.innerText;
            // Add the clicked select styles to the select element
            select.classList.remove('select-filter-clicked');
            // Add the rotate styles to the caret element
            caret.classList.remove('caret-rotate');
            // Add the open styles to the menu element
            menu.classList.remove('menu-filter-open');

            // Remove active class from all option elements
            options.forEach((option) => {
                option.classList.remove('active-selected');
            });

            // Add active class to the clicked option element
            option.classList.add('active-selected');


            // klu option filter di klik, siap fetch data products seller sesuai dengan filter yg dipilih
            if (option.innerText === 'Produk Terbaru') {
                // kita ubah nilai urutkan jadi -1, krena urutkan secara descending (dri yg terbaru ke yg terlama)
                urutkan = -1;
                page = 0; // kita reset
                counter = 0; // kita reset

                // kita hapus semua data yg ada di dalam container
                productContainer.innerHTML = '';

                // kita panggil function getProducts dgn nilai urutkan 1
                let dataProducts = await getProducts(page, urutkan); // kita ambil data products dari server

                // kita panggil function UpdateUI dgn nilai dataProducts.products
                if (dataProducts.pagination.has_next_page === false) { // klu next page nya false, maka ...
                    btnLoadMore.style.display = 'none'; // kita hilangkan button load more
                } else {
                    btnLoadMore.style.display = 'block'; // kita tampilkan lgi button load more
                }

                // cek, klu data products nya kosong, maka...
                if (dataProducts.products.length === 0) {
                    productContainer.innerHTML = `<h2 style="text-align: center; color: rgba(255, 126, 126, 1);">Maaf Produk Anda Masih Kosong, Silahkan Tambahkan Produk Anda</h2>`
                    return; // kita return supaya tidak lanjut ke function UpdateUI
                }

                UpdateUI(dataProducts.products); // kita tampilkan data products ke dalam container

            } else
                if (option.innerText === 'Produk Terlama') {
                    // kita ubah nilai urutkan jadi 1, krena urutkan secara ascending (dri yg terlama ke yg terbaru) 
                    urutkan = 1;
                    page = 0; // kita reset
                    counter = 0; // kita reset

                    // kita hapus semua data yg ada di dalam container
                    productContainer.innerHTML = '';

                    // kita panggil function getProducts dgn nilai counter 1
                    let dataProducts = await getProducts(page, urutkan); // kita ambil data products dari server

                    // kita panggil function UpdateUI dgn nilai dataProducts.products
                    if (dataProducts.pagination.has_next_page === false) { // klu next page nya false, maka ...
                        btnLoadMore.style.display = 'none'; // kita hilangkan button load more
                    } else {
                        btnLoadMore.style.display = 'block'; // kita tampilkan lgi button load more
                    }

                    // cek, klu data products nya kosong, maka...
                    if (dataProducts.products.length === 0) {
                        productContainer.innerHTML = `<h2 style="text-align: center; color: rgba(255, 126, 126, 1);">Maaf Produk Anda Masih Kosong, Silahkan Tambahkan Produk Anda</h2>`
                        return; // kita return supaya tidak lanjut ke function UpdateUI
                    }

                    UpdateUI(dataProducts.products); // kita tampilkan data products ke dalam container

                }

        });
    });

});