const itemContainer = document.querySelector('.cart-item-box');
let btnMethodPayment = document.querySelectorAll('.payment-method .method');
let btnApplyDiscount = document.querySelector('.discount-token .btn-apply-coupon');
let inputDiscountCode = document.getElementById('discount-token');
let cartsubTotal = document.getElementById('subtotal');
let discountCodePrice = document.getElementById('discount-amount');
let totalPrice = document.getElementById('total');
let idproduct, kuantitas, hargaproduct, totalhargaproduk;




btnMethodPayment.forEach(function (e) { // kita looping btn method payment untk ksh effect select pda saat user klik pada btn method payment tersebut.

    e.addEventListener('click', function (e) { // kita ksh event klik msg" btn box payment method

        if (e.target.classList.contains('selected')) { // cek, klu btn itu sdh ter select, ya biarkan mi saja / nothing happen

            return;

        } else { // klu btnnya itu blm pi terselect, maka...

            // tmbah effect select pda btn payment method yg user pilih
            e.target.classList.add('selected');
            e.target.querySelector('i.checkmark').classList.add('fill');

            // hapus effect select pda btn payment method yg user tidak pilih
            btnMethodPayment.forEach(function (x) {

                if (x !== e.target) { // klu btn itu bukan btn yg user pilih, maka hapus effect select pda btn payment method tersebut
                    x.classList.remove('selected');
                    x.querySelector('i.checkmark').classList.remove('fill');
                }

            })

        }

    });

});




document.addEventListener("DOMContentLoaded", async function () { // function yang akan dijalankan saat DOMContentLoaded yaitu untuk mengambil data dan tampilkan ke dalam container kalau ada data
    try { // klu sukses, maka...
        deleteItemContainer(); // kosongkan semua item yg ada di container

        let userItems = await getUserCart(); // kita ambil data Items dari server

        UpdateUI(userItems.cartproducts); // kita tampilkan data Items ke dalam container

        UpdatePriceUI(userItems.cartproducts); // kita tampilkan data harga ke dalam price section

    } catch (err) {  // klu gagal, maka...

        alert(err);

    }
});

document.addEventListener('click', async function (e) { // function untk klu button tambah di klik, maka akan menambahkan jumlah item ke cart user
    try { // klu sukses, maka...

        if (e.target.classList.contains('btn-increment-cart')) { // Kita cek apakah yang diklik adalah tombol tambah

            // Ambil semua data Product yg mau di add to cart
            idproduct = e.target.dataset.idproduct;
            kuantitas = 1;
            hargaproduct = e.target.parentElement.parentElement.parentElement.querySelector('.price #price').innerText.replace(/[^\w\s]/gi, '');
            totalhargaproduk = parseInt(hargaproduct) * kuantitas;
            // Ambil semua data Product yg mau di add to cart


            e.target.classList.add('fa-spin', 'fa-spinner'); // Tambah effect loading

            await plusToCart(); // panggil function plusToCart untk menambahkan jumlah item ke cart user

            e.target.classList.remove('fa-spin', 'fa-spinner'); // Hapus effect loading

            deleteItemContainer();  // kosongkan semua item yg ada di container

            let userItems = await getUserCart(); // kita ambil data Items dari server

            UpdateUI(userItems.cartproducts); // kita tampilkan data Items ke dalam container

            UpdatePriceUI(userItems.cartproducts); // kita tampilkan data harga ke dalam price section

        }

    } catch (error) {  // klu gagal, maka...

        alert(error);

    }
});

document.addEventListener('click', async function (e) { // function untk klu button kurang di klik, maka akan mengurangkan jumlah item ke cart user
    try { // klu sukses, maka...

        if (e.target.classList.contains('btn-decrement-cart')) { // Kita cek apakah yang diklik adalah tombol kurang

            // Ambil semua data Product yg mau di add to cart
            idproduct = e.target.dataset.idproduct;
            kuantitas = 1;
            hargaproduct = e.target.parentElement.parentElement.parentElement.querySelector('.price #price').innerText.replace(/[^\w\s]/gi, '');
            totalhargaproduk = parseInt(hargaproduct) * kuantitas;
            // Ambil semua data Product yg mau di add to cart


            e.target.classList.add('fa-spin', 'fa-spinner'); // Tambah effect loading


            // Jika jumlah item sama dgn 1, dan user masih klik tombol kurang, maka item akan langsung dihapus dari cart
            let angkaqty = e.target.parentElement.parentElement.querySelector('#quantity').innerText;
            if (angkaqty == 1) { // Kita cek apakah jumlah item sudah 1, jika sudah 1 maka akan menghapus item dari cart user
                window.location.href = await delToCart(); // panggil function delToCart untk hapus item dari cart user dan refresh page
                return; // return spya code dibawahnya tidak dijalankan
            }
            // Jika jumlah item sama dgn 1, dan user masih klik tombol kurang, maka item akan langsung dihapus dari cart



            await minToCart(); // panggil function minToCart untk mengurangkan jumlah item ke cart user

            e.target.classList.remove('fa-spin', 'fa-spinner'); // Hapus effect loading

            deleteItemContainer();  // kosongkan semua item yg ada di container

            let userItems = await getUserCart(); // kita ambil data Items dari server

            UpdateUI(userItems.cartproducts); // kita tampilkan data Items ke dalam container

            UpdatePriceUI(userItems.cartproducts); // kita tampilkan data harga ke dalam price section

        }

    } catch (error) {  // klu gagal, maka...

        alert(error);

    }
});

document.addEventListener('click', async function (e) { // function untk klu button Delete di klik, maka akan Hapus Item dari cart user
    try { // klu sukses, maka...

        if (e.target.classList.contains('btn-delete-cart')) { // Kita cek apakah yang diklik adalah tombol kurang

            // Ambil semua data Product yg mau di add to cart
            idproduct = e.target.dataset.idproduct;
            // Ambil semua data Product yg mau di add to cart


            e.target.classList.add('fa-spin'); // Tambah effect loading spin


            window.location.href = await delToCart(); // panggil function delToCart untk hapus item dari cart user dan refresh page

            e.target.classList.remove('fa-spin'); // Hapus effect loading spin

        }

    } catch (error) {  // klu gagal, maka...

        alert(error);

    }
});

btnApplyDiscount.addEventListener('click', async function (e) { // function untk klu button Apply Discount di klik, maka akan mengurangkan harga total

    e.target.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`; // Tambah effect loading

    if (!inputDiscountCode.value) { // Kita cek apakah inputan kosong atau tidak
        alert('Kode Voucher Tidak Boleh Kosong');
        e.target.innerHTML = `Apply`; // Hapus effect loading
        return;
    }

    if (inputDiscountCode.value === 'Makan') { // klu kode voucher benar, maka...

        inputDiscountCode.setAttribute('readonly', ''); // disable inputan kode voucher klu sdh sukses apply

        let nilaiVoucher = 10 / 100; // nilai voucher 10%

        let priceTotal = totalPrice.innerText.replace(/[^\w\s]/gi, ''); // Ambil harga total

        let priceDiscount = priceTotal * nilaiVoucher; // Hitung harga discount berdasarkan total harga

        let priceTotalAfterDiscount = priceTotal - (priceDiscount); // Hitung harga total setelah dikurangi voucher

        discountCodePrice.innerText = `${formatRupiah(priceDiscount)}`; // Tampilkan harga discount ke dalam UI

        totalPrice.innerText = `${formatRupiah(priceTotalAfterDiscount)}`; // Tampilkan harga total setelah dikurangi voucher


        e.target.innerHTML = `Apply`; // Hapus effect loading
        e.target.disabled = true; // disable button Apply Discount

        return; // return spya code dibawahnya tidak dijalankan

    } else { // klu kode voucher salah, maka...

        alert('Maaf Kode Voucher Salah / Tidak Tersedia');
        e.target.innerHTML = `Apply`; // Hapus effect loading

        return; // return spya code dibawahnya tidak dijalankan

    }

});





function getUserCart() { // function untuk GET data dari server
    return fetch('/api/v1/add-to-cart')
        .then(status)
        .then((response) => { return response.datausercart });
};

function plusToCart() {  // function untk POST atau tambah product ke cart User
    let dataProduct = {
        'idproduct': idproduct,
        'kuantitas': kuantitas,
        'hargaproduk': hargaproduct,
        'totalhargaproduk': totalhargaproduk,
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

function minToCart() {  // function untk POST atau Kurang product ke cart User

    let dataProduct = {
        'idproduct': idproduct,
        'kuantitas': kuantitas,
        'hargaproduk': hargaproduct,
        'totalhargaproduk': totalhargaproduk,
    };

    return fetch(`/api/v1/min-add-to-cart`, {
        method: "POST",
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(dataProduct)
    })
        .then((response) => {
            return response.url;
        });

}

function delToCart() {  // function untk DELETE atau Hapous item product dari cart User
    let dataProduct = {
        'idproduct': idproduct,
    };

    return fetch(`/api/v1/del-add-to-cart`, {
        method: "DELETE",
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(dataProduct)
    })
        .then((response) => {
            return response.url;
        });
}





function UpdateUI(data) {  // Function untuk memasukkan data item ke dalam container

    let items = ''; // inisialisasi variabel items

    data.forEach(function (item) {  // Kita looping data tiap array di products
        items = itemFrags(item);  // hsil dri function productFrags kita masukkan ke dalam variabel products

        let itemsNode = new DOMParser().parseFromString(items, 'text/html'); // kita ubah isi dari variabel item yg isinya string, menjadi DOM element agar bisa kita appendChild ke dalam container.

        itemContainer.appendChild(itemsNode.body.firstChild);  // Kita masukkan data item yg sdh dlm btk element node ke dalam container
    });

}

function UpdatePriceUI(data) {  // Function untuk memasukkan data harga ke dalam container

    let hargaTotal = 0; // inisialisasi variabel hargaTotal

    data.forEach(function (item) {  // Kita looping data cartproducts
        let totalhargaproduk = item.totalhargaproduk.replace(/[^\w\s]/gi, '');
        hargaTotal += parseInt(totalhargaproduk);  // tambah nilai total harga produk
    });

    hargaTotal = formatRupiah(hargaTotal); // kita ubah format harga total menjadi format rupiah

    cartsubTotal.innerText = hargaTotal; // tampilkan hargaTotal ke dalam nilai cart sub total

    totalPrice.innerText = hargaTotal; // tampilkan hargaTotal ke dalam nilai total price


    let payAmountButton = document.getElementById('payAmount');  // kita select elemen nilai dari button pay checkout

    payAmountButton.innerHTML = hargaTotal; // tampilkan hargaTotal ke dalam nilai pay amount button

    return;
}

function itemFrags(m) {
    return `
    <div class="product-card">

        <div class="card">
            <!-- Gambar Item -->
            <div class="img-box">
                <img src="${m.productpic}" alt="${m.nameproduk}" width="80px" height="80px"
                    class="product-img">
            </div>

            <!-- Nama & Detail Item -->
            <div class="detail">

                <h4 class="product-name">${m.nameproduk}</h4>

                <div class="wrapper">

                    <div class="product-qty">
                        <!-- Tombol Kurang -->
                        <button id="decrement" class="btn-decrement-cart" data-idproduct="${m.idproduct}">
                            <i class="far fa-minus btn-decrement-cart" data-idproduct="${m.idproduct}"></i>
                        </button>

                        <!-- Jumlah Item -->
                        <span id="quantity">${m.kuantitas}</span>

                        <!-- Tombol Tambah -->
                        <button id="increment" class="btn-increment-cart" data-idproduct="${m.idproduct}">
                            <i class="far fa-plus btn-increment-cart" data-idproduct="${m.idproduct}"></i>
                        </button>
                    </div>

                    <div class="price">
                        Rp <span id="price">${m.hargaproduk}</span>
                    </div>

                </div>

                <div class="weight">
                    Berat : <span id="beratproduk">${m.beratproduk}</span>
                </div>

            </div>

            <!-- Button Hapus Item -->
            <button class="product-close-btn btn-delete-cart" data-idproduct="${m.idproduct}">
                <i class="far fa-times btn-delete-cart" data-idproduct="${m.idproduct}"></i>
            </button>

            <!-- Input Hidden -->
            <input type="hidden" name="notelppenjual" value="${m.notelppenjual}">

        </div>

    </div>
`
};





function formatRupiah(nilai) { // function untk mengubah angka menjadi format rupiah

    let format = nilai.toString().split('').reverse().join(''),
        convert = format.match(/\d{1,3}/g);
    rupiah = convert.join('.').split('').reverse().join('');

    return rupiah;
}

function deleteItemContainer() { // function untk kosongkan container, sblm dimasukkan data item yg baru

    let itemContainerDelete = document.querySelectorAll('.cart-item-box>div'); // select semua data yg ada di container
    itemContainerDelete.forEach((e) => {  // lalu Kita kosongkan dlu isi dari product container, sebelum di input data baru
        e.remove();
    })

    return;
}

