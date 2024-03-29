// Bring in Mongo
const mongoose = require('mongoose')
const slugify = require("slugify")

//initialize Mongo schema
const Schema = mongoose.Schema

//create a schema object
const QuizSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  creation_date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'category',
    unique: true
  },
  questions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'question'
    }
  ],
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    unique: true
  },
  last_updated_by: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  video_links: {
    type: [
      {
        vtitle: {
          type: String,
          required: true
        },
        vlink: {
          type: String,
          required: true
        }
      }
    ]
  }
})

QuizSchema.pre("validate", function (next) {
  const quiz = this

  if (quiz.title) {
    quiz.slug = slugify(`${quiz.title}`, { replacement: '-', lower: true, strict: true })
  }
  next()
})

//Quiz: the name of this model
// module.exports = mongoose.model('quiz', QuizSchema)

//Quiz: the name of this model - using the db connection
const db = require('../server').db
const Quiz = db.model('quiz', QuizSchema)

module.exports = Quiz