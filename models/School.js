// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const SchoolSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true
    },
    website: {
        type: String,
        required: true
    }
},
    {
        // createdAt,updatedAt fields are automatically added into records
        timestamps: true
    });

// //school: the name of this model
// module.exports = mongoose.model('school', SchoolSchema);
//School: the name of this model - using the db connection
const db = require('../server').db
const School = db.model('school', SchoolSchema)

module.exports = School
