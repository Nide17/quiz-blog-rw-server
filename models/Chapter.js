// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const ChapterSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'course'
    },
    courseCategory: {
        type: Schema.Types.ObjectId,
        ref: 'courseCategory'
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    last_updated_by: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
},
    {
        // createdAt,updatedAt fields are automatically added into records
        timestamps: true
    });

//chapter: the name of this model
module.exports = mongoose.model('chapter', ChapterSchema);
