const path = require('path'); // import core module path
const fs = require('fs'); // import core module fs
const bcrypt = require("bcryptjs"); // import third party module bcryptjs untk encrypt password / hash password
const { nanoid } = require("nanoid"); // import nanoid untuk generate id. Untk versi nya perhatikan https://github.com/ai/nanoid/blob/main/CHANGELOG.md#40
const User = require("../models/user.js"); // import local module user.js untk mengakses model User
const Seller = require("../models/seller.js"); // import local module seller.js untk mengakses model Seller
const Transaction = require("../models/transaction.js"); // import local module transaction.js untk mengakses model Transaction
const { buatObjectId } = require("../models/objectid.js"); // import local module objectid.js untk mengakses function buatObjectId
const { registerValidation, loginValidation, sendEmailForgotPassValidation, regexMongoDbId, updateProfileValidation, changePassValidation, registerShopValidation, addNewProductValidation, updateSellerDashboardValidation, updateSellerProductValidation } = require('../utils/validation.js'); // import local modules dari validation.js / kita mau require schema validation yg kita sdh buat
const { formatRupiah, rupiahToString } = require('../utils/formatrupiah.js'); // import local module formatrupiah.js untk format rupiah
const { upImgUserProfile, upImgSellerProfile, upImgSellerProducts } = require('../uploadfile.js'); // import local modules dari uploadfile.js untk upload file ke Google Drive
const validator = require('validator'); // import third party module validator
const { buatInvoice, ambilInvoice, tutupInvoice } = require('../utils/paymentxendit.js'); // import local module paymentxendit.js untk membuat invoice
const { sendMailForgotPass } = require('../utils/sendmailpass.js'); // import local module sendmailpass.js untk send email via gmail




exports.home_page = async (req, res) => { // function middleware untk route GET '/'
    try { // klu sukses, maka...

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        res.render('index.ejs', { // panggil file index.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: 'Frizfoo | Belanja Online Frozen Food Aman, Mudah & Terpercaya!', // title dari halaman ini
            cdnswiperjs: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css" />',
            dataProfile: dataProfile
        });

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}




exports.product_page = async (req, res) => { // function middleware untk route GET '/product'
    try { // klu sukses, maka...

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        res.render('product.ejs', { // panggil file product.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: 'Products | Frizfoo', // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile
        })

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}
exports.product_api = async (req, res) => { // function middleware untk route GET '/api/v1/product?page=0'
    try { // klu sukses, maka...

        const page = req.query.page || 0; // get current page from query string (?page=1) artinnya kita ambil nilai pagenya yaitu 1
        const itemPerPage = 8; // set item per page brp


        let products = [];

        // Ada 2 cara untk dpt semua data products dari collection sellers : 

        // CARA 1, pakai find semua document seller dan melakukan looping untuk mengambil semua data products dari document seller tersebut dan push ke array baru
        let product = await Seller.find({}, {  // ambil semua data seller dari database mongoDB
            products: 1, // hanya ambil field products
        });


        product.forEach((item) => { // looping data seller 
            item.products.forEach((item2) => { // looping data products
                products.push(item2); // masukkan data product yg di looping ke array products satu persatu 
            });
        });



        // CARA 2, pakai aggregate untuk mengambil semua data products dari collection sellers dan push ke array baru langsung, tanpa perlu looping. Dgn aggregate jg kita bisa sekalian melakukan match, sort, limit, skip, dll
        // let products = await Seller.aggregate([ // untk ambil seluruh data products dari collection seller. Stage Operator yg bisa di pakai di aggregate pipeline stage : https://stackoverflow.com/questions/50605448/differences-between-project-filter-and-match-in-mongodb
        //     {
        //         $unwind: '$products' // kyk destructuring, yg nnti elemen object dlm array akan di pecah menjadi dokumen sendiri, yg nntinya akan di pakai untk di manipulasi pada tahap pipeline berikutnya : https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/
        //     },
        //     {
        //         $limit: 4
        //     },
        //     {
        //         $sort: { // sort tiap document data berdasarkan field nama product
        //             'products.namaproduct': -1 // -1 artinya descending, 1 artinya ascending
        //         }
        //     },
        //     {
        //         // skip 2 data
        //         $skip: 2
        //     },
        //     {
        //         $group: {  // tahap group ini yaitu dokumen yg sdh di grouping berdasarkan kriteria yg diberikan, akan di satukan menjadi satu dokumen yg berisi data dari dokumen yg sesuai kriteria yg diberikan. Docs : https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/#mongodb-pipeline-pipe.-group
        //             _id: '', // _id ini adalah field yg akan dijadikan sebagai key utk grouping dokumen, jadi dokumen yg memiliki
        //             results: { // ini adalah nama field yg akan di grouping
        //                 $push: '$products' // ambil elemen products yg sdh di unwind dan sdh di sort, lalu di push ke array baru yg nnti akan di simpan di field products
        //             }
        //         }
        //     }
        // ]);

        // console.log(products[0].results);



        // Indikator Apakah Ada Next Page atau Tidak
        let has_next_page;
        if (products.length > 0) { // klu data products lebih dari 0, maka...
            let totalPage = Math.ceil(products.length / itemPerPage) - 1; // hitung total page, dan INGAT DI KURANG 1 karena kita mulai page dari 0

            if (page < totalPage) { // klu page yg sedang diakses lbh kecil dari total TOTAL PAGE - 1, maka...
                has_next_page = true; // berarti masih ada page selanjutnya
            } else { // klu tidak, maka...
                has_next_page = false; // berarti sudah di page terakhir
            }

        }



        // kita slice array products agar hanya mengirimkan data product yg sdh di skip dan di limit sesuai dengan page yg sedang diakses / query string yg dikirimkan
        let productfinal = products.slice(page * itemPerPage, (page * itemPerPage) + itemPerPage); // ambil data product dari array products lalu slice untk sesuaikan dgn page dan itemPerPage dari user nanti




        res.status(200).json({  // kirim response ke client, kode status 200 yg artinya sukses, dan kirimkan data productfinal
            pagination: {
                current_page: page, // kirimkan page yg sedang diakses
                has_next_page: has_next_page, // kirimkan indikator apakah ada page selanjutnya atau tidak
            },
            status: 'Success',
            message: 'Success get all products',
            products: productfinal
        });

    } catch (error) { // klu gagal, maka...

        res.status(500).json({  // kirim error ke client, krena error 500 itu error internal server
            message: error
        });

    }

}




exports.about_page = async (req, res) => { // function middleware untk route GET '/about'
    try { // klu sukses, maka...

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        res.render('about.ejs', { // panggil file about.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: 'About Us | Frizfoo', // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile
        })

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}




exports.contact_page = async (req, res) => { // function middleware untk route GET '/contact'
    try { // klu sukses, maka...

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        res.render('contact.ejs', { // panggil file contact.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: 'Contact Us | Frizfoo', // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile
        })

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}




exports.register_page = async (req, res) => { // function middleware untk route GET '/register'
    try { // klu sukses, maka...

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        let msg = await req.session.msgFlsh; // ambil data msgFlsh dari session
        delete req.session.msgFlsh; // hapus session msgFlsh

        res.render('register.ejs', { // panggil file register.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: 'Registrasi | Frizfoo', // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile,
            flshMsg: msg
        })

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}
exports.register_page_post = async (req, res) => { // function middleware untk route POST '/register'

    // VALIDATE INPUTAN DARI FORM REGISTER
    let { error } = registerValidation(req.body); // validasi inputan user
    let notelpvalid = validator.isMobilePhone(req.body.notelp, 'id-ID'); // cek apakah inputan no telp benar atau tidak

    if (error) { // jika ada error
        req.session.msgFlsh = error.details[0].message; // kasih tau session ada msgFlsh
        req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
            if (err) {
                console.log(err);
            }
            res.redirect('/register'); // redirect ke halaman register
        });
        return; // klu sdh di save, maka return supaya tidak lanjut ke bawah
    }


    if (!notelpvalid) { // jika no telp tidak valid
        req.session.msgFlsh = 'No telp Tidak Valid'; // kasih tau session ada msgFlsh
        req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
            if (err) {
                console.log(err);
            }
            res.redirect('/register'); // redirect ke halaman register
        });
        return; // klu sdh di save, maka return supaya tidak lanjut ke bawah
    }
    // VALIDATE INPUTAN DARI FORM REGISTER


    const { fullname, username, email, notelp, password, password_confirmation, gender } = req.body; // ambil inputan dari form register

    let user = await User.findOne({ email: email }); // cari user dgn email yg di input user (dalam database)

    if (user) { // klau email user yg mau register ditemukan di database
        req.session.msgFlsh = 'Email Sudah Terdaftar'; // kasih tau session ada msgFlsh
        req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
            if (err) {
                console.log(err);
            }
            res.redirect('/register'); // redirect ke halaman register
        });
        return; // klu sdh di save, maka return supaya tidak lanjut ke bawah
    }

    // HASHING THE PASSWORD
    const salt = await bcrypt.genSalt(10); // create variable salt untuk menampung hasil dari bcrypt.genSalt(10), dan genSalt(10) itu settingan kompleksitas hash password
    const hashedPassword = await bcrypt.hash(password, salt); // create variable hashedPassword untuk menampung hasil dari ekripsi password yang dikirimkan, dan ekripsi password itu hasil dari bcrypt.hash(req.body.password, salt)
    const hashedPassword_confirmation = await bcrypt.hash(password_confirmation, salt); // create variable hashedPassword_confirmation untuk menampung hasil dari ekripsi password yang dikirimkan, dan ekripsi password itu hasil dari bcrypt.hash(req.body.password_confirmation, salt)

    // CREATE NEW USER
    user = new User({  // buat user baru dgn model user, dlm btk object user
        fullname: fullname,
        username: username,
        email: email,
        notelp: notelp,
        password: hashedPassword,
        password_confirmation: hashedPassword_confirmation,
        gender: gender
    });


    try { // kalau sukses, maka...

        await user.save(); // simpan user baru ke database

        req.session.msgFlsh = 'Registrasi Berhasil, Silahkan Login';
        req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
            if (err) {
                console.log(err);
            }
            res.redirect('/login'); // redirect ke halaman login
        });

    } catch (err) { // klu ada error, maka...

        res.status(400).send(err); // kasih tau error 400

    }

}




exports.login_page = async (req, res) => { // function middleware untk route GET '/login'
    try { //klu sukses, maka...

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        let msg = await req.session.msgFlsh; // ambil data msgFlsh dari session
        delete req.session.msgFlsh; // hapus session msgFlsh

        res.render('login.ejs', { // panggil file login.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: 'Login | Frizfoo', // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile,
            flshMsg: msg
        })

    } catch (error) {  //klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}
exports.login_page_post = async (req, res) => { // function middleware untk route POST '/login'
    try { //klu sukses, maka...

        // VALIDATE INPUTAN DARI FORM LOGIN
        let { error } = loginValidation(req.body); // validasi inputan user

        if (error) { // jika ada error
            req.session.msgFlsh = error.details[0].message; // kasih tau session error
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect('/login'); // redirect ke halaman login
            });
            return; // klu sdh di save, maka return supaya tidak lanjut ke bawah
        }
        // VALIDATE INPUTAN DARI FORM LOGIN


        const { email, password } = req.body; // ambil inputan dari login register

        let user = await User.findOne({ email: email }); // cari user dgn email yg di input user (dalam database)

        if (!user) { // klu user tidak ditemukan di database. maka...
            req.session.msgFlsh = 'Email Tidak Terdaftar, Silahkan Registrasi'; // set session "Email tidak terdaftar"
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect('/register'); // redirect ke halaman register
            });
            return; // klu sdh di save, maka return supaya tidak lanjut ke bawah
        }

        // CHECK IF PASSWORD IS CORRECT
        const isMatch = await bcrypt.compare(password, user.password); // create variable isMatch untuk menampung hasil dari perbadingan password yang dikirimkan dari client pas mau login dengan password yang ada di database mongoDB

        if (!isMatch) { // kalau password yg dikirimkan dari client tidak sama dengan password yg ada di database mongoDB
            req.session.msgFlsh = "Password is Wrong / not Valid"; // set session "Password not Valid"
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect('/login'); // redirect ke halaman login
            });
            return; // klu sdh di save, maka return supaya tidak lanjut ke bawah
        }

        // IF PASSWORD IS CORRECT
        req.session.isAuth = true; // set session isAuth = true, supaya ketika user sukses login, session akan di buat dan session ini akan di simpan di database mongoDB dan server akan mengirimkan cookie ke client yg berisi session id yg sama dgn session id yg di buat di database mongoDB

        req.session.dataProfile = { // set session dataProfile dgn data yang user sdh pakai untuk login
            username: user.username,
            userId: user._id,
            userPicId: user.userpicid,
            userCartProducts: user.cartproducts.length,
        }

        req.session.save((err) => { // Untuk Pastikan semua session sudah tersimpan
            if (err) {
                console.log(err);
            }
            res.redirect('/'); // kalau password yang di input user sesuai dengan password yang ada di database mongoDB, redirect ke halaman dashboard
        });

    } catch (error) { //klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}




exports.forgot_password_page = async (req, res) => { // function middleware untk route GET '/forgot-password'
    try { //klu sukses, maka...

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        let msg = await req.session.msgFlsh; // ambil data msgFlsh dari session
        delete req.session.msgFlsh; // hapus session msgFlsh


        res.render('forgot-password.ejs', { // panggil file forgot-password.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: 'Forgot Password | Frizfoo', // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile,
            flshMsg: msg
        })

    } catch (error) { //klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}
exports.forgot_password_page_post = async (req, res) => { // function middleware untk route POST '/forgot-password'
    try { // klu sukses, maka...

        let passRecovery = `${nanoid(7)}`; // buat variable passRecovery dgn nilai random 7 karakter


        // VALIDATE INPUTAN DARI FORM FORGOT PASSWORD
        let { error } = sendEmailForgotPassValidation(req.body); // validasi inputan user

        if (error) { // jika ada error
            req.session.msgFlsh = error.details[0].message; // kasih tau session error
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect('/forgot-password'); // redirect ke halaman Forgot Password
            });
            return; // klu sdh di save, maka return supaya tidak lanjut ke bawah
        }
        // VALIDATE INPUTAN DARI FORM FORGOT PASSWORD



        let user = await User.findOne({ email: req.body.email }); // cari user dgn email yg di input user (dalam database)

        if (!user) { // klu user tidak ditemukan di database. maka...
            req.session.msgFlsh = 'Email Tidak Terdaftar, Silahkan Registrasi'; // set session "Email tidak terdaftar"
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect('/forgot-password'); // redirect ke halaman Forgot Password
            });
            return; // klu sdh di save, maka return supaya tidak lanjut ke bawah
        }



        // HASHING THE PASSWORD
        const salt = await bcrypt.genSalt(10); // create variable salt untuk menampung hasil dari bcrypt.genSalt(10), dan genSalt(10) itu settingan kompleksitas hash password
        const hashedPassword = await bcrypt.hash(passRecovery, salt); // create variable hashedPassword untuk menampung hasil dari ekripsi password yang baru, dan ekripsi password itu hasil dari bcrypt.hash(passRecovery, salt)
        const hashedPassword_confirmation = await bcrypt.hash(passRecovery, salt); // create variable hashedPassword_confirmation untuk menampung hasil dari ekripsi password yang baru, dan ekripsi password itu hasil dari bcrypt.hash(passRecovery, salt)



        // Update Password User Dengan Password Baru ke Database
        await User.updateOne(
            {
                email: req.body.email
            },
            {
                $set: { // data yg akan diupdate
                    password: hashedPassword,
                    password_confirmation: hashedPassword_confirmation
                }
            }
        )
            .then(async (result) => { // klu sukses, maka...

                // SEND EMAIL
                let resultsendMail = await sendMailForgotPass(req.body.email, passRecovery, user); // kirim email ke user


                req.session.msgFlsh = `Kami Telah Mengirimkan Password Reset ke Email Anda - ${req.body.email}. Silahkan Mengecek Email Anda Ciaoy!`; // kirim pesan flash ke client

                req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                    if (err) {
                        console.log(err);
                    }
                    res.redirect(`/login`); // redirect ke halaman profile
                });

            });
        // Update Password User Dengan Password Baru ke Database


    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}




exports.logout_page = async (req, res) => { // function middleware untk route GET '/logout'

    req.session.destroy((err) => { // kalau ada yg logout, maka destroy sessionnya yang ada di database mongoDB
        if (err) throw new err;
        res.clearCookie('connect.sid'); // hapus cookie connect.sid pda client
        res.redirect('/'); // redirect ke halaman landing page
    });

}




exports.profile_page = async (req, res) => { // function middleware untk route GET '/profile/:idUser'
    try { // klu sukses, maka...

        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK
        if (!regexMongoDbId(req.params.idUser)) { // kalau mongoDB punya Id yg dikirimkan dari client tidak sesuai dengan regex, maka...
            return res.redirect('/'); // redirect ke halaman landing page
        }
        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        let msg = await req.session.msgFlsh; // ambil data msgFlsh dari session
        delete req.session.msgFlsh; // hapus session msgFlsh

        let alldataUserProfile = await User.findById(req.params.idUser); // ambil data user dari database berdasarkan id mereka


        res.render('profile.ejs', { // panggil file profile.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: 'Profile | Frizfoo', // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile,
            flshMsg: msg,
            alldataUserProfile: alldataUserProfile
        });

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}
exports.profile_page_post = async (req, res) => { // function middleware untk route POST '/profile/:idUser'
    try {  // klu sukses, maka...

        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK
        if (!regexMongoDbId(req.params.idUser)) { // kalau mongoDB punya Id yg dikirimkan dari client tidak sesuai dengan regex, maka...
            return res.redirect('/'); // redirect ke halaman landing page
        }
        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK


        if (!req.files) {  // Cek apakah ada file yang diupload
            req.session.msgFlsh = 'File Tidak Ditemukan'; // kirim pesan flash ke client
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect(`/profile/${req.params.idUser}`); // redirect ke halaman profile user
            });
            return; // hentikan proses
        }


        let allowedExtension = ['.png', '.jpg', '.jpeg', '.jfif', '.gif', '.webp']; //  ekstensi file yg diizinkan
        let fileNameExtension = path.extname(req.files.profileImg.name); // ambil ekstensi file yg diupload

        if (!allowedExtension.includes(fileNameExtension)) {  // Cek extensi file image yg diupload

            fs.unlinkSync(`${req.files.profileImg.tempFilePath}`);  // pakai fs.unlinkSync, supaya file yg gagal diupload, bisa langsung dihapus dari folder temp

            req.session.msgFlsh = 'Harap Upload File Gambar Hanya Dengan Ekstensi .png, .jpg, .jpeg, .jfif, .gif, .webp'; // kirim pesan flash ke client
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect(`/profile/${req.params.idUser}`); // redirect ke halaman profile user
            });
            return; // hentikan proses
        }


        // Panggil function upImgUserProfile untuk mengupload file yg diupload user ke google drive
        let idUserProfileImg = await upImgUserProfile(req.files.profileImg); // upload file profileImg ke Google Drive



        req.session.dataProfile.userPicId = idUserProfileImg; // set session dataProfile khusus userPicId dengan data userPicId yg baru di update user
        req.session.save(); // Untuk Pastikan session sudah tersimpan



        // KIRIM DATA USER YANG SUDAH DIUPDATE KE DATABASE
        await User.updateOne(
            {
                _id: req.params.idUser // kriteria document yg akan diupdate
            },
            {
                $set: { // data yg akan diupdate
                    userpicid: idUserProfileImg
                }
            }
        )
            .then((result) => { // klu sukses, maka...

                req.session.msgFlsh = 'Profile Picture Anda Berhasil di Upload!'; // kirim pesan flash ke client
                req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                    if (err) {
                        console.log(err);
                    }
                    res.redirect(`/profile/${req.params.idUser}`); // redirect ke halaman profile user
                });

            });

    } catch (error) {  // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}
exports.profile_page_delete = async (req, res) => { // function middleware untk route DELETE '/profile'
    try { // klu sukses, maka...

        let alldataUserProfile = await User.findById(req.body.idUserDelete); // ambil data user dari database berdasarkan id mereka

        await req.session.destroy((err) => { // destroy sessionnya yang ada di database mongoDB
            if (err) throw new err;
        });


        // cek, klu user tdk punya shop, maka hapus data usernya saja dari database
        if (!alldataUserProfile.idtokouser) { // klu user tdk punya shop, maka...

            await User.deleteOne({ _id: req.body.idUserDelete })  // hapus data user dari database berdasarkan id mereka
                .then((result) => {  // klu sukses hapus, maka...
                    res.clearCookie('connect.sid'); // hapus cookie connect.sid pda client
                    res.redirect('/'); // redirect ke halaman landing page
                })

        } else { // klu user punya shop, maka...

            await Seller.deleteOne(   // hapus Document Seller dari collection Sellers berdasarkan id
                {
                    _id: alldataUserProfile.idtokouser
                }
            )
                .then(async (result) => {  // klu sukses hapus, maka...

                    await User.deleteOne({ _id: req.body.idUserDelete })  // hapus data user dari database berdasarkan id mereka
                        .then((result) => {  // klu sukses hapus, maka...
                            res.clearCookie('connect.sid'); // hapus cookie connect.sid pda client
                            res.redirect('/'); // redirect ke halaman landing page
                        })

                });

        }

    } catch (err) { // klu gagal hapus, maka...

        res.status(400).send(err); // kirim error

    }

}




exports.update_profile_page = async (req, res) => { // function middleware untk route GET '/update-profile/:idUser'
    try { // klu sukses, maka...

        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK
        if (!regexMongoDbId(req.params.idUser)) { // kalau mongoDB punya Id yg dikirimkan dari client tidak sesuai dengan regex, maka...
            return res.redirect('/'); // redirect ke halaman landing page
        }
        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        let alldataUserProfile = await User.findById(req.params.idUser); // ambil data user dari database berdasarkan id mereka


        res.render('update-profile.ejs', { // panggil file update-profile.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: 'Update Profile | Frizfoo', // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile,
            flshMsg: '',
            alldataUserProfile: alldataUserProfile
        })

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}
exports.update_profile_page_put = async (req, res) => { // function middleware untk route PUT '/update-profile'
    try { // klu sukses, maka...

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        // VALIDATE INPUTAN DARI FORM UPDATE PROFILE
        let { error } = updateProfileValidation(req.body); // validasi inputan user
        let notelpvalid = validator.isMobilePhone(req.body.notelp, 'id-ID'); // cek apakah inputan no telp benar atau tidak

        if (error) { // jika ada error, render halaman update-profile.ejs kembali dan kirimkan pesan errornya dan data user yg sudah diinputkan tadi

            return res.render('update-profile.ejs', { // panggil file update-profile.ejs dlm folder views dan kirim data dibawah ini
                layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
                title: 'Update Profile | Frizfoo', // title dari halaman ini
                cdnswiperjs: '',
                dataProfile: dataProfile,
                flshMsg: error,
                alldataUserProfile: req.body,
            })

        }

        if (!notelpvalid) { // jika no telp tidak valid, render halaman update-profile.ejs kembali dan kirimkan pesan errornya dan data user yg sudah diinputkan tadi

            return res.render('update-profile.ejs', { // panggil file update-profile.ejs dlm folder views dan kirim data dibawah ini
                layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
                title: 'Update Profile | Frizfoo', // title dari halaman ini
                cdnswiperjs: '',
                dataProfile: dataProfile,
                flshMsg: 'No telp Tidak Valid',
                alldataUserProfile: req.body,
            })

        }
        // VALIDATE INPUTAN DARI FORM UPDATE PROFILE



        req.session.dataProfile.username = req.body.username; // set session dataProfile khusus username dengan data username yg baru di update user
        req.session.save(); // simpan session dataProfile yg baru di update sama user


        // KIRIM DATA USER YANG SUDAH DIUPDATE KE DATABASE
        await User.updateOne(
            {
                _id: req.body._id // kriteria document yg akan diupdate
            },
            {
                $set: { // data yg akan diupdate
                    fullname: req.body.fullname,
                    username: req.body.username,
                    email: req.body.email,
                    notelp: req.body.notelp,
                    alamat: req.body.alamat,
                    kota: req.body.kota,
                    kecamatan: req.body.kecamatan,
                    provinsi: req.body.provinsi,
                    kodepos: req.body.kodepos,
                    gender: req.body.gender,
                }
            }
        )
            .then((result) => { // klu sukses, maka...

                req.session.msgFlsh = 'Data Profile Berhasil di Ubah!'; // kirim pesan flash ke client
                req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                    if (err) {
                        console.log(err);
                    }
                    res.redirect(`/profile/${req.body._id}`); // redirect ke halaman profile
                });

            });


    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}




exports.change_password_page = async (req, res) => { // function middleware untk route GET '/change-password/:idUser'
    try { // klu sukses, maka...

        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK
        if (!regexMongoDbId(req.params.idUser)) { // kalau mongoDB punya Id yg dikirimkan dari client tidak sesuai dengan regex, maka...
            return res.redirect('/'); // redirect ke halaman landing page
        }
        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        let msg = await req.session.msgFlsh; // ambil data msgFlsh dari session
        delete req.session.msgFlsh; // hapus session msgFlsh

        let alldataUserProfile = await User.findById(req.params.idUser); // ambil data user dari database berdasarkan id mereka



        res.render('change-password.ejs', { // panggil file change-password.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: 'Change Password | Frizfoo', // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile,
            flshMsg: msg,
            alldataUserProfile: alldataUserProfile,
        });

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}
exports.change_password_page_put = async (req, res) => { // function middleware untk route PUT '/change-password'
    try { // klu sukses, maka...

        const { _id, oldpassword, password, password_confirmation } = req.body; // ambil inputan dari form change password

        // VALIDATE INPUTAN DARI FORM LOGIN
        let { error } = changePassValidation(req.body); // validasi inputan user

        if (error) { // jika ada error
            req.session.msgFlsh = error.details[0].message; // kasih tau session error
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect(`/change-password/${_id}`); // redirect ke halaman change-password kembali
            });
            return; // klu sdh di save, maka return supaya tidak lanjut ke bawah
        }
        // VALIDATE INPUTAN DARI FORM LOGIN



        // CEK PASSWORD LAMA USER
        let user = await User.findById(_id); // ambil data user dari database berdasarkan id mereka


        // CHECK IF PASSWORD IS CORRECT
        const isMatch = await bcrypt.compare(oldpassword, user.password); // create variable isMatch untuk menampung hasil dari perbadingan password yang dikirimkan dari client dengan password yang ada di database mongoDB

        if (!isMatch) { // kalau password yg dikirimkan dari client tidak sama dengan password yg ada di database mongoDB
            req.session.msgFlsh = "Your Old Password is Wrong / not Valid"; // set session "Password not Valid"
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect(`/change-password/${_id}`); // redirect ke halaman change-password kembali
            });
            return; // klu sdh di save, maka return supaya tidak lanjut ke bawah
        }


        // HASHING THE PASSWORD
        const salt = await bcrypt.genSalt(10); // create variable salt untuk menampung hasil dari bcrypt.genSalt(10), dan genSalt(10) itu settingan kompleksitas hash password
        const hashedPassword = await bcrypt.hash(password, salt); // create variable hashedPassword untuk menampung hasil dari ekripsi password yang baru, dan ekripsi password itu hasil dari bcrypt.hash(password, salt)
        const hashedPassword_confirmation = await bcrypt.hash(password_confirmation, salt); // create variable hashedPassword_confirmation untuk menampung hasil dari ekripsi password yang baru, dan ekripsi password itu hasil dari bcrypt.hash(password_confirmation, salt)


        // Update Password User Dengan Password Baru ke Database
        await User.updateOne(
            {
                _id: _id // kriteria document yg akan diupdate
            },
            {
                $set: { // data yg akan diupdate
                    password: hashedPassword,
                    password_confirmation: hashedPassword_confirmation
                }
            }
        )
            .then((result) => { // klu sukses, maka...

                req.session.msgFlsh = `Password Anda Berhasil di Ubah!`; // kirim pesan flash ke client

                req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                    if (err) {
                        console.log(err);
                    }
                    res.redirect(`/profile/${_id}`); // redirect ke halaman profile kembali
                });

            });
        // Update Password User Dengan Password Baru ke Database


    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}




exports.product_details_page = async (req, res) => { // function middleware untk route GET '/product-details/:idProduct'
    try {  // klu sukses, maka...

        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK
        if (!regexMongoDbId(req.params.idProduct)) { // kalau mongoDB punya Id yg dikirimkan dari client tidak sesuai dengan regex, maka...
            return res.redirect('/'); // redirect ke halaman landing page
        }
        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        let msg = await req.session.msgFlsh; // ambil data msgFlsh dari session
        delete req.session.msgFlsh; // hapus session msgFlsh



        // ADA 2 CARA QUERYNYA, CARA 1 :
        // let alldataProductDetail = await Seller.findOne({ // cari data seller di database mongoDB
        //     'products._id': req.params.idProduct // cari data seller yg punya product dengan id yg sama dgn id yg dikirimkan dari client
        // }, 'products.$'); // hanya ambil field products, .$ artinya ambil data products yg pertama kali ketemu yang cocok dengan kondisi kueri. Docs : https://docs.mongodb.com/manual/reference/operator/projection/positional/


        // CARA 2 :
        let alldataProductDetail = await Seller.findOne({
            'products._id': req.params.idProduct // cari data seller yg punya product dengan id yg sama dgn id yg dikirimkan dari client
        }, { products: { $elemMatch: { _id: req.params.idProduct } } }); // hanya ambil field products yg tpi yg punya field _id yg sama dgn id yg dikirimkan dari client. Dan $elemMatch artinya ambil data products yg pertama kali ketemu yang cocok dengan kondisi kueri. Docs : https://docs.mongodb.com/manual/reference/operator/projection/positional/



        res.render('product-details.ejs', { // panggil file product-details.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: `${alldataProductDetail.products[0].namaproduct} | Frizfoo`, // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile,
            flshMsg: msg,
            alldataProductDetail: alldataProductDetail,
        })

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}




exports.cart_page = async (req, res) => { // function middleware untk route GET '/cart'
    try { // klu sukses, maka...

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        let alldataUserProfile = await User.findById(dataProfile.userId); // ambil data user dari database berdasarkan id mereka untk dapatkan data alamat user



        res.render('cart.ejs', { // panggil file cart.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: 'Cart | Frizfoo', // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile,
            alldataUserProfile: alldataUserProfile,
        })

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}
exports.add_to_cart_api = async (req, res) => { // function middleware untk route GET '/api/v1/add-to-cart
    try { // klu sukses, maka...

        let userId = await req.session.dataProfile.userId; // ambil Id User yg sedang login dari session

        let dataCartUser = await User.findOne({ // cari data user dan ambil data cartproductsnya
            _id: userId // cari data user yg punya Id yg sama dgn Id yg diambil dari session
        }, {
            cartproducts: 1 // hanya ambil field cartproducts
        });


        res.status(200).json({  // kirim response ke client, kode status 200 yg artinya sukses, dan kirimkan data productfinal
            status: 'Success',
            message: 'Success get all User cartproducts',
            datausercart: dataCartUser
        });


    } catch (error) { // klu gagal, maka...

        res.status(500).json({  // kirim error ke client, krena error 500 itu error internal server
            message: error
        });

    }

}
exports.plus_add_to_cart_api = async (req, res) => { // function middleware untk route POST '/api/v1/plus-add-to-cart'
    try { // klu sukses, maka...

        let userId = await req.session.dataProfile.userId; // ambil Id User yg sedang login

        let { idproduct, productpic, nameproduk, kuantitas, hargaproduk, totalhargaproduk, beratproduk, idpenjual, notelppenjual } = req.body // ambil semua data dari client yg dikirimkan melalui body request



        // Validasi, apakah product sdh pernah dimasukkan ke cart sebelumnya atau belum
        let cekProductSdhAdaDiCart = await User.findOne({ // cari data cart di database mongoDB
            _id: userId, // cari data document milik user yg sedang login
            'cartproducts.idproduct': idproduct // cari data di cartproducts yg punya idproduct yg sama dgn idproduct yg dikirimkan dari client
        }, 'cartproducts.$'); // hanya ambil field cartproducts, .$ artinya ambil data cart yg pertama kali ketemu yang cocok dengan kondisi kueri. Docs : https://docs.mongodb.com/manual/reference/operator/projection/positional/


        if (cekProductSdhAdaDiCart) { // klu product sdh ada di cart, maka...

            let kuantitasBaru = parseInt(cekProductSdhAdaDiCart.cartproducts[0].kuantitas) + parseInt(kuantitas); // jumlahkan kuantitas yg sdh ada di cart dgn kuantitas yg baru dimasukkan ke cart

            let totalHargaBaru = parseInt(rupiahToString(cekProductSdhAdaDiCart.cartproducts[0].totalhargaproduk)) + parseInt(totalhargaproduk); // jumlahkan total harga yg sdh ada di cart dgn total harga yg baru dimasukkan ke cart

            await User.updateOne({ // update data cart di database mongoDB
                _id: userId, // cari data cart yg punya id yg sama dgn id yg dikirimkan dari client
                'cartproducts.idproduct': idproduct
            }, {
                $set: { // set data cart yg baru
                    "cartproducts.$.kuantitas": kuantitasBaru, // set kuantitasBaru
                    'cartproducts.$.totalhargaproduk': formatRupiah(totalHargaBaru) // set totalHargaBaru
                }
            })
                .then((result) => { // klu sukses, maka...

                    res.status(201).redirect('back');

                });
            return; // hentikan proses klu sdh berhasil
        };
        // Validasi, apakah product sdh pernah dimasukkan ke cart sebelumnya atau belum



        // Klu product blm pernah ada di cart User
        await User.updateOne({ // cari data user di database mongoDB dan update data cartproductsnya
            _id: userId,
        }, {
            $push: {
                cartproducts: {
                    idproduct: idproduct,
                    productpic: productpic,
                    nameproduk: nameproduk,
                    kuantitas: kuantitas,
                    hargaproduk: formatRupiah(hargaproduk),
                    totalhargaproduk: formatRupiah(totalhargaproduk),
                    beratproduk: beratproduk,
                    idpenjual: idpenjual,
                    notelppenjual: notelppenjual,
                }
            }
        })
            .then((result) => { // klu sukses, maka...

                req.session.dataProfile.userCartProducts += 1; // tambahkan 1 ke session userCartProducts

                req.session.save((err) => { // Untuk Pastikan semua session sudah tersimpan
                    if (err) {
                        return console.log(err);
                    }
                    res.status(201).redirect('back');  // tampilkan halaman yg sedang user berada
                });

            });
        // Klu product blm pernah ada di cart User


    } catch (error) { // klu gagal, maka...

        res.status(500).json({  // kirim error ke client, krena error 500 itu error internal server
            message: error
        });

    }

}
exports.min_add_to_cart_api = async (req, res) => { // function middleware untk route POST '/api/v1/min-add-to-cart'
    try { // klu sukses, maka...

        let userId = await req.session.dataProfile.userId; // ambil Id User yg sedang login

        let { idproduct, productpic, nameproduk, kuantitas, hargaproduk, totalhargaproduk, beratproduk, idpenjual, notelppenjual } = req.body // ambil semua data dari client yg dikirimkan melalui body request



        let cekProductSdhAdaDiCart = await User.findOne({ // cari data cart di database mongoDB
            _id: userId, // cari data document milik user yg sedang login
            'cartproducts.idproduct': idproduct // cari data di cartproducts yg punya idproduct yg sama dgn idproduct yg dikirimkan dari client
        }, 'cartproducts.$'); // hanya ambil field cartproducts, .$ artinya ambil data cart yg pertama kali ketemu yang cocok dengan kondisi kueri. Docs : https://docs.mongodb.com/manual/reference/operator/projection/positional/


        if (cekProductSdhAdaDiCart) { // klu product sdh ada di cart, maka...

            let kuantitasBaru = parseInt(cekProductSdhAdaDiCart.cartproducts[0].kuantitas) - parseInt(kuantitas); // kurangi kuantitas yg sdh ada di cart dgn kuantitas yg baru dimasukkan ke cart

            let totalHargaBaru = parseInt(rupiahToString(cekProductSdhAdaDiCart.cartproducts[0].totalhargaproduk)) - parseInt(totalhargaproduk); // kurangi total harga yg sdh ada di cart dgn total harga yg baru dimasukkan ke cart


            await User.updateOne({ // update data cart di database mongoDB
                _id: userId, // cari data cart yg punya id yg sama dgn id yg dikirimkan dari client
                'cartproducts.idproduct': idproduct
            }, {
                $set: { // set data cart yg baru
                    "cartproducts.$.kuantitas": kuantitasBaru, // set kuantitasBaru
                    'cartproducts.$.totalhargaproduk': formatRupiah(totalHargaBaru) // set totalHargaBaru
                }
            })
                .then((result) => { // klu sukses, maka...

                    res.status(201).redirect('back');

                });
            return; // hentikan proses klu sdh berhasil
        };


    } catch (error) { // klu gagal, maka...

        res.status(500).json({  // kirim error ke client, krena error 500 itu error internal server
            message: error
        });

    }

}
exports.del_add_to_cart_api = async (req, res) => { // function middleware untk route DELETE '/api/v1/del-add-to-cart'
    try { // klu sukses, maka...

        let userId = await req.session.dataProfile.userId; // ambil Id User yg sedang login

        let { idproduct } = req.body // ambil nilai idproduct dari client yg dikirimkan melalui body request untk di hapus dari cart

        await User.updateOne({ // cari data user di database mongoDB dan update data cartproductsnya
            _id: userId, // cari document berdasarkan id user yg sedang login
        }, {
            $pull: { // hapus data cartproducts yg punya idproduct yg sama dgn idproduct yg dikirimkan dari client. Docs: https://www.mongodb.com/docs/manual/reference/operator/update/pull/#mongodb-update-up.-pull
                cartproducts: {
                    idproduct: idproduct // hapus data cart yg punya idproduct yg sama dgn idproduct yg dikirimkan dari client
                }
            }
        })
            .then((result) => {
                req.session.dataProfile.userCartProducts -= 1; // kurangi 1 dari session userCartProducts

                req.session.save((err) => { // Untuk Pastikan semua session sudah tersimpan
                    if (err) {
                        return console.log(err);
                    }
                    res.status(201).redirect('back'); // tampilkan halaman yg sedang user berada
                });
            })

    } catch (error) { // klu gagal, maka...

        res.status(500).json({  // kirim error ke client, krena error 500 itu error internal server
            message: error
        });

    }

}




exports.payment_virtual_api = async (req, res) => { // function middleware untk route POST '/api/v1/payment_virtual'
    try { // klu sukses, maka...

        let userId = await req.session.dataProfile.userId; // ambil Id User yg sedang login atau yg sdg pesan

        let alldataUserProfile = await User.findById(userId); // ambil data user dari database berdasarkan id mereka

        let dataInvoiceItem = req.body; // ambil semua data dari client yg dikirimkan melalui body request

        let alldataInvoice = await buatInvoice(alldataUserProfile, dataInvoiceItem); // buat invoice baru berdasarkan data yg dikirimkan dari client


        await User.updateOne({ // masukkan invoice id user ke data base user tersebut
            _id: userId,
        }, {
            $push: {
                history_invoice: {
                    idinvoice: alldataInvoice.id,
                }
            }
        })
            .then((result) => { // klu sukses, maka...

                res.status(201).json({ // kirim data invoice Url ke client untk ditampilkan di halaman payment virtual
                    dataInvoiceUrl: alldataInvoice.invoice_url,
                    idinvoice: alldataInvoice.id
                });

            });


    } catch (error) { // klu gagal, maka...

        res.status(500).json({  // kirim error ke client, krena error 500 itu error internal server
            message: error
        });

    }

}
exports.get_invoice_api = async (req, res) => { // function middleware untk route GET '/api/v1/get-invoice'
    try { // klu sukses, maka...

        let userId = await req.session.dataProfile.userId; // ambil Id User yg sedang login atau yg sdg pesan

        let dataInvoice = []; // buat array kosong untk menampung data invoice User


        let invoiceUser = await User.aggregate([ // untk ambil data history invoice user tpi di sorting dari data tanggal yg terbaru. Stage Operator yg bisa di pakai di aggregate pipeline stage : https://stackoverflow.com/questions/50605448/differences-between-project-filter-and-match-in-mongodb
            {
                $match: { // cari data user berdasarkan id user
                    _id: buatObjectId(userId) // kita kirim id user ke function buatObjectId dulu untk di convert ke ObjectId, krena : https://stackoverflow.com/questions/36193289/moongoose-aggregate-match-does-not-match-ids
                }
            },
            {
                $unwind: '$history_invoice' // kyk destructuring, yg nnti elemen object dlm array akan di pecah menjadi dokumen sendiri, yg nntinya akan di pakai untk di manipulasi pada tahap pipeline berikutnya : https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/
            },
            {
                $sort: { // sort tiap document data berdasarkan tanggal yg terbaru
                    'history_invoice.date': -1 // -1 artinya descending, 1 artinya ascending
                }
            },
            {
                $group: {  // tahap group ini yaitu dokumen yg sdh di grouping berdasarkan kriteria yg diberikan, akan di satukan menjadi satu dokumen yg berisi data dari dokumen yg sesuai kriteria yg diberikan. Docs : https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/#mongodb-pipeline-pipe.-group
                    _id: '$_id', // _id ini adalah id user
                    results: { // ini adalah nama field yg akan di grouping
                        $push: '$history_invoice' // ambil elemen history_invoice yg sdh di unwind dan sdh di sort, lalu di push ke array baru yg nnti akan di simpan di field history_invoice
                    }
                }
            }
        ]);


        if (invoiceUser.length == 0) { // klu data invoice user kosong, maka...
            res.json({ // kirim data invoice ke client
                dataInvoice: dataInvoice
            })
            return; // hentikan proses
        }


        for (let data of invoiceUser[0].results) { // kita pakai loop for of dan nd pakai forEach, krena forEach itu asyncronus jadi function callback trus, jadi kita nd bisa pakai await di dalamnya. Baca ini : https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop

            let result = await ambilInvoice(data.idinvoice); // ambil data invoice berdasarkan id invoice

            dataInvoice.push(result); // lalu push ke array kosong yg sdh kita buat tadi

        };



        res.json({ // kirim data invoice ke client
            dataInvoice: dataInvoice
        })


    } catch (error) { // klu gagal, maka...

        res.status(500).json({  // kirim error ke client, krena error 500 itu error internal server
            message: error
        });

    }

}
exports.close_invoice_api = async (req, res) => { // function middleware untk route PUT '/api/v1/close-invoice'
    try { // klu sukses, maka...

        let invoiceId = req.params.idInvoice; // ambil invoice id yg dikirimkan dari client

        await tutupInvoice(invoiceId) // tutup invoice
            .then((result) => { // klu sukses, maka...
                res.status(201).json({
                    message: 'Invoice berhasil ditutup'
                })
            });

    } catch (error) { // klu gagal, maka...

        res.status(500).json({  // kirim error ke client, krena error 500 itu error internal server
            message: error
        });

    }

}
exports.del_invoice_api = async (req, res) => { // function middleware untk route DELETE '/api/v1/del-invoice'
    try { // klu sukses, maka...

        let userId = await req.session.dataProfile.userId; // ambil Id User yg sedang login

        let invoiceId = req.params.idInvoice; // ambil invoice id yg dikirimkan dari client

        await User.updateOne({ // cari data user di database mongoDB dan update data history_invoicenya
            _id: userId, // cari document berdasarkan id user yg sedang login
        }, {
            $pull: { // hapus data history_invoicenya yg punya idinvoice yg sama dgn idinvoice yg dikirimkan dari client. Docs: https://www.mongodb.com/docs/manual/reference/operator/update/pull/#mongodb-update-up.-pull
                history_invoice: {
                    idinvoice: invoiceId // hapus data cart yg punya idinvoice yg sama dgn invoiceId yg dikirimkan dari client
                }
            }
        })
            .then((result) => {

                res.status(201).json({
                    message: 'Invoice berhasil dihapus'
                })

            })

    } catch (error) { // klu gagal, maka...

        res.status(500).json({  // kirim error ke client, krena error 500 itu error internal server
            message: error
        });

    }

}




exports.saveTransaction_api = async (req, res) => { // function middleware untk route POST /api/v1/saveTransaction
    try { // klu sukses, maka...

        let userId = await req.session.dataProfile.userId; // ambil Id User yg sedang login atau yg sdg pesan

        let alldataUserProfile = await User.findById(userId); // ambil data user dari database berdasarkan id mereka

        let { deskripsiproduk, metodepembayaran, paymentgate_invoiceid } = req.body // ambil data transaksi yg user buat

        let keteranganproduk = alldataUserProfile.cartproducts; // ambil isi cart user supaya dimasukkan ke variabel keterangan produk



        let transaction = new Transaction({  // Format kalau mau save data transaksi user ke database
            idpembeli: alldataUserProfile._id,
            namapembeli: alldataUserProfile.fullname,
            emailpembeli: alldataUserProfile.email,
            notelppembeli: alldataUserProfile.notelp,
            deskripsiproduk: deskripsiproduk,
            keteranganproduk: keteranganproduk,
            metodepembayaran: metodepembayaran,
            paymentgate_invoiceid: paymentgate_invoiceid,
        });


        transaction.save((err, data) => {  // Untk Save ke database transaction
            if (err) {
                console.log(err);
            }

            res.status(201).redirect('back'); // tampilkan halaman yg sedang user berada

        });

    } catch (error) { // klu gagal, maka...

        res.status(500).json({  // kirim error ke client, krena error 500 itu error internal server
            message: error
        });

    }

}




exports.register_shop_page = async (req, res) => { // function middleware untk route GET '/seller/register-shop/:idUser'
    try { // klu sukses, maka...

        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK
        if (!regexMongoDbId(req.params.idUser)) { // kalau mongoDB punya Id yg dikirimkan dari client tidak sesuai dengan regex, maka...
            return res.redirect('/'); // redirect ke halaman landing page
        }
        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        let msg = await req.session.msgFlsh; // ambil data msgFlsh dari session
        delete req.session.msgFlsh; // hapus session msgFlsh

        let alldataUserProfile = await User.findById(req.params.idUser); // ambil data user dari database berdasarkan id mereka


        res.render('register-shop.ejs', { // panggil file register-shop.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: 'Registrasi Toko | Frizfoo', // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile,
            flshMsg: msg,
            alldataUserProfile: alldataUserProfile
        })

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}
exports.register_shop_page_post = async (req, res) => { // function middleware untk route POST '/seller/register-shop/:idUser'
    try { //klu sukses, maka...

        // VALIDATE INPUTAN DARI FORM REGISTER SHOP
        let { error } = registerShopValidation(req.body); // validasi inputan user
        let notelpvalid = validator.isMobilePhone(req.body.notelp, 'id-ID'); // cek apakah inputan no telp benar atau tidak

        if (error) { // jika ada error
            req.session.msgFlsh = error.details[0].message; // kasih tau session ada msgFlsh
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect(`/seller/register-shop/${req.params.idUser}`); // redirect ke halaman register shop
            });
            return; // klu sdh di save, maka return supaya tidak lanjut ke bawah
        }


        if (!notelpvalid) { // jika no telp tidak valid
            req.session.msgFlsh = 'No telp Tidak Valid'; // kasih tau session ada msgFlsh
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect(`/seller/register-shop/${req.params.idUser}`); // redirect ke halaman register shop
            });
            return; // klu sdh di save, maka return supaya tidak lanjut ke bawah
        }
        // VALIDATE INPUTAN DARI FORM REGISTER SHOP


        const { idpemiliktoko, namatoko, alamat, email, notelp, kota, kecamatan, provinsi, kodepos } = req.body; // ambil inputan dari form register shop


        let seller = new Seller({  // Format kalau User mau Daftar Toko Baru di Frizfoo
            idpemiliktoko: idpemiliktoko,
            namatoko: namatoko,
            alamat: alamat,
            kota: kota,
            kecamatan: kecamatan,
            provinsi: provinsi,
            kodepos: kodepos,
            email: email,
            notelp: notelp,
        });

        seller.save(async (err, data) => {  // Untk Save ke database seller
            if (err) {
                console.log(err);
            }

            // Kirim id toko yg sdh di buat ke database user
            await User.updateOne(
                {
                    _id: `${req.params.idUser}`// kriteria document yg akan diupdate
                },
                {
                    $set: { // data yg akan diupdate
                        idtokouser: data._id // masukkan id toko yg sdh di buat ke databse user
                    }
                }
            )
                .then((result) => { // klu sukses, maka...

                    req.session.msgFlsh = 'Toko Berhasil di Buat'; // kirim pesan flash ke client
                    req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                        if (err) {
                            console.log(err);
                        }
                        res.redirect(`/seller/profile-shop/${data._id}`); // redirect ke halaman seller Dashboard
                    });

                });

        });


    } catch (error) { //klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}




exports.profile_shop_page = async (req, res) => { // function middleware untk route GET '/seller/profile-shop/:idSeller'
    try { // klu sukses, maka...

        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK
        if (!regexMongoDbId(req.params.idSeller)) { // kalau mongoDB punya Id yg dikirimkan dari client tidak sesuai dengan regex, maka...
            return res.redirect('/'); // redirect ke halaman landing page
        }
        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        let msg = await req.session.msgFlsh; // ambil data msgFlsh dari session
        delete req.session.msgFlsh; // hapus session msgFlsh

        let alldataUserProfile = await User.findById(dataProfile.userId); // ambil data user dari database berdasarkan id mereka
        let alldataSellerProfile = await Seller.findById(req.params.idSeller); // ambil data seller dari database berdasarkan id mereka


        res.render('seller-dashboard.ejs', { // panggil file seller-dashboard.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: 'Seller Centre Dashboard | Frizfoo', // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile,
            flshMsg: msg,
            alldataUserProfile: alldataUserProfile,
            alldataSellerProfile: alldataSellerProfile
        });

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}
exports.profile_shop_page_post = async (req, res) => { // function middleware untk route POST '/seller/profile-shop/:idSeller'
    try {  // klu sukses, maka...

        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK
        if (!regexMongoDbId(req.params.idSeller)) { // kalau mongoDB punya Id yg dikirimkan dari client tidak sesuai dengan regex, maka...
            return res.redirect('/'); // redirect ke halaman landing page
        }
        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK


        if (!req.files) {  // Cek apakah ada file yang diupload
            req.session.msgFlsh = 'File Tidak Ditemukan'; // kirim pesan flash ke client
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect(`/seller/profile-shop/${req.params.idSeller}`); // redirect ke halaman Dashboard Seller
            });
            return; // hentikan proses
        }


        let allowedExtension = ['.png', '.jpg', '.jpeg', '.jfif', '.gif', '.webp']; //  ekstensi file yg diizinkan
        let fileNameExtension = path.extname(req.files.sellerpicid.name); // ambil ekstensi file yg diupload

        if (!allowedExtension.includes(fileNameExtension)) {  // Cek extensi file image yg diupload

            fs.unlinkSync(`${req.files.sellerpicid.tempFilePath}`);  // pakai fs.unlinkSync, supaya file yg gagal diupload, bisa langsung dihapus dari folder temp

            req.session.msgFlsh = 'Harap Upload File Gambar Hanya Dengan Ekstensi .png, .jpg, .jpeg, .jfif, .gif, .webp'; // kirim pesan flash ke client
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect(`/seller/profile-shop/${req.params.idSeller}`); // redirect ke halaman Dashboard Seller
            });
            return; // hentikan proses
        }


        // Panggil function upImgSellerProfile untuk mengupload file yg diupload user ke google drive
        let idSellerProfileImg = await upImgSellerProfile(req.files.sellerpicid); // upload file profileImg ke Google Drive



        // KIRIM DATA SELLER YANG SUDAH DIUPDATE KE DATABASE
        await Seller.updateOne(
            {
                _id: req.params.idSeller // kriteria document yg akan diupdate
            },
            {
                $set: { // data yg akan diupdate
                    sellerpicid: idSellerProfileImg
                }
            }
        )
            .then((result) => { // klu sukses, maka...

                req.session.msgFlsh = 'Profile Picture Anda Berhasil di Upload!'; // kirim pesan flash ke client
                req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                    if (err) {
                        console.log(err);
                    }
                    res.redirect(`/seller/profile-shop/${req.params.idSeller}`); // redirect ke halaman Dashboard Seller
                });

            });

    } catch (error) {  // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}




exports.add_new_product_page = async (req, res) => { // function middleware untk route GET '/seller/add-new-product/:idSeller'
    try { // klu sukses, maka...

        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK
        if (!regexMongoDbId(req.params.idSeller)) { // kalau mongoDB punya Id yg dikirimkan dari client tidak sesuai dengan regex, maka...
            return res.redirect('/'); // redirect ke halaman landing page
        }
        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        let msg = await req.session.msgFlsh; // ambil data msgFlsh dari session
        delete req.session.msgFlsh; // hapus session msgFlsh

        let alldataUserProfile = await User.findById(dataProfile.userId); // ambil data user dari database berdasarkan id mereka
        let alldataSellerProfile = await Seller.findById(req.params.idSeller); // ambil data seller dari database berdasarkan id mereka


        res.render('add-new-product.ejs', { // panggil file add-new-product.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: 'Tambah Produk Baru | Frizfoo', // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile,
            flshMsg: msg,
            alldataUserProfile: alldataUserProfile,
            alldataSellerProfile: alldataSellerProfile
        });

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}
exports.add_new_product_page_post = async (req, res) => { // function middleware untk route POST '/seller/add-new-product/:idSeller'
    try { // klu sukses, maka...

        // VALIDATE INPUTAN DARI FORM ADD NEW PRODUCT
        let { error } = addNewProductValidation(req.body); // validasi inputan user
        let notelpvalid = validator.isMobilePhone(req.body.notelppenjual, 'id-ID'); // cek apakah inputan no telp benar atau tidak

        if (error) { // jika ada error
            req.session.msgFlsh = error.details[0].message; // kasih tau session ada msgFlsh
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect(`/seller/add-new-product/${req.params.idSeller}`); // redirect ke halaman form add new product
            });
            return; // klu sdh di save, maka return supaya tidak lanjut ke bawah
        }

        if (!notelpvalid) { // jika no telp tidak valid
            req.session.msgFlsh = 'No telp Tidak Valid'; // kasih tau session ada msgFlsh
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect(`/seller/add-new-product/${req.params.idSeller}`); // redirect ke halaman add new product
            });
            return; // klu sdh di save, maka return supaya tidak lanjut ke bawah
        }
        // VALIDATE INPUTAN DARI FORM ADD NEW PRODUCT


        // VALIDASI FILE IMAGE PRODUCTS DARI FORM ADD NEW PRODUCT
        if (!req.files) {  // Cek apakah ada file yang diupload
            req.session.msgFlsh = 'File Foto Tidak Ditemukan'; // kirim pesan flash ke client
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect(`/seller/add-new-product/${req.params.idSeller}`); // redirect ke halaman Form Add New Product
            });
            return; // hentikan proses
        }

        let allowedExtension = ['.png', '.jpg', '.jpeg', '.jfif', '.gif', '.webp']; //  ekstensi file yg diizinkan

        // Filter extensi file yg bisa diupload, baik itu user upload 1 file atau lebih dari 1 file
        if (!(Array.isArray(req.files.picproducts))) { // untk fitler ekstensi file yg diupload, jika file yg diupload hanya 1 file, maka...

            let fileNameExtension = path.extname(req.files.picproducts.name); // ambil ekstensi file yg diupload

            if (!allowedExtension.includes(fileNameExtension)) {  // Cek extensi file image yg diupload

                fs.unlinkSync(`${req.files.picproducts.tempFilePath}`);  // pakai fs.unlinkSync, supaya file yg gagal diupload, bisa langsung dihapus dari folder temp

                req.session.msgFlsh = 'Harap Upload File Gambar Hanya Dengan Ekstensi .png, .jpg, .jpeg, .jfif, .gif, .webp'; // kirim pesan flash ke client
                req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                    if (err) {
                        console.log(err);
                    }
                    res.redirect(`/seller/add-new-product/${req.params.idSeller}`); // redirect ke halaman Form Add New Product
                });
                return; // hentikan proses
            }

        } else { // untk fitler ekstensi file yg diupload, jika file yg diupload lebih dari 1 file, filter semuanya dulu

            for (let x = 0; x < req.files.picproducts.length; x++) {

                let fileNameExtension = path.extname(req.files.picproducts[x].name); // ambil ekstensi file yg diupload

                if (!allowedExtension.includes(fileNameExtension)) {  // Cek extensi file image yg diupload

                    // loop untk hapus file yg gagal diupload / file yg tidak sesuai ekstensi
                    for (let y = 0; y < req.files.picproducts.length; y++) {

                        fs.unlinkSync(`${req.files.picproducts[y].tempFilePath}`);  // pakai fs.unlinkSync, supaya file yg gagal diupload, bisa langsung dihapus dari folder temp

                    }

                    req.session.msgFlsh = 'Harap Upload File Gambar Hanya Dengan Ekstensi .png, .jpg, .jpeg, .jfif, .gif, .webp'; // kirim pesan flash ke client
                    req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                        if (err) {
                            console.log(err);
                        }
                        res.redirect(`/seller/add-new-product/${req.params.idSeller}`); // redirect ke halaman Form Add New Product
                    });
                    return; // hentikan proses
                }

            }

        }

        // Filter supaya img yg di upload tdk kurang dari 4 file image dan buat validasi khusus klu req.files.picproducts bukan array krena artinya user hanya upload 1 file image
        if (!(Array.isArray(req.files.picproducts))) {  // klu req.files.picproducts bukan array, artinya itu hanya 1 file image yg diupload, krena klu user up 1 image maka req.files.picproducts akan berupa object bukan array

            fs.unlinkSync(`${req.files.picproducts.tempFilePath}`);  // pakai fs.unlinkSync, supaya file yg gagal diupload, bisa langsung dihapus dari folder temp

            req.session.msgFlsh = 'Harap Mengupload Minimal 4 Gambar Untk 1 Produk.'; // kirim pesan flash ke client
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect(`/seller/add-new-product/${req.params.idSeller}`); // redirect ke halaman Form Add New Product
            });
            return; // hentikan proses

        } else
            if (req.files.picproducts.length < 4) {  // klu file image yg diupload kurang dari 4 file, maka...

                // loop untk hapus file yg tdk jadi di upload krena kurang dari 4 file
                for (let z = 0; z < req.files.picproducts.length; z++) {

                    fs.unlinkSync(`${req.files.picproducts[z].tempFilePath}`);  // pakai fs.unlinkSync, supaya file yg gagal diupload, bisa langsung dihapus dari folder temp

                }

                req.session.msgFlsh = 'Harap Mengupload Minimal 4 Gambar Untk 1 Produk.'; // kirim pesan flash ke client
                req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                    if (err) {
                        console.log(err);
                    }
                    res.redirect(`/seller/add-new-product/${req.params.idSeller}`); // redirect ke halaman Form Add New Product
                });
                return; // hentikan proses

            }
        // VALIDASI FILE IMAGE PRODUCTS DARI FORM ADD NEW PRODUCT


        const { idpenjual, kotapenjual, notelppenjual, penjual, namaproduct, merekproduct, rating, hargaproduct, beratproduct, stokproduct, masasimpanproduct, deskripsiproduct } = req.body; // ambil inputan dari form add new product



        // Looping untk upload file image products ke google drive
        let idImgProducts = []; // array kosong untuk menampung id file image products yg diupload ke google drive
        for (let i = 0; i < req.files.picproducts.length; i++) {
            let idImgProduct = await upImgSellerProducts(req.files.picproducts[i]); // upload file image products ke Google Drive
            idImgProducts.push(idImgProduct); // push id file image products ke array idImgProducts
        }


        // masukkan data produk ke database seller field products
        await Seller.updateOne(   // Query untk push data produk baru ke array products
            {
                _id: `${req.params.idSeller}` // kriteria document yg akan diupdate
            },
            {
                $push: { // update data array
                    products: {
                        productpicid: idImgProducts,
                        idpenjual: idpenjual,
                        penjual: penjual,
                        kotapenjual: kotapenjual,
                        notelppenjual: notelppenjual,
                        namaproduct: namaproduct,
                        merekproduct: merekproduct,
                        rating: rating,
                        hargaproduct: hargaproduct,
                        deskripsiproduct: deskripsiproduct,
                        beratproduct: [beratproduct],
                        stokproduct: stokproduct,
                        masasimpanproduct: masasimpanproduct,
                    }
                }
            }
        ).then((result) => {  // klu sukses, maka...

            req.session.msgFlsh = 'Produk Baru Anda Telah Berhasil diTambahkan'; // kirim pesan flash ke client
            req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                if (err) {
                    console.log(err);
                }
                res.redirect(`/seller/profile-shop/${req.params.idSeller}`); // redirect ke halaman seller Dashboard
            });

        });


    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}




exports.update_seller_dashboard_page = async (req, res) => { // function middleware untk route GET '/seller/update-seller-dashboard/:idSeller'
    try { // klu sukses, maka...

        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK
        if (!regexMongoDbId(req.params.idSeller)) { // kalau mongoDB punya Id yg dikirimkan dari client tidak sesuai dengan regex, maka...
            return res.redirect('/'); // redirect ke halaman landing page
        }
        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        let alldataUserProfile = await User.findById(dataProfile.userId); // ambil data user dari database berdasarkan id mereka
        let alldataSellerProfile = await Seller.findById(req.params.idSeller); // ambil data seller dari database berdasarkan id mereka


        res.render('update-seller-dashboard.ejs', { // panggil file update-seller-dashboard.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: 'Update Seller Dashboard | Frizfoo', // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile,
            flshMsg: '',
            alldataUserProfile: alldataUserProfile,
            alldataSellerProfile: alldataSellerProfile
        })

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}
exports.update_seller_dashboard_page_put = async (req, res) => { // function middleware untk route PUT '/seller/update-seller-dashboard/:idSeller'
    try { // klu sukses, maka...

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        // VALIDATE INPUTAN DARI FORM UPDATE SELLER DASHBOARD
        let { error } = updateSellerDashboardValidation(req.body); // validasi inputan user
        let notelpvalid = validator.isMobilePhone(req.body.notelp, 'id-ID'); // cek apakah inputan no telp benar atau tidak

        if (error) { // jika ada error, render halaman update-seller-dashboard.ejs kembali dan kirimkan pesan errornya dan data user yg sudah diinputkan tadi

            return res.render('update-seller-dashboard.ejs', { // panggil file update-seller-dashboard.ejs dlm folder views dan kirim data dibawah ini
                layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
                title: 'Update Seller Dashboard | Frizfoo', // title dari halaman ini
                cdnswiperjs: '',
                dataProfile: dataProfile,
                flshMsg: error,
                alldataSellerProfile: req.body
            })

        }

        if (!notelpvalid) { // jika no telp tidak valid, render halaman update-seller-dashboard.ejs kembali dan kirimkan pesan errornya dan data user yg sudah diinputkan tadi

            return res.render('update-seller-dashboard.ejs', { // panggil file update-seller-dashboard.ejs dlm folder views dan kirim data dibawah ini
                layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
                title: 'Update Seller Dashboard | Frizfoo', // title dari halaman ini
                cdnswiperjs: '',
                dataProfile: dataProfile,
                flshMsg: 'No telp Tidak Valid',
                alldataSellerProfile: req.body
            })

        }
        // VALIDATE INPUTAN DARI FORM UPDATE SELLER DASHBOARD



        // KIRIM DATA SELLER YANG SUDAH DIUPDATE KE DATABASE
        await Seller.updateOne(
            {
                _id: req.body._id  // kriteria document yg akan diupdate
            },
            {
                $set: { // data Toko Seller yg akan diupdate
                    idpemiliktoko: req.body.idpemiliktoko,
                    namatoko: req.body.namatoko,
                    alamat: req.body.alamat,
                    kota: req.body.kota,
                    kecamatan: req.body.kecamatan,
                    provinsi: req.body.provinsi,
                    kodepos: req.body.kodepos,
                    email: req.body.email,
                    notelp: req.body.notelp,
                }
            }
        )
            .then((result) => { // klu sukses, maka...

                req.session.msgFlsh = 'Data Seller Dashboard Berhasil di Ubah!'; // kirim pesan flash ke client
                req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                    if (err) {
                        console.log(err);
                    }
                    res.redirect(`/seller/profile-shop/${req.body._id}`); // redirect ke halaman Seller Dashboard
                });

            });


    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}




exports.seller_product_api = async (req, res) => { // function middleware untk route GET '/api/v1/seller/seller-product?page=0&urutkan=1'
    try { // klu sukses, maka...

        let userId = await req.session.dataProfile.userId; // ambil id user dari session user yg sedang login

        let alldataUserProfile = await User.findById(userId); // ambil data user dari database berdasarkan id mereka

        let urutkan = req.query.urutkan || -1; // ambil nilai urutkan dari query string (?urutkan=1) artinya kita ambil nilai urutkan yaitu -1
        const page = req.query.page || 0; // get current page from query string (?page=1) artinnya kita ambil nilai pagenya yaitu 1
        const itemsPerPage = 8; // set books per page



        // Pakai aggregate untuk mengambil semua data products dari collection sellers yg di inginkan dan push ke array baru langsung, tanpa perlu looping. Dgn aggregate jg kita bisa sekalian melakukan match, sort, limit, skip, dll
        let products = await Seller.aggregate([ // untk ambil seluruh data products dari collection seller. Stage Operator yg bisa di pakai di aggregate pipeline stage : https://stackoverflow.com/questions/50605448/differences-between-project-filter-and-match-in-mongodb
            {
                $match: { // match data seller berdasarkan idtokouser
                    _id: buatObjectId(alldataUserProfile.idtokouser) // ambil collection seller berdasarkan idtokouser yg sdh di ambil dari data user yg sdh punya idtokouser krena sdh buat toko seller. kita kirim idtokouser ke function buatObjectId dulu untk di convert ke ObjectId, krena : https://stackoverflow.com/questions/36193289/moongoose-aggregate-match-does-not-match-ids
                }
            },
            {
                $unwind: '$products' // kyk destructuring, yg nnti elemen object dlm array akan di pecah menjadi dokumen sendiri, yg nntinya akan di pakai untk di manipulasi pada tahap pipeline berikutnya : https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/
            },
            {
                $sort: { // sort tiap document data berdasarkan field create_at / kpn data di buat
                    'products.created_at': parseInt(urutkan) // -1 artinya descending atau dari yg terbaru ke yg terlama, 1 artinya ascending atau dari yg terlama ke yg terbaru
                }
            },
            {
                // skip bbrp item, tergantung page yg di kirim dari client
                $skip: page * itemsPerPage // skip data berdasarkan page yg di kirim dari client
            },
            {
                // limit item per page nya
                $limit: itemsPerPage // limit item per page nya
            },
            {
                $group: {  // tahap group ini yaitu dokumen yg sdh di grouping berdasarkan kriteria yg diberikan, akan di satukan menjadi satu dokumen yg berisi data dari dokumen yg sesuai kriteria yg diberikan. Docs : https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/#mongodb-pipeline-pipe.-group
                    _id: '', // _id ini adalah field yg akan dijadikan sebagai key utk grouping dokumen, jadi dokumen yg memiliki
                    results: { // ini adalah nama field yg akan di grouping
                        $push: '$products' // ambil elemen products yg sdh di unwind dan sdh di sort, lalu di push ke array baru yg nnti akan di simpan di field products
                    }
                }
            }
        ]);

        let productNext = await Seller.aggregate([ // untk ambil seluruh data products dari collection seller. Stage Operator yg bisa di pakai di aggregate pipeline stage : https://stackoverflow.com/questions/50605448/differences-between-project-filter-and-match-in-mongodb
            {
                $match: { // match data seller berdasarkan idtokouser
                    _id: buatObjectId(alldataUserProfile.idtokouser) // ambil collection seller berdasarkan idtokouser yg sdh di ambil dari data user yg sdh punya idtokouser krena sdh buat toko seller. kita kirim idtokouser ke function buatObjectId dulu untk di convert ke ObjectId, krena : https://stackoverflow.com/questions/36193289/moongoose-aggregate-match-does-not-match-ids
                }
            },
            {
                $unwind: '$products' // kyk destructuring, yg nnti elemen object dlm array akan di pecah menjadi dokumen sendiri, yg nntinya akan di pakai untk di manipulasi pada tahap pipeline berikutnya : https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/
            },
            {
                $sort: { // sort tiap document data berdasarkan field create_at / kpn data di buat
                    'products.created_at': parseInt(urutkan) // -1 artinya descending atau dari yg terbaru ke yg terlama, 1 artinya ascending atau dari yg terlama ke yg terbaru
                }
            },
            {
                // skip bbrp item, tergantung page yg di kirim dari client
                $skip: (page + 1) * itemsPerPage // skip data berdasarkan page yg di kirim dari client, tpi tambah 1 utk mengecek apakah ada data selanjutnya atau tidak
            },
            {
                // limit item per page nya
                $limit: itemsPerPage // limit item per page nya
            },
            {
                $group: {  // tahap group ini yaitu dokumen yg sdh di grouping berdasarkan kriteria yg diberikan, akan di satukan menjadi satu dokumen yg berisi data dari dokumen yg sesuai kriteria yg diberikan. Docs : https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/#mongodb-pipeline-pipe.-group
                    _id: '', // _id ini adalah field yg akan dijadikan sebagai key utk grouping dokumen, jadi dokumen yg memiliki
                    results: { // ini adalah nama field yg akan di grouping
                        $push: '$products' // ambil elemen products yg sdh di unwind dan sdh di sort, lalu di push ke array baru yg nnti akan di simpan di field products
                    }
                }
            }
        ]);



        // klu data product 0 atau tidak ada, maka...
        if (products.length == 0) {
            res.status(200).json({  // kirim response ke client, kode status 200 yg artinya sukses, dan kirimkan data productfinal
                pagination: {
                    current_page: page, // kirimkan page yg sedang diakses
                    has_next_page: false, // kirimkan indikator apakah ada page selanjutnya atau tidak
                },
                status: 'Success',
                message: 'Success get all products',
                products: [] // kirimkan data products kosong
            });
            return; // hentikan proses
        }



        // Indikator Apakah Ada Next Page atau Tidak
        let has_next_page;

        if (products[0].results.length > 0) { // klu data products lebih dari 0, maka...
            let totalPage;

            if (products[0].results.length % itemsPerPage == 0) { // klu jumlah data products habis dibagi itemsPerPage, maka...

                totalPage = products[0].results.length / itemsPerPage; // hitung total page, dgn cara jumlah data products dibagi itemsPerPage


            } else { // klu tidak, maka...

                totalPage = Math.ceil(products[0].results.length / itemsPerPage); // klu jumlah data products tidak habis dibagi itemsPerPage, maka hitung total page

            }


            if (page < totalPage) { // klu page yg sedang diakses lbh kecil dari total TOTAL PAGE - 1, maka...

                // untk cek kalau nd ada data selanjutnya, maka...
                if (productNext.length == 0) {
                    has_next_page = false; // berarti sudah di page terakhir
                } else {
                    has_next_page = true; // berarti masih ada page selanjutnya
                }

            } else { // klu tidak, maka...

                has_next_page = false; // berarti sudah di page terakhir

            }

        }



        res.status(200).json({  // kirim response ke client, kode status 200 yg artinya sukses, dan kirimkan data productfinal
            pagination: {
                current_page: page, // kirimkan page yg sedang diakses
                has_next_page: has_next_page, // kirimkan indikator apakah ada page selanjutnya atau tidak
            },
            status: 'Success',
            message: 'Success get all products',
            products: products[0].results // kirimkan data products yg sdh di grouping
        });

    } catch (error) { // klu gagal, maka...

        res.status(500).json({  // kirim error ke client, krena error 500 itu error internal server
            message: error
        });

    }

}
exports.del_seller_product_api = async (req, res) => { // function middleware untk route DELETE '/api/v1/seller/del-seller-product/:idProduct'
    try { // klu sukses, maka...

        let userId = await req.session.dataProfile.userId; // ambil id user dari session user yg sedang login

        let alldataUserProfile = await User.findById(userId); // ambil data user dari database berdasarkan id mereka

        let idProduct = req.params.idProduct; // ambil id product yg akan dihapus


        await Seller.updateOne(
            { // Query untk Hapus data Product di array products
                _id: alldataUserProfile.idtokouser, // kriteria document yg akan diupdate
            },
            {
                $pull: { // hapus data products yg punya idproduct yg sama dgn idproduct yg dikirimkan dari client. Docs: https://www.mongodb.com/docs/manual/reference/operator/update/pull/#mongodb-update-up.-pull
                    products: {
                        _id: idProduct // // kriteria document yg akan hapus dari array products
                    }
                }
            })
            .then((result) => {

                req.session.msgFlsh = 'Produk Anda Telah DiHapus'; // kirim pesan flash ke client
                req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                    if (err) {
                        console.log(err);
                    }
                    res.status(201).redirect('back'); // tampilkan halaman yg sedang user berada
                });

            })

    } catch (error) { // klu gagal, maka...

        res.status(500).json({  // kirim error ke client, krena error 500 itu error internal server
            message: error
        });

    }

}




exports.update_seller_product_page = async (req, res) => { // function middleware untk route GET '/seller/update-seller-product/:idProduct'
    try { // klu sukses, maka...

        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK
        if (!regexMongoDbId(req.params.idProduct)) { // kalau mongoDB punya Id yg dikirimkan dari client tidak sesuai dengan regex, maka...
            return res.redirect('/'); // redirect ke halaman landing page
        }
        // VALIDASI MONGODB ID DGN REGEX, VALID ATAU TIDAK

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login


        let alldataUserProfile = await User.findById(dataProfile.userId); // ambil data user dari database berdasarkan id mereka


        // ADA 2 CARA QUERYNYA UNTK AMBIL DATA DETAIL DARI PRODUCT YG SELLER MAU UPDATE, CARA 1 :
        // let alldataProductDetail = await Seller.findOne({ // cari data seller di database mongoDB
        //     'products._id': req.params.idProduct // cari data seller yg punya product dengan id yg sama dgn id yg dikirimkan dari client
        // }, 'products.$'); // hanya ambil field products, .$ artinya ambil data products yg pertama kali ketemu yang cocok dengan kondisi kueri. Docs : https://docs.mongodb.com/manual/reference/operator/projection/positional/


        // CARA 2 :
        let alldataProductDetail = await Seller.findOne({
            '_id': alldataUserProfile.idtokouser, // cari data seller di database mongoDB
            'products._id': req.params.idProduct // cari data seller yg punya product dengan id yg sama dgn id yg dikirimkan dari client
        }, { products: { $elemMatch: { _id: req.params.idProduct } } }); // hanya ambil field products yg tpi yg punya field _id yg sama dgn id yg dikirimkan dari client. Dan $elemMatch artinya ambil data products yg pertama kali ketemu yang cocok dengan kondisi kueri. Docs : https://docs.mongodb.com/manual/reference/operator/projection/positional/




        res.render('update-product-details.ejs', { // panggil file update-product-details.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: 'Update Product Details | Frizfoo', // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile,
            flshMsg: '',
            alldataUserProfile: alldataUserProfile,
            alldataProductDetail: alldataProductDetail.products[0]
        })

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}
exports.update_seller_product_page_put = async (req, res) => { // function middleware untk route PUT '/seller/update-seller-product/:idProduct'
    try { // klu sukses, maka...

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        // VALIDATE INPUTAN DARI FORM UPDATE DATA PRODUCT
        let { error } = updateSellerProductValidation(req.body); // validasi inputan user
        let notelpvalid = validator.isMobilePhone(req.body.notelppenjual, 'id-ID'); // cek apakah inputan no telp benar atau tidak

        if (error) { // jika ada error, render halaman update-product-details.ejs kembali dan kirimkan pesan errornya dan data user yg sudah diinputkan tadi

            return res.render('update-product-details.ejs', { // panggil file update-product-details.ejs dlm folder views dan kirim data dibawah ini
                layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
                title: 'Update Product Details | Frizfoo', // title dari halaman ini
                cdnswiperjs: '',
                dataProfile: dataProfile,
                flshMsg: error,
                alldataProductDetail: req.body
            })

        }

        if (!notelpvalid) { // jika no telp tidak valid, render halaman update-product-details.ejs kembali dan kirimkan pesan errornya dan data user yg sudah diinputkan tadi

            return res.render('update-product-details.ejs', { // panggil file update-product-details.ejs dlm folder views dan kirim data dibawah ini
                layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
                title: 'Update Product Details | Frizfoo', // title dari halaman ini
                cdnswiperjs: '',
                dataProfile: dataProfile,
                flshMsg: 'No telp Tidak Valid',
                alldataProductDetail: req.body
            })

        }
        // VALIDATE INPUTAN DARI FORM UPDATE DATA PRODUCT


        const { idpenjual, kotapenjual, notelppenjual, penjual, namaproduct, merekproduct, rating, hargaproduct, beratproduct, stokproduct, masasimpanproduct, deskripsiproduct } = req.body; // ambil inputan dari form add new product


        // KIRIM DATA SELLER YANG SUDAH DIUPDATE KE DATABASE
        await Seller.updateOne(
            {
                _id: req.body.idpenjual, // dokumen yg akan diupdate itu berdasarkan id penjual
                'products._id': req.body._id // dan di dalam field productsnya, cari document dgn id yg sama dgn id yg dikirimkan dari client
            },
            {
                $set: { // data Toko Seller yg akan diupdate
                    "products.$.idpenjual": idpenjual,
                    "products.$.penjual": penjual,
                    "products.$.kotapenjual": kotapenjual,
                    "products.$.notelppenjual": notelppenjual,
                    "products.$.namaproduct": namaproduct,
                    "products.$.merekproduct": merekproduct,
                    "products.$.rating": rating,
                    "products.$.hargaproduct": hargaproduct,
                    "products.$.deskripsiproduct": deskripsiproduct,
                    "products.$.beratproduct": [beratproduct],
                    "products.$.stokproduct": stokproduct,
                    "products.$.masasimpanproduct": masasimpanproduct,
                }
            }
        )
            .then((result) => { // klu sukses, maka...

                req.session.msgFlsh = 'Data Produk Anda Berhasil di Ubah!'; // kirim pesan flash ke client
                req.session.save((err) => { // Untuk Pastikan session sudah tersimpan
                    if (err) {
                        console.log(err);
                    }
                    res.redirect(`/seller/profile-shop/${req.body.idpenjual}`); // redirect ke halaman Seller Dashboard
                });

            });


    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}




exports.search_page = async (req, res) => { // function middleware untk route GET '/search'
    try { // klu sukses, maka...

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login


        let searchWord = req.query.q; // klu tnya npa pake req.query, maka cek ini : https://stackoverflow.com/questions/68513966/req-body-is-empty-for-a-form-get-request


        let dataSearchResult = await Seller.aggregate([ // pakai aggregate untk memproses bnyk dokumen dlm array, sehingga kita nnti bisa manipulasi data dlm array sesuai yg kita mau. Stage Operator yg bisa di pakai di aggregate pipeline stage : https://stackoverflow.com/questions/50605448/differences-between-project-filter-and-match-in-mongodb
            {
                $unwind: '$products' // kyk destructuring, yg nnti elemen object dlm array akan di pecah menjadi dokumen sendiri, yg nntinya akan di pakai untk di manipulasi pada tahap pipeline berikutnya : https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/
            },
            {
                $match: { // match untk, filter dokumen sesuai dengan kondisi yg diberikan dan hnya document yg sesuai kriteria yg diberikan yg akan di lanjutkan ke tahap pipeline berikutnya. Docs : https://www.mongodb.com/docs/manual/reference/operator/aggregation/match/
                    $or: [{
                        'products.namaproduct': {
                            $regex: searchWord,
                            $options: 'i'
                        }
                    }, {
                        'products.deskripsiproduct': {
                            $regex: searchWord,
                            $options: 'i'
                        }
                    }],
                }
            },
            {
                $group: { // tahap group ini yaitu dokumen yg sdh di grouping berdasarkan kriteria yg diberikan, akan di satukan menjadi satu dokumen yg berisi data dari dokumen yg sesuai kriteria yg diberikan. Docs : https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/#mongodb-pipeline-pipe.-group
                    _id: '$idpenjual', // id group hasil grouping
                    products: { $push: '$products' } // ambil elemen products yg sdh di unwind dan sdh di match, lalu di push ke array baru yg nnti akan di simpan di field products
                }
            }
        ]);



        res.render('search.ejs', { // panggil file search.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: `Jual ${req.query.q} | Frizfoo`, // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile,
            searchWord: searchWord,
            dataSearchResult: dataSearchResult,
        })

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}




exports.not_found_page = async (req, res) => { // function middleware untk route GET '/sembarang-url'
    try { // klu sukses, maka...

        let dataProfile = await req.session.dataProfile; // cek user sdh login atau blm, lalu ambil data dataProfile dari session user tersebut klu sdh login

        res.status(404); // kasih tau statusnya adalah 404
        res.render('404.ejs', { // panggil file 404.ejs dlm folder views dan kirim data dibawah ini
            layout: 'layouts/main-layout.ejs', // kasih tau layoutnya adalah layouts/main-layout.ejs
            title: '404 Page | Frizfoo', // title dari halaman ini
            cdnswiperjs: '',
            dataProfile: dataProfile
        })

    } catch (error) { // klu gagal, maka...

        res.status(400).send(error); // kirim error ke client

    }

}