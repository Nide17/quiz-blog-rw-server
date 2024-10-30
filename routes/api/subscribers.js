const express = require("express")
const router = express.Router()
const { auth, authRole } = require('../../middleware/authMiddleware')
const { sendEmail } = require("./emails/sendEmail")

// SubscribedUser Model
const SubscribedUser = require('../../models/SubscribedUser')

// @route   GET /api/subscribers
// @desc    Get subscribers
// @access  Private: Accessed by admins only
router.get('/', authRole(['Creator', 'Admin', 'SuperAdmin']), async (req, res) => {

  try {
    const subscribers = await SubscribedUser.find()
    if (!subscribers) {
      res.status(400).json({ msg: 'No subscribers found!' })
    }

    res.status(200).json(subscribers)
  } catch (err) {
    res.status(400).json({ msg: err.message, id: 'SUBSCRIBE_ERR' })
  }
})

// @route   POST /api/subscribers
// @desc    Subscribe to our posts
// @access  Public
router.post('/', async (req, res) => {
  const { name, email } = req.body

  // Simple validation
  if (!name || !email) {
    return res.status(400).json({ msg: 'Please fill all fields' })
  }

  try {
    const subscriber = await SubscribedUser.findOne({ email })
    if (subscriber) {
      return res.status(400).json({ msg: 'You are already subscribed!' })
    }

    const newSubscriber = new SubscribedUser({ name, email })

    const savedSubscriber = await newSubscriber.save()
    if (!savedSubscriber) {
      return res.status(400).json({ msg: 'Failed to subscribe!' })
    }

    // Sending e-mail to subscribed user
    const clientURL = process.env.NODE_ENV === 'production' ?
      'https://quizblog.rw' : 'http://localhost:5173'

    sendEmail(
      savedSubscriber.email,
      "Thank you for subscribing to Quiz-Blog!",
      {
        name: savedSubscriber.name,
        unsubscribeLink: `${clientURL}/unsubscribe`
      },
      "./template/subscribe.handlebars")

    res.status(200).json(savedSubscriber)

  } catch (err) {
    res.status(400).json({ msg: err.message, status: 400, id: 'SUBSCRIBE_ERR' })
  }
})

// @route GET api/subscribers/:id
// @route GET one Subscriber
// @route Private: Accessed by admins only
router.get('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {
  try {
    //Find the subscriber by id
    const subscriber = await SubscribedUser.findById(req.params.id)
    if (!subscriber) {
      res.status(400).json({ msg: 'No subscriber found!' })
    }

  } catch (err) {
    res.status(400).json({ msg: 'Failed to retrieve! ' + err.message, id: 'SUBSCRIBE_ERR' })
  }
})

// @route DELETE api/subscribers
// @route delete a subscriber
// @route Private: Accessed by authenticated people only
//:id placeholder, findId=we get it from the parameter in url
router.delete('/:id', auth, async (req, res) => {

  try {
    //Find the subscriber to delete by id first
    const subscriber = await SubscribedUser.findOne({ _id: req.params.id })
    if (!subscriber) {
      res.status(400).json({ msg: 'No subscriber found!' })
    }

    const removedSubscriber = await SubscribedUser.deleteOne({ _id: req.params.id })

    if (!removedSubscriber) {
      res.status(400).json({ msg: 'Failed to delete!' })
    }

    res.status(200).json({ msg: `Deleted!` })

  } catch (err) {
    res.status(400).json({
      id: 'SUBSCRIBE_ERR',
      msg: err.message
    })
  }
})

module.exports = router