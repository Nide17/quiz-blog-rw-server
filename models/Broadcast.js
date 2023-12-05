// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const BroadcastSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    sent_by: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
},
    {
        // createdAt,updatedAt fields are automatically added into records
        timestamps: true
    });

// //broadcast: the name of this model
// module.exports = mongoose.model('broadcast', BroadcastSchema);
//Broadcast: the name of this model - using the db connection
const db = require('../server').db
const Broadcast = db.model('broadcast', BroadcastSchema)

module.exports = Broadcast