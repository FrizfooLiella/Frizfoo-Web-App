// Middleware buatan sendiri untk mengecek jika user sdh login, maka larang akses ke halaman login / register / forgot password
const authWarn = (req, res, next) => { // buat middleware untk jika user sdh login, maka larang akses ke halaman login / register / forgot password

    if (req.session.isAuth) {  // kalau req.session.isAuth itu true, maka user sudah login
        res.redirect('/'); // kalau req.session.isAuth itu true, maka user sudah login, maka larang akses ke halaman login / register / forgot password
    } else {
        next(); // kita lanjut ke next middleware klu user belum login
    }

};

module.exports = authWarn; // export middleware authWarn agar bisa dipakai di luar file ini