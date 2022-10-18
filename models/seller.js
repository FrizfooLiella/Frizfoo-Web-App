const mongoose = require('mongoose'); // import third party module mongoose

// Membuat Schema / struktur data dari collection sellers
const productsSchema = new mongoose.Schema({
    productpicid: {
        type: [String],
        default: [],
        required: true,
    },
    idpenjual: {
        type: String,
        required: true,
        default: '',
    },
    penjual: {
        type: String,
        required: true,
    },
    kotapenjual: {
        type: String,
        required: true,
    },
    notelppenjual: {
        type: String,
        required: true,
    },
    namaproduct: {
        type: String,
        required: true,
    },
    merekproduct: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    banyakterjual: {
        type: Number,
        default: 0,
        required: true,
    },
    hargaproduct: {
        type: String,
        required: true,
    },
    deskripsiproduct: {
        type: String,
        required: true,
    },
    beratproduct: {
        type: [String],
        default: [],
        required: true,
    },
    stokproduct: {
        type: String,
        required: true,
    },
    masasimpanproduct: {
        type: String,
        required: true,
    },
    // date: {   // field date untk tandakan waktu pembuatan data
    //     type: Date,
    //     default: Date.now,
    // },
}, {
    timestamps: { // otomatis membuat field createdAt dan updatedAt. Docs: https://mongoosejs.com/docs/timestamps.html
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});


const sellerSchema = mongoose.Schema({ // buat struktur databasenya / the way our data is gonna look like on our post data
    idpemiliktoko: {  // field yg di simpan ke collection
        type: String,
        required: true,
    },
    namatoko: {  // field yg di simpan ke collection
        type: String,
        required: true,  // field username wajib di isi
    },
    alamat: {   // field yg di simpan ke collection
        type: String,
        default: 'Please Update',
        required: true,  // field username wajib di isi
    },
    kota: {     // field yg di simpan ke collection
        type: String,
        default: 'Please Update',
        required: true,  // field username wajib di isi
    },
    kecamatan: {   // field yg di simpan ke collection
        type: String,
        default: 'Please Update',
        required: true,  // field username wajib di isi
    },
    provinsi: {    // field yg di simpan ke collection
        type: String,
        default: 'Please Update',
        required: true,  // field username wajib di isi
    },
    kodepos: {   // field yg di simpan ke collection
        type: String,
        default: 0,
        required: true,  // field username wajib di isi
    },
    email: {    // field yg di simpan ke collection
        type: String,
        required: true,  // field username wajib di isi
        unique: true, // supaya email tidak boleh sama
    },
    notelp: {    // field yg di simpan ke collection
        type: String,
        required: true,  // field username wajib di isi
    },
    products: {
        type: [productsSchema],
        default: [],
    },
    // date: {   // field date untk tandakan waktu pembuatan data
    //     type: Date,
    //     default: Date.now
    // }
}, {
    timestamps: { // otomatis membuat field createdAt dan updatedAt. Docs: https://mongoosejs.com/docs/timestamps.html
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});


module.exports = mongoose.model('Seller', sellerSchema); // export modelnya ke file lainnya, krn kita akan menggunakan modelnya di file lainnya.



// FORMAT DATA YANG AKAN DISIMPAN KE COLLECTION, KYK INI
// let Seller = mongoose.model('Seller', sellerSchema);
// let seller = new Seller({
//     idpemiliktoko: '62fe5ccc96fb56ff7f15c992',
//     namatoko: 'Sahabat Frozen Shop',
//     alamat: 'Jl. Rappocini Raya No.11',
//     kota: 'Makassar',
//     kecamatan: 'Rappocini',
//     provinsi: 'Sulawesi Selatan',
//     kodepos: '90222',
//     email: 'karlitheodorus@gmail.com',
//     notelp: '081943442111',
//     products: {
//         productpicid: ['1DwjLB_b2_M3kkLZeNvvgNXC5vvuAC7gb', '13mZWjUhW7bfm3Wp0bGYz4l3DiGDP_tX9', '1yummB0F7pJ6uZoOOs0M0mimKBcUUHdlz', '1JrbZBBx6BP-ybWTs4Kzj6wua6hKRytYr'],
//         idpenjual: '62ff412e7d46052b538f590d',
//         penjual : 'Sahabat Frozen Shop',
//         kotapenjual: 'Makassar',
//         notelppenjual: '081943442111',
//         namaproduct: 'Bakso Ikan Cedea',
//         merekproduct: 'Cedea',
//         rating: 5,
//         hargaproduct: '32.000',
//         deskripsiproduct: 'CEDEA Baso Ikan Besar 500gBakso Ikan Besar merupakan makanan instan yang terbuat dari ikan olahan pilihan dan diproses secara higienis bersertifikasi HALAL dari MUI dan diproduksi berdasarkan standar BPOM RI Terbuat dari Ikan Olahan Berkualitas ini dapat disajikan dengan berbagai menu makanan lainnya.',
//         beratproduct: ['500 gram'],
//         stokproduct: '100',
//         masasimpanproduct: '6 Bulan',
//     }
// });

// seller.save((err, data) => {  Untk Save ke database
//     console.log(data);
// })




// let seller = new Seller({  // Format kalau User mau Daftar Toko Baru di Frizfoo
//     idpemiliktoko: '62fe5ccc96fb56ff7f15c992',
//     namatoko: 'Theo Coba Frozen Shop',
//     alamat: 'Jl. Sungai Saddang 1 No 1C',
//     kota: 'Makassar',
//     kecamatan: 'Maradekaya',
//     provinsi: 'Sulawesi Selatan',
//     kodepos: '90142',
//     email: 'karlitheodorus@gmail.com',
//     notelp: '085825351463',
// });

// seller.save((err, data) => {  // Untk Save ke database
//     console.log(data);
// });




// Seller.updateOne(   // Query untk push data baru ke array products
//     {
//         _id: '62ff412e7d46052b538f590d' // kriteria document yg akan diupdate
//     },
//     {
//         $push: { // update data array
//             products: {
//                 productpicid: ['1DwjLB_b2_M3kkLZeNvvgNXC5vvuAC7gb', '13mZWjUhW7bfm3Wp0bGYz4l3DiGDP_tX9', '1yummB0F7pJ6uZoOOs0M0mimKBcUUHdlz', '1JrbZBBx6BP-ybWTs4Kzj6wua6hKRytYr'],
//                 idpenjual: '62ff412e7d46052b538f590d',
//                 penjual : 'Sahabat Frozen Shop',
//                 kotapenjual: 'Makassar',
//                 notelppenjual: '081943442111',
//                 namaproduct: 'Cedea Fishroll',
//                 merekproduct: 'Cedea',
//                 rating: 5,
//                 hargaproduct: '28.000',
//                 deskripsiproduct: 'CEDEA FISH ROLL, MERUPAKAN MAKANAN INSTAN YANG TERBUAT DARI IKAN OLAHAN PILIHAN DAN DIPROSES SECARA HIGIENIS INI DAPAT DISAJIKAN DENGAN BERBAGAI MENU MAKANAN LAINNYA.SEMUA ORDERAN YANG MASUK DIKIRIM H+1, PENGIRIMAN DILAKUKAN SETIAP SENIN SAMPAI SABTU, HARI MINGGU DAN TANGGAL MERAH LIBUR',
//                 beratproduct: ['500 gram'],
//                 stokproduct: '50',
//                 masasimpanproduct: '12 Bulan',
//             }
//         }
//     }
// ).then((result) => {
//     console.log(result);
// });




// Seller.updateOne(   // Query untk Hapus data Product di array products
//     {
//         _id: '62ff412e7d46052b538f590d' // kriteria document yg akan diupdate
//     },
//     {
//         $pull: { // update data array
//             products: {
//                 _id: '631c1eec0c511982ecea6b9a' // kriteria document yg akan hapus dari array products
//             }
//         }
//     }
// ).then((result) => {
//     console.log(result);
// });





// Seller.updateOne({ // Query Untuk Update 1 data product di array products pada document Seller tertentu berdasarkan id
//     _id: '6343ddc0f047a0aa98ec4825',
//     'products._id': '6343e16660f3d8518f0f4f85'
// }, {
//     $set: { // set data cart yg baru
//         "products.$.banyakterjual": '10', // set kuantitasBaru
//     }
// })
//     .then((result) => { // klu sukses, maka...

//         console.log(result);

//     });





// Seller.deleteOne(   // hapus Document Seller dari collection Sellers berdasarkan id
//     {
//         _id: '631c1e1e517b143d0e2a5e81'
//     }
// )
//     .then((result) => {  // klu sukses hapus, maka...
//         console.log(result);
//     });