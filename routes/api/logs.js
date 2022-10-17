const express = require("express")
const router = express.Router()
const { auth, authRole } = require('../../middleware/auth')

// ULog Model
const ULog = require('../../models/ULog')

// @route   GET /api/logs
// @desc    Get all today's logs
// @access  Public
router.get('/', async (req, res) => {

    var now = new Date();
    var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    try {
        const logs = await ULog.find({ loggedInAt: { $gte: startOfToday } })
            .sort({ loggedInAt: -1 })
            .populate('userId', 'name email role -_id')

        if (!logs) throw Error('No logs found!')
        res.status(200).json(logs)
    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET /api/logs/:id
// @desc    Get one uLog
// @access Private: accessed by logged in user
router.get('/:id', async (req, res) => {
    let id = req.params.id
    try {
        //Find the uLog by id
        await ULog.findById(id, (err, uLog) => {
            res.status(200).json(uLog)
        })
    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }
})

// @route PUT api/logs/:id
// @route UPDATE one uLog
// @access Private: Accessed by admin only
router.put('/:id', auth, authRole(['Admin']), async (req, res) => {
    try {
        //Find the uLog by id
        const uLog = await ULog.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(uLog)
    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route DELETE api/logs/:id
// @route delete a uLog
// @route Private: Accessed by admin only
router.delete('/:id', auth, authRole(['Admin']), async (req, res) => {
    try {
        const uLog = await ULog.findById(req.params.id)
        if (!uLog) throw Error('uLog is not found!')
        // Delete uLog
        const removeduLog = await ULog.remove()
        if (!removeduLog)
            throw Error('Something went wrong while deleting!')
        res.status(200).json({ msg: `Deleted!` })
    } catch (err) {
        res.status(400).json({
            msg: err.message
        })
    }
})

module.exports = router