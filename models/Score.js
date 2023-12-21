// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object: If you use multiple connections, you should make sure you export schemas, not models
// The alternative to the export model pattern is the export schema pattern.
const ScoreSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    marks: {
        type: Number,
        required: true
    },
    out_of: {
        type: Number,
        required: true
    },
    test_date: {
        type: Date,
        default: Date.now
    },
    review: {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true
        },
        questions: [
            {
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
                            },
                            choosen: {
                                type: Boolean,
                                required: true,
                                default: false
                            }
                        }
                    ]
                }
            }
        ]

    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category'
    },
    quiz: {
        type: Schema.Types.ObjectId,
        ref: 'quiz'
    },
    taken_by: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
});

// Bring in the dbscores connection from server.js - using the dbscores connection - using the Score model name - using the ScoreSchema object - using the dbscores connection - using the Score model name - using the ScoreSchema object - using the dbscores connection - using the Score model name - using
const dbScores = require('../server').dbScores;

// Create the model - using the ScoreSchema object - using the dbscores connection - using the Score model name - using the ScoreSchema object - using the dbscores connection - using the Score model name - using the ScoreSchema object - using the dbscores connection - using the Score model name - using the Score
const Score = dbScores.model('score', ScoreSchema);

//export the model
module.exports = Score;