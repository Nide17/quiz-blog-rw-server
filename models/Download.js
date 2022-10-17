// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const DownloadSchema = new Schema({
    notes: {
        type: Schema.Types.ObjectId,
        ref: 'notes'
    },
    chapter: {
        type: Schema.Types.ObjectId,
        ref: 'chapter'
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'course'
    },
    courseCategory: {
        type: Schema.Types.ObjectId,
        ref: 'courseCategory'
    },
    downloaded_by: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
},
    {
        // createdAt,updatedAt fields are automatically added into records
        timestamps: true
    });

//download: the name of this model
module.exports = mongoose.model('download', DownloadSchema);