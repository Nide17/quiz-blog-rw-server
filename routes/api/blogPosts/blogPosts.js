const express = require("express")
const router = express.Router()
const config = require('config')
const AWS = require('aws-sdk')
const { authRole } = require('../../../middleware/auth')
const { blogPostUpload } = require('../utils/blogPostUpload.js')

const s3Config = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || config.get('AWSAccessKeyId'),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || config.get('AWSSecretKey'),
    Bucket: process.env.S3_BUCKET_BLOGPOSTS || config.get('S3BlogPostsBucket')
})

// BlogPost Model
const BlogPost = require('../../../models/blogPosts/BlogPost')

// @route   GET /api/blogPosts
// @desc    Get all blogPosts
// @access  Public
router.get('/', async (req, res) => {

    // Pagination
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    var query = {}

    query.limit = limit
    query.skip = skip

    try {
        const blogPosts = await BlogPost.find({}, {}, query)

            //sort blogPosts by date_created
            .sort({ createdAt: -1 })
            .populate('postCategory creator')

        if (!blogPosts) throw Error('No blog posts found')

        res.status(200).json(blogPosts)
    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route GET api/blogPosts/:id
// @route GET one blog post
// @route Private: accessed by logged in user
router.get('/:id', (req, res) => {

    //Find the blogpost by id
    BlogPost.findById(req.params.id)
        .populate('postCategory creator')

        //return a promise
        .then(blogPost => res.json(blogPost))
        // if id not exist or if error
        .catch(err => res.status(404).json({ success: false }))
})

// @route   GET /api/blogPosts/postCategory/:id
// @desc    Get blogPosts by postCategory
// @access  Needs to private
router.get('/postCategory/:id', async (req, res) => {

    //Find the blogpost by id
    BlogPost.find({ postCategory: req.params.id })
        .populate('postCategory creator')

        //return a promise
        .then(blogPosts => res.json(blogPosts))
        // if id not exist or if error
        .catch(err => res.status(400).json({ success: false }))

})

// @route   POST /api/blogPosts
// @desc    Create blogPost & upload a post_image
// @access  Have to be private
router.post("/", authRole(['Creator', 'Admin']), blogPostUpload.single("post_image"), async (req, res) => {

    const bp_image = req.file ? req.file : null
    const { title, markdown, postCategory, creator, bgColor } = req.body

    // Simple validation
    if (!title || !markdown || !postCategory || !creator) {
        return res.status(400).json({ msg: title })
    }

    try {
        const newBlogPost = new BlogPost({
            title,
            post_image: bp_image && bp_image.location,
            markdown,
            postCategory,
            creator,
            bgColor
        })

        const savedBlogPost = await newBlogPost.save()

        if (!savedBlogPost) throw Error('Something went wrong during creation! file size should not exceed 1MB')

        res.status(200).json({
            _id: savedBlogPost._id,
            title: savedBlogPost.title,
            post_image: savedBlogPost.post_image,
            markdown: savedBlogPost.markdown,
            postCategory: savedBlogPost.postCategory,
            creator: savedBlogPost.creator,
            bgColor: savedBlogPost.bgColor,
            slug: savedBlogPost.slug,
        })

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route PUT api/blogPosts/:id
// @route UPDATE one blogPost
// @route Private: Accessed by admin only
router.put('/:id', authRole(['Creator', 'Admin']), async (req, res) => {

    try {
        //Find the blogPost by id
        const updatedBlogPost = await BlogPost.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(updatedBlogPost)

    } catch (error) {
        res.status(400).json({
            msg: 'Failed to update! ' + error.message
        })
    }
})

// @route DELETE api/blogPosts/:id
// @route delete a blogPost
// @route Private: Accessed by admin only
router.delete('/:id', authRole(['Creator', 'Admin']), async (req, res) => {

    try {
        const blogPost = await BlogPost.findById(req.params.id)
        if (!blogPost) throw Error('BlogPost is not found!')

        if (blogPost.post_image) {
            const params = {
                Bucket: process.env.S3_BUCKET_BLOGPOSTS || config.get('S3BlogPostsBucket'),
                Key: blogPost.post_image.split('/').pop() //if any sub folder-> path/of/the/folder.ext
            }

            try {
                await s3Config.deleteObject(params, (err, data) => {
                    if (err) {
                        res.status(400).json({ msg: err.message })
                        console.log(err, err.stack) // an error occurred
                    }
                    else {
                        res.status(200).json({ msg: 'deleted!' })
                        console.log(params.Key + ' deleted from ' + params.Bucket)
                    }
                })

            }
            catch (err) {
                console.log('ERROR in file Deleting : ' + JSON.stringify(err))
                res.status(400).json({
                    msg: 'Failed to delete! ' + error.message,
                    success: false
                })
            }
        }

        const removedBlogPost = await BlogPost.deleteOne()

        if (!removedBlogPost)
            throw Error('Something went wrong while deleting!')

    } catch (err) {
        res.status(400).json({
            success: false,
            msg: err.message
        })
    }

})

module.exports = router