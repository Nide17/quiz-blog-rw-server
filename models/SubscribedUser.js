// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const SubscribedUserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

// //subscribedUser: the name of this model
// module.exports = mongoose.model('subscribedUser', SubscribedUserSchema);
//SubscribedUser: the name of this model - using the db connection
const db = require('../server').db
const SubscribedUser = db.model('subscribedUser', SubscribedUserSchema)

module.exports = SubscribedUser