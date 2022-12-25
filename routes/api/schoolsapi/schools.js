const express = require("express");
const router = express.Router();
const { auth, authRole } = require('../../../middleware/auth');

// School Model
const School = require('../../../models/School');
const Level = require('../../../models/Level');
const Faculty = require('../../../models/Faculty');

// @route   GET /api/schoolsapi/schools
// @desc    Get schools
// @access  Public
router.get('/', async (req, res) => {

    try {
        const schools = await School.find()
            //sort schools by createdAt
            .sort({ createdAt: -1 })

        if (!schools) throw Error('No schools found!');

        res.status(200).json(schools);

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
});

// @route   GET /api/schoolsapi/schools/:id
// @desc    Get one school
// @access Public
router.get('/:id', async (req, res) => {

    let id = req.params.id;
    try {
        //Find the school by id
        await School.findById(id, (err, school) => {
            res.status(200).json(school);
        })

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        });
    }
});

// @route   POST /api/schoolsapi/schools
// @desc    Create a school school
// @access  Private: Accessed by admins
router.post('/', authRole(['Admin', 'SuperAdmin']), async (req, res) => {
    const { title, location, website } = req.body;

    // Simple validation
    if (!title || !location || !website) {
        return res.status(400).json({ msg: 'Please fill all fields' });
    }

    try {
        const school = await School.findOne({ title });
        if (school) throw Error('School already exists!');

        const newSchool = new School({
            title,
            location,
            website
        });

        const savedSchool = await newSchool.save();
        if (!savedSchool) throw Error('Something went wrong during creation!');

        res.status(200).json({
            _id: savedSchool._id,
            title: savedSchool.title,
            location: savedSchool.location,
            createdAt: savedSchool.createdAt,
            website: savedSchool.website
        });

    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// @route PUT api/schools/:id
// @route UPDATE one School
// @access Private: Accessed by admins only
router.put('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        //Find the School by id
        const school = await School.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(school);

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        });
    }
});

// @route DELETE api/schools/:id
// @route delete a school
// @route Private: Accessed by admins only
//:id placeholder, findById = we get it from the parameter in url
router.delete('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const schoolToDelete = await School.findById(req.params.id);
        if (!schoolToDelete) throw Error('School is not found!')

        // Delete levels belonging to this School
        await Level.remove({ school: schoolToDelete._id });

        // Delete faculties belonging to this School
        await Faculty.remove({ school: schoolToDelete._id });

        // Delete this school
        const removedSchool = await schoolToDelete.remove();

        if (!removedSchool)
            throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: `${removedSchool.title} is Deleted!` })

    } catch (err) {
        res.status(400).json({
            msg: err.message
        });
    }
});

module.exports = router;