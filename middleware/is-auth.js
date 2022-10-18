// Middleware buatan sendiri untk mengecek apakah user sudah login atau belum
const isAuth = (req, res, next) => { // buat middleware untk cek apakah user sudah login atau belum

    if (req.session.isAuth) {  // kalau req.session.isAuth itu true, maka user sudah login
        next(); // kita lanjut ke next middleware
    } else {
        res.redirect('/login'); // kalau req.session.isAuth itu false, maka user belum login
    }

};

module.exports = isAuth; // export middleware isAuth agar bisa dipakai di luar file ini