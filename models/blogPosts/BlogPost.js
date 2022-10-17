// Bring in Mongo
const mongoose = require('mongoose');
const slugify = require("slugify");

//initialize Mongo schema
const Schema = mongoose.Schema;

//BlogPost Schema
const blogPostSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    postCategory: {
        type: Schema.Types.ObjectId,
        ref: 'postCategory'
    },
    post_image: String,
    markdown: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
},
    {
        timestamps: true,
    });

blogPostSchema.pre("validate", function (next) {
    const blogPost = this;

    if (blogPost.title) {
        blogPost.slug = slugify(`${blogPost.title}`, { replacement: '-', lower: true, strict: true });
    }
    next();
})

//Export
module.exports = mongoose.model("BlogPost", blogPostSchema);