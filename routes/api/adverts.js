const express = require('express')
const router = express.Router()

// auth middleware to protect routes
const { authRole } = require('../../middleware/authMiddleware.js')
const { advertUpload } = require('./utils/advertUpload.js')
const Advert = require('../../models/Advert')

// @route   GET /api/adverts
// @desc    Get adverts
// @access  Public
router.get('/', async (req, res) => {
    try {
        const adverts = await Advert.find().sort({ createdAt: -1 })
        if (!adverts) throw Error('No adverts found')
        res.status(200).json(adverts)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET /api/adverts/active
// @desc    Get active adverts
// @access  Public
router.get('/active', async (req, res) => {
    try {
        const activeAdverts = await Advert
            .find({ status: "Active" })
            .sort({ createdAt: -1 })

        if (!activeAdverts) throw Error('No active adverts found')
        res.status(200).json(activeAdverts)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route GET api/adverts/:id
// @route GET one Advert
// @route Public
router.get('/:id', (req, res) => {

    //Find the Advert by id
    Advert.findById(req.params.id)

        //return a promise
        .then(advert => res.json(advert))
        // if id not exist or if error
        .catch(err => res.status(404).json({ success: false }))
})

// @route GET api/adverts/:id
// @route GET one advert
// @route Public
router.get('/created-by/:id', async (req, res) => {
    let id = req.params.id
    try {
        //Find the adverts by id
        await Advert.find({ owner: id }, (err, adverts) => {
            res.status(200).json(adverts)
        })

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }
})

// @route POST api/adverts
// @route Create an advert
// @route Private: accessed by authorized user
router.post('/', authRole(['Admin', 'SuperAdmin']), advertUpload.single('advert_image'), async (req, res) => {

    const { caption, phone, owner, email, link } = req.body

    // Simple validation
    if (!caption || !owner || !email || !phone) {
        return res.status(400).json({ msg: 'Please fill required fields' })
    }

    if (!req.file) {
        //If the file is not uploaded, then throw custom error with message: FILE_MISSING
        throw Error('FILE_MISSING')
    }

    else {

        //If the file is uploaded
        const ad_file = req.file

        try {
            const newAdvert = new Advert({
                caption,
                phone,
                owner,
                email,
                link,
                // advert_image: ad_file.location
                // IF WORKING LOCALLY
                advert_image: ad_file.location ? ad_file.location : ad_file.path
            })

            const savedAdvert = await newAdvert.save()
            if (!savedAdvert) throw Error('Something went wrong during creation!')

            res.status(200).json({
                _id: savedAdvert._id,
                caption: savedAdvert.caption,
                owner: savedAdvert.owner,
                phone: savedAdvert.phone,
                email: savedAdvert.email,
                link: savedAdvert.link,
                advert_image: savedAdvert.advert_image,
                createdAt: savedAdvert.createdAt
            })

        } catch (err) {
            console.error(err.message);
            res.status(400).json({ msg: err.message })
        }
    }
})

// @route PUT api/adverts/:id
// @route UPDATE one advert
// @access Private: Accessed by authorized user
router.put('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        //Find the advert by id
        const advert = await Advert.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(advert)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route PUT api/adverts/status/:id
// @route UPDATE by activating and deactivating advert
// @access Private: Accessed by authorized user
router.put('/status/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        //Find the advert by id
        const advert = await Advert.findByIdAndUpdate({ _id: req.params.id },
            { $set: { status: req.body.status } },
            { new: true })
        res.status(200).json(advert)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })

    }
})

// @route PUT api/adverts/add-video/:id
// @route UPDATE one video
// @access Private: Accessed by admin authorization
router.put('/add-video/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const advert = await Advert.updateOne(
            { '_id': req.params.id },
            { $push: { 'video_links': req.body } },
            { new: true }
        )
        res.status(200).json(advert)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route DELETE api/adverts/delete-video/:id
// @route DELETE one video
// @access Private: Accessed by authorization
router.put('/delete-video/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const quiz = await Advert.updateOne(
            { '_id': req.body.fID },
            { $pull: { 'video_links': { _id: req.body.vId } } }
        )
        res.status(200).json(quiz)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route DELETE api/adverts
// @route delete a advert
// @route Private: Accessed by admin authorization
router.delete('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const advert = await Advert.findById(req.params.id)
        if (!advert) throw Error('advert is not found!')

        // Delete Advert
        const removedAdvert = await Advert.deleteOne({ _id: req.params.id })

        if (!removedAdvert)
            throw Error('Something went wrong while deleting!')

        res.status(200).json({ msg: `${removedAdvert.caption} is Deleted!` })

    } catch (err) {
        res.status(400).json({
            msg: err.message
        })
    }
})


module.exports = router