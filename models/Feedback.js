// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: false
    },
    score: {
        type: Schema.Types.ObjectId,
        ref: 'score'
    },
    quiz: {
        type: Schema.Types.ObjectId,
        ref: 'quiz'
    }
},
    {
        timestamps: true
    });

const dbFeedbacks = require('../server').dbFeedbacks;
const Feedback = dbFeedbacks.model('feedback', FeedbackSchema);

//export the model
module.exports = Feedback;