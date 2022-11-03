const express = require('express');  // import third party module express
const cors = require('cors'); // import third party middleware cors for express cross origin resource sharing
const fileUpload = require("express-fileupload");  // import third party middleware express yaitu express-fileupload
const expressLayouts = require('express-ejs-layouts'); // import third party middleware express yaitu express-ejs-layouts
const session = require('express-session'); // import express middleware yaitu express-session


const MongoDBStore = require('connect-mongodb-session')(session); // import third party module connect-mongodb-session untk store session ke database mongoDB
const flash = require('connect-flash'); // import thrid party middleware yaitu untuk flash message
const dotenv = require('dotenv'); // import third party module dotenv to read .env file


const cookies = require('cookie-parser'); // import third party module cookie-parser
const methodOverride = require('method-override'); // import third party middleware yaitu method-override


const appcontroller = require('./routes/appcontroller'); // import local module appcontroller.js
const isAuth = require('./middleware/is-auth.js'); // import local middleware dari is-auth.js
const authWarn = require('./middleware/auth-warn.js'); // import local middleware dari auth-warn.js
const { connectToDb } = require('./utils/db.js'); // import local module dari utils/db.js dan ambil nilai dari property connectToDb


const app = express(); // run express function
const port = process.env.PORT || 3000; // pakai port 3000, jika tidak ada maka pakai port yg ada di environment tempt kita deploy web app kita
dotenv.config(); // to read .env file from this file



app.set('view engine', 'ejs'); // Tell Express to use view / Template engine Ejs (Embedded JavaScript templates)
app.use(expressLayouts); // ksih tau Express untuk Gunakan view engine Ejs dengan bantuan Layoutnya adalah express-ejs-layouts
app.set("layout extractScripts", true); // Untuk letakkan semua blok skrip di akhir file sblm /body


app.use(cors()); // set cors Enable All CORS Requests / atur cors supaya bisa di akses dari domain manampun
app.use(express.urlencoded({ extended: true })); // kasih tau express bahwa data apapun yang di post ke server, harus di parsing dlu URL-encode bodiesnya agar bisa kita gunakan
app.use(express.json()); // This is a built-in middleware function in Express. It parses incoming requests with JSON payloads then we can use req.body to access that data
app.use(express.static('./public')); // kasih tau express bahwa apapun yang saya simpan di folder public, bisa kita akses untuk di pakai filenya
app.use(cookies()); // use cookie-parser middleware
app.use(flash()); // kasih tau express untk pakai middleware flash
app.use(methodOverride('_method')); // ksih tau Express untuk Gunakan middleware method-override



// use express-fileupload middleware
app.use(fileUpload({ // gunakan express-fileupload sebagai middleware untk express supaya dapat menerima file uplaod dari client
    useTempFiles: true, // gunakan folder temp untk tampung file upload, sebagai file sementara
}));



// Create a store for session data on MongoDB
const store = new MongoDBStore({ // buat object store dari class MongoDBSession
    uri: process.env.FrizfooClusterURI, // koneksikan ke database mongoDB yang ada di FrizfooClusterURI
    collection: 'userSessions', // nama collection dari database
},
    (err) => {
        if (err) { // kalau ada error, maka...
            console.log('Error in MongoDBStore: ' + err);
        }
    });
// Create a store for session data on MongoDB



// DB Connection
connectToDb((err) => {
    if (!err) {  // kalau tidak ada error connect ke mongoDB database, maka BARU jalankan function dibawah yaitu jalankan server
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } else { // kalau ada error connect ke mongoDB database, maka...
        console.log('Error in database connection: ' + err);
    }
})
// DB Connection



// Session Middleware
app.use(session({ // ksh tau express untk pakai middleware session dgn opsi yg dibawah
    secret: 'secret', // secret key untuk enkripsi session id wktu session di buat di sisi server
    cookie: { // opsi cookie untk setting kapan session di database mongoDB dan cookie client akan terhapus / expired. Klu nd mau expired, maka hapus saja property cookie ini beserta isinya
        maxAge: 86400000 // maksimal waktu session di database mongoDB dan cookie client tersimpan ialah 1 hari dan setelah itu akan di hapus
    },
    resave: false, // kalau kita set resave: true, setiap kali client req ke server, kita mau session di save kembali di database/webserver secara berulang tiap kali ada req ke server. Dan jika kita set resave: false artinya untuk setiap kali client req ke server, kita tidak mau session di save kembali di database/webserver secara berulang tiap kali ada req ke server. Dan hanya akan di save kembali jika kita melakukan perubahan data di session.
    saveUninitialized: false, // kalau kita set saveUninitialized: true, maka setiap ada request dari client ke server, maka session akan di buat dan tersave ke database/webserver secara otomatis. Sehingga pastinya server akan mengirim cookies yg isinya sessionID ke client juga. Tapi kalau kita set saveUninitialized: false, maka session tidak akan di buat dan tidak akan tersave ke database/webserver secara otomatis. Sehingga pastinya server tidak akan mengirim cookies yg isinya sessionID ke client juga. Sehingga jika kita mau buat session baru, ya kita hrus buat session baru itu sendiri, dan baru server akan langsung mengirim cookies yg isinya sessionID ke client juga.
    store: store, // kita mau menggunakan store yg sudah dibuat di atas untuk simpan session kedalam database mongoDB
}));
// Session Middleware










// Route Middleware : 
// Route untk Home/Index Page
app.get('/', appcontroller.home_page); // klu ada Req ke '/', jlnkan function midleware appcontroller.home_page



// Route untk Product Page
app.get('/product', appcontroller.product_page); // klu ada Req ke '/product', jlnkan function midleware appcontroller.product_page
app.get('/api/v1/product', appcontroller.product_api); // klu ada Req ke '/api/v1/product', jlnkan function midleware appcontroller.product_api



// Route untk About Page
app.get('/about', appcontroller.about_page); // klu ada Req ke '/about', jlnkan function midleware appcontroller.about_page



// Route untk Contact Page
app.get('/contact', appcontroller.contact_page); // klu ada Req ke '/contact', jlnkan function midleware appcontroller.contact_page



// Route untk Register Page
app.get('/register', authWarn, appcontroller.register_page); // klu ada Req ke '/register', jlnkan function midleware appcontroller.register_page
app.post('/register', authWarn, appcontroller.register_page_post); // klu ada Req POST ke '/register', jlnkan function midleware appcontroller.register_page_post



// Route untk Login Page
app.get('/login', authWarn, appcontroller.login_page); // klu ada Req ke '/login', jlnkan function midleware appcontroller.login_page
app.post('/login', authWarn, appcontroller.login_page_post); // klu ada Req POST ke '/login', jlnkan function midleware appcontroller.login_page_post



// Route untk Forgot Password Page
app.get('/forgot-password', authWarn, appcontroller.forgot_password_page); // klu ada Req ke '/forgot-password', jlnkan function midleware appcontroller.forgot_password_page
app.post('/forgot-password', authWarn, appcontroller.forgot_password_page_post); // klu ada Req POST ke '/forgot-password', jlnkan function midleware appcontroller.forgot_password_page_post



// Route untk Logout Page
app.get('/logout', appcontroller.logout_page); // klu ada Req ke '/logout', jlnkan function midleware appcontroller.logout_page



// Route untk Profile Page
app.get('/profile/:idUser', isAuth, appcontroller.profile_page); // klu ada Req ke '/profile/:idUser', jlnkan function midleware appcontroller.profile_page
app.post('/profile/:idUser', isAuth, appcontroller.profile_page_post); // klu ada Req POST ke '/profile/:idUser', jlnkan function midleware appcontroller.profile_page_post
app.delete('/profile', isAuth, appcontroller.profile_page_delete); // klu ada Req DELETE ke '/profile', jlnkan function midleware appcontroller.profile_page_delete



// Route untk Update Profile Page
app.get('/update-profile/:idUser', isAuth, appcontroller.update_profile_page); // klu ada Req ke '/update-profile/:idUser', jlnkan function midleware appcontroller.update_profile_page
app.put('/update-profile', isAuth, appcontroller.update_profile_page_put); // klu ada Req PUT ke '/update-profile', jlnkan function midleware appcontroller.update_profile_page_put



// Route untk Change Password Page
app.get('/change-password/:idUser', isAuth, appcontroller.change_password_page); // klu ada Req ke '/change-password', jlnkan function midleware appcontroller.change_password_page
app.put('/change-password', isAuth, appcontroller.change_password_page_put); // klu ada Req PUT ke '/change-password', jlnkan function midleware appcontroller.change_password_page_put



// Route untk Product Details Page
app.get('/product-details/:idProduct', appcontroller.product_details_page); // klu ada Req ke '/product-details', jlnkan function midleware appcontroller.product_details_page



// Route untk Cart Page
app.get('/cart', isAuth, appcontroller.cart_page); // klu ada Req ke '/cart', jlnkan function midleware appcontroller.cart_page
app.get('/api/v1/add-to-cart', isAuth, appcontroller.add_to_cart_api); // klu ada Req ke '/api/v1/add-to-cart', jlnkan function midleware appcontroller.add_to_cart_api
app.post('/api/v1/plus-add-to-cart', isAuth, appcontroller.plus_add_to_cart_api); // klu ada Req PUT ke '/api/v1/plus-add-to-cart', jlnkan function midleware appcontroller.plus_add_to_cart_api
app.post('/api/v1/min-add-to-cart', isAuth, appcontroller.min_add_to_cart_api); // klu ada Req PUT ke '/api/v1/min-add-to-cart', jlnkan function midleware appcontroller.min_add_to_cart_api
app.delete('/api/v1/del-add-to-cart', isAuth, appcontroller.del_add_to_cart_api); // klu ada Req DELETE ke '/api/v1/del-add-to-cart', jlnkan function midleware appcontroller.delete_cart_api



// Route untk Payment Page
app.post('/api/v1/payment-virtual', isAuth, appcontroller.payment_virtual_api); // klu ada Req POST ke '/api/v1/payment-virtual', jlnkan function midleware appcontroller.payment_virtual_api
app.get('/api/v1/get-invoice', isAuth, appcontroller.get_invoice_api); // klu ada Req ke '/api/v1/get-invoice', jlnkan function midleware appcontroller.get_invoice_api
app.put('/api/v1/close-invoice/:idInvoice', isAuth, appcontroller.close_invoice_api); // klu ada Req PUT ke '/api/v1/close-invoice/idInvoice', jlnkan function midleware appcontroller.close_invoice_api
app.delete('/api/v1/del-invoice/:idInvoice', isAuth, appcontroller.del_invoice_api); // klu ada Req DELETE ke '/api/v1/del-invoice', jlnkan function midleware appcontroller.del_invoice_api



// Route untk Search Page
app.get('/search', appcontroller.search_page); // klu ada Req ke '/search', jlnkan function midleware appcontroller.search_page'




// Route untk 404 Page
app.use(appcontroller.not_found_page); // klu ada Req ke url sembarang, jlnkan function midleware appcontroller.404_page

// Run server on port 3000
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// })
// DB Connection
