const mongoose = require('mongoose'); // import third party module mongoose
const { nanoid } = require("nanoid"); // import nanoid untuk generate id. Untk versi nya perhatikan https://github.com/ai/nanoid/blob/main/CHANGELOG.md#40

// Membuat Schema / struktur data dari collection transactions
const transactionSchema = mongoose.Schema({ // buat struktur databasenya / the way our data is gonna look like on our post data
    transactionid: {  // field yg di simpan ke collection
        type: String,
        required: true,
        default: `ID-${nanoid(10)}`, // generate id dengan panjang 10 karakter
    },
    idpembeli: {  // field yg di simpan ke collection
        type: String,
        required: true, // field idpembeli wajib di isi
    },
    namapembeli: {
        type: String,
        required: true,
    },
    emailpembeli: {
        type: String,
        required: true,
    },
    notelppembeli: {
        type: String,
        required: true,
    },
    deskripsiproduk: {
        type: String,
        required: true,
    },
    keteranganproduk: {
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
    metodepembayaran: {
        type: String,
        required: true,
    },
    paymentgate_invoiceid: {
        type: String,
        default: '',
    }
}, {
    timestamps: { // otomatis membuat field createdAt dan updatedAt. Docs: https://mongoosejs.com/docs/timestamps.html
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});


module.exports = mongoose.model('Transaction', transactionSchema); // export modelnya ke file lainnya, krn kita akan menggunakan modelnya di file lainnya.