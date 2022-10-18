const productContainer = document.querySelector('.pro-container');  // Kita ambil element dengan class pro-container
let idproduct, productpic, namaproduct, kuantitas, hargaproduct, totalhargaproduk, beratproduk, idpenjual, notelppenjual;




document.addEventListener("click", async function (e) {  // Event listener untuk jika button add to cart di klik
    try { // klu sukses, maka...

        if (e.target.classList.contains('btn-cart')) {

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


            e.target.classList.add('fa-spinner', 'fa-spin'); // kita tambahkan class spinner dan spin

            window.location.href = await addToCart(); // klu user sdh login, maka akan tidak akan diarahkan ke halaman login

            e.target.classList.remove('fa-spinner', 'fa-spin'); // kita hapus class spinner dan spin

        }


    } catch (error) {  // klu gagal, maka...

        alert(error);

    }

});





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