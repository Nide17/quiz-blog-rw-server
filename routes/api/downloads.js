const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Download Model
const Download = require('../../models/Download');
const { auth, authRole } = require('../../middleware/auth');

// @route GET api/downloads
// @route Get paginated downloads
// @route Private: accessed by authorization
router.get('/', authRole(['Creator', 'Admin', 'SuperAdmin']), async (req, res) => {

    // Pagination
    const totalPages = await Download.countDocuments({});
    var PAGE_SIZE = 20
    var pageNo = parseInt(req.query.pageNo || "0")
    var query = {}

    query.limit = PAGE_SIZE
    query.skip = PAGE_SIZE * (pageNo - 1)

    try {
        const downloads = pageNo > 0 ?
            await Download.find({}, {}, query)
                .sort({ createdAt: -1 })
                .populate('notes course chapter downloaded_by') :

            await Download.find()

                //sort downloads by date
                .sort({ createdAt: -1 })
                .populate('notes course chapter downloaded_by')

        if (!downloads) throw Error('No downloads exist');

        if (pageNo > 0) {

            return res.status(200).json({
                totalPages: Math.ceil(totalPages / PAGE_SIZE),
                downloads
            })
        }
        else {
            return res.status(200).json({ downloads })
        }

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
});

// @route   GET /api/downloads/notes-creator/:id
// @desc    Get all downloads by taker
// @access  Private: accessed by authorization
router.get('/notes-creator/:id', authRole(['Creator', 'Admin', 'SuperAdmin']), async (req, res) => {

    try {
        Download.aggregate([
            {
                // Join with notes collection
                $lookup:
                {
                    from: "notes",
                    localField: "notes",
                    foreignField: "_id",
                    as: "notes_downloads"
                }
            },
            { $unwind: '$notes_downloads' },

            // Match only downloads of the notes uploader
            { $match: { 'notes_downloads.uploaded_by': new mongoose.Types.ObjectId(req.params.id) } },
            {
                // Join with courses collection
                $lookup:
                {
                    from: "courses",
                    localField: "course",
                    foreignField: "_id",
                    as: "courses_downloads"
                }
            },
            { $unwind: '$courses_downloads' },
            {
                // Join with chapters collection
                $lookup:
                {
                    from: "chapters",
                    localField: "chapter",
                    foreignField: "_id",
                    as: "chapters_downloads"
                }
            },
            { $unwind: '$chapters_downloads' },
            {
                // Join with users collection
                $lookup:
                {
                    from: "users",
                    localField: "downloaded_by",
                    foreignField: "_id",
                    as: "users_downloads"
                }
            },
            { $unwind: '$users_downloads' },
            {
                // Decide what to return
                $project: {
                    updatedAt: 1,
                    _id: 0,
                    notes_downloads_title: '$notes_downloads.title',
                    courses_downloads_title: '$courses_downloads.title',
                    chapters_downloads_title: '$chapters_downloads.title',
                    users_downloads_name: '$users_downloads.name',
                }
            }
        ]).exec(function (err, downloads) {
            if (err) return err;
            res.json(downloads);
        }
        );

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        });
    }

})

// @route   GET /api/downloads/downloaded-by/:id
// @desc    Get all downloads by taker
// @access  Private: accessed by authenticated user
router.get('/downloaded-by/:id', auth, async (req, res) => {

    let id = req.params.id;
    try {
        //Find the downloads by id
        await Download.find({ downloaded_by: id }, (err, downloads) => {
            res.status(200).json(downloads);
        })
            // Use the name of the schema path instead of the collection name
            .populate('notes course chapter downloaded_by')

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        });
    }

});

// @route   POST /api/downloads
// @desc    Save the download
// @access  Private
router.post('/', async (req, res) => {

    const { notes, chapter, course, courseCategory, downloaded_by } = req.body;

    // Simple validation
    if (!notes) {
        return res.status(400).json({ msg: 'no notes' });
    }

    try {
        const newDownload = new Download({
            notes,
            chapter,
            course,
            courseCategory,
            downloaded_by
        });

        const savedDownload = await newDownload.save();
        if (!savedDownload) throw Error('Something went wrong during creation!');

        res.status(200).json({
            _id: savedDownload._id,
            notes: savedDownload.notes,
            chapter: savedDownload.chapter,
            course: savedDownload.course,
            courseCategory: savedDownload.course,
            downloaded_by: savedDownload.downloaded_by,
            createdAt: savedDownload.createdAt,
        });

    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// @route DELETE api/downloads
// @route delete a download
// @route Private: Accessed by authorization
//:id placeholder, findById = we get it from the parameter in url
router.delete('/:id', authRole(['Creator', 'Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const download = await Download.findById(req.params.id);
        if (!download) throw Error('Download is not found!')

        // Delete Download
        const removedDownload = await download.remove();

        if (!removedDownload)
            throw Error('Something went wrong while deleting!');
        res.status(200).json({ msg: `Deleted!` })

    } catch (err) {
        res.status(400).json({
            msg: err.message
        });
    }
});

module.exports = router;