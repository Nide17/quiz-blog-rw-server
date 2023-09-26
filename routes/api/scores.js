const express = require("express")
const mongoose = require('mongoose')
const router = express.Router()

// auth middleware to protect routes
const { auth, authRole } = require('../../middleware/auth')

//Score Model : use capital letters since it's a model
const Score = require('../../models/Score')

// @route GET api/scores
// @route Get All scores
// @route Private: accessed by authorization
router.get('/', authRole(['Creator', 'Admin', 'SuperAdmin']), async (req, res) => {

  // Pagination
  const totalPages = await Score.countDocuments({})
  var PAGE_SIZE = 20
  var pageNo = parseInt(req.query.pageNo || "0")
  var query = {}

  query.limit = PAGE_SIZE
  query.skip = PAGE_SIZE * (pageNo - 1)

  try {

    const scores = pageNo > 0 ?
      await Score.find({}, {}, query)
        .sort({ test_date: -1 })
        .populate('quiz category taken_by') :

      await Score.find()

        //sort scores by creation_date
        .sort({ test_date: -1 })
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
// @access  Private:
router.get('/quiz-creator/:id', authRole(['Creator', 'Admin', 'SuperAdmin']), async (req, res) => {

  try {
    Score.aggregate([
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
          test_date: 1,
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
// @access  Private
router.get('/one-score/:id', auth, async (req, res) => {

  let id = req.params.id
  try {
    //Find the score by id
    await Score.findOne({ id }, (err, score) => {
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
// @access  Public
router.get('/ranking/:id', async (req, res) => {

  let id = req.params.id
  try {
    //Find the scores by id
    const scores = await Score.find({ quiz: id })
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
// @access  Public
router.get('/popular-quizes', async (req, res) => {

  var now = new Date();
  var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  try {
    await Score.aggregate([
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
        $match: { "test_date": { $gte: startOfToday } }
      },
      { $unwind: '$quiz_scores' },
      // Second Stage: group
      {
        $group: {
          _id: { qId: "$quiz_scores._id", qTitle: "$quiz_scores.title", slug: "$quiz_scores.slug" },
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
// @access  Public
router.get('/monthly-user', async (req, res) => {

  var now = new Date();
  var startOfMonth = new Date(now.getFullYear(), now.getMonth())

  try {
    await Score.aggregate([
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
        $match: { "test_date": { $gte: startOfMonth } }
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
// @access  Private
router.get('/taken-by/:id', auth, async (req, res) => {

  let id = req.params.id
  try {
    //Find the scores by id
    await Score.find({ taken_by: id }, (err, scores) => {
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

// @route POST api/scores
// @route Create a Score
// @route Private: accessed by logged in user
router.post('/', auth, async (req, res) => {

  const { id, out_of, category, quiz, review, taken_by } = req.body
  const marks = req.body.marks ? req.body.marks : 0
  var now = new Date()

  // Simple validation
  if (!id || !out_of || !category || !quiz || !review || !taken_by) {
    const missing = !id ? 'Error' : !out_of ?'No total' : !category ?'No category' : !quiz ?'No quiz' : !review ?'No review' : !taken_by ?'No taker user' : 'Wrong'
    return res.status(400).json({ msg: missing + '!' })
  }

  else {
    try {
      const existingScore = await Score.find({ id: id })
      const recentScoreExist = await Score.find({ taken_by }, {}, { sort: { 'test_date': -1 } })

      if (existingScore.length > 0) {
        console.log('existingScore')
        return res.status(400).json({
          msg: 'Score duplicate! You have already saved this score!'
        })
      }

      else if (recentScoreExist.length > 0) {
        // Check if the score was saved within 10 seconds
        let testDate = new Date(recentScoreExist[0].test_date)
        let seconds = Math.round((now - testDate) / 1000)

        if (seconds < 60) {
          console.log('recentScoreExist')
          return res.status(400).json({
            msg: 'Score duplicate! You took this quiz in less than a minute ago!'
          })
        }

        else {
          console.log('newScore not recent')
        }
      }

      else {
        console.log('newScore total score')
      }

      const newScore = new Score({
        id,
        marks,
        out_of,
        test_date: now,
        category,
        quiz,
        review,
        taken_by
      })

      const savedScore = await newScore.save()

      if (!savedScore) {
        console.log('newScore not saved')
        throw Error('Something went wrong during creation!')
      }

      else {
        console.log('newScore saved')

        res.status(200).json({
          _id: savedScore._id,
          id: savedScore.id,
          marks: savedScore.marks,
          out_of: savedScore.out_of,
          test_date: savedScore.test_date,
          category: savedScore.category,
          quiz: savedScore.quiz,
          review: savedScore.review,
          taken_by: savedScore.taken_by
        })
      }

    } catch (err) {
      console.log(err.message)
      res.status(400).json({ msg: 'Failed to save score! ' + err.message })
    }
  }

})
// @route DELETE api/scores
// @route delete a Score
// @route Private: Accessed by admin only
router.delete('/:id', authRole(['Admin', 'SuperAdmin']), (req, res) => {

  //Find the Score to delete by id first
  Score.findById(req.params.id)

    //returns promise 
    .then(score => score.remove().then(() => res.json({ success: true })))
    // if id not exist or if error
    .catch(err => res.status(404).json({ success: false }))
})

module.exports = router