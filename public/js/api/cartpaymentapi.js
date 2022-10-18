const buttonPayOut = document.querySelector('.btn-checkout-pay');
let MethodPayment = document.querySelectorAll('.payment-method .method');
let tableContainer = document.querySelector('#tbody-user-invoice');
let UserPayMethod = '';
let itemsInCart = [];
let totalAmount;
let descriptionInvoice = '';




document.addEventListener("DOMContentLoaded", async function () { // function yang akan dijalankan saat DOMContentLoaded yaitu untuk mengambil data dan tampilkan ke dalam container kalau ada data
    try { // klu sukses, maka...

        tableContainer.innerHTML = ''; // kosongkan table container

        tableContainer.innerHTML = `<tr><td colspan="6" style="font-size: 1.8rem"> <i class="far fa-spinner fa-spin"></i> Loading <i class="far fa-spinner fa-spin"></i></td></tr>`; // tampilkan Effect loading dlu

        let hasilUserInvoice = await ambilInvoice(); // ambil data invoice yg user pernah buat


        if (hasilUserInvoice.dataInvoice.length === 0) { // klu data invoice kosong, maka...
            tableContainer.innerHTML = `<tr><td colspan="6" style="font-size: 1.8rem"> <i class="far fa-frown"></i> Belum Ada Pesanan <i class="far fa-frown"></i></td></tr>`; // tampilkan pesan
            return;
        }

        UpdateUITable(hasilUserInvoice.dataInvoice); // update UI table dgn data yg baru

    } catch (err) {  // klu gagal, maka...

        alert(err);

    }
});

document.addEventListener('click', async function (e) { // function untk klu button Cancel di klik, maka akan Close Invoice
    try { // klu sukses, maka...

        if (e.target.classList.contains('btn-cancel-invoice')) { // Kita cek apakah yang diklik adalah tombol Cancel

            e.target.innerHTML = `<i class="far fa-spinner fa-spin"></i>`; // tampilkan effect loading


            // Ambil data invoice Id yg akan di cancel
            let idInvoice = e.target.dataset.idinvoice;
            // Ambil data invoice Id yg akan di cancel

            await cancelInvoice(idInvoice); // panggil function cancelInvoice untk close invoice yg user pilih


            setTimeout(async () => { // tahan 3 detik dlu, baru ambil data invoice dari database user

                let hasilUserInvoice = await ambilInvoice(); // ambil data invoice yg user pernah buat

                if (hasilUserInvoice.dataInvoice.length === 0) { // klu data invoice kosong, maka...
                    tableContainer.innerHTML = `<tr><td colspan="6" style="font-size: 1.8rem"> <i class="far fa-frown"></i> Belum Ada Pesanan <i class="far fa-frown"></i></td></tr>`; // tampilkan pesan
                    return;
                }

                UpdateUITable(hasilUserInvoice.dataInvoice); // update UI table dgn data yg baru

            }, 3000); // 3000ms = 3 detik

        }

    } catch (error) {  // klu gagal, maka...

        alert(error);

    }
});

document.addEventListener('click', async function (e) { // function untk klu button Delete di klik, maka akan Close Invoice
    try { // klu sukses, maka...

        if (e.target.classList.contains('btn-del-invoice')) { // Kita cek apakah yang diklik adalah tombol Delete

            e.target.innerHTML = `<i class="far fa-spinner fa-spin"></i>`; // tampilkan effect loading


            // Ambil data invoice Id yg akan di delete dari database user
            let idInvoice = e.target.dataset.idinvoice;
            // Ambil data invoice Id yg akan di delete dari database user

            await delInvoice(idInvoice); // panggil function delInvoice untk hapus invoice dari database user

            let hasilUserInvoice = await ambilInvoice(); // ambil data invoice yg user pernah buat

            if (hasilUserInvoice.dataInvoice.length === 0) { // klu data invoice kosong, maka...
                tableContainer.innerHTML = `<tr><td colspan="6" style="font-size: 1.8rem"> <i class="far fa-frown"></i> Belum Ada Pesanan <i class="far fa-frown"></i></td></tr>`; // tampilkan pesan
                return;
            }

            UpdateUITable(hasilUserInvoice.dataInvoice); // update UI table dgn data yg baru

        }

    } catch (error) {  // klu gagal, maka...

        alert(error);

    }
});

buttonPayOut.addEventListener('click', async function (e) { // klu btn checkout pay diklik, maka...
    try { // klu sukses, maka...

        checkUserPayMethod(); // mengecek method payment yang dipilih oleh user


        if (!UserPayMethod) { // klu user nd pilih method payment, maka...
            alert('Please select payment method');
            return;
        }


        if (UserPayMethod === 'WhatsApp') { // klu user memilih method payment payout via WhatsApp, maka...

            checkoutViaWa(); // menjalankan fungsi chatPayoutWa()

        }


        if (UserPayMethod === 'Virtual Account Payment') { // klu user memilih method payment payout via virtual account, maka...
            let itemCart = document.querySelectorAll('.cart-item-box .product-card'); // ambil item yg ada di cart semua dlm btk nodelist

            if (itemCart.length === 0) { // klu cart kosong, maka...
                alert('Cart is empty');
                return;
            }

            // Ambil semua data Product yg mau di pakai
            itemCart.forEach(function (data) { // untk ambil data tiap item di cart dan masukkan ke array itemsInCart
                let idproduct = data.querySelector('button.product-close-btn').dataset.idproduct;
                let productpic = data.querySelector('.img-box img').src;
                let name = data.querySelector('.product-name').innerText;
                let price = data.querySelector('#price').innerText.replace(/[^\w\s]/gi, '');
                let qty = data.querySelector('#quantity').innerText;
                let urlproduct = `${idproduct}`;
                descriptionInvoice += `${qty} ${name} dan `;

                itemsInCart.push({  // Masukkan object ke array itemsInCart
                    'productpic': productpic,
                    'name': name,
                    'quantity': qty,
                    'price': price,
                    'url': urlproduct
                });
            });

            totalAmount = document.querySelector('#total').innerText.replace(/[^\w\s]/gi, ''); // ambil total amount seluruh item dari cart
            // Ambil semua data Product yg mau di pakai


            buttonPayOut.innerText = 'Please Wait...'; // ubah text button checkout pay menjadi 'Please Wait...'

            let paymentUrl = await checkoutVirtualAccount(); // menjalankan fungsi checkoutVirtualAccount()


            window.open(paymentUrl.dataInvoiceUrl, '_blank'); // buka payment url di browser

            buttonPayOut.innerHTML = `<b>Pay</b> Rp <span id="payAmount">${formatRupiah(totalAmount)}</span>`; // ubah kembali text btn menjadi pay Rp ...



            tableContainer.innerHTML = ''; // kosongkan table container

            tableContainer.innerHTML = `<tr><td colspan="6" style="font-size: 1.8rem"> <i class="far fa-spinner fa-spin"></i> Loading <i class="far fa-spinner fa-spin"></i></td></tr>`; // tampilkan Effect loading dlu


            setTimeout(async () => { // tahan 3 detik dlu, baru ambil data invoice dari database user

                let hasilUserInvoice = await ambilInvoice(); // ambil data invoice yg user pernah buat


                if (hasilUserInvoice.dataInvoice.length === 0) { // klu data invoice kosong, maka...
                    tableContainer.innerHTML = `<tr><td colspan="6" style="font-size: 1.8rem"> <i class="far fa-frown"></i> Belum Ada Pesanan <i class="far fa-frown"></i></td></tr>`; // tampilkan pesan
                    return;
                }

                UpdateUITable(hasilUserInvoice.dataInvoice); // update UI table dgn data yg baru

            }, 3000); // 3000ms = 3 detik

        }

    } catch (error) { // klu gagal, maka...

        alert(error);

    }

});





function checkoutViaWa() { // function untuk checkout via WhatsApp

    let waAPI = '';
    let textChatWA = '';
    let jdlProduk = '';
    let notelpSeller = [];
    let notelpSellerFix = '';
    let itemCart = document.querySelectorAll('.cart-item-box .product-card');


    if (itemCart.length === 0) { // klu cart kosong, maka...
        alert('Cart is empty');
        return;
    }



    itemCart.forEach(function (item) { // untk ambil no telp seller dari setiap item cart
        notelpSeller.push(item.querySelector('input[name="notelppenjual"]').value);
    });

    function allAreEqual(arr) { // fungsi untuk mengecek apakah semua elemen array sama atau tidak untk cek apakah produk yang dibeli user itu berasal dari toko yang sama atau tidak

        const result = arr.every((element) => {
            if (element === arr[0]) {
                return true;
            }
        });

        return result;
    }

    if (!allAreEqual(notelpSeller)) { // klu user beli produk yg berasal dari toko yg berbeda, maka...
        alert(`Untuk Checkout Melalui WhatsApp \nHarap Melakukan Checkout Produk Yang Hanya Berada Dalam 1 Toko Yang Sama`); // tampilkan pesan
        return;
    }



    itemCart.forEach(function (item) { // untk ambil kuantitas serta judul produk dari setiap item di cart user
        jdlProduk += item.querySelector('#quantity').innerText + ' ' + item.querySelector('.product-name').innerText + ' dan ';
    })


    textChatWA = 'Halo, saya mau pesan produk yang saya liat di Website Frizfoo. ' + '\n\n' + 'Produk yang saya mau pesan yaitu : ';


    // untk pastikan format hp seller hrus berformat 62
    if (notelpSeller[0].substring(0, 1) === '0') { // klu notelp dpnnya 0, mka ubah jdi 62
        notelpSellerFix = notelpSeller[0].replace(/^0/, '62');
    }
    else
        if (notelpSeller[0].substring(0, 3) === '+62') { // klu notelp dpnnya +62, mka ubah jdi 62
            notelpSellerFix = notelpSeller[0].replace(/^\+62/, '62');
        }
        else { // klu notelp dpnnya 62, maka tak diubah
            notelpSellerFix = notelpSeller[0];
        }
    // untk pastikan format hp seller hrus berformat 62



    waAPI = `https://api.whatsapp.com/send?phone=${notelpSellerFix}&text=`;

    textChatWA += jdlProduk.substring(0, jdlProduk.length - 4) + '\n\n';

    window.open(waAPI + textChatWA, '_blank'); // buka tab baru untuk mengirim pesan Checkout ke seller via WhatsApp

}

function checkoutVirtualAccount() {  // function untuk checkout via virtual account

    let dataInvoiceItem = {
        'itemsInCart': itemsInCart,
        'totalAmount': totalAmount,
        'descriptionInvoice': `Pembelian Produk ${descriptionInvoice.substring(0, descriptionInvoice.length - 4)}`
    };

    itemsInCart = []; // kosongkan array itemsInCart untuk menghindari duplikasi data invoice jika user melakukan checkout lagi

    descriptionInvoice = ''; // kosongkan isi variabel descriptionInvoice supaya tidak terjadi duplikasi deskripsi produk jika user melakukan checkout lagi

    return fetch(`/api/v1/payment-virtual`, {
        method: "POST",
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(dataInvoiceItem)
    })
        .then(status)  // cek status response pada function status
        .then((response) => {
            return response;
        });

}

function ambilInvoice() { // function untk ambil Invoice yg user pernah buat user sebelumnya

    return fetch(`/api/v1/get-invoice`, {
        method: 'GET',
    })
        .then(status)  // cek status response pada function status
        .then((response) => {
            return response; // send data hasil fetch 
        })

}

function cancelInvoice(id) { // function untk cancel invoice

    return fetch(`/api/v1/close-invoice/${id}`, {
        method: 'PUT',
    })
        .then(status) // cek status response pada function status
}

function delInvoice(id) {

    return fetch(`/api/v1/del-invoice/${id}`, {
        method: 'DELETE',
    })
        .then(status);  // cek status response pada function status
}





function UpdateUITable(data) { // function untk masukkan data invoice ke dalam table

    tableContainer.innerHTML = "";  // Kita kosongkan dlu isi dari tbody, sebelum di input data baru
    let table = ''; // inisialisasi variabel table

    data.forEach(function (item) {  // Kita looping data tiap array di dataInvoice 
        table += invoiceFrags(item);  // Kita tambahkan data ke variable penampung yaitu table
    });

    return tableContainer.innerHTML = table;  // Kita masukkan data yang sudah di looping ke dalam tbody

}

function invoiceFrags(m) { // untk membuat template invoice

    function penentuStatus(stat) {
        if (stat === 'PAID') {
            return `<p class="status status-paid"> Paid</p> `;
        } else
            if (stat === 'PENDING') {
                return `<p class="status status-pending"> Pending</p> `;
            } else
                if (stat === 'EXPIRED') {
                    return `<p class="status status-expired"> Expired</p> `;
                } else
                    if (stat === 'SETTLED') {
                        return `<p class="status status-setteld"> Setteld</p> `;
                    }
    }

    function isoDateParse(date) { // untk ubah format date dari ISO ke format Indonesia
        let d = new Date(date); // ubah format date dari ISO ke format Date

        let day = d.getDate(); // ambil tanggal
        let month = d.getMonth() + 1; // ambil bulan
        let year = d.getFullYear(); // ambil tahun
        let hour = d.getHours();    // ambil jam
        let minute = d.getMinutes(); // ambil menit

        if (day < 10) { // klu tanggal < 10, maka tambahkan 0 di depannya
            day = '0' + day;
        }

        if (month < 10) { // klu bulan < 10, maka tambahkan 0 di depannya
            month = '0' + month;
        }

        if (hour < 10) { // klu jam < 10, maka tambahkan 0 di depannya
            hour = '0' + hour;
        }

        if (minute < 10) { // klu menit < 10, maka tambahkan 0 di depannya
            minute = '0' + minute;
        }

        return `${day}-${month}-${year} ${hour}:${minute}`;

    }

    function btnAction(dataStatus) { // function untk tentukan button action apa yg akan ditampilkan
        if (dataStatus === 'PAID') {
            return `
                <button class="btn-refdel btn-del-invoice" data-idinvoice="${m.id}">Delete</button>
            `;
        } else
            if (dataStatus === 'PENDING') {
                return `
                    <button class="btn-refdel btn-del-invoice" data-idinvoice="${m.id}">Delete</button>
                    <button class="btn-refdel btn-cancel-invoice" data-idinvoice="${m.id}">Cancel</button>
                `;
            } else
                if (dataStatus === 'EXPIRED') {
                    return `
                        <button class="btn-refdel btn-del-invoice" data-idinvoice="${m.id}">Delete</button>
                    `;
                } else
                    if (dataStatus === 'SETTLED') {
                        return `
                            <button class="btn-refdel btn-del-invoice" data-idinvoice="${m.id}">Delete</button>
                        `;
                    }
    }

    return `
        <tr>
            <td>${m.customer.given_names}</td>
            <td>${m.description}</td>
            <td>Rp. <span class="total-amount-price">${formatRupiah(m.amount)}</span></td>
            <td>
                ${penentuStatus(m.status)}
            </td>
            <td>${isoDateParse(m.created)}</td>
            <td>
                <span class="action-btn">
                    ${btnAction(m.status)}
                </span>
            </td>
        </tr>
    `

}





function checkUserPayMethod() { // fungsi untuk mengecek method payment yang dipilih oleh user

    MethodPayment.forEach(function (btn) { // melakukan looping pada method payment
        if (btn.classList.contains('selected')) {
            UserPayMethod = btn.querySelector('span').innerText; // mengambil text dari span pada method payment yang dipilih
        }
    });

}

function formatRupiah(nilai) { // function untk mengubah angka menjadi format rupiah

    let format = nilai.toString().split('').reverse().join(''),
        convert = format.match(/\d{1,3}/g);
    rupiah = convert.join('.').split('').reverse().join('');

    return rupiah;
}