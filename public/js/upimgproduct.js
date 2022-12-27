let files = [];
let dragArea = document.querySelector('.container-upphoto .drag-area');
let input = document.querySelector('.drag-area input');
let button = document.querySelector('.container-upphoto .btn-upphoto');
let select = document.querySelector('.drag-area .visible .select-img');
let container = document.querySelector('.container-img-preview');


// Kalau Tulisan Browse di click, maka...
select.addEventListener('click', () => input.click());


// Kalau elemen input berubah/ada inputan, maka...
input.addEventListener('change', () => {
    let file = input.files;

    // kosongkan array files dlu, jadi tiap user browse image baru maka image di container akan di hapus dlu, dan di ganti dengan image yg baru di browse. Jadi user tau bahwa hrus 1 kali browse untuk upload banyak image sekaligus
    files = [];

    // if user select no image
    if (file.length == 0) {
        return;
    }

    // if user select more than one image and if the select file is not an image, then...
    for (let i = 0; i < file.length; i++) {
        // ambil ekstensi file yg di upload user, dan jika file bkn ekstensi image, maka...
        if (file[i].type.split("/")[0] != 'image') continue;

        // jika file yang di upload user tidak sama dengan file yang sudah ada di dalam array files, maka masukkan file ke dalam array files, dan sebaliknya
        if (!files.some(e => e.name == file[i].name)) files.push(file[i]);
    }

    showImages();
});



// Tampilkan gambar yang di upload user
function showImages() {
    container.innerHTML = files.reduce((prev, curr, index) => {
        return `${prev}
		    <div class="image">
			    <span onclick="delImage(${index})">&times;</span>
			    <img src="${URL.createObjectURL(curr)}" />
			</div>`
    }, '');
}

// Hapus Foto yang di upload user
function delImage(index) {
    files.splice(index, 1);
    showImages();
}



// Drag & Drop
dragArea.addEventListener('dragover', (e) => { // ketika ada file yg di drag ke dalam dragArea, tpi file belum di drop
    e.preventDefault();   // method preventDefault() agar elemen dragArea bisa menerima event drop / to allow drop
    dragArea.classList.add('dragover');
});

// Drag Leave
dragArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragArea.classList.remove('dragover');
});

// klu ada file yg di drop ke dalam dragArea, maka...
dragArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragArea.classList.remove('dragover');

    let file = e.dataTransfer.files;

    // kosongkan array files dlu, jadi tiap user browse image baru maka image di container akan di hapus dlu, dan di ganti dengan image yg baru di browse. Jadi user tau bahwa hrus 1 kali browse untuk upload banyak image sekaligus
    files = [];

    for (let i = 0; i < file.length; i++) {
        // ambil ekstensi file yg di upload user, dan jika file bkn ekstensi image, maka...
        if (file[i].type.split("/")[0] != 'image') continue;

        // jika file yang di upload user tidak sama dengan file yang sudah ada di dalam array files, maka masukkan file ke dalam array files, dan sebaliknya
        if (!files.some(e => e.name == file[i].name)) files.push(file[i]);
    }

    input.files = e.dataTransfer.files; // untuk mengambil file yg di drop ke dalam dragArea lalu masukkan ke dalam input yg ada di dalam dragArea

    showImages();
});



// Effect ketika button Tambah Product di click
let btnTambahProduct = document.querySelector('#form-add-new-product .button-tmbhproduct .btn-add-product');
let formAddNewProduct = document.querySelector('#form-add-new-product');

formAddNewProduct.addEventListener('submit', () => {

    // Kalau Form Add New Product di submit, maka...
    btnTambahProduct.classList.add('btn-pauseload');
    btnTambahProduct.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Loading <i class="fas fa-sync-alt fa-spin"></i>';

});
