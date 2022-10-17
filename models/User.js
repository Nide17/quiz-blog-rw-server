// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    default: 'Visitor'
  },
  register_date: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String
  },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'school'
  },
  level: {
    type: Schema.Types.ObjectId,
    ref: 'level'
  },
  faculty: {
    type: Schema.Types.ObjectId,
    ref: 'faculty'
  },
  year: {
    type: String
  },
  interests: {
    type: [
      {
        favorite: {
          type: String,
          required: false
        }
      }
    ]
  },
  about: {
    type: String
  }
});

//User: the name of this model
module.exports = mongoose.model('user', UserSchema);