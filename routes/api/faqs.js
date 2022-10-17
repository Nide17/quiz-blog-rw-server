const express = require("express")
const router = express.Router()

// auth middleware to protect routes
const { authRole } = require('../../middleware/auth')
const Faq = require('../../models/Faq')

// @route   GET /api/faqs
// @desc    Get faqs
// @access  Public
router.get('/', async (req, res) => {

    try {
        const faqs = await Faq.find()
            //sort faqs by createdAt
            .sort({ createdAt: -1 })
            .populate('created_by', '_id role name email')

        if (!faqs) throw Error('No faqs found')

        res.status(200).json(faqs)

    } catch (err) {
        res.status(400).json({ msg: err.answer })
    }
})

// @route GET api/faqs/:id
// @route GET one Faq
// @route Private: accessed by logged in user
router.get('/:id', (req, res) => {

    //Find the Faq by id
    Faq.findById(req.params.id)

        //return a promise
        .then(faq => res.json(faq))
        // if id not exist or if error
        .catch(err => res.status(404).json({ success: false }))
})

// @route GET api/faqs/:id
// @route GET one Faq
// @route Private: accessed by logged in user
router.get('/created-by/:id', async (req, res) => {

    let id = req.params.id
    try {
        //Find the faqs by id
        await Faq.find({ created_by: id }, (err, faqs) => {
            res.status(200).json(faqs)
        })

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }
})

// @route POST api/faqs
// @route Create a Faq
// @route Private: accessed by admin
router.post("/", authRole(['Admin']), async (req, res) => {

    const { title, answer, created_by } = req.body

    // Simple validation
    if (!title || !created_by || !answer) {
        return res.status(400).json({ msg: 'Please fill required fields' })
    }

    try {
        const newFaq = new Faq({
            title,
            answer,
            created_by
        })

        const savedFaq = await newFaq.save()
        if (!savedFaq) throw Error('Something went wrong during creation!')

        res.status(200).json({
            _id: savedFaq._id,
            title: savedFaq.title,
            created_by: savedFaq.created_by,
            answer: savedFaq.answer,
            createdAt: savedFaq.createdAt
        })

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route PUT api/faqs/:id
// @route UPDATE one Faq
// @access Private: Accessed by admin only
router.put('/:id', authRole(['Admin']), async (req, res) => {

    try {
        //Find the Faq by id
        const faq = await Faq.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(faq)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route DELETE api/faqs
// @route delete a Faq
// @route Private: Accessed by admin only
router.delete('/:id', authRole(['Admin']), async (req, res) => {

    try {
        const faq = await Faq.findById(req.params.id)
        if (!faq) throw Error('Faq is not found!')

        // Delete Faq
        const removedFaq = await Faq.remove()

        if (!removedFaq)
            throw Error('Something went wrong while deleting!')

        res.status(200).json({ msg: `${removedFaq.title} is Deleted!` })

    } catch (err) {
        res.status(400).json({
            msg: err.message
        })
    }
})


module.exports = router