const express = require("express")
const mongoose = require('mongoose')
const router = express.Router()

// auth middleware to protect routes
const { auth, authRole } = require('../../../middleware/auth')

//ChallengeScore Model : use capital letters since it's a model
const ChallengeScore = require('../../../models/challenges/ChallengeScore')

// @route GET api/scores
// @route Get All scores
// @route Private: accessed by logged in user
router.get('/', async (req, res) => {

  // Pagination
  const totalPages = await ChallengeScore.countDocuments({})
  var PAGE_SIZE = 20
  var pageNo = parseInt(req.query.pageNo || "0")
  var query = {}

  query.limit = PAGE_SIZE
  query.skip = PAGE_SIZE * (pageNo - 1)

  try {

    const scores = pageNo > 0 ?
      await ChallengeScore.find({}, {}, query)
        .sort({ createdAt: -1 })
        .populate('quiz category taken_by') :

      await ChallengeScore.find()

        //sort scores by creation_date
        .sort({ createdAt: -1 })
        .populate('quiz category taken_by')

    if (!scores) throw Error('No scores exist')

    if (pageNo > 0) {

      return res.status(200).json({
        totalPages: Math.ceil(totalPages / PAGE_SIZE),
        scores
      })
    }
    else {
      return res.status(200).json({ scores })
    }

  } catch (err) {
    res.status(400).json({ msg: err.message + "Please login first!" })
  }
})

// @route   GET /api/scores/quiz-creator/:id
// @desc    Get all scores by taker
// @access  Needs to private
router.get('/quiz-creator/:id', auth, authRole(['Creator', 'Admin']), async (req, res) => {

  try {
    ChallengeScore.aggregate([
      {
        // Join with quiz collection
        $lookup:
        {
          from: "quizzes",
          localField: "quiz",
          foreignField: "_id",
          as: "quiz_scores"
        }
      },
      { $unwind: '$quiz_scores' },

      // Match only scores of the quiz creators
      { $match: { 'quiz_scores.created_by': new mongoose.Types.ObjectId(req.params.id) } },
      {
        // Join with users collection
        $lookup:
        {
          from: "users",
          localField: "taken_by",
          foreignField: "_id",
          as: "users_scores"
        }
      },
      { $unwind: '$users_scores' },
      {
        // Join with categories collection
        $lookup:
        {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category_scores"
        }
      },
      { $unwind: '$category_scores' },
      {
        // Decide what to return
        $project: {
          marks: 1,
          out_of: 1,
          _id: 0,
          createdAt: 1,
          quiz_scores_title: '$quiz_scores.title',
          category_scores_title: '$category_scores.title',
          users_scores_name: '$users_scores.name',
        }
      }
    ]).exec(function (err, scores) {
      if (err) return err
      res.json(scores)
    }
    )

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    })
  }

})

// @route   GET /api/scores/:id
// @desc    Get one score
// @access  Needs to private
router.get('/one-score/:id', auth, async (req, res) => {

  let id = req.params.id
  try {
    //Find the score by id
    await ChallengeScore.findOne({ id }, (err, score) => {
      res.status(200).json(score)
    })
      // Use the name of the schema path instead of the collection name
      .populate('category quiz user')

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    })
  }
})


// @route   GET /api/scores/ranking/:id
// @desc    Get one score
// @access  Needs to private
router.get('/ranking/:id', async (req, res) => {

  let id = req.params.id
  try {
    //Find the scores by id
    const scores = await ChallengeScore.find({ quiz: id })
      .sort({ marks: -1 })
      .limit(20)
      .select('quiz taken_by category id marks out_of')
      .populate('quiz taken_by category')

    if (!scores) throw Error('No scores found')

    res.status(200).json(scores)

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    })
  }
})

// @route   GET /api/scores/popular-quizes
// @desc    Get popular quizes
// @access  Needs to private
router.get('/popular-quizes', async (req, res) => {

  var now = new Date();
  var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  try {
    await ChallengeScore.aggregate([
      {
        // Join with quiz collection
        $lookup:
        {
          from: "quizzes",
          localField: "quiz",
          foreignField: "_id",
          as: "quiz_scores"
        }
      },
      // First Stage: today's scores
      {
        $match: { "createdAt": { $gte: startOfToday } }
      },
      { $unwind: '$quiz_scores' },
      // Second Stage: group
      {
        $group: {
          _id: { qId: "$quiz_scores._id", qTitle: "$quiz_scores.title" },
          count: { $sum: 1 }
        }
      },
      // Third Stage: sort by count
      {
        $sort: { count: -1 }
      },
      // Fourth Stage: only top 3
      { $limit: 3 }
    ]).exec(function (err, scores) {
      if (err) return err
      res.json(scores)
    })

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    })
  }

})

// @route   GET /api/scores/popular
// @desc    Get popular quizes
// @access  Needs to private
router.get('/monthly-user', async (req, res) => {

  var now = new Date();
  var startOfMonth = new Date(now.getFullYear(), now.getMonth())

  try {
    await ChallengeScore.aggregate([
      {
        // Join with quiz collection
        $lookup:
        {
          from: "quizzes",
          localField: "quiz",
          foreignField: "_id",
          as: "quiz_scores"
        }
      },
      {
        // Join with quiz collection
        $lookup:
        {
          from: "users",
          localField: "taken_by",
          foreignField: "_id",
          as: "taken_by_scores"
        }
      },
      // First Stage: today's scores
      {
        $match: { "createdAt": { $gte: startOfMonth } }
      },
      // Second Stage: unwinding or populating
      { $unwind: '$quiz_scores' },
      { $unwind: '$taken_by_scores' },
      // Third stage: matching visitors and creators
      {
        $match: {
          "taken_by_scores.role": {
            $in: ['Visitor', 'Creator']
          }
        }
      },
      // Fourth Stage: group
      {
        $group: {
          _id: { uId: "$taken_by_scores._id", uEmail: "$taken_by_scores.email", uName: "$taken_by_scores.name", uPhoto: "$taken_by_scores.image" },
          count: { $sum: 1 }
        }
      },
      // Fifth Stage: sort by count
      {
        $sort: { count: -1 }
      },
      // Six Stage: only top 3
      { $limit: 1 }
    ]).exec(function (err, scores) {
      if (err) return err
      res.json(scores[0])
    })

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    })
  }

})

// @route   GET /api/scores/taken-by/:id
// @desc    Get all scores by taker
// @access  Needs to private
router.get('/taken-by/:id', auth, async (req, res) => {

  let id = req.params.id
  try {
    //Find the scores by id
    await ChallengeScore.find({ taken_by: id }, (err, scores) => {
      res.status(200).json(scores)
    })
      // Use the name of the schema path instead of the collection name
      .populate('category quiz user')

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    })
  }

})

// @route POST api/challengeScore
// @route Create a ChallengeScore
// @route Private: accessed by logged in user
router.post('/', auth, async (req, res) => {

  const { id, marks, out_of, category, quiz, review, taken_by } = req.body
  var now = new Date()

  // Simple validation
  if (!id || !category || !quiz || !taken_by) {
    return res.status(400).json({ msg: 'Insufficient info' })
  }

  else if (!Object.entries(review).length > 0) {
    return res.status(400).json({ msg: 'No answers provided' })
  }

  try {
    const challengeScoreExist = await ChallengeScore.findOne({ taken_by }, {}, { sort: { 'createdAt': -1 } })

    if (challengeScoreExist) {
      let testDate = new Date(challengeScoreExist.createdAt)
      let seconds = Math.round((now.getTime() - testDate.getTime()) / 1000)

      if (seconds < 10) {
        return res.status(400).json({
          msg: 'Score saved already!'
        })
      }
    }

    const newChallengeScore = new ChallengeScore({
      id,
      marks,
      out_of,
      category,
      quiz,
      review,
      taken_by
    })

    const savedChallengeScore = await newChallengeScore.save()

    if (!savedChallengeScore) throw Error('Something went wrong during creation!')

    res.status(200).json({
      _id: savedChallengeScore._id,
      id: savedChallengeScore.id,
      marks: savedChallengeScore.marks,
      out_of: savedChallengeScore.out_of,
      createdAt: savedChallengeScore.createdAt,
      category: savedChallengeScore.category,
      quiz: savedChallengeScore.quiz,
      review: savedChallengeScore.review,
      taken_by: savedChallengeScore.taken_by
    })

  } catch (err) {
    res.status(400).json({ msg: err.message })
  }
})

// @route DELETE api/scores
// @route delete a Score
// @route Private: Accessed by admin only
router.delete('/:id', auth, authRole(['Admin']), (req, res) => {

  //Find the Score to delete by id first
  ChallengeScore.findById(req.params.id)

    //returns promise 
    .then(challengeScore => challengeScore.remove().then(() => res.json({ success: true })))
    // if id not exist or if error
    .catch(err => res.status(404).json({ success: false }))
})

module.exports = router