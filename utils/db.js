// db.js untuk connect ke database mongoDB Atlas dgn bantuan mongoose, agar lbh mudah dalam mengolah data
const mongoose = require('mongoose'); // import third party module mongoose
const dotenv = require('dotenv'); // import third party module dotenv to read .env file

dotenv.config(); // to read .env file from this file

module.exports = {
    connectToDb: (cb) => {

        mongoose.connect(process.env.FrizfooClusterURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
            (err) => { // callback function untuk mengecek apakah ada error atau tidak
                if (err) { // jika ada error, maka...
                    console.log('Error in database connection: ' + err);
                    return cb(err);
                } else { // jika tidak ada error, maka...
                    console.log('MongoDB database connection established successfully');
                    return cb();
                }
            }
        );

    }
}

