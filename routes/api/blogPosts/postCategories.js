const express = require("express")
const router = express.Router()
const { authRole } = require('../../../middleware/authMiddleware')

// PostCategory Model
const PostCategory = require('../../../models/blogPosts/PostCategory')
const BlogPost = require('../../../models/blogPosts/BlogPost')

// @route   GET /api/postCategories
// @desc    Get postCategories
// @access  Public
router.get('/', async (req, res) => {

    try {
        const postCategories = await PostCategory.find()
            //sort postCategories by createdAt
            .sort({ createdAt: -1 })

        if (!postCategories) throw Error('No post categories found!')

        res.status(200).json(postCategories)

    } catch (err) {
        res.status(400).json({ msg: err.message + ", Please login first!" })
    }
})

// @route   GET /api/postCategories/:id
// @desc    Get one category
// @access Public
router.get('/:id', async (req, res) => {

    let id = req.params.id
    try {
        //Find the Category by id
        const category = await PostCategory.findById(id)

        if (!category) throw Error('No category found!')

        res.status(200).json(category)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }
})

// @route   POST /api/postCategories
// @desc    Create a post category
// @access Private: Accessed by authorization
router.post('/', authRole(['Creator', 'Admin', 'SuperAdmin']), async (req, res) => {
    const { title, description, creator } = req.body

    // Simple validation
    if (!title || !description || !creator) {
        return res.status(400).json({ msg: 'Please fill all fields' })
    }

    try {
        const postCategory = await PostCategory.findOne({ title })
        if (postCategory) throw Error('Category already exists!')

        const newPostCategory = new PostCategory({
            title,
            description,
            creator
        })

        const savedPostCategory = await newPostCategory.save()
        if (!savedPostCategory) throw Error('Something went wrong during creation!')

        res.status(200).json({
            _id: savedPostCategory._id,
            title: savedPostCategory.title,
            description: savedPostCategory.description,
            createdAt: savedPostCategory.createdAt,
            creator: savedPostCategory.creator
        })

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route PUT api/postCategories/:id
// @route UPDATE one post category
// @access Private: Accessed by authorization
router.put('/:id', authRole(['Creator', 'Admin', 'SuperAdmin']), async (req, res) => {

    try {
        //Find the post category by id
        const postCategory = await PostCategory.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(postCategory)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route DELETE api/postCategories/:id
// @route delete a post Category
// @route Private: Accessed by authorization
//:id placeholder, findById = we get it from the parameter in url
router.delete('/:id', authRole(['Creator', 'Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const postCategory = await PostCategory.findById(req.params.id)
        if (!postCategory) throw Error('post category is not found!')

        // Delete BlogPosts belonging to this category
        await BlogPost.deleteMany({ postCategory: postCategory._id })

        // Delete this category
        const removedCategory = await postCategory.deleteOne()

        if (!removedCategory)
            throw Error('Something went wrong while deleting!')
        res.status(200).json({ msg: `Deleted!` })

    } catch (err) {
        res.status(400).json({
            msg: err.message
        })
    }

})

module.exports = router