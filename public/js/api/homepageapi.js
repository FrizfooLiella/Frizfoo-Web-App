const productContainer = document.querySelector('.pro-container');  // Kita ambil element dengan class pro-container
let idproduct, productpic, namaproduct, kuantitas, hargaproduct, totalhargaproduk, beratproduk, idpenjual, notelppenjual;




document.addEventListener("DOMContentLoaded", async function () { // function yang akan dijalankan saat DOMContentLoaded yaitu untuk mengambil data dan tampilkan ke dalam container kalau ada data
    try {
        productContainer.innerHTML = "";  // Kita kosongkan dlu isi dari product container, sebelum di input data baru

        let dataProducts = await getProducts(); // kita ambil data products dari server

        UpdateUI(dataProducts.products); // kita tampilkan data products ke dalam container

    } catch (err) {

        alert(err);

    }
});

document.addEventListener("click", async function (e) {  // Event listener untuk jika button add to cart di klik
    try { // klu sukses, maka...

        if (e.target.classList.contains('btn-cart')) {

            e.target.classList.add('btn-pauseload'); // Tambah effect btn spya tidak bisa di klik lagi
            e.target.classList.add('fa-spinner', 'fa-spin'); // kita tambahkan class spinner dan spin


            // Ambil semua data Product yg mau di add to cart
            idproduct = e.target.dataset.idproduct;
            productpic = e.target.parentElement.querySelector('a .pro-image img').src;
            namaproduct = e.target.parentElement.querySelector('a .des-pro h3').innerText;
            kuantitas = 1;
            hargaproduct = e.target.parentElement.querySelector('a .des-pro h4').innerText.replace(/[^\w\s]/gi, ''); // pkai replace biar gak ada titik
            totalhargaproduk = kuantitas * parseInt(hargaproduct);
            beratproduk = e.target.parentElement.querySelector('input[name="beratproduct"]').value;
            idpenjual = e.target.parentElement.querySelector('input[name="idpenjual"]').value;
            notelppenjual = e.target.parentElement.querySelector('input[name="notelppenjual"]').value;
            // Ambil semua data Product yg mau di add to cart


            window.location.href = await addToCart(); // klu user sdh login, maka akan tidak akan diarahkan ke halaman login


            // e.target.classList.remove('btn-pauseload'); // Hapus effect btn spya bisa di klik lagi
            // e.target.classList.remove('fa-spinner', 'fa-spin'); // kita hapus class spinner dan spin

        }


    } catch (error) {  // klu gagal, maka...

        alert(error);

    }

});





function getProducts(page) { // function untuk GET data Products dari server
    return fetch(`/api/v1/product?page=${page || 0}`, {
        method: 'GET',
    })
        .then(status)  // cek status response pada function status
        .then((response) => {
            return response; // send data hasil fetch 
        })
};

function addToCart() {  // function untk POST product ke cart User
    let dataProduct = {
        'idproduct': idproduct,
        'productpic': productpic,
        'nameproduk': namaproduct,
        'kuantitas': kuantitas,
        'hargaproduk': hargaproduct,
        'totalhargaproduk': totalhargaproduk,
        'beratproduk': beratproduk,
        'idpenjual': idpenjual,
        'notelppenjual': notelppenjual,
    };

    return fetch(`/api/v1/plus-add-to-cart`, {
        method: "POST",
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(dataProduct)
    })
        .then((response) => {
            return response.url;
        });

}





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
            <i class="fal fa-shopping-cart btn-cart" data-idproduct="${m._id}"></i>
        </div>
    `
};
