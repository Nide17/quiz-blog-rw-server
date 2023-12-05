// Bring in Mongo
const mongoose = require('mongoose')

// initialize Mongo schema 
const Schema = mongoose.Schema

// Create Schema for blogPostView 
const blogPostViewSchema = new Schema({
    blogPost: {
        type: Schema.Types.ObjectId,
        ref: 'BlogPost'
    },
    viewer: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: false,
        default: null
    },
    device: {
        type: String,
        required: false,
        default: null
    },
    country: {
        type: String,
        required: false,
        default: null
    }
},
    {
        timestamps: true,
    })

// //Export
// module.exports = mongoose.model("BlogPostView", blogPostViewSchema)
//BlogPostView: the name of this model - using the db connection
const db = require('../../server').db
const BlogPostView = db.model('BlogPostView', blogPostViewSchema)

module.exports = BlogPostView