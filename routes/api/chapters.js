const express = require("express")
const router = express.Router()
const { authRole } = require('../../middleware/auth')

// Chapter Model
const Chapter = require('../../models/Chapter')
const Notes = require('../../models/Notes')

// @route   GET /api/chapters
// @desc    Get chapters
// @access  Public
router.get('/', async (req, res) => {

    try {
        const chapters = await Chapter.find()
            //sort chapters by createdAt
            .sort({ createdAt: -1 })

        if (!chapters) throw Error('No chapters found!')

        res.status(200).json(chapters)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET /api/chapters/:id
// @desc    Get one chapter
// @access Public
router.get('/:id', async (req, res) => {

    let id = req.params.id
    try {
        //Find the chapter by id
        await Chapter.findById(id, (err, chapter) => {
            res.status(200).json(chapter)
        })

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }
})

// @route   GET /api/chapters/course/:id
// @desc    Get all chapters by course id
// @access  Needs to private
router.get('/course/:id', async (req, res) => {

    let id = req.params.id
    try {
        //Find the chapters by id
        await Chapter.find({ course: id }, (err, chapters) => {
            res.status(200).json(chapters)
        })
            .populate('course')

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }

})

// @route   POST /api/chapters
// @desc    Create a chapter
// @access Private: Accessed by admin only
router.post('/', authRole(['Creator', 'Admin', 'SuperAdmin']), async (req, res) => {
    const { title, description, courseCategory, course, created_by } = req.body

    // Simple validation
    if (!title || !description || !courseCategory || !course) {
        return res.status(400).json({ msg: 'Please fill all fields' })
    }

    try {
        const chapter = await Chapter.findOne({ title })
        if (chapter) throw Error('Chapter already exists!')

        const newChapter = new Chapter({
            title,
            description,
            courseCategory,
            course,
            created_by
        })

        const savedChapter = await newChapter.save()
        if (!savedChapter) throw Error('Something went wrong during creation!')

        res.status(200).json({
            _id: savedChapter._id,
            title: savedChapter.title,
            description: savedChapter.description,
            courseCategory: savedChapter.courseCategory,
            course: savedChapter.course,
            created_by: savedChapter.created_by,
            createdAt: savedChapter.createdAt,
        })

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route PUT api/chapters/:id
// @route UPDATE one chapter
// @access Private: Accessed by authorization
router.put('/:id', authRole(['Creator', 'Admin', 'SuperAdmin']), async (req, res) => {

    try {
        //Find the chapter by id
        const chapter = await Chapter.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(chapter)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route DELETE api/chapters/:id
// @route delete a chapter
// @route Private: Accessed by authorized user
//:id placeholder, findById = we get it from the parameter in url
router.delete('/:id', authRole(['Creator', 'Admin', 'SuperAdmin']), async (req, res) => {
    try {
        const chapter = await Chapter.findById(req.params.id)
        if (!chapter) throw Error('Chapter is not found!')

        // Delete notes belonging to this chapter
        const removedNotes = await Notes.deleteMany({ chapter: chapter._id })

        if (!removedNotes)
            throw Error('Something went wrong while deleting the chapter notes!')

        // Delete this chapter
        const removedChapter = await chapter.remove()

        if (!removedChapter)
            throw Error('Something went wrong while deleting this chapter!')

        res.status(200).json({ msg: `Chapter Deleted!` })

    } catch (err) {
        res.status(400).json({
            msg: err.message
        })
    }

})

module.exports = router