const express = require("express")
const router = express.Router()

// ChallengeQuiz Model
const ChallengeQuiz = require('../../../models/challenges/ChallengeQuiz')

const { auth, authRole } = require('../../../middleware/auth')
const sendEmail = require("../emails/sendEmail")

const shuffle = (v) => {
    for (var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    return v;
};

// @route   GET /api/challengeQuizzes
// @desc    Get all challengeQuizzes
// @access  Public
router.get('/', async (req, res) => {

    // Pagination
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    var query = {}

    query.limit = limit
    query.skip = skip

    try {
        const challengeQuizzes = await ChallengeQuiz.find({}, {}, query)
            //sort challengeQuizzes by createdAt
            .sort({ createdAt: -1 })
            .populate('category questions created_by')

        if (!challengeQuizzes) throw Error('No challengeQuizzes found');

        res.status(200).json(challengeQuizzes);
    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
});

// @route   GET /api/challengeQuizzes/:id
// @desc    Get one quiz
// @access  Needs to private
router.get('/:id', async (req, res) => {

    try {
        const Query = await ChallengeQuiz.findOne({ _id: req.params.id })
            .populate('category questions created_by')

        if (!Query) throw Error('Challenge quiz not found!')

        //shuffle answerOptions
        Query.questions.map(qn => shuffle(qn.answerOptions))

        //if you need to shuffle the questions too
        shuffle(Query.questions)

        res.status(200).json(Query) // output quiz with shuffled questions and answers

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        });
    }

});

// @route   GET 
// @desc    Get all challengeQuizzes by category id
// @access  Needs to private
router.get('/category/:id', async (req, res) => {

    let id = req.params.id
    try {
        //Find the challengeQuizzes by id
        await ChallengeQuiz.find({ category: id }, (err, challengeQuizzes) => {
            res.status(200).json(challengeQuizzes)
        })

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }

})

// @route   POST /api/challengeQuizzes
// @desc    Create quiz
// @access  Have to private
router.post('/', auth, authRole(['Creator', 'Admin']), async (req, res) => {

    const { title, description, duration, category, created_by } = req.body;

    // Simple validation
    if (!title || !description || !duration || !category || !created_by) {
        return res.status(400).json({ msg: 'There are missing info!' });
    }

    try {
        const quiz = await ChallengeQuiz.findOne({ title });
        if (quiz) throw Error('Quiz already exists!');

        const newChallengeQuiz = new ChallengeQuiz({
            title,
            description,
            duration,
            category,
            created_by
        });

        const savedChallengeQuiz = await newChallengeQuiz.save();

        if (!savedChallengeQuiz) throw Error('Something went wrong during creation!');

        res.status(200).json({
            _id: savedChallengeQuiz._id,
            title: savedChallengeQuiz.title,
            description: savedChallengeQuiz.description,
            duration: savedChallengeQuiz.duration,
            category: savedChallengeQuiz.category,
            created_by: savedChallengeQuiz.created_by
        });

    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});


// @route DELETE api/challengeQuizzes/:id
// @route delete a Quiz
// @route Private: Accessed by admin only
router.delete('/:id', auth, authRole(['Creator', 'Admin']), async (req, res) => {

    try {
        const challengeQuiz = await ChallengeQuiz.findById(req.params.id);
        if (!challengeQuiz) throw Error('Challenge quiz is not found!')

        // Delete questions belonging to this quiz
        await ChallengeQuiz.remove({ challengeQuiz: challengeQuiz._id });

        // Delete quiz
        const removedChallengeQuiz = await challengeQuiz.remove();

        if (!removedChallengeQuiz)
            throw Error('Something went wrong while deleting!');
        res.status(200).json({ msg: `Deleted!` })

    } catch (err) {
        res.status(400).json({
            msg: err.message
        });
    }
});

module.exports = router;