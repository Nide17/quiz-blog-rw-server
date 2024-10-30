const express = require("express")
const router = express.Router()

// auth middleware to protect routes
const { auth, authRole } = require('../../middleware/authMiddleware')
const Feedback = require('../../models/Feedback')
const Score = require('../../models/Score')
const Quiz = require('../../models/Quiz')
const User = require('../../models/User')

// @route GET api/feedbacks
// @route Get All feedbacks
// @route Private: accessed by authorization
router.get('/', authRole(['Creator', 'Admin', 'SuperAdmin']), async (req, res) => {

    // Pagination
    const totalPages = await Feedback.countDocuments({})
    var PAGE_SIZE = 20
    var pageNo = parseInt(req.query.pageNo || "0")
    var query = {}

    query.limit = PAGE_SIZE
    query.skip = PAGE_SIZE * (pageNo - 1)

    try {

        const feedbacks = pageNo > 0 ?
            await Feedback.find({}, {}, query)
                .sort({ createdAt: -1 })
                .populate({
                    path: 'quiz',
                    model: Quiz,
                    select: 'title slug'
                })
                .populate({
                    path: 'score',
                    model: Score,
                    select: 'taken_by id marks out_of',
                    populate: {
                        path: 'taken_by',
                        model: User,
                        select: 'name email'
                    }
                })
                .exec() :

            await Feedback.find()
                .sort({ createdAt: -1 })
                .populate({
                    path: 'quiz',
                    model: Quiz,
                    select: 'title slug'
                })
                .populate({
                    path: 'score',
                    model: Score,
                    select: 'taken_by id marks out_of',
                    populate: {
                        path: 'taken_by',
                        model: User,
                        select: 'name email'
                    }
                })
                .exec()

        if (!feedbacks) throw Error('No feedbacks exist');

        if (pageNo > 0) {
            res.status(200).json({
                feedbacks,
                totalPages: Math.ceil(totalPages / PAGE_SIZE)
            })
        } else {
            res.status(200).json(feedbacks)
        }
    }
    catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route POST api/feedbacks
// @route Create a feedback
// @route Private: accessed by authorization
router.post('/', auth, async (req, res) => {
    const newFeedback = new Feedback(req.body);
    try {
        const feedback = await newFeedback.save()
        if (!feedback) throw Error('Something went wrong saving the feedback');
        res.status(200).json(feedback)
    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

module.exports = router