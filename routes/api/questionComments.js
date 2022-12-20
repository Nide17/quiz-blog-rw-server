const express = require("express")
const router = express.Router()

// auth middleware to protect routes
const { auth, authRole } = require('../../middleware/auth')
const QuestionComment = require('../../models/QuestionComment')

// @route   GET /api/questionComments
// @desc    Get question comments
// @access  Public
router.get('/', async (req, res) => {

    try {
        const comments = await QuestionComment.find()
            //sort comments by createdAt
            .sort({ createdAt: -1 })
            .populate('sender question quiz', '_id questionText title role name email')

        if (!comments) throw Error('No comments found')

        res.status(200).json(comments)

    } catch (err) {
        res.status(400).json({ msg: err.answer })
    }
})

// @route GET api/questionComments/:id
// @route GET one comment
// @route Private: accessed by logged in user
router.get('/:id', (req, res) => {

    //Find the comment by id
    QuestionComment.findById(req.params.id)
        //return a promise
        .then(comment => res.json(comment))
        // if id not exist or if error
        .catch(err => res.status(404).json({ success: false }))
})

// @route GET api/questionComments/comments-on/:id
// @route GET comments on one question
// @route Private
router.get('/comments-on/:id', async (req, res) => {

    let id = req.params.id
    try {
        //Find the comments by id
        await QuestionComment.find({ question: id }, (err, comments) => {
            res.status(200).json(comments)
        })
            .populate('sender question', '_id questionText role name email')

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }
})

// @route GET api/questionComments/quiz/:id
// @route GET comments on this quiz
// @route Private
router.get('/quiz/:id', async (req, res) => {

    let id = req.params.id
    try {
        //Find the comments by id
        await QuestionComment.find({ quiz: id }, (err, comments) => {
            res.status(200).json(comments)
        })
            .populate('sender question quiz', '_id questionText title role name email')

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }
})


// @route POST api/questionComments
// @route Create a comment
// @route Private: accessed by admin
router.post("/", auth, async (req, res) => {

    const { comment, sender, question, quiz } = req.body

    // Simple validation
    if (!comment || !sender || !quiz || !question) {
        return res.status(400).json({ msg: 'There are empty fields' })
    }

    try {
        const newQuestionComment = new QuestionComment({
            comment,
            sender,
            question,
            quiz
        })

        const savedQuestionComment = await newQuestionComment.save()
        if (!savedQuestionComment) throw Error('Something went wrong during creation!')

        res.status(200).json({
            _id: savedQuestionComment._id,
            comment: savedQuestionComment.comment,
            sender: savedQuestionComment.sender,
            question: savedQuestionComment.question,
            quiz: savedQuestionComment.quiz
        })

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route PUT api/questionComments/:id
// @route UPDATE one comment
// @access Private: Accessed by admin only
router.put('/:id', authRole(['Admin']), async (req, res) => {

    try {
        //Find the comment by id
        const comment = await QuestionComment.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(comment)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route DELETE api/questionComments
// @route delete a comment
// @route Private: Accessed by admin only
router.delete('/:id', authRole(['Admin']), async (req, res) => {

    try {
        const comment = await QuestionComment.findById(req.params.id)
        if (!comment) throw Error('Comment is not found!')

        // Delete comment
        const removedComment = await comment.remove()

        if (!removedComment)
            throw Error('Something went wrong while deleting!')

        res.status(200).json({ msg: `${removedComment.comment}` })

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

module.exports = router