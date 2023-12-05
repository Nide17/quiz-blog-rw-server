// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const AdvertSchema = new Schema({
    caption: {
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    advert_image: {
        type: String,
        required: true
    },
    status: { // Active, Inactive
        type: String,
        required: true,
        default: "Inactive"
    }
},
    {
        // createdAt,updatedAt fields are automatically added into records
        timestamps: true
    });

// //advert: the name of this model
// module.exports = mongoose.model('advert', AdvertSchema);
//Advert: the name of this model - using the db connection
const db = require('../server').db
const Advert = db.model('advert', AdvertSchema)

module.exports = Advert