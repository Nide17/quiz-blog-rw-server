// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const QuizCommentSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    quiz: {
        type: Schema.Types.ObjectId,
        ref: 'quiz'
    }
},
    {
        // createdAt,updatedAt fields are automatically added into records
        timestamps: true
    });

// //quizComment: the name of this model
// module.exports = mongoose.model('quizComment', QuizCommentSchema);
//QuizComment: the name of this model - using the db connection
const db = require('../server').db
const QuizComment = db.model('quizComment', QuizCommentSchema)

module.exports = QuizComment