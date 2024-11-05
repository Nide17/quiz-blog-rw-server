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
      .select('-password -__v')
      .populate('school level faculty', '_id title years')

    if (!user) throw Error('User does not exist')
    res.json(user)
  } catch (err) {
    res.status(400).json({ msg: err.message, status: 400 })
  }
})

// @route   POST api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  const emailTest = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please fill all fields', id: 'AUTH_ERR', status: 400 })
  }

  if (!emailTest.test(email)) {
    return res.status(400).json({ msg: 'Please provide a valid email!', id: 'AUTH_ERR', status: 400 })
  }

  try {
    const user = await User.findOne({ email })

    if (user && (user.verified || user.verified === undefined || user.verified === null)) {
      return res.status(400).json({ msg: 'User already exists, login instead!', id: 'AUTH_EXIST', status: 400 })
    }

    // Create salt and hash
    const salt = await bcrypt.genSalt(10)
    if (!salt) throw Error('Something went wrong with bcrypt')

    const hash = await bcrypt.hash(password, salt)
    if (!hash) throw Error('Something went wrong hashing the password')
      
    if (user && user.verified === false) {
      await User.findOneAndUpdate({ email }, { name, password: hash, otp })
      await sendEmail(user.email,
        "One Time Password (OTP) verification for Quiz Blog account",
        { name: user.name, otp }, "./template/otp.handlebars")
      console.log("Existing: ", email, otp)
    } else {
      const newUser = new User({ name, email, password: hash, otp, verified: false })
      const savedUser = await newUser.save()
      if (!savedUser) throw Error('Something went wrong saving the user')

      await sendEmail(savedUser.email,
        "One Time Password (OTP) verification for Quiz Blog account",
        { name: savedUser.name, otp }, "./template/otp.handlebars")
      console.log(email, otp)
    }

    res.status(200).json({ msg: 'Registration successful! Please verify your email to login.', email })

  } catch (err) {
    res.status(400).json({ msg: err.message, status: 400 })
  }
})

// @route   POST api/auth/verify-otp
// @desc    Verify OTP
// @access  Public
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    return res.status(400).json({ msg: "Email and OTP required!", status: 400 })
  }

  try {
    const usr = await User.findOne({ email }).select('-password')

    if (!usr) {
      return res.status(400).json({ msg: "User does not exist", status: 400 })
    }

    if (otp !== usr.otp) {
      return res.status(400).json({ msg: "Invalid OTP.", status: 400 })
    }

    await User.findOneAndUpdate({ email }, { verified: true })

    // Sign and generate token
    const token = jwt.sign({ _id: usr._id, role: usr.role }, process.env.JWT_SECRET || config.get('jwtSecret'), { expiresIn: '2h' })

    // update current token date for this user
    const updatedUser = await User.findByIdAndUpdate(
      { _id: usr._id },
      { $set: { current_token: token } },
      { new: true }
    )

    if (!updatedUser) throw Error('Something went wrong updating current token date')

    return res.status(200).json({
      current_token: updatedUser.current_token,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      },
      msg: "Account verified now!", status: 200
    })

  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error, Try Again!", status: 500 })
  }
})

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password, confirmLogin } = req.body

  // Simple validation
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please fill all fields', id: 'AUTH_ERR', status: 400 })
  }

  try {

    // Check for existing user
    const user = await User.findOne({ email }).populate('school level faculty', '_id title years')
    if (!user) throw Error('User does not exist!')

    // Validate password and email
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw Error('Incorrect E-mail or Password!')

    // Verify if user is verified
    if (user.verified === false) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      await User.findOneAndUpdate({ email }, { otp })
      // await sendEmail(user.email,
      //   "One Time Password (OTP) verification for Quiz Blog account",
      //   { name: user.name, otp }, "./template/otp.handlebars")
      console.log(email, otp)
      return res.status(400).json({ msg: 'Account not verified yet, check your email for OTP!', id: 'OTP_VERIFY' })
    }

    // Check current_token for validity
    jwt.verify(user.current_token, process.env.JWT_SECRET || config.get('jwtSecret'), async (err, decoded) => {

      // WHEN THE CURRENT TOKEN IS INVALID, SIGN IN AGAIN
      if (!user.current_token || err) {
        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET || config.get('jwtSecret'), { expiresIn: '2h' })

        if (!token) throw Error('Could not sign in, try again!')

        // update current token date for this user
        const updatedUser = await User.findByIdAndUpdate({ _id: user._id }, { $set: { current_token: token } }, { new: true })

        if (!updatedUser) throw Error('Something went wrong updating current token date')

        res.status(200).json({
          current_token: token,
          user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
          }
        })
      } else {
        // WHEN THE CURRENT TOKEN IS STILL VALID, CHECK IF USER WANTS TO LOG IN FROM ANOTHER DEVICE
        if (!confirmLogin) {
          return res.status(401).json({
            msg: 'You are already logged in from another device or browser. Do you want to log them out to use here?',
            id: 'CONFIRM_ERR', status: 401
          })
        } else {
          // Sign and generate token
          const token1 = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET || config.get('jwtSecret'), { expiresIn: '2h' })

          if (!token1) throw Error('Could not sign in, try again!')
          // update current token date for this user
          const confirmedUser = await User.findByIdAndUpdate({ _id: user._id }, { $set: { current_token: token1 } }, { new: true })

          if (!confirmedUser) throw Error('Something went wrong updating current token date')
          res.status(200).json({
            current_token: token1,
            user: {
              _id: confirmedUser._id,
              name: confirmedUser.name,
              email: confirmedUser.email,
              role: confirmedUser.role
            },
          })
        }
      }
    })
  } catch (err) {
    res.status(400).json({ msg: err.message, status: 400 })
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

    if (!loggedOutUser) throw Error('Something went wrong updating current token date')

    res.status(200).json({ msg: 'Good Bye!', id: 'LOGOUT_SUCCESS', status: 200 })
  } catch (err) {
    res.status(400).json({ msg: err.message, status: 400 })
  }
})

// @route   POST api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const email = req.body.email

  try {
    const userToReset = await User.findOne({ email })

    if (!userToReset) throw Error('User with that email does not exist!')

    // check if there is an existing token for this user & delete it.
    let token = await PswdResetToken.findOne({ userId: userToReset._id })
    if (token) {
      await token.deleteOne()
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
    ).then(() => {
      res.status(200).json({ msg: 'Reset email sent successfully', status: 200 })
    }).catch((error) => {
      console.error(error)
      res.status(500).json({ msg: 'Failed to send reset link to your email!', status: 500 })
    })
  } catch (err) {
    res.status(400).json({ msg: err.message, status: 400 })
  }
})

// @route   POST api/auth/reset-password
// @desc    Reset password
// @access  Public
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

    res.status(200).json({ msg: "Password reset successful!", status: 200 })
  } catch (err) {
    res.status(400).json({ msg: err.message, status: 400 })
  }
})

module.exports = router