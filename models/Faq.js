// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const FaqSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
},
    {
        // createdAt, updatedAt fields are automatically added into records
        timestamps: true
    });

//broadcast: the name of this model
module.exports = mongoose.model('faq', FaqSchema);