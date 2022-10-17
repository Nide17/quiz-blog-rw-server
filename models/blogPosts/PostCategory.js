// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const PostCategorySchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
},
    {
        // createdAt,updatedAt fields are automatically added into records
        timestamps: true
    });

//postCategory: the name of this model
module.exports = mongoose.model('postCategory', PostCategorySchema);
