// Bring in Mongo
const mongoose = require('mongoose')

//Initialize Mongo schema
const Schema = mongoose.Schema

//imageUpload Schema
const imageUploadSchema = new Schema({
    imageTitle: {
        type: String,
        required: true,
    },
    uploadImage: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
},
    {
        timestamps: true,
    })

// //Export
// module.exports = mongoose.model("ImageUpload", imageUploadSchema)
//ImageUpload: the name of this model - using the db connection
const db = require('../../server').db
const ImageUpload = db.model('ImageUpload', imageUploadSchema)

module.exports = ImageUpload