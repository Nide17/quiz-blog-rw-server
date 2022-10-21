const express = require("express")
const router = express.Router()

// Quiz Model
const Quiz = require('../../models/Quiz')
const Question = require('../../models/Question')
const Category = require('../../models/Category')
const User = require('../../models/User')
const SubscribedUser = require('../../models/SubscribedUser')

const { auth, authRole } = require('../../middleware/auth')
const sendEmail = require("./emails/sendEmail")

// Help to randomize
const shuffle = (v) => {
    for (var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    return v;
};

// @route   GET /api/quizes
// @desc    Get all quizes
// @access  Public
router.get('/', async (req, res) => {

    // Pagination
    const limit = parseInt(req.query.limit)
    const skip = parseInt(req.query.skip)
    var query = {}

    query.limit = limit
    query.skip = skip

    try {
        const quizes = await Quiz.find({}, {}, query)
            //sort quizes by creation_date
            .sort({ creation_date: -1 })
            .populate('category questions created_by')

        if (!quizes) throw Error('No quizes found')

        res.status(200).json(quizes)
    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET /api/quizes/:id
// @desc    Get one quiz
// @access  Needs to private
router.get('/:id', async (req, res) => {

    try {
        const Query = await Quiz.findOne({ _id: req.params.id })
            .populate('category questions created_by')

        if (!Query) throw Error('Quiz not found!')

        //shuffle answerOptions
        Query.questions.map(qn => shuffle(qn.answerOptions))

        //if you need to shuffle the questions too
        shuffle(Query.questions)

        res.status(200).json(Query) // output quiz with shuffled questions and answers

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }

})

// @route   GET 
// @desc    Get all quizes by category id
// @access  Needs to private
router.get('/category/:id', async (req, res) => {

    let id = req.params.id
    try {
        //Find the quizes by id
        await Quiz.find({ category: id }, (err, quizes) => {
            res.status(200).json(quizes)
        })

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }

})

// @route   GET /api/quizes/course-notes/:id
// @desc    Get one quiz
// @access  Needs to private
router.get('/course-notes/:id', async (req, res) => {

    try {
        // First lookup categories with the course category of the notes
        const categories = await Category.find({ courseCategory: req.params.id })
        if (!categories) throw Error('No category found!')

        //search quizzes
        const quizzes = await Quiz.find({ category: { $in: categories } })
        if (!quizzes) throw Error('No quizzes found!')

        res.status(200).json(quizzes)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }

})

// @route   POST /api/quizes
// @desc    Create quiz
// @access  Have to private
router.post('/', auth, authRole(['Creator', 'Admin']), async (req, res) => {

    const { title, description, category, created_by } = req.body

    // Simple validation
    if (!title || !description || !category) {
        return res.status(400).json({ msg: 'There are missing info!' })
    }

    try {
        const quiz = await Quiz.findOne({ title })
        if (quiz) throw Error('Quiz already exists!')

        const newQuiz = new Quiz({
            title,
            description,
            category,
            created_by
        })

        const savedQuiz = await newQuiz.save()

        if (!savedQuiz) throw Error('Something went wrong during creation!')

        // Update the Category on Quiz creation
        await Category.updateOne(
            { "_id": category },
            { $addToSet: { "quizes": savedQuiz._id } }
        )

        res.status(200).json({
            _id: savedQuiz._id,
            title: savedQuiz.title,
            description: savedQuiz.description,
            category: savedQuiz.category,
            created_by: savedQuiz.created_by
        })

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   POST /api/quizes/notifying
// @desc    Send email when quiz is ready
// @access  Have to private
router.post('/notifying', authRole(['Creator', 'Admin']), async (req, res) => {

    const { quizId, title, category, created_by } = req.body

        // Send email to subscribers of Category on Quiz creation
        const subscribers = await SubscribedUser.find()

        const clientURL = process.env.NODE_ENV === 'production' ?
            'https://www.quizblog.rw' : 'http://localhost:3000'

        subscribers.forEach(sub => {
            sendEmail(
                sub.email,
                `Updates!! new ${category} quiz that may interests you`,
                {
                    name: sub.name,
                    author: created_by,
                    newQuiz: title,
                    quizesLink: `${clientURL}/view-quiz/${quizId}`,
                    unsubscribeLink: `${clientURL}/unsubscribe`
                },
                "./template/newquiz.handlebars")
        })

        res.status(200).json({
            quizId,
            title,
            category,
            created_by,
        })
})

// @route PUT api/quizes/:id
// @route Move quiz from one category to another
// @access Private: Accessed by admin only
router.put('/:id', authRole(['Creator', 'Admin']), async (req, res) => {

    try {
        //Find the Quiz by id
        const quiz = await Quiz.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(quiz)

        // Delete quiz in old Category
        await Category.updateOne(
            { _id: req.body.oldCategoryID },
            { $pull: { quizes: quiz._id } }
        )

        // Update the Category on quiz updating
        await Category.updateOne(
            { _id: req.body.category },
            { $addToSet: { "quizes": quiz._id } }
        )

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route PUT api/quizes/add-video/:id
// @route UPDATE one video
// @access Private: Accessed by admin only
router.put('/add-video/:id', authRole(['Admin']), async (req, res) => {

    try {
        const quiz = await Quiz.updateOne(
            { "_id": req.params.id },
            { $push: { "video_links": req.body } },
            { new: true }
        )
        res.status(200).json(quiz)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route DELETE api/quizes/delete-video/:id
// @route DELETE one video
// @access Private: Accessed by admin only
router.put('/delete-video/:id', authRole(['Admin']), async (req, res) => {

    try {
        const quiz = await Quiz.updateOne(
            { "_id": req.body.qID },
            { $pull: { "video_links": { _id: req.body.vId } } }
        )
        res.status(200).json(quiz)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route DELETE api/quizes/:id
// @route delete a Quiz
// @route Private: Accessed by admin only
//:id placeholder, findById = we get it from the parameter in url
router.delete('/:id', auth, authRole(['Creator', 'Admin']), async (req, res) => {

    try {
        const quiz = await Quiz.findById(req.params.id)
        if (!quiz) throw Error('Quiz is not found!')

        // Remove quiz from quizzes of the category
        await Category.updateOne(
            { _id: quiz.category },
            { $pull: { quizes: quiz._id } }
        )

        // Delete questions belonging to this quiz
        await Question.remove({ quiz: quiz._id })

        // Delete quiz
        const removedQuiz = await quiz.remove()

        if (!removedQuiz)
            throw Error('Something went wrong while deleting!')
        res.status(200).json({ msg: `Deleted!` })

    } catch (err) {
        res.status(400).json({
            msg: err.message
        })
    }
})

module.exports = router