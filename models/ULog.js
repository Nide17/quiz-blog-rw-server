// Bring in Mongo
const mongoose = require('mongoose')

//initialize Mongo schema
const Schema = mongoose.Schema

//create a schema object
const ULogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    loggedInAt: {
        type: Date
    },
    expiresAt: {
        type: Date
    }
})

//uLog: the name of this model
module.exports = mongoose.model('uLog', ULogSchema)