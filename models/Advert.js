// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const AdvertSchema = new Schema({
    caption: {
        type: String,
        required: true
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
        required: true,
        unique: true
    },
    advert_image: {
        type: String,
        required: true
    }
},
    {
        // createdAt,updatedAt fields are automatically added into records
        timestamps: true
    });

//advert: the name of this model
module.exports = mongoose.model('advert', AdvertSchema);
