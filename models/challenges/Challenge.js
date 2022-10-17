// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const challengeSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },

    challengerReview: {
        id: {
            type: String,
            required: true,
            unique: true
        },
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

    challengeeReview: {
        id: {
            type: String,
            required: true,
            unique: true
        },
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
    challenge_taker: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    challenged_by: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
},
    {
        // createdAt,updatedAt fields are automatically added into records
        timestamps: true
    });

//challenge: the name of this model
module.exports = mongoose.model('challenge', challengeSchema);