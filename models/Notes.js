// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

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
    });

//notes: the name of this model
module.exports = mongoose.model('notes', NotesSchema);