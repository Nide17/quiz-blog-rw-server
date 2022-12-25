const express = require("express")
const router = express.Router()
const sendEmail = require("./emails/sendEmail")

// auth middleware to protect routes
const { authRole } = require('../../middleware/auth')

const User = require('../../models/User')
const Broadcast = require('../../models/Broadcast')
const SubscribedUser = require('../../models/SubscribedUser')

// @route   GET /api/broadcasts
// @desc    Get broadcasts
// @access  Private: accessed by ['Admin', 'SuperAdmin']
router.get('/', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const broadcasts = await Broadcast.find()
            //sort broadcasts by createdAt
            .sort({ createdAt: -1 })
            .populate('sent_by')

        if (!broadcasts) throw Error('No broadcasts found')

        res.status(200).json(broadcasts)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route GET api/broadcasts/:id
// @route GET one Broadcast
// @route Private: accessed by ['Admin', 'SuperAdmin']
router.get('/:id', authRole(['Admin', 'SuperAdmin']), (req, res) => {

    //Find the Broadcast by id
    Broadcast.findById(req.params.id)

        //return a promise
        .then(broadcast => res.json(broadcast))
        // if id not exist or if error
        .catch(err => res.status(404).json({ success: false }))
})

// @route POST api/broadcasts
// @route Create a Broadcast
// @route Private: accessed by ['Admin', 'SuperAdmin']
router.post("/", authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    const { title, sent_by, message } = req.body

    // Simple validation
    if (!title || !sent_by || !message) {
        return res.status(400).json({ msg: 'Please fill required fields' })
    }

    // Send email to subscribers of Category on Quiz creation
    const subscribers = await SubscribedUser.find()
    const allUsers = await User.find()
    const clientURL = process.env.NODE_ENV === 'production' ?
        'https://www.quizblog.rw' : 'http://localhost:3000'

    try {
        const newBroadcast = new Broadcast({
            title,
            sent_by,
            message
        })

        const savedBroadcast = await newBroadcast.save()
        if (!savedBroadcast) throw Error('Something went wrong during creation!')


        // Sending a Broadcast
        subscribers.forEach((sub, index) => {

            // Send mail every 2 secs to avoid spamming
            setTimeout(() => {
                sendEmail(
                    sub.email,
                    req.body.title,
                    {
                        name: sub.name,
                        message: req.body.message,
                        unsubscribeLink: `${clientURL}/unsubscribe`
                    },
                    "./template/broadcast.handlebars")

            }, 2000 * index)
        })

        allUsers.forEach((usr, index) => {

            // Send mail every 2 secs to avoid spamming
            setTimeout(() => {
                sendEmail(
                    usr.email,
                    req.body.title,
                    {
                        name: usr.name,
                        message: req.body.message,
                        unsubscribeLink: `${clientURL}/unsubscribe`
                    },
                    "./template/broadcast.handlebars")
            }, 2000 * index)

        })

        res.status(200).json({
            _id: savedBroadcast._id,
            title: savedBroadcast.title,
            sent_by: savedBroadcast.sent_by,
            message: savedBroadcast.message,
            createdAt: savedBroadcast.createdAt
        })

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route DELETE api/broadcasts
// @route delete a Broadcast
// @route Private: Accessed by admin, , 'SuperAdmin' only
router.delete('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {
    try {
        const broadcast = await Broadcast.findById(req.params.id)
        if (!broadcast) throw Error('Broadcast is not found!')

        // Delete broadcast
        const removedBroadcast = await broadcast.remove()

        if (!removedBroadcast)
            throw Error('Something went wrong while deleting!')

        res.status(200).json({ msg: `${removedBroadcast.title} is Deleted!` })

    } catch (err) {
        res.status(400).json({
            msg: err.message
        })
    }
})


module.exports = router