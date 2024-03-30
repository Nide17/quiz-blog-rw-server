const express = require("express")
const router = express.Router()

// auth middleware to protect routes
const { auth, authRole } = require('../../middleware/authMiddleware')
const QuizComment = require('../../models/QuizComment')

// @route   GET /api/comments
// @desc    Get comments
// @access  Public
router.get('/', async (req, res) => {

    try {
        const comments = await QuizComment.find()
            //sort comments by createdAt
            .sort({ createdAt: -1 })
            .populate('sender quiz', '_id comment title role name email')

        if (!comments) throw Error('No comments found')

        res.status(200).json(comments)

    } catch (err) {
        res.status(400).json({ msg: err.answer })
    }
})

// @route GET api/comments/:id
// @route GET one comment
// @route Public
router.get('/:id', (req, res) => {

    //Find the comment by id
    QuizComment.findById(req.params.id)

        //return a promise
        .then(comment => res.json(comment))
        // if id not exist or if error
        .catch(err => res.status(404).json({ success: false }))
})

// @route GET api/quizComments/comment-on/:id
// @route GET comments on one quiz
// @route Private: accessed by authenticated user
router.get('/comments-on/:id', auth, async (req, res) => {

    let id = req.params.id
    try {
        //Find the comments by id
        const comments = await QuizComment.find({ quiz: id })
            //sort comments by createdAt
            .sort({ createdAt: -1 })
            .populate('sender', 'role name email')

        if (!comments) throw Error('No comments found')

        res.status(200).json(comments)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }
})

// @route POST api/comments
// @route Create a comment
// @route Private: accessed by authenticated user
router.post("/", auth, async (req, res) => {

    const { comment, quiz, sender } = req.body

    // Simple validation
    if (!comment || !sender || !quiz) {
        return res.status(400).json({ msg: 'Please fill required fields' })
    }

    try {
        const newQuizComment = new QuizComment({
            comment,
            quiz,
            sender
        })

        const savedQuizComment = await newQuizComment.save()
        if (!savedQuizComment) throw Error('Something went wrong during creation!')

        res.status(200).json({
            _id: savedQuizComment._id,
            comment: savedQuizComment.comment,
            sender: savedQuizComment.sender,
            quiz: savedQuizComment.quiz
        })

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route PUT api/comments/:id
// @route UPDATE one comment
// @access Private: Accessed by admins only
router.put('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        //Find the comment by id
        const comment = await QuizComment.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(comment)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route DELETE api/comments
// @route delete a comment
// @route Private: Accessed by admins only
router.delete('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const comment = await QuizComment.findById(req.params.id)
        if (!comment) throw Error('Comment is not found!')

        // Delete comment
        const removedComment = await QuizComment.deleteOne({ _id: req.params.id })

        if (!removedComment)
            throw Error('Something went wrong while deleting!')

        res.status(200).json({ msg: `${removedComment.comment} is Deleted!` })

    } catch (err) {
        res.status(400).json({
            msg: err.message
        })
    }
})


module.exports = router