const mongoose = require('mongoose'); // import third party module mongoose

// Membuat Schema / struktur data dari collection users
const userSchema = mongoose.Schema({ // buat struktur databasenya / the way our data is gonna look like on our post data
    userpicid: {  // field yg di simpan ke collection
        type: String,
        required: true,
        default: '1a07U-OnKg9Uy0VSjaJXERWM1vGrFI0RV',
    },
    fullname: {  // field yg di simpan ke collection
        type: String,
        required: true,  // field username wajib di isi
    },
    username: {  // field yg di simpan ke collection
        type: String,
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
    password: {    // field yg di simpan ke collection
        type: String,
        required: true,  // field password wajib di isi
    },
    password_confirmation: {    // field yg di simpan ke collection
        type: String,
        required: true,  // field password wajib di isi
    },
    gender: {
        type: String,
        default: 'Unknown',
    },
    alamat: {   // field yg di simpan ke collection
        type: String,
        default: 'Please Update',
    },
    kota: {     // field yg di simpan ke collection
        type: String,
        default: 'Please Update',
    },
    kecamatan: {   // field yg di simpan ke collection
        type: String,
        default: 'Please Update',
    },
    provinsi: {    // field yg di simpan ke collection
        type: String,
        default: 'Please Update',
    },
    kodepos: {   // field yg di simpan ke collection
        type: String,
        default: 0,
    },
    cartproducts: {
        type: [{
            idproduct: String,
            productpic: String,
            nameproduk: String,
            kuantitas: Number,
            hargaproduk: String,
            totalhargaproduk: String,
            beratproduk: String,
            idpenjual: String,
            notelppenjual: String,
            _id: false, // supaya tidak object id di dalam array
        }],
    },
    history_invoice: {
        type: [{
            idinvoice: String,
            date: {
                type: Date,
                default: Date.now,
            },
            _id: false, // supaya tidak object id di dalam array
        }],
    },
    idtokouser: {
        type: String,
        default: '',
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


module.exports = mongoose.model('User', userSchema); // export modelnya ke file lainnya, krn kita akan menggunakan modelnya di file lainnya.