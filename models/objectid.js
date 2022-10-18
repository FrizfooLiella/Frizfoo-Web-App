const mongoose = require('mongoose'); // import third party module mongoose

function buatObjectId(id) {
    return mongoose.Types.ObjectId(id);
}

module.exports = {
    buatObjectId: buatObjectId
}