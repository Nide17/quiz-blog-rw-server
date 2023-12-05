// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const RoomMessageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    content: {
        type: String,
        required: true
    },
    room: {
        type: Schema.Types.ObjectId,
        ref: 'chatRoom'
    }
},
    {
        // createdAt, updatedAt fields are automatically added into records
        timestamps: true
    });

// //roomMessage: the name of this model
// module.exports = mongoose.model('roomMessage', RoomMessageSchema);
//RoomMessage: the name of this model - using the db connection
const db = require('../../server').db
const RoomMessage = db.model('roomMessage', RoomMessageSchema)

module.exports = RoomMessage