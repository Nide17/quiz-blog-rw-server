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

//level: the name of this model
module.exports = mongoose.model('level', LevelSchema);
