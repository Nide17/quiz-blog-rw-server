// Bring in Mongo
const mongoose = require('mongoose')
const slugify = require("slugify")

//initialize Mongo schema
const Schema = mongoose.Schema

//create a schema object
const NotesSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    notes_file: String,
    chapter: {
        type: Schema.Types.ObjectId,
        ref: 'chapter'
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'course'
    },
    courseCategory: {
        type: Schema.Types.ObjectId,
        ref: 'courseCategory'
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    uploaded_by: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    quizzes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'quiz',
            default: []
        }
    ]
},
    {
        // createdAt,updatedAt fields are automatically added into records
        timestamps: true
    })

NotesSchema.pre("validate", function (next) {
    const notes = this

    if (notes.title) {
        notes.slug = slugify(`${notes.title}`, { replacement: '-', lower: true, strict: true })
    }
    next()
})

// //notes: the name of this model
// module.exports = mongoose.model('notes', NotesSchema)
//Notes: the name of this model - using the db connection
const db = require('../server').db
const Notes = db.model('notes', NotesSchema)

module.exports = Notes