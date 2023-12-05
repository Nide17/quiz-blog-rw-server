// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const QuestionCommentSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    question: {
        type: Schema.Types.ObjectId,
        ref: 'question'
    },
    quiz: {
        type: Schema.Types.ObjectId,
        ref: 'quiz'
    },
    status: { // Pending - Approved - Rejected
        type: String,
        required: true,
        default: "Pending"
    }
},
    {
        // createdAt,updatedAt fields are automatically added into records
        timestamps: true
    });

// //questionComment: the name of this model
// module.exports = mongoose.model('questionComment', QuestionCommentSchema);
//QuestionComment: the name of this model - using the db connection
const db = require('../server').db
const QuestionComment = db.model('questionComment', QuestionCommentSchema)

module.exports = QuestionComment