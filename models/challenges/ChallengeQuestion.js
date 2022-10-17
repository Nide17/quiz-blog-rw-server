// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const ChallengeQuestionSchema = new Schema({
    questionText: {
        type: String,
        required: true
    },
    question_image: String,
    answerOptions: {
        type: [
            {
                answerText: {
                    type: String,
                    required: true
                },
                explanations: {
                    type: String,
                    required: false,
                    default: null
                },
                isCorrect: {
                    type: Boolean,
                    required: true,
                    default: false
                }
            }
        ]
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        unique: true
    },
    challengeQuiz: {
        type: Schema.Types.ObjectId,
        ref: 'challengeQuiz',
        unique: true
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        unique: true
    }
},
    {
        // createdAt, updatedAt fields are automatically added into records
        timestamps: true
    });

//Question: the name of this model
module.exports = mongoose.model('challengeQuestion', ChallengeQuestionSchema);