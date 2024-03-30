const express = require('express')
const { S3 } = require("@aws-sdk/client-s3")
const router = express.Router()
const config = require('config')
const { notesUpload } = require('./utils/notesUpload.js')

const s3Config = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || config.get('AWSAccessKeyId'),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || config.get('AWSSecretKey'),
    Bucket: process.env.S3_BUCKET_NOTES || config.get('S3NotesBucket')
})

// Notes Model
const Notes = require('../../models/Notes')
const Download = require('../../models/Download')
const { auth, authRole } = require('../../middleware/authMiddleware.js')

// @route   GET /api/notes
// @desc    Get notes
// @access  Public
router.get('/', async (req, res) => {

    try {
        const notes = await Notes.find()
            //sort notes by createdAt
            .sort({ createdAt: 1 })
            .populate('quizzes')

        if (!notes) throw Error('No notes found!')

        res.status(200).json(notes)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET /api/notes/landingDisplay
// @desc    Get notes
// @access  Public
router.get('/landingDisplay', async (req, res) => {

    const limit = parseInt(req.query.limit)
    var query = {}

    query.limit = limit

    try {
        const notes = await Notes.find({}, {}, query)
            //sort notes by createdAt
            .sort({ createdAt: -1 })
            .populate('courseCategory course chapter')

        if (!notes) throw Error('No notes found!')

        res.status(200).json(notes)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET /api/notes/ccatg/:id
// @desc    Get all notes by ccatg id
// @access  Public
router.get('/ccatg/:id', async (req, res) => {
    let id = req.params.id;
    try {
        const notes = await Notes.find({ courseCategory: id }).populate('courseCategory');
        if (!notes) throw Error('No notes found!');
        res.status(200).json(notes);
    } catch (err) {
        res.status(400).json({ msg: 'Failed to retrieve! ' + err.message });
    }
});

// @route   GET /api/notes/chapter/:id
// @desc    Get all notes by chapter id
// @access  Private
router.get('/chapter/:id', auth, async (req, res) => {

    let id = req.params.id
    try {
        //Find the notes by id
        const notes = await Notes.find({ chapter: id }).populate('chapter')

        if (!notes) throw Error('No notes found!')

        res.status(200).json(notes)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }
})

// @route   GET /api/notes/:id
// @desc    Get one note
// @access  Public
router.get('/:noteSlug', async (req, res) => {

    let slg = req.params.noteSlug
    try {
        //Find the note by slg
        const note = await Notes.findOne({ slug: slg }).populate('courseCategory course chapter')
        if (!note) throw Error('Notes Does not exist!')
        res.status(200).json(note)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }
})

// @route   POST /api/notes
// @desc    Create a note
// @access Private: Accessed by authorization
router.post('/', authRole(['Creator', 'Admin', 'SuperAdmin']), notesUpload.single('notes_file'), async (req, res) => {

    const { title, description, courseCategory, course, chapter, created_by } = req.body

    // Simple validation
    if (!title || !description || !courseCategory || !course) {
        return res.status(400).json({ msg: 'Please fill all fields' })
    }

    if (!req.file) {
        //If the file is not uploaded, then throw custom error with message: FILE_MISSING
        throw Error('FILE_MISSING')
    }

    else {
        //If the file is uploaded
        const nt_file = req.file

        try {

            const note = await Notes.findOne({ title })
            if (note) throw Error('Failed! notes already exists!')

            const newNotes = new Notes({
                title,
                description,
                notes_file: nt_file.location,
                courseCategory,
                course,
                chapter,
                created_by
            })

            const savedNotes = await newNotes.save()
            if (!savedNotes) throw Error('Something went wrong during creation!')

            res.status(200).json({
                _id: savedNotes._id,
                title: savedNotes.title,
                notes_file: savedNotes.notes_file,
                description: savedNotes.description,
                courseCategory: savedNotes.courseCategory,
                course: savedNotes.course,
                chapter: savedNotes.chapter,
                created_by: savedNotes.created_by,
                createdAt: savedNotes.createdAt,
                slug: savedNotes.slug
            })

        } catch (err) {
            res.status(400).json({ msg: err.message })
        }
    }
})

// @route  PUT /api/notes/:id
// @desc   update notes
// @access Private: Accessed by authorization
router.put('/:id', authRole(['Creator', 'Admin', 'SuperAdmin']), notesUpload.single('notes_file'), async (req, res) => {

    const { title, description } = req.body

    if (req.file) {
        //If the file is uploaded
        const not_file = req.file

        try {

            const note = await Notes.findOne({ _id: req.params.id })
            if (!note) throw Error('Failed! note not exists!')

            // Delete existing notes
            const params = {
                Bucket: process.env.S3_BUCKET_NOTES || config.get('S3NotesBucket'),
                Key: note.notes_file.split('/').pop() //if any sub folder-> path/of/the/folder.ext
            }

            try {
                s3Config.deleteObject(params, (err, data) => {
                    if (err) {
                        console.log(err, err.stack) // an error occurred
                    }
                    else {
                        console.log(params.Key + ' notes deleted!')
                    }
                })

            }
            catch (err) {
                console.log('ERROR in notes deleting : ' + JSON.stringify(err))
            }

            //Find the notes by id
            const updatedNotes = await Notes
                .findByIdAndUpdate({ _id: req.params.id },
                    {
                        title,
                        description,
                        notes_file: not_file.location
                    },
                    { new: true })

            res.status(200).json(updatedNotes)


        } catch (err) {
            res.status(400).json({ msg: err.message })
        }
    }

    // If the file is not provided
    else {
        try {
            //Find the notes by id
            const notes = await Notes.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
            res.status(200).json(notes)

        } catch (err) {
            res.status(400).json({
                msg: 'Failed to update! ' + err.message
            })
        }
    }
})

// @route PUT api/notes/notes-quizzes/:id
// @route UPDATE one notes
// @route Private: Accessed by logged in users only
router.put('/notes-quizzes/:id', auth, async (req, res) => {
    try {
        const notes = await Notes.updateOne(
            { "_id": req.params.id },
            { $push: { "quizzes": req.body.quizesState } },
            { new: true }
        )
        res.status(200).json(notes)

    } catch (error) {
        res.status(400).json({
            msg: 'Failed to update! ' + error.message
        })
    }
})

// @route DELETE api/notes/:id
// @route delete a notes
// @route Private: Accessed by authorization
//:id placeholder, findById = we get it from the parameter in url
router.delete('/:id', authRole(['Creator', 'Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const notes = await Notes.findById(req.params.id)
        if (!notes) throw Error('Notes not found!')

        const params = {
            Bucket: process.env.S3_BUCKET_NOTES || config.get('S3NotesBucket'),
            Key: notes.notes_file.split('/').pop() //if any sub folder-> path/of/the/folder.ext
        }

        try {
            await s3Config.deleteObject(params, (err, data) => {
                if (err) {
                    res.status(400).json({ msg: err.message })
                    console.log(err, err.stack) // an error occurred
                }
                else {
                    res.status(200).json({ msg: 'deleted!' })
                    console.log(params.Key + ' deleted from ' + params.Bucket)
                }
            })

        }
        catch (err) {
            console.log('ERROR in file Deleting : ' + JSON.stringify(err))
        }

        // Delete downloads related to this notes
        const removedDownloads = await Download.deleteMany({ notes: notes._id })

        if (!removedDownloads)
            throw Error('Something went wrong while deleting the downloads!')

        // Delete this notes
        const removedNotes = await Notes.deleteOne({ _id: req.params.id })

        if (!removedNotes)
            throw Error('Something went wrong while deleting!')

        res.status(200).json({ msg: `Deleted!` })

    } catch (err) {
        res.status(400).json({
            msg: err.message
        })
    }

})

// @route remove quiz from notes
// @route Private
router.put('/notes-quizzes/remove/:id', auth, async (req, res) => {

    try {
        const note = await Notes.findOne({ _id: req.params.id })
        if (!note) throw Error('Notes not found!')

        // Delete quiz in notes
        await Notes.updateOne(
            { _id: note._id },
            { $pull: { quizzes: req.body.quizID } }
        )

        res.status(200).json({ msg: `Deleted!` })

    } catch (err) {
        res.status(400).json({
            msg: err.message
        })
    }

})

module.exports = router