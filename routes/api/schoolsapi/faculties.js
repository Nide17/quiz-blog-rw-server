const express = require("express")
const router = express.Router()
const { auth, authRole } = require('../../../middleware/auth')

// Faculty Model
const Faculty = require('../../../models/Faculty')

// @route   GET /api/schoolsapi/faculties
// @desc    Get faculties
// @access  Public
router.get('/', async (req, res) => {

    try {
        const faculties = await Faculty.find()
            //sort faculties by createdAt
            .sort({ createdAt: -1 })

        if (!faculties) throw Error('No faculties found!')

        res.status(200).json(faculties)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET /api/schoolsapi/faculties/:id
// @desc    Get one faculty
// @access Private: accessed by logged in user
router.get('/:id', async (req, res) => {

    let id = req.params.id
    try {
        //Find the faculty by id
const faculty = await Faculty.findById(id)

        if (!faculty) throw Error('No faculty found!')

        res.status(200).json(faculty)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }
})

// @route   GET /api/schoolsapi/faculties/level/:id
// @desc    Get all faculties by level id
// @access  Needs to private
router.get('/level/:id', async (req, res) => {

    let id = req.params.id
    try {
        //Find the faculties by id
        const faculties = await Faculty.find({ level: id })

        if (!faculties) throw Error('No faculties found!')

        res.status(200).json(faculties)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }

})

// @route   POST /api/schoolsapi/faculties
// @desc    Create a faculty
// @access Private: Accessed by admins only
router.post('/', authRole(['Admin', 'SuperAdmin']), async (req, res) => {
    const { title, school, level, years } = req.body

    // Simple validation
    if (!title || !school || !level || !years) {
        return res.status(400).json({ msg: 'Please fill all fields' })
    }

    try {
        const faculty = await Faculty.findOne({ title, school, level })
        if (faculty) throw Error('Faculty already exists in this school level!')

        const newFaculty = new Faculty({
            title,
            school,
            level,
            years
        })

        const savedFaculty = await newFaculty.save()
        if (!savedFaculty) throw Error('Something went wrong during creation!')

        res.status(200).json({
            _id: savedFaculty._id,
            title: savedFaculty.title,
            school: savedFaculty.school,
            level: savedFaculty.level,
            years: savedFaculty.level,
            createdAt: savedFaculty.createdAt
        })

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route PUT api/faculties/:id
// @route UPDATE one Faculty
// @access Private: Accessed by admins only
router.put('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        //Find the Faculty by id
        const faculty = await Faculty.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(faculty)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to update! ' + err.message
        })
    }
})

// @route DELETE api/faculties/:id
// @route delete a Faculty
// @route Private: Accessed by admins only
//:id placeholder, findById = we get it from the parameter in url
router.delete('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const faculty = await Faculty.findById(req.params.id)
        if (!faculty) throw Error('Faculty is not found!')

        // Delete faculty
        const removedFaculty = await faculty.remove()

        if (!removedFaculty)
            throw Error('Something went wrong while deleting!')

        res.status(200).json({ msg: `${removedFaculty.title} is Deleted!` })

    } catch (err) {
        res.status(400).json({
            msg: err.message
        })
    }
})


module.exports = router