const express = require("express")
const router = express.Router()

// Category Model
const Category = require('../../models/Category')
const Quiz = require('../../models/Quiz')
const Question = require('../../models/Question')

const { authRole } = require('../../middleware/auth')

// @route   GET /api/categories
// @desc    Get categories
// @access  Public
router.get('/', async (req, res) => {

    try {
        const categories = await Category.find()
            //sort categories by creation_date
            .sort({ creation_date: -1 })
            .populate('courseCategory')
            .populate('quizes')

        if (!categories) throw Error('No categories found')

        res.status(200).json(categories)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET /api/categories/:id
// @desc    Get one category
// @access Public
router.get('/:id', async (req, res) => {

    let id = req.params.id
    try {
        //Find the Category by id
        const category = await Category.findById(id).populate('courseCategory').populate('quizes')

        if (!category) throw Error('No category found!')

        res.status(200).json(category)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }
})

// @route   POST /api/categories
// @desc    Create a category
// @access Private: Accessed by authorized user
router.post('/', authRole(['Admin', 'SuperAdmin']), async (req, res) => {
    const { title, description, quizes, created_by, creation_date, courseCategory } = req.body

    // Simple validation
    if (!title || !description) {
        return res.status(400).json({ msg: 'Please fill all fields' })
    }

    try {
        const category = await Category.findOne({ title })
        if (category) throw Error('Category already exists!')

        const newCategory = new Category({
            title,
            description,
            creation_date,
            quizes,
            created_by,
            courseCategory
        })

        const savedCategory = await newCategory.save()
        if (!savedCategory) throw Error('Something went wrong during creation!')

        res.status(200).json({
            _id: savedCategory._id,
            title: savedCategory.title,
            description: savedCategory.description,
            creation_date: savedCategory.creation_date,
            quizes: savedCategory.quizes,
            created_by: savedCategory.created_by,
            courseCategory: savedCategory.courseCategory,
        })

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route PUT api/categories/:id
// @route UPDATE one Category
// @access Private: Accessed by authorized user
router.put('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        //Find the Category by id
        const category = await Category.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(category)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route DELETE api/categories/:id
// @route delete a Category
// @route Private: Accessed by authorized user
//:id placeholder, findById = we get it from the parameter in url
router.delete('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const category = await Category.findById(req.params.id)
        if (!category) throw Error('Category is not found!')

        // Delete questions belonging to this quiz
        await Question.remove({ category: category._id })

        // Delete quizes belonging to this category
        await Quiz.remove({ category: category._id })

        // Delete this category
        const removedCategory = await category.remove()

        if (!removedCategory)
            throw Error('Something went wrong while deleting!')

        res.status(200).json(removedCategory)
        // res.status(200).json({ msg: `${removedCategory.title} is deleted!` })

    } catch (err) {
        res.status(400).json({
            msg: err.message
        })
    }

})

module.exports = router