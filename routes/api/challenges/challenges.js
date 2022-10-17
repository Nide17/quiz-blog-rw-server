const express = require("express");
const router = express.Router();

// auth middleware to protect routes
const { auth, authRole } = require('../../../middleware/auth');

//Challenge Model : use capital letters since it's a model
const Challenge = require('../../../models/challenges/Challenge');

// @route GET api/challenges
// @route Get All challenges
// @route Private: accessed by logged in user
router.get('/',  async (req, res) => {

  // Pagination
  const totalPages = await Challenge.countDocuments({});
  var PAGE_SIZE = 20
  var pageNo = parseInt(req.query.pageNo || "0")
  var query = {}

  query.limit = PAGE_SIZE
  query.skip = PAGE_SIZE * (pageNo - 1)

  try {

    const challenges = pageNo > 0 ?
      await Challenge.find({}, {}, query)

        //sort challenges by creation_date

        .sort({ challenge_date: -1 })
        .populate('quiz category challenge_taker challenged_by') :

      await Challenge.find()

        //sort challenges by creation_date
        .sort({ challenge_date: -1 })
        .populate('quiz category challenge_taker challenged_by')

    if (!challenges) throw Error('No challenges exist');

    res.status(200).json({
      totalPages: Math.ceil(totalPages / PAGE_SIZE),
      challenges
    });

  } catch (err) {
    res.status(400).json({ msg: err.message })
  }
});


// @route   GET /api/challenges/:id
// @desc    Get one Challenge
// @access  Needs to private
router.get('/:id', auth, async (req, res) => {

  let id = req.params.id;
  try {
    //Find the Challenge by id
    await Challenge.findOne({ id }, (err, challenge) => {
      res.status(200).json(challenge);
    })
      // Use the name of the schema path instead of the collection name
      .populate('quiz category challenge_taker challenged_by')

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    });
  }

});

// @route   GET /api/challenges/challenged-by/:id
// @desc    Get all challenges by taker
// @access  Needs to private
router.get('/challenged-by/:id', auth, async (req, res) => {

  let id = req.params.id;
  try {
    //Find the challenges by id
    await Challenge.find({ challenge_taker: id }, (err, challenges) => {
      res.status(200).json(challenges);
    })
      // Use the name of the schema path instead of the collection name
      .populate('quiz category challenge_taker challenged_by')

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    });
  }

});

// @route POST api/challenges
// @route Create a Challenge
// @route Private: accessed by logged in user

router.post('/', auth, async (req, res) => {

  const { id, challengerReview, challengeeReview, category, quiz, challenge_taker, challenged_by } = req.body;

  // Simple validation
  if (!id || !challengerReview || !challengeeReview || !category || !quiz || !challenge_taker || !challenged_by) {
    return res.status(400).json({ msg: 'There are missing info!' });
  }

  try {
    const challengeExist = await Challenge.findOne({ id });
    if (challengeExist) throw Error('Challenge already exists!');

    const newChallenge = new Challenge({
      id,
      challengerReview,
      challengeeReview,
      category,
      quiz,
      challenge_taker,
      challenged_by
    });

    const savedChallenge = await newChallenge.save();

    if (!savedChallenge) throw Error('Something went wrong during creation!');

    res.status(200).json({
      _id: savedChallenge._id,
      id: savedChallenge.id,
      challengerReview: savedChallenge.challengerReview,
      challengeeReview: savedChallenge.challengeeReview,
      category: savedChallenge.category,
      quiz: savedChallenge.quiz,
      challenge_taker: savedChallenge.challenge_taker,
      challenged_by: savedChallenge.challenged_by
    });

  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// @route DELETE api/challenges
// @route delete a Challenge
// @route Private: Accessed by admin only
router.delete('/:id', auth, authRole(['Admin']), (req, res) => {

  //Find the Challenge to delete by id first
  Challenge.findById(req.params.id)

    //returns promise 
    .then(challenge => Challenge.remove().then(() => res.json({ success: true })))
    // if id not exist or if error
    .catch(err => res.status(404).json({ success: false }));
});

module.exports = router;