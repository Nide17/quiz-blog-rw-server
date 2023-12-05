// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const LevelSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    school: {
        type: Schema.Types.ObjectId,
        ref: 'school'
    }
},
    {
        // createdAt,updatedAt fields are automatically added into records
        timestamps: true
    });

// //level: the name of this model
// module.exports = mongoose.model('level', LevelSchema);
//Level: the name of this model - using the db connection
const db = require('../server').db
const Level = db.model('level', LevelSchema)

module.exports = Level