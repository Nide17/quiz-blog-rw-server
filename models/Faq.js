// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const FaqSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'user'
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
},
    {
        // createdAt, updatedAt fields are automatically added into records
        timestamps: true
    });

// //Faq: the name of this model
// module.exports = mongoose.model('faq', FaqSchema);
//Faq: the name of this model - using the db connection
const db = require('../server').db
const Faq = db.model('faq', FaqSchema)

module.exports = Faq