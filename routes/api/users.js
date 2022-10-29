// CRUD for users
const express = require("express")
const config = require('config')
const router = express.Router()
const AWS = require('aws-sdk')

const s3Config = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || config.get('AWSAccessKeyId'),
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || config.get('AWSSecretKey'),
  Bucket: process.env.S3_BUCKET_PROFILES || config.get('S3ProfilesBucket')
})

// User Model
const User = require('../../models/User')
const { profileUpload } = require('./utils/profileUpload.js')
const { auth, authRole } = require('../../middleware/auth')

// @route   GET api/users
// @desc    Get all users
// @access Private: Accessed by admin only

/*
router.get('/', async (req, res) => {

  // Pagination
  const totalPages = await User.countDocuments({})
  var PAGE_SIZE = 8
  var pageNo = parseInt(req.query.pageNo || "0")
  var query = {}

  query.limit = PAGE_SIZE
  query.skip = PAGE_SIZE * (pageNo - 1)

  try {

    const users = pageNo > 0 ?
      await User.find({}, {}, query)

        //sort users by creation_date
        .sort({ register_date: -1 }) :

      await User.find()

        //sort users by creation_date
        .sort({ register_date: -1 })

    if (!users) throw Error('No users exist')

    res.status(200).json({
      totalPages: Math.ceil(totalPages / PAGE_SIZE),
      users
    })

  } catch (err) {
    res.status(400).json({ msg: err.message })
  }
})

*/

router.get('/', auth, authRole(['Creator', 'Admin']), async (req, res) => {

  try {
    const users = await User.find()
      // Populate only needed fields
      .populate('school level faculty', '_id title years')

      //sort users by creation_date
      .sort({ register_date: -1 })

    if (!users) throw Error('No users exist')

    res.status(200).json(users)

  } catch (err) {
    res.status(400).json({ msg: err.message })
  }
})


// @route   GET /api/users/:id
// @desc    Get one User
// @access  Private: Accessed by admin only
router.get('/:id', auth, authRole(['Admin']), async (req, res) => {

  let id = req.params.id
  try {
    //Find the User by id
    await User.findById(id, (err, user) => {
      res.status(200).json(user)
    })

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    })
  }

})

// @route PUT api/users/:id
// @route UPDATE one User
// @route Private: Accessed by admin only
router.put('/:id', auth, authRole(['Admin']), async (req, res) => {

  try {
    //Find the User by id
    const user = await User.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
    res.status(200).json(user)

  } catch (error) {
    res.status(400).json({
      msg: 'Failed to update! ' + error.message
    })
  }
})


// @route PUT api/users/user-details/:id
// @route UPDATE one User
// @route Private: Accessed by logged in user only
router.put('/user-details/:id', auth, async (req, res) => {

  try {
    //Find the User by id and update
    const user = await User.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
    res.status(200).json(user)

  } catch (error) {
    res.status(400).json({
      msg: 'Failed to update! ' + error.message
    })
  }
})

// @route  PUT /api/users/user-image/:id
// @desc   update image
// @access Private: Accessed by LOGGED IN
router.put('/user-image/:id', auth, profileUpload.single('profile_image'), async (req, res) => {

  if (!req.file) {
    //If the file is not uploaded, then throw custom error with message: FILE_MISSING
    throw Error('FILE_MISSING')
  }

  else {
    //If the file is uploaded
    const img_file = req.file

    try {

      const profile = await User.findOne({ _id: req.params.id })
      if (!profile) throw Error('Failed! profile not exists!')

      // Delete existing image
      const params = {
        Bucket: process.env.S3_BUCKET_PROFILES || config.get('S3ProfilesBucket'),
        Key: profile.image.split('/').pop() //if any sub folder-> path/of/the/folder.ext
      }

      try {
        s3Config.deleteObject(params, (err, data) => {
          if (err) {
            console.log(err, err.stack) // an error occurred
          }
          else {
            console.log(params.Key + ' deleted!')
          }
        })

      }
      catch (err) {
        console.log('ERROR in file Deleting : ' + JSON.stringify(err))
      }

      //Find the user by id
      const updatedUserProfile = await User
        .findByIdAndUpdate({ _id: req.params.id }, { image: img_file.location }, { new: true })

      res.status(200).json(updatedUserProfile)


    } catch (err) {
      res.status(400).json({ msg: err.message })
    }
  }
})


// @route DELETE api/users/:id
// @route delete a User
// @route Private: Accessed by admin only
//:id placeholder, findById = we get it from the parameter in url
router.delete('/:id', auth, authRole(['Admin']), async (req, res) => {

  try {
    const user = await User.findById(req.params.id)
    if (!user) throw Error('User is not found!')

    const removedUser = await user.remove()

    if (!removedUser)
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