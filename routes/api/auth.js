const express = require("express")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const config = require('config')
const router = express.Router()
const { auth } = require('../../middleware/authMiddleware')
const { sendEmail } = require("./emails/sendEmail")

// User Model
const User = require('../../models/User')
const PswdResetToken = require('../../models/PswdResetToken')


// @route   GET api/auth/user
// @desc    Get user data to keep logged in user token bcz jwt data are stateless - loadUser
// @access  Private: Accessed by any logged in user
router.get('/user', auth, async (req, res) => {

  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('school level faculty', '_id title years')

    if (!user) throw Error('User Does not exist')

    res.json(user)

  } catch (err) {
    res.status(400).json(err.message)
  }
})

// @route   PUT api/auth/logout
// @desc    Logout user
// @access  Private: Accessed by any logged in user
router.put('/logout', auth, async (req, res) => {

  try {
    // set current token date to null
    const loggedOutUser = await User.findByIdAndUpdate(
      { _id: req.body.userId },
      { $set: { current_token: null } },
      { new: true }
    )

    if (!loggedOutUser) throw Error('Something went wrong current token date')

    res.status(200).json({ msg: 'You are logged out!', current_token: loggedOutUser.current_token })
  } catch (err) {
    res.status(400).json(err.message)
  }
})

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {

  const { email, password, confirmLogin } = req.body

  // Simple 
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please fill all fields', id: 'AUTH_ERR', status: 400 })
  }

  try {
    // Check for existing user
    const user = await User.findOne({ email }).populate('school level faculty', '_id title years')

    if (!user) throw Error('User Does not exist!')

    // Validate password and email
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw Error('Incorrect E-mail or Password!')

    // Check current_token for validity
    jwt.verify(user.current_token, process.env.JWT_SECRET || config.get('jwtSecret'), async (err, decoded) => {

      if (err) {
        // Sign and generate token
        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET || config.get('jwtSecret'), { expiresIn: '2h' })

        if (!token) throw Error('Could not sign in, try again!')

        // update current token date for this user
        const updatedUser = await User.findByIdAndUpdate(
          { _id: user._id },
          { $set: { current_token: token } },
          { new: true }
        )

        if (!updatedUser) throw Error('Something went wrong current token date')

        res.status(200).json({
          current_token: updatedUser.current_token,
          user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
          }
        })
      }
      else {
        if (!confirmLogin) {
          return res.status(401).json({
            msg: 'You are already logged in from other device or browser.\n do you want to log them out to use here?',
            id: 'CONFIRM_ERR', status: 401
          })
        }
        else {

          // Sign and generate token
          const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET || config.get('jwtSecret'), { expiresIn: '2h' })

          if (!token) throw Error('Could not sign in, try again!')
          // update current token date for this user
          const updatedUser = await User.findByIdAndUpdate({ _id: user._id }, { $set: { current_token: token } }, { new: true })

          if (!updatedUser) throw Error('Something went wrong current token date')
          res.status(200).json({
            current_token: updatedUser.current_token,
            user: {
              _id: updatedUser._id,
              name: updatedUser.name,
              email: updatedUser.email,
              role: updatedUser.role
            },
          })
        }
      }
    })
  } catch (err) {
    res.status(400).json(err.message)
  }
})



// @route   POST api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  const emailTest = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i

  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please fill all fields', id: 'AUTH_ERR', status: 400 })
  }

  else if (!emailTest.test(email)) {
    return res.status(400).json({ msg: 'Please provide a valid email!', id: 'AUTH_ERR', status: 400 })
  }

  try {
    const user = await User.findOne({ email })
    if (user) throw Error('User already exists')

    // Create salt and hash
    const salt = await bcrypt.genSalt(10)
    if (!salt) throw Error('Something went wrong with bcrypt')

    const hash = await bcrypt.hash(password, salt)
    if (!hash) throw Error('Something went wrong hashing the password')

    const newUser = new User({
      name,
      email,
      password: hash
    })

    const savedUser = await newUser.save()
    if (!savedUser) throw Error('Something went wrong saving the user')

    sendEmail(
      savedUser.email,
      "Welcome to Quiz-Blog, your account is created!",
      {
        name: savedUser.name,
      },
      "./template/welcome.handlebars")
    console.log('savedUser', savedUser)

    // Sign and generate token
    const token = jwt.sign({ _id: savedUser._id, role: savedUser.role }, process.env.JWT_SECRET || config.get('jwtSecret'), { expiresIn: '2h' })

    // update current token date for this user
    const updatedUser = await User.findByIdAndUpdate(
      { _id: savedUser._id },
      { $set: { current_token: token } },
      { new: true }
    )

    if (!updatedUser) throw Error('Something went wrong current token date')

    res.status(200).json({
      current_token: updatedUser.current_token,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    })
  } catch (err) {
    res.status(400).json(err.message)
  }
})

// @route  POST api/auth/forgot-password
// @desc    
// @access  
router.post('/forgot-password', async (req, res) => {

  const email = req.body.email

  try {
    const userToReset = await User.findOne({ email })

    if (!userToReset) throw Error('User with that email does not exist!')

    res.json(userToReset)

    // check if there is an existing token for this user & delete it.
    let tokn = await PswdResetToken.findOne({ userId: userToReset._id })
    if (tokn) {
      await tokn.deleteOne()
    }

    // create a new random token for resetting password
    let resetToken = crypto.randomBytes(32).toString("hex")

    // Create salt and hash
    const salt = await bcrypt.genSalt(10)
    if (!salt) throw Error('Something went wrong with bcrypt')

    const hash = await bcrypt.hash(resetToken, salt)

    await new PswdResetToken({
      userId: userToReset._id,
      token: hash,
      createdAt: Date.now(),
    }).save()

    // const clientURL = process.env.NODE_ENV === 'production' ?
    //   'https://quizblog.rw' : 'http://localhost:3000'
    const clientURL = req.headers.origin
    const link = `${clientURL}/reset-password?token=${resetToken}&id=${userToReset._id}`

    sendEmail(
      userToReset.email,
      "Password reset for your Quiz-Blog account!",
      {
        name: userToReset.name,
        link: link,
      },
      "./template/requestResetPassword.handlebars"
    )

    return link

  } catch (err) {
    res.status(400).json(err.message)
  }
})

// @route   POST api/auth/reset-password
// @desc    
// @access  
router.post('/reset-password', async (req, res) => {

  try {

    const { userId, token, password } = req.body

    let passwordResetToken = await PswdResetToken.findOne({ userId })

    if (!passwordResetToken) {
      throw Error("Invalid or expired link, try resetting again!")
    }

    const isValid = await bcrypt.compare(token, passwordResetToken.token)

    if (!isValid) {
      throw Error("Invalid link, try resetting again!")
    }

    // Create salt and hash
    const salt = await bcrypt.genSalt(10)
    if (!salt) throw Error('Something went wrong with bcrypt')

    const hash = await bcrypt.hash(password, salt)

    // process sent new data
    await User.updateOne(
      { _id: userId },
      { $set: { password: hash } },
      { new: true }
    )

    const resetUser = await User.findById({ _id: userId })

    sendEmail(
      resetUser.email,
      "Password reset for your Quiz-Blog account is successful!",
      {
        name: resetUser.name,
      },
      "./template/resetPassword.handlebars")

    // delete the token
    await passwordResetToken.deleteOne()

    res.json("Password reset successful!")
  }
  catch (err) {
    res.status(400).json(err.message)
  }
})

module.exports = router