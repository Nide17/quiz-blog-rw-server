// Bring in Mongo
const mongoose = require('mongoose')

//initialize Mongo schema
const Schema = mongoose.Schema

//create a schema object
const ChallengeQuizSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 600
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'category',
    unique: true
  },
  questions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'challengeQuestion'
    }
  ],
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    unique: true
  }
},
  {
    // createdAt, updatedAt fields are automatically added into records
    timestamps: true
  })

//ChallengeQuiz: the name of this model
module.exports = mongoose.model('challengeQuiz', ChallengeQuizSchema)