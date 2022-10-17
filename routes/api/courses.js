const express = require("express")
const router = express.Router()
const { authRole } = require('../../middleware/auth')

// Course Model
const Course = require('../../models/Course')
const Chapter = require('../../models/Chapter')
const Notes = require('../../models/Notes')

// @route   GET /api/courses
// @desc    Get courses
// @access  Public

router.get('/', async (req, res) => {

    try {
        const courses = await Course.find()
            //sort courses by createdAt
            .sort({ createdAt: -1 })

        if (!courses) throw Error('No courses found!')

        res.status(200).json(courses)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET /api/courses/:id
// @desc    Get one course
// @access Private: accessed by logged in user
router.get('/:id', async (req, res) => {

    let id = req.params.id
    try {
        //Find the Course by id
        await Course.findById(id, (err, course) => {
            res.status(200).json(course)
        })

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }
})

// @route   GET /api/courses/courseCategory/:id
// @desc    Get all courses by courseCategory id
// @access  Needs to private
router.get('/courseCategory/:id', async (req, res) => {

    let id = req.params.id
    try {
        //Find the courses by id
        await Course.find({ courseCategory: id }, (err, courses) => {
            res.status(200).json(courses)
        })

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }

})

// @route   POST /api/courses
// @desc    Create a course
// @access Private: Accessed by admin only
router.post('/', authRole(['Creator', 'Admin']), async (req, res) => {
    const { title, description, courseCategory, created_by } = req.body

    // Simple validation
    if (!title || !description || !courseCategory) {
        return res.status(400).json({ msg: 'Please fill all fields' })
    }

    try {
        const course = await Course.findOne({ title })
        if (course) throw Error('Course already exists!')

        const newCourse = new Course({
            title,
            description,
            courseCategory,
            created_by
        })

        const savedCourse = await newCourse.save()
        if (!savedCourse) throw Error('Something went wrong during creation!')

        res.status(200).json({
            _id: savedCourse._id,
            title: savedCourse.title,
            description: savedCourse.description,
            courseCategory: savedCourse.courseCategory,
            created_by: savedCourse.created_by,
            createdAt: savedCourse.createdAt,
        })

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route PUT api/courses/:id
// @route UPDATE one course
// @access Private: Accessed by admin only
router.put('/:id', authRole(['Creator', 'Admin']), async (req, res) => {

    try {
        //Find the course by id
        const course = await Course.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(course)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route DELETE api/courses/:id
// @route delete a course
// @route Private: Accessed by admin only
//:id placeholder, findById = we get it from the parameter in url
router.delete('/:id', authRole(['Admin']), async (req, res) => {

    try {
        const course = await Course.findById(req.params.id)
        if (!course) throw Error('Course is not found!')

        // Delete chapters belonging to this course
        const removedChapters = await Chapter.deleteMany({ course: course._id })

        if (!removedChapters)
            throw Error('Something went wrong while deleting the course chapters!')

        // Delete notes belonging to this chapter
        const removedNotes = await Notes.deleteMany({ course: course._id })

        if (!removedNotes)
            throw Error('Something went wrong while deleting the course notes!')

        // Delete this course
        const removedCourse = await course.remove()

        if (!removedCourse)
            throw Error('Something went wrong while deleting!')
        res.status(200).json({ msg: `Deleted!` })
        
    } catch (err) {
        res.status(400).json({
            success: false
        })
    }

})

module.exports = router