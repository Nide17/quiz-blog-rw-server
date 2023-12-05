// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const CourseSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
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

// //Course: the name of this model
// module.exports = mongoose.model('course', CourseSchema);
//Course: the name of this model - using the db connection
const db = require('../server').db
const Course = db.model('course', CourseSchema)

module.exports = Course