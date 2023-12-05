// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const FacultySchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    school: {
        type: Schema.Types.ObjectId,
        ref: 'school'
    },
    level: {
        type: Schema.Types.ObjectId,
        ref: 'level'
    },
    years: [
        {
            type: String,
            required: true,
        }
    ]
},
    {
        // createdAt,updatedAt fields are automatically added into records
        timestamps: true
    });

// //faculty: the name of this model
// module.exports = mongoose.model('faculty', FacultySchema);
//Faculty: the name of this model - using the db connection
const db = require('../server').db
const Faculty = db.model('faculty', FacultySchema)

module.exports = Faculty
