const fs = require('fs'); // import core module fs
require('dotenv').config(); // import dotenv so we can use variabel on .env file
const { google } = require('googleapis'); // import third party module yaitu googleapis

const USER_PROFILE_FOLDER_API = '1PiZYurAQ5jh8l26ihuq4ebA_cQ8orOP9';
const SELLER_PROFILE_FOLDER_API = '1_5SI88WfDt0KnJUpPB9tcnInLgXJXo-Q';
const SELLER_PRODUCT_IMAGES_FOLDER_API = '1WnIVArnNZAwgTLL8pmK6gyHvW2nMeTB-';



async function upImgUserProfile(dataImg) {
    try {  // klu sukse, maka...

        const auth = new google.auth.GoogleAuth({  // untk autentikasi google api
            keyFile: './googledrivekey.json',  // file yang berisi credential google api
            scopes: ['https://www.googleapis.com/auth/drive'] // scope yang akan dipergunakan
        });

        const driveService = google.drive({ // service yg kita gunakan
            version: 'v3',
            auth
        });

        const fileMetadata = { // metadata file itu berisi metadata dari file yang akan diupload
            'name': `${dataImg.name}`, // nama file yang akan diupload
            'parents': [USER_PROFILE_FOLDER_API] // parent file itu folder mana yg kita pakai untk menyimpan file yg akan diupload
        }

        const media = { // media yaitu tipe file apa yang akan diupload
            mimeType: `${dataImg.mimetype}`, // tipe file yang akan diupload
            body: fs.createReadStream(`${dataImg.tempFilePath}`) // lokasi file yg akan diupload
        }

        const response = await driveService.files.create({  // Create a request to Upload file to Google drive
            resource: fileMetadata, // metadata file yang akan diupload
            media: media, // tipe media yang akan diupload
            field: 'id' // field atau nilai property apa yang akan direturn
        });


        // kita pakai fs.unlinkSync, supaya file yg diupload bisa dihapus dari folder temp setelah diupload
        fs.unlinkSync(`${dataImg.tempFilePath}`);

        return response.data.id;

    } catch (error) { // klu gagal, maka...

        throw new Error(error);

    }
}


async function upImgSellerProfile(dataImg) {
    try {  // klu sukse, maka...

        const auth = new google.auth.GoogleAuth({  // untk autentikasi google api
            keyFile: './googledrivekey.json',  // file yang berisi credential google api
            scopes: ['https://www.googleapis.com/auth/drive'] // scope yang akan dipergunakan
        });

        const driveService = google.drive({ // service yg kita gunakan
            version: 'v3',
            auth
        });

        const fileMetadata = { // metadata file itu berisi metadata dari file yang akan diupload
            'name': `${dataImg.name}`, // nama file yang akan diupload
            'parents': [SELLER_PROFILE_FOLDER_API] // parent file itu folder mana yg kita pakai untk menyimpan file yg akan diupload
        }

        const media = { // media yaitu tipe file apa yang akan diupload
            mimeType: `${dataImg.mimetype}`, // tipe file yang akan diupload
            body: fs.createReadStream(`${dataImg.tempFilePath}`) // lokasi file yg akan diupload
        }

        const response = await driveService.files.create({  // Create a request to Upload file to Google drive
            resource: fileMetadata, // metadata file yang akan diupload
            media: media, // tipe media yang akan diupload
            field: 'id' // field atau nilai property apa yang akan direturn
        });


        // kita pakai fs.unlinkSync, supaya file yg diupload bisa dihapus dari folder temp setelah diupload
        fs.unlinkSync(`${dataImg.tempFilePath}`);

        return response.data.id;

    } catch (error) { // klu gagal, maka...

        throw new Error(error);

    }
}


async function upImgSellerProducts(dataImg) {
    try {  // klu sukse, maka...

        const auth = new google.auth.GoogleAuth({  // untk autentikasi google api
            keyFile: './googledrivekey.json',  // file yang berisi credential google api
            scopes: ['https://www.googleapis.com/auth/drive'] // scope yang akan dipergunakan
        });

        const driveService = google.drive({ // service yg kita gunakan
            version: 'v3',
            auth
        });

        const fileMetadata = { // metadata file itu berisi metadata dari file yang akan diupload
            'name': `${dataImg.name}`, // nama file yang akan diupload
            'parents': [SELLER_PRODUCT_IMAGES_FOLDER_API] // parent file itu folder mana yg kita pakai untk menyimpan file yg akan diupload
        }

        const media = { // media yaitu tipe file apa yang akan diupload
            mimeType: `${dataImg.mimetype}`, // tipe file yang akan diupload
            body: fs.createReadStream(`${dataImg.tempFilePath}`) // lokasi file yg akan diupload
        }

        const response = await driveService.files.create({  // Create a request to Upload file to Google drive
            resource: fileMetadata, // metadata file yang akan diupload
            media: media, // tipe media yang akan diupload
            field: 'id' // field atau nilai property apa yang akan direturn
        });


        // kita pakai fs.unlinkSync, supaya file yg diupload bisa dihapus dari folder temp setelah diupload
        fs.unlinkSync(`${dataImg.tempFilePath}`);

        return response.data.id;

    } catch (error) { // klu gagal, maka...

        throw new Error(error);

    }
}




module.exports = {
    upImgUserProfile: upImgUserProfile,
    upImgSellerProfile: upImgSellerProfile,
    upImgSellerProducts: upImgSellerProducts
}
