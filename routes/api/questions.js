const express = require("express")
const router = express.Router()
const config = require('config')
// auth middleware to protect routes
const { auth, authRole } = require('../../middleware/auth')
const AWS = require('aws-sdk')
const { questionUpload } = require('./utils/questionUpload.js')

const s3Config = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || config.get('AWSAccessKeyId'),
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || config.get('AWSSecretKey'),
  Bucket: process.env.S3_BUCKET_QUESTIONS || config.get('S3QuestionsBucket')
})

//Question Model : use capital letters since it's a model
const Question = require('../../models/Question')
const Quiz = require('../../models/Quiz')

// @route GET api/questions
// @route Get All questions
// @route Public

//we use router. instead of app. and / because we are already in this dir
router.get('/', async (req, res) => {

  try {
    const questions = await Question.find()
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
// @route Public

router.get('/:id', async (req, res) => {
  try {
    //Find the question by id
    const question = await Question.findById(req.params.id).populate('category quiz')

    if (!question) throw Error('No question found')

    res.status(200).json(question)

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    })
  }
})

// @route POST api/questions
// @route Create a Question
// @route Accessed by Admin and Creator
router.post("/", authRole(['Admin', 'Creator', 'SuperAdmin']), questionUpload.single('question_image'), async (req, res) => {

  const { questionText, quiz, category, created_by, answerOptions, duration } = req.body
  const qnImage = req.file

  // Parse answer options from frontend
  const answers = answerOptions.map(a => JSON.parse(a))

  // Simple validation
  if (!questionText && !qnImage) {
    return res.status(400).json({ msg: 'Question text or Image is required!' })
  }
  else if (!questionText || !quiz || !category || !answerOptions || !duration) {
    return res.status(400).json({ msg: 'Please fill all fields' })
  }

  try {
    let qtn = await Question.findOne({ questionText })

    if (qtn) {
      return res.status(400).json({ msg: 'A question with same name already exists!' })
    }

    const newQuestion = new Question({
      questionText,
      question_image: qnImage && qnImage.location,
      answerOptions: answers,
      category,
      quiz,
      created_by,
      duration
    })

    const savedQuestion = await newQuestion.save()

    // Update the Quiz on Question creation
    await Quiz.updateOne(
      { "_id": quiz },
      { $addToSet: { "questions": savedQuestion._id } }
    )

    if (!savedQuestion) throw Error('Something went wrong during creation!')

    res.status(200).json(savedQuestion)

  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ msg: err.errors })
    }
    res.status(500).json({ msg: 'Something went wrong' })
  }
})

// @route PUT api/questions/:id
// @route Move question from one quiz to another
// @access Private: Accessed by authorization
router.put('/:id', authRole(['Creator', 'Admin', 'SuperAdmin']), questionUpload.single('question_image'), async (req, res) => {

  const { questionText, answerOptions, quiz, oldQuizID, last_updated_by, duration } = req.body
  const qnImage = req.file

  //Find the Question by id
  const question = await Question.findOne({ _id: req.params.id });
  if (!question) throw Error('Failed! question not exists!');

  try {

    // changing question quiz
    if (quiz) {
      const updatedQuestion = await Question.findByIdAndUpdate({ _id: req.params.id }, {
        quiz,
        last_updated_by,
      }, { new: true })

      // Delete Question in old quiz
      await Quiz.updateOne(
        { _id: oldQuizID },
        { $pull: { questions: question._id } }
      )

      // Update the Quiz on Question updating
      await Quiz.updateOne(
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
          Bucket: process.env.S3_BUCKET_QUESTIONS || config.get('S3QuestionsBucket'),
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
      const updatedQuestion = await Question.findByIdAndUpdate({ _id: req.params.id }, {
        questionText,
        question_image: qnImage && qnImage.location,
        answerOptions: answers,
        last_updated_by,
        duration
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
// @route Private: Accessed by AUTHORIZATION
router.delete('/:id', authRole(['Creator', 'Admin', 'SuperAdmin']), async (req, res) => {

  try {
    //Find the Question to delete by id first
    const question = await Question.findById(req.params.id)
    if (!question) throw Error('Question is not found!')

    // Delete existing image
    const params = question.question_image ?
      {
        Bucket: process.env.S3_BUCKET_QUESTIONS || config.get('S3QuestionsBucket'),
        Key: question.question_image.split('/').pop() //if any sub folder-> path/of/the/folder.ext
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
    await Quiz.updateOne(
      { _id: question.quiz },
      { $pull: { questions: question._id } }
    )

    // Delete the question
    const removedQuestion = await question.remove()

    if (!removedQuestion)
      throw Error('Something went wrong while deleting!')

    res.status(200).json({ msg: "Deleted successfully!" })

  } catch (err) {
    res.status(400).json({
      success: false,
      msg: err.message
    })
  }
})

module.exports = router