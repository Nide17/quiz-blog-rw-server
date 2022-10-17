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
  },
  subscription_date: {
    type: Date,
    default: Date.now
  }
});

//subscribedUser: the name of this model
module.exports = mongoose.model('subscribedUser', SubscribedUserSchema);
