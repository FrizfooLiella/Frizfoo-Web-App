let btnAddToCart = document.querySelector('.btn-qty-to-cart');
let idproduct = btnAddToCart.dataset.idproduct;
let productpic = document.querySelectorAll("[data-product-thumbnail]")[0].src;
let namaproduct = document.querySelector('.product-title').innerText;
let btnKuantitas = document.querySelector('.product-qty-input');
let hargaproduct = document.querySelector('.product-price').innerText.replace(/[^\w\s]/gi, ''); // pkai replace biar gak ada titik
let btnBeratProduct = document.querySelectorAll('input.product-weight-radio');
let idpenjual = document.querySelector('[name= idpenjual]').value;
let notelppenjual = document.querySelector('[name= notelppenjual]').value;



let kuantitas = 1;
btnKuantitas.addEventListener('change', function (e) { // klu ada perubahan pada inputan kuantitas

    if (e.target.value < 1) { // untk pastikan kuantitas tidak kurang dari 1
        e.target.value = 1; // jika kurang dari 1 maka kuantitasnya akan di set 1
    }

    kuantitas = e.target.value;
});


let beratproduk = '';
btnBeratProduct.forEach((btn) => {  // untk cek berat mana yg user pilih
    btn.addEventListener('click', function (e) {
        beratproduk = btn.value; // ambil value dari radio button yg dipilih
    });
});




btnAddToCart.addEventListener('click', async function (e) { // klu btnAddToCart di klik, jlnkan function
    try {  // klu sukses, maka...

        if (!beratproduk) { // klu berat product belum dipilih, mka...
            return alert('Pilih Berat Produk Terlebih Dahulu');
        }


        btnAddToCart.classList.add('btn-pauseload'); // Tambah effect btn spya tidak bisa di klik lagi
        btnAddToCart.innerHTML = `<i class="fas fa-sync-alt fa-spin"></i> Process.. <i class="fas fa-sync-alt fa-spin"></i>`; // kita ubah text button menjadi Please Wait


        window.location.href = await addToCart(); // klu user sdh login, maka akan tidak akan diarahkan ke halaman login


        // btnAddToCart.classList.remove('btn-pauseload'); // Hapus effect btn spya bisa di klik lagi
        // btnAddToCart.innerHTML = `Add To Cart`; // kita ubah text button menjadi add to cart kembali

    } catch (error) {  // klu gagal, maka...

        alert(error);
    }
});





function addToCart() {
    const dataProduct = {
        'idproduct': idproduct,
        'productpic': productpic,
        'nameproduk': namaproduct,
        'kuantitas': kuantitas,
        'hargaproduk': hargaproduct,
        'totalhargaproduk': kuantitas * parseInt(hargaproduct),
        'beratproduk': beratproduk,
        'idpenjual': idpenjual,
        'notelppenjual': notelppenjual
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
