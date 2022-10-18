// UNTUK VALIDATION
const Joi = require('joi'); // import third party module joi for validation


// REGISTER VALIDATION
const registerValidation = (data) => {  // create a function for register validation

    const schema = Joi.object({  // create schema object untuk meng validasi
        fullname: Joi.string().min(4).required(),
        username: Joi.string().alphanum().required(),
        email: Joi.string().email().required(),
        notelp: Joi.string().required(),
        password: Joi.string().min(3).max(40).required(),
        password_confirmation: Joi.ref('password'),  // password_confirmation harus sama dengan password
        gender: Joi.string(),
    });

    return schema.validate(data); // return data yg validasi untuk di proses di file lainnya
}


// LOGIN VALIDATION
const loginValidation = (data) => { // create a function for login validation

    const schema = Joi.object({ // create schema object untuk meng validasi
        email: Joi.string().email().required(),
        password: Joi.string().min(3).max(40).required(),
    });

    return schema.validate(data); // kembalikan hasil validasi data dgm pkai struktur data schema

}


// SEND EMAIL FORGOT PASS VALIDATION
const sendEmailForgotPassValidation = (data) => { // create a function for send email forgot pass validation
    const schema = Joi.object({ // create schema object untuk meng validasi
        email: Joi.string().email().required(),
    });

    return schema.validate(data); // kembalikan hasil validasi data dgN pkai struktur data schema
}


// MONGODB ID VALIDATION
const regexMongoDbId = (id) => { // create a function for id validation
    let cekId = new RegExp(/^[a-f\d]{24}$/i);
    return cekId.test(id); // return true jika id valid, false jika tidak valid
}


// UPDATE PROFILE VALIDATION
const updateProfileValidation = (data) => { // create a function for update profile validation

    const schema = Joi.object({  // create schema object untuk meng validasi
        _id: Joi.string(),
        fullname: Joi.string().min(4).required(),
        username: Joi.string().alphanum().required(),
        email: Joi.string().email().required(),
        notelp: Joi.string().required(),
        alamat: Joi.string().required(),
        kota: Joi.string().required(),
        kecamatan: Joi.string().required(),
        provinsi: Joi.string().required(),
        kodepos: Joi.string().min(5).max(5).required(),
        gender: Joi.string(),
    });

    return schema.validate(data); // return data yg validasi untuk di proses di file lainnya

}


// CHANGE PASS VALIDATION
const changePassValidation = (data) => { // create a function for change password validation

    const schema = Joi.object({  // create schema object untuk meng validasi
        _id: Joi.string(),
        oldpassword: Joi.string().min(3).max(40).required(),
        password: Joi.string().min(3).max(40).required(),
        password_confirmation: Joi.ref('password'),  // password_confirmation harus sama dengan password
    });

    return schema.validate(data); // return data yg validasi untuk di proses di file lainnya

}




module.exports = { // export module agar bisa di pakai di file lain
    registerValidation: registerValidation,
    loginValidation: loginValidation,
    sendEmailForgotPassValidation: sendEmailForgotPassValidation,
    regexMongoDbId: regexMongoDbId,
    updateProfileValidation: updateProfileValidation,
    changePassValidation: changePassValidation
}