const express = require("express");
const config = require('config')
const router = express.Router();
const { auth, authRole } = require('../../middleware/auth');
const sendEmail = require("./emails/sendEmail");

// SubscribedUser Model
const SubscribedUser = require('../../models/SubscribedUser');

// @route   GET /api/subscribers
// @desc    Get subscribers
// @access  Private: Accessed by admins only
router.get('/', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

  try {
    const subscribers = await SubscribedUser.find()
      //sort subscribers by subscription_date
      .sort({ subscription_date: -1 })

    if (!subscribers) throw Error('No subscribers found');

    res.status(200).json(subscribers);
  } catch (err) {
    res.status(400).json({ msg: err.message })
  }
});

// @route   POST /api/subscribers
// @desc    Subscribe to our newsletter
// @access  Public
router.post('/', async (req, res) => {
  const { name, email } = req.body;

  // Simple validation
  if (!name || !email) {
    return res.status(400).json({ msg: 'Please fill all fields' });
  }

  try {
    const subscriber = await SubscribedUser.findOne({ email });
    if (subscriber) throw Error('You had already subscribed!');

    const newSubscriber = new SubscribedUser({
      name,
      email
    });

    const savedSubscriber = await newSubscriber.save();
    if (!savedSubscriber) throw Error('Something went wrong while subscribing!');

    // Sending e-mail to subscribed user
    const clientURL = process.env.NODE_ENV === 'production' ?
      'https://www.quizblog.rw' : 'http://localhost:3000'

    sendEmail(
      savedSubscriber.email,
      "Thank you for subscribing to Quiz Blog!",
      {
        name: savedSubscriber.name,
        unsubscribeLink: `${clientURL}/unsubscribe`
      },
      "./template/subscribe.handlebars");

    res.status(200).json({
      subscriber: {
        _id: savedSubscriber._id,
        name: savedSubscriber.name,
        email: savedSubscriber.email
      }
    });

  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// @route GET api/subscribers/:id
// @route GET one Subscriber
// @route Private: Accessed by admins only
router.get('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {
  try {
    //Find the subscriber by id
    const subscriber = await SubscribedUser.findById(req.params.id);
    if (!subscriber) throw Error('subscriber is not found!')

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    });
  }

});

// @route DELETE api/subscribers
// @route delete a subscriber
// @route Private: Accessed by authenticated people only
//:id placeholder, findId=we get it from the parameter in url
router.delete('/:uemail', auth, async (req, res) => {

  try {
    //Find the subscriber to delete by id first
    const subscriber = await SubscribedUser.findOne({ email: req.params.uemail });
    if (!subscriber) throw Error('subscriber is not found!')

    const removedSubscriber = await subscriber.remove();

    if (!removedSubscriber)
      throw Error('Something went wrong while unsubscribing!');

    res.status(200).json({ msg: `Deleted!` })

  } catch (err) {
    res.status(400).json({
      success: false,
      msg: err.message
    });
  }
});

module.exports = router;