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
    post_image: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
},
    {
        timestamps: true,
    })

//Export
module.exports = mongoose.model("ImageUpload", imageUploadSchema)