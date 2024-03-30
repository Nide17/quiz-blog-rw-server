const express = require("express")
const router = express.Router()

// auth middleware to protect routes
const { auth, authRole } = require('../../middleware/authMiddleware')
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

// @route GET api/questionComments/paginated
// @route Get qnComments paginated
// @route Private: accessed by authorization
router.get('/paginated', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    // Pagination
    const totalQnComments = await QuestionComment.countDocuments({})
    var PAGE_SIZE = 10
    var pageNo = parseInt(req.query.pageNo || "0")
    var query = {}

    query.limit = PAGE_SIZE
    query.skip = PAGE_SIZE * (pageNo - 1)

    try {

        const qnComments = pageNo > 0 ?
            await QuestionComment.find({}, {}, query)
                .sort({ createdAt: -1 }).populate('sender question quiz', '_id questionText title role name email') :

            await QuestionComment.find()
                //sort qnComments by createdAt
                .sort({ createdAt: -1 }).populate('sender question quiz', '_id questionText title role name email')

        if (!qnComments) throw Error('No qnComments exist')

        if (pageNo > 0) {
            return res.status(200).json({
                totalPages: Math.ceil(totalQnComments / PAGE_SIZE),
                qnComments
            })
        }
        else {
            return res.status(200).json(qnComments)
        }

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})


// @route GET api/questionComments/pending
// @route Get qnComments pending
// @route Private: accessed by super admin
router.get('/pending', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const pendComments = await QuestionComment.find({ status: 'Pending' })
            .sort({ createdAt: -1 })
            .populate('sender question quiz', '_id questionText title role name email')

        if (!pendComments) throw Error('No pending comments found')

        res.status(200).json(pendComments)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})


// @route GET api/questionComments/:id
// @route GET one comment
// @route Public
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
router.get('/comments-on/:id', auth, async (req, res) => {

    let id = req.params.id
    try {
        //Find the comments by id
        const comments = await QuestionComment.find({ question: id })
            .populate('sender question', '_id questionText role name email')

        if (!comments) throw Error('No comments found')

        res.status(200).json(comments)

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
        const comments = await QuestionComment.find({ quiz: id }).populate('sender question quiz', '_id questionText title role name email')

        if (!comments) throw Error('No comments found')

        res.status(200).json(comments)

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
// @access Private: Accessed by admins only
router.put('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {
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

// @route PUT api/questionComments/approve/:id
// @route approve one comment
// @access Private: Accessed by super admin only
router.put('/approve/:id', authRole(['SuperAdmin']), async (req, res) => {
    try {
        //Find the comment by id
        const comment = await QuestionComment.findOneAndUpdate(
            { _id: req.params.id },
            { status: 'Approved' },
            { new: true })

        res.status(200).json(comment)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route PUT api/questionComments/reject/:id
// @route reject one comment
// @access Private: Accessed by SuperAdmin only
router.put('/reject/:id', authRole(['SuperAdmin']), async (req, res) => {
    try {
        //Find the comment by id
        const comment = await QuestionComment.findOneAndUpdate(
            { _id: req.params.id },
            { status: 'Rejected' },
            { new: true })

        res.status(200).json(comment)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route DELETE api/questionComments
// @route delete a comment
// @route Private: Accessed by SuperAdmin only
router.delete('/:id', authRole(['SuperAdmin']), async (req, res) => {

    try {
        const comment = await QuestionComment.findById(req.params.id)
        if (!comment) throw Error('Comment is not found!')

        // Delete comment
        const removedComment = await QuestionComment.deleteOne({ _id: req.params.id })

        if (!removedComment)
            throw Error('Something went wrong while deleting!')

        res.status(200).json({ msg: `${removedComment.comment}` })

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

module.exports = router