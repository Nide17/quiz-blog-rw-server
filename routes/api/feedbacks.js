const express = require("express")
const router = express.Router()

// auth middleware to protect routes
const { authRole } = require('../../middleware/authMiddleware')
const Feedback = require('../../models/Feedback')

// @route GET api/feedbacks
// @route Get All feedbacks
// @route Private: accessed by authorization
router.get('/', async (req, res) => {

    try {
        const feedbacks = await Feedback.find()
        if (!feedbacks) throw Error('No feedbacks exist');
        res.status(200).json(feedbacks)
    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route POST api/feedbacks
// @route Create a feedback
// @route Private: accessed by authorization
router.post('/', async (req, res) => {

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