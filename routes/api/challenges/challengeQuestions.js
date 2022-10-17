const express = require("express")
const router = express.Router()
const config = require('config')
// auth middleware to protect routes
const { auth, authRole } = require('../../../middleware/auth')
const AWS = require('aws-sdk')
const { challengeUpload } = require('../utils/challengeUpload.js')

const s3Config = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || config.get('AWSAccessKeyId'),
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || config.get('AWSSecretKey'),
  Bucket: process.env.S3_BUCKET_CHALLENGES || config.get('S3ChallengesBucket')
})

//ChallengeQuestion Model : use capital letters since it's a model
const ChallengeQuestion = require('../../../models/challenges/ChallengeQuestion')
const ChallengeQuiz = require('../../../models/challenges/ChallengeQuiz')

// @route GET api/questions
// @route Get All questions
// @route Public

//we use router. instead of app. and / because we are already in this dir
router.get('/', async (req, res) => {

  try {
    const questions = await ChallengeQuestion.find()
      //sort questions by creation_date
      .sort({ creation_date: -1 })
      .populate('category quiz created_by')

    if (!questions) throw Error('No questions found')

    res.status(200).json(questions)
  } catch (err) {
    res.status(400).json({ msg: err.message })
  }
})

// @route GET api/questions/:id
// @route GET one Question
// @route Private
router.get('/:id', async (req, res) => {
  try {
    //Find the question by id
    await ChallengeQuestion.findById(req.params.id, (err, question) => {
      res.status(200).json(question)
    })
      // Use the name of the schema path instead of the collection name
      .populate('category quiz')

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    })
  }
})

// @route POST api/questions
// @route Create a Question
// @route Accessed by Admin and Creator
router.post("/", auth, authRole(['Admin', 'Creator']), challengeUpload.single('question_image'), async (req, res) => {

  const { questionText, answerOptions, category, challengeQuiz, created_by } = req.body
  const qnImage = req.file

  // Parse answer options from frontend
  const answers = answerOptions.map(a => JSON.parse(a))

  // Simple validation
  if (!questionText && !qnImage) {
    return res.status(400).json({ msg: 'Question text or Image is required!' })
  }
  else if (!questionText || !challengeQuiz || !category || !answerOptions) {
    return res.status(400).json({ msg: 'Please fill all fields' })
  }

  try {
    let qtn = await ChallengeQuestion.findOne({ questionText })

    if (qtn) {
      return res.status(400).json({ msg: 'A question with same name already exists!' })
    }

    const newQuestion = new ChallengeQuestion({
      questionText,
      question_image: qnImage && qnImage.location,
      answerOptions: answers,
      category,
      challengeQuiz,
      created_by
    })

    const savedChallengeQuestion = await newQuestion.save()

    // Update the Quiz on Question creation
    await ChallengeQuiz.updateOne(
      { "_id": challengeQuiz },
      { $addToSet: { "questions": savedChallengeQuestion._id } }
    )

    if (!savedChallengeQuestion) throw Error('Something went wrong during creation!')

    res.status(200).json(savedChallengeQuestion)

  } catch (err) {
    res.status(400).json({ msg: err.message })
  }
})

// @route PUT api/questions/:id
// @route Move question from one quiz to another
// @access Private: Accessed by admin only
router.put('/:id', authRole(['Creator', 'Admin']), challengeUpload.single('question_image'), async (req, res) => {

  const { questionText, answerOptions, quiz, oldQuizID, last_updated_by } = req.body
  const qnImage = req.file

  //Find the Question by id
  const question = await ChallengeQuestion.findOne({ _id: req.params.id });
  if (!question) throw Error('Failed! question not exists!');

  try {

    // changing question quiz
    if (quiz) {
      const updatedQuestion = await ChallengeQuestion.findByIdAndUpdate({ _id: req.params.id }, {
        quiz,
        last_updated_by,
      }, { new: true })

      // Delete Question in old quiz
      await ChallengeQuiz.updateOne(
        { _id: oldQuizID },
        { $pull: { questions: question._id } }
      )

      // Update the Quiz on Question updating
      await ChallengeQuiz.updateOne(
        { "_id": quiz },
        { $addToSet: { "questions": question._id } }
      )
      res.status(200).json(updatedQuestion);
    }

    // Editing question
    else {
      // Changing answerOptions from string to json
      const answers = answerOptions.map(a => JSON.parse(a))

      // Delete existing image
      const params = question.question_image ?
        {
          Bucket: process.env.S3_BUCKET_CHALLENGES || config.get('S3ChallengesBucket'),
          Key: question.question_image.split('/').pop() //if any sub folder-> path/of/the/folder.ext
        } :
        null

      // Deleting old image
      try {
        params ?
          s3Config.deleteObject(params, (err, data) => {
            if (err) {
              console.log(err, err.stack); // an error occurred
            }
            else {
              console.log(params.Key + ' deleted!');
            }
          }) : null

      }
      catch (err) {
        console.log('ERROR in file Deleting : ' + JSON.stringify(err))
      }

      //Find the question by id and update
      const updatedQuestion = await ChallengeQuestion.findByIdAndUpdate({ _id: req.params.id }, {
        questionText,
        question_image: qnImage && qnImage.location,
        answerOptions: answers,
        last_updated_by
      }, { new: true })

      res.status(200).json(updatedQuestion);
    }

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to update! ' + err.message,
      success: false
    })
  }
})

// @route DELETE api/questions
// @route delete a Question
// @route Private: Accessed by admin only
router.delete('/:id', auth, authRole(['Creator', 'Admin']), async (req, res) => {

  try {
    //Find the Question to delete by id first
    const challengeQuestion = await ChallengeQuestion.findById(req.params.id)
    if (!challengeQuestion) throw Error('Question is not found!')

    // Delete existing image
    const params = challengeQuestion.question_image ?
      {
        Bucket: process.env.S3_BUCKET_CHALLENGES || config.get('S3ChallengesBucket'),
        Key: challengeQuestion.question_image.split('/').pop() //if any sub folder-> path/of/the/folder.ext
      } :
      null

    try {

      params ?
        await s3Config.deleteObject(params, (err, data) => {
          if (err) {
            res.status(400).json({ msg: err.message })
            console.log(err, err.stack) // an error occurred
          }
          else {
            console.log(params.Key + ' deleted from ' + params.Bucket)
            // res.status(200).json({ msg: 'deleted!' })
          }
        }) : null

    }
    catch (err) {
      console.log('ERROR in file Deleting : ' + JSON.stringify(err))
    }

    // Remove question from questions of the quiz
    const pulledOutQuestion = await ChallengeQuiz.updateOne(
      { _id: challengeQuestion.challengeQuiz },
      { $pull: { questions: challengeQuestion._id } }
    )

    if (!pulledOutQuestion)
      throw Error('Something went wrong while removing the question from the quiz!')

    // Delete the question
    const removedQuestion = await challengeQuestion.remove()

    if (!removedQuestion)
      throw Error('Something went wrong while deleting!')

    res.status(200).json({ msg: "Deleted successfully!" })

  } catch (err) {
    res.status(400).json({
      msg: err.message
    })
  }
})

module.exports = router