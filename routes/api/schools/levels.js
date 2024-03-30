const express = require("express");
const router = express.Router();
const { auth, authRole } = require('../../../middleware/authMiddleware');

// Level Model
const Level = require('../../../models/Level');
const Faculty = require('../../../models/Faculty');

// @route   GET /api/schoolsapi/levels
// @desc    Get levels
// @access  Public
router.get('/', async (req, res) => {

    try {
        const levels = await Level.find()
            //sort levels by createdAt
            .sort({ createdAt: -1 })

        if (!levels) throw Error('No levels found!');

        res.status(200).json(levels);

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
});

// @route   GET /api/schoolsapi/levels/:id
// @desc    Get one Level
// @access  Public
router.get('/:id', async (req, res) => {

    let id = req.params.id;
    try {
        //Find the Level by id
        const level = await Level.findById(id);

        if (!level) throw Error('No level found!');

        res.status(200).json(level);

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        });
    }
});

// @route   GET /api/schoolsapi/levels/school/:id
// @desc    Get all levels by school id
// @access  Public
router.get('/school/:id', async (req, res) => {

    let id = req.params.id;
    try {
        //Find the levels by id
        const levels = await Level.find({ school: id })

        if (!levels) throw Error('No levels found!');

        res.status(200).json(levels);

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        });
    }

});

// @route   POST /api/schoolsapi/levels
// @desc    Create a level
// @access  Private
router.post('/', authRole(['Admin', 'SuperAdmin']), async (req, res) => {
    const { title, school } = req.body;

    // Simple validation
    if (!title || !school) {
        return res.status(400).json({ msg: 'Please fill all fields' });
    }

    try {
        const level = await Level.findOne({ title, school });
        if (level) throw Error('This level already exists in this school!');
        const newLevel = new Level({
            title,
            school
        });

        const savedLevel = await newLevel.save();
        if (!savedLevel) throw Error('Something went wrong during creation!');

        res.status(200).json({
            _id: savedLevel._id,
            title: savedLevel.title,
            school: savedLevel.school,
            createdAt: savedLevel.createdAt,
        });

    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// @route PUT api/levels/:id
// @route UPDATE one Level
// @access Private: Accessed by admins
router.put('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        //Find the Level by id
        const level = await Level.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(level);

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        });
    }
});

// @route DELETE api/levels/:id
// @route delete a level
// @route Private: Accessed by admin only
//:id placeholder, findById = we get it from the parameter in url
router.delete('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const level = await Level.findById(req.params.id);
        if (!level) throw Error('Level is not found!')

        // Delete faculties belonging to this level
        const remFaculty = await Faculty.deleteMany({ level: req.params.id });

        if (!remFaculty)
            throw Error('Something went wrong while deleting!');

        // Delete level
        const removedLevel = await Level.deleteOne({ _id: req.params.id });

        if (!removedLevel)
            throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: `${removedLevel.title} is Deleted!` })

    } catch (err) {
        res.status(400).json({
            msg: err.message
        });
    }
});

module.exports = router;