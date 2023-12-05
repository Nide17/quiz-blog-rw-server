// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const ChatRoomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ]
},
    {
        // createdAt, updatedAt fields are automatically added into records
        timestamps: true
    });

// //chatRoom: the name of this model
// module.exports = mongoose.model('chatRoom', ChatRoomSchema);
//ChatRoom: the name of this model - using the db connection
const db = require('../../server').db
const ChatRoom = db.model('chatRoom', ChatRoomSchema)

module.exports = ChatRoom