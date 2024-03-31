const express = require("express")
const { S3 } = require("@aws-sdk/client-s3")
const config = require('config')
const router = express.Router()

const s3Config = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || config.get('AWSAccessKeyId'),
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || config.get('AWSSecretKey'),
  Bucket: process.env.S3_BUCKET || config.get('S3Bucket'),
  region: process.env.AWS_REGION || config.get('AWS_Region')
})

// User Model
const User = require('../../models/User')
const { profileUpload } = require('./utils/profileUpload.js')
const { auth, authRole } = require('../../middleware/authMiddleware.js')

// @route   GET api/users
// @desc    Get all users
// @access Private: Accessed by ['Creator', 'Admin', 'SuperAdmin']
router.get('/', authRole(['Creator', 'Admin', 'SuperAdmin']), async (req, res) => {

  try {
    const users = await User.find()
      // Populate only needed fields
      .populate('school level faculty', '_id title years')

      //sort users by creation_date
      .sort({ register_date: -1 })

    if (!users) throw Error('No users exist')

    res.status(200).json(users)

  } catch (err) {
    res.status(400).json({ msg: err.message, id: 'USER_ERR' })
  }
})

// @route   GET /api/users/:id
// @desc    Get one User
// @access  Private: Accessed by SuperAdmin only
router.get('/:id', authRole(['SuperAdmin']), async (req, res) => {

  let id = req.params.id
  try {
    //Find the User by id
    const user = User.findById(id)

    if (!user) throw Error('No user found!')

    res.status(200).json(user)

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message, id: 'USER_ERR'
    })
  }

})

// @route PUT api/users/:id
// @route UPDATE one User
// @route Private: Accessed by SuperAdmin only
router.put('/:id', authRole(['SuperAdmin']), async (req, res) => {

  try {
    //Find the User by id
    const user = await User.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
    res.status(200).json(user)

  } catch (error) {
    res.status(400).json({
      msg: 'Failed to update! ' + error.message, id: 'USER_ERR'
    })
  }
})


// @route PUT api/users/user-details/:id
// @route UPDATE one User details
// @route Private: Accessed by logged in user
router.put('/user-details/:id', auth, async (req, res) => {

  try {
    //Find the User by id and update
    const user = await User.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
    res.status(200).json(user)

  } catch (error) {
    res.status(400).json({
      msg: 'Failed to update! ' + error.message, id: 'USER_ERR'
    })
  }
})

// @route  PUT /api/users/user-image/:id
// @desc   update image
// @access Private: Accessed by LOGGED IN users
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
      if (profile && profile.image) {

        const params = {
          Bucket: process.env.S3_BUCKET || config.get('S3Bucket'),
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
      }

      //Find the user by id
      const updatedUserProfile = await User
        .findByIdAndUpdate({ _id: req.params.id }, { image: img_file.location }, { new: true })

      res.status(200).json(updatedUserProfile)


    } catch (err) {
      res.status(400).json({ msg: err.message, id: 'USER_ERR' })
    }
  }
})

// @route DELETE api/users/:id
// @route delete a User
// @route Private: Accessed by SuperAdmin only
//:id placeholder, findById = we get it from the parameter in url
router.delete('/:id', authRole(['SuperAdmin']), async (req, res) => {

  try {
    const user = await User.findById(req.params.id)
    if (!user) throw Error('User is not found!')

    const removedUser = await User.deleteOne({ _id: req.params.id })

    if (!removedUser)
      throw Error('Something went wrong while deleting!')

    res.status(200).json({ msg: "Deleted successfully!" })

  } catch (err) {
    res.status(400).json({
      id: 'USER_ERR',
      msg: err.message
    })
  }
})

module.exports = router