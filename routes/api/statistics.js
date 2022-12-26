const express = require("express")
const config = require('config')
const router = express.Router()

// MODELS
const User = require('../../models/User')
const Download = require('../../models/Download')
const Score = require('../../models/Score')


// MIDDLEWARE
const { authRole } = require('../../middleware/auth')

// @route   GET api/statistics
// @desc    Get 50 users
// @access Private: Accessed by ['Admin', 'SuperAdmin']
router.get('/users50', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const users = await User.find({}, // query filter (optional)
            {
                _id: 0,
                name: 1,
                email: 1,
                role: 1,
                register_date: 1,
                image: { $ifNull: ["$image", null] },
                school: { $ifNull: ["$school", null] },
                level: { $ifNull: ["$level", null] },
                faculty: { $ifNull: ["$faculty", null] },
                year: { $ifNull: ["$year", null] },
                interests: { $ifNull: ["$interests", null] },
                about: { $ifNull: ["$about", null] },
            }
        )
            .populate('school level faculty', '-_id, title years')
            .limit(50)
            .sort({ register_date: -1 })

        if (!users) throw Error('No users exist')

        res.status(200).json(users)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})


// @route   GET api/statistics
// @desc    Get all users
// @access Private: Accessed by ['Admin', 'SuperAdmin']
router.get('/usersAll', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const users = await User.find({}, // query filter (optional)
            {
                _id: 0,
                name: 1,
                email: 1,
                role: 1,
                register_date: 1,
                image: { $ifNull: ["$image", null] },
                school: { $ifNull: ["$school", null] },
                level: { $ifNull: ["$level", null] },
                faculty: { $ifNull: ["$faculty", null] },
                year: { $ifNull: ["$year", null] },
                interests: { $ifNull: ["$interests", null] },
                about: { $ifNull: ["$about", null] },
            }
        )
            .populate('school level faculty', '-_id title years')
            .sort({ register_date: -1 })

        if (!users) throw Error('No users exist')

        res.status(200).json(users)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET api/statistics
// @desc    Get all users having an image field which is not null or empty
// @access Private: Accessed by ['Admin', 'SuperAdmin']
router.get('/usersWithImage', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const users = await User.find({ image: { $exists: true, $ne: null, $ne: "" } }, // query filter (optional)
            {
                _id: 0,
                name: 1,
                email: 1,
                role: 1,
                register_date: 1,
                image: { $ifNull: ["$image", null] },
                school: { $ifNull: ["$school", null] },
                level: { $ifNull: ["$level", null] },
                faculty: { $ifNull: ["$faculty", null] },
                year: { $ifNull: ["$year", null] },
                interests: { $ifNull: ["$interests", null] },
                about: { $ifNull: ["$about", null] },
            }
        )
            .populate('school level faculty', '-_id title years')

        if (!users) throw Error('No users exist')

        res.status(200).json(users)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET api/statistics
// @desc    Get all users having an school field which exists and is not null and not empty
// @access Private: Accessed by ['Admin', 'SuperAdmin']
router.get('/usersWithSchool', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const users = await User.find({ school: { $exists: true, $ne: null } }, // query filter (optional)
            {
                _id: 0,
                name: 1,
                email: 1,
                role: 1,
                register_date: 1,
                image: { $ifNull: ["$image", null] },
                school: { $ifNull: ["$school", null] },
                level: { $ifNull: ["$level", null] },
                faculty: { $ifNull: ["$faculty", null] },
                year: { $ifNull: ["$year", null] },
                interests: { $ifNull: ["$interests", null] },
                about: { $ifNull: ["$about", null] },
            }
        )
            .populate('school level faculty', '-_id title years')

        if (!users) throw Error('No users exist')

        res.status(200).json(users)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET api/statistics
// @desc    Get all users having an level field which exists and is not null and not empty
// @access Private: Accessed by ['Admin', 'SuperAdmin']
router.get('/usersWithLevel', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const users = await User.find({ level: { $exists: true, $ne: null } }, // query filter (optional)
            {
                _id: 0,
                name: 1,
                email: 1,
                role: 1,
                register_date: 1,
                image: { $ifNull: ["$image", null] },
                school: { $ifNull: ["$school", null] },
                level: { $ifNull: ["$level", null] },
                faculty: { $ifNull: ["$faculty", null] },
                year: { $ifNull: ["$year", null] },
                interests: { $ifNull: ["$interests", null] },
                about: { $ifNull: ["$about", null] },
            }

        )
            .populate('school level faculty', '-_id title years')

        if (!users) throw Error('No users exist')

        res.status(200).json(users)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET api/statistics
// @desc    Get all users having an faculty field which exists and is not null and not empty
// @access Private: Accessed by ['Admin', 'SuperAdmin']
router.get('/usersWithFaculty', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const users = await User.find({ faculty: { $exists: true, $ne: null } }, // query filter (optional)

            {
                _id: 0,
                name: 1,
                email: 1,
                role: 1,
                register_date: 1,
                image: { $ifNull: ["$image", null] },
                school: { $ifNull: ["$school", null] },
                level: { $ifNull: ["$level", null] },
                faculty: { $ifNull: ["$faculty", null] },
                year: { $ifNull: ["$year", null] },
                interests: { $ifNull: ["$interests", null] },
                about: { $ifNull: ["$about", null] },
            }
        )
            .populate('school level faculty', '-_id title years')

        if (!users) throw Error('No users exist')

        res.status(200).json(users)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET api/statistics
// @desc    Get all users having an year field which exists and is not null and not empty
// @access Private: Accessed by ['Admin', 'SuperAdmin']
router.get('/usersWithYear', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const users = await User.find({ year: { $exists: true, $ne: null, $ne: "" } }, // query filter (optional)
            {
                _id: 0,
                name: 1,
                email: 1,
                role: 1,
                register_date: 1,
                image: { $ifNull: ["$image", null] },
                school: { $ifNull: ["$school", null] },
                level: { $ifNull: ["$level", null] },
                faculty: { $ifNull: ["$faculty", null] },
                year: { $ifNull: ["$year", null] },
                interests: { $ifNull: ["$interests", null] },
                about: { $ifNull: ["$about", null] },
            }
        )
            .populate('school level faculty', '-_id title years')

        if (!users) throw Error('No users exist')

        res.status(200).json(users)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET api/statistics
// @desc    Get all users having an interests field which exists and is not null - empty are considered
// @access Private: Accessed by ['Admin', 'SuperAdmin']
router.get('/usersWithInterests', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const users = await User.find({ interests: { $exists: true, $ne: null } }, // query filter (optional)
            {
                _id: 0,
                name: 1,
                email: 1,
                role: 1,
                register_date: 1,
                image: { $ifNull: ["$image", null] },
                school: { $ifNull: ["$school", null] },
                level: { $ifNull: ["$level", null] },
                faculty: { $ifNull: ["$faculty", null] },
                year: { $ifNull: ["$year", null] },
                interests: { $ifNull: ["$interests", null] },
                about: { $ifNull: ["$about", null] },
            }
        )

            .populate('school level faculty', '-_id title years')

        if (!users) throw Error('No users exist')

        res.status(200).json(users)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET api/statistics
// @desc    Get all users having an about field which exists and is not null and not empty
// @access Private: Accessed by ['Admin', 'SuperAdmin']
router.get('/usersWithAbout', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const users = await User.find({ about: { $exists: true, $ne: null, $ne: "" } }, // query filter (optional)
            {
                _id: 0,
                name: 1,
                email: 1,
                role: 1,
                register_date: 1,
                image: { $ifNull: ["$image", null] },
                school: { $ifNull: ["$school", null] },
                level: { $ifNull: ["$level", null] },
                faculty: { $ifNull: ["$faculty", null] },
                year: { $ifNull: ["$year", null] },
                interests: { $ifNull: ["$interests", null] },
                about: { $ifNull: ["$about", null] },
            }
        )
            .populate('school level faculty', '-_id title years')

        if (!users) throw Error('No users exist')

        res.status(200).json(users)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route GET api/statistics
// @route Group 50 users with most downloaded files
// @route Private: accessed by authorization
router.get('/top50downloaders', async (req, res) => {
    Download.aggregate([
        {
            // Join with notes collection
            $lookup: {
                from: "notes",
                localField: "notes",
                foreignField: "_id",
                as: "notes_downloads"
            }
        },
        { $unwind: "$notes_downloads" },
        {
            // Join with users collection
            $lookup: {
                from: "users",
                localField: "downloaded_by",
                foreignField: "_id",
                as: "users_downloads"
            }
        },
        { $unwind: "$users_downloads" },
        {
            // Group by user and count downloads
            $group: {
                _id: "$users_downloads._id",
                name: { $first: "$users_downloads.name" },
                email: { $first: "$users_downloads.email" },
                count: { $sum: 1 }
            }
        },
        {
            // Sort by count in descending order
            $sort: { count: -1 }
        },
        {
            // Limit to top 50
            $limit: 50
        },
        {
            // Decide what to return
            $project: {
                _id: 0,
                name: 1,
                email: 1,
                count: 1
            }
        }
    ]).exec(function (err, downloads) {
        if (err) return err
        res.json(downloads)
    })

})

// @route GET api/statistics
// @route Group users with downloaded files total
// @route Private: accessed by authorization
router.get('/all-downloaders', async (req, res) => {
    Download.aggregate([
        {
            // Join with notes collection
            $lookup: {
                from: "notes",
                localField: "notes",
                foreignField: "_id",
                as: "notes_downloads"
            }
        },
        { $unwind: "$notes_downloads" },
        {
            // Join with users collection
            $lookup: {
                from: "users",
                localField: "downloaded_by",
                foreignField: "_id",
                as: "users_downloads"
            }
        },
        { $unwind: "$users_downloads" },
        {
            // Group by user and count downloads
            $group: {
                _id: "$users_downloads._id",
                name: { $first: "$users_downloads.name" },
                email: { $first: "$users_downloads.email" },
                count: { $sum: 1 }
            }
        },
        {
            // Sort by count in descending order
            $sort: { count: -1 }
        },
        {
            // Decide what to return
            $project: {
                _id: 0,
                name: 1,
                email: 1,
                count: 1
            }
        }
    ]).exec(function (err, downloads) {
        if (err) return err
        res.json(downloads)
    })
})


// @route GET api/statistics
// @route Group notes with most downloads
// @route Private: accessed by authorization
router.get('/top50downloads', async (req, res) => {
    Download.aggregate([
        {
            // Join with notes collection
            $lookup: {
                from: "notes",
                localField: "notes",
                foreignField: "_id",
                as: "notes_downloads"
            }
        },
        { $unwind: "$notes_downloads" },
        {
            // Group by note and count downloads
            $group: {
                _id: "$notes_downloads._id",
                title: { $first: "$notes_downloads.title" },
                count: { $sum: 1 }
            }
        },
        {
            // Sort by count in descending order
            $sort: { count: -1 }
        },
        {
            // Limit to top 50
            $limit: 50
        },
        {
            // Decide what to return
            $project: {
                _id: 0,
                title: 1,
                count: 1
            }
        }
    ]).exec(function (err, downloads) {
        if (err) return err
        res.json(downloads)
    })

})

// @route GET api/statistics
// @route Group notes with most downloads
// @route Private: accessed by authorization
router.get('/topDownloads', async (req, res) => {
    Download.aggregate([
        {
            // Join with notes collection
            $lookup: {
                from: "notes",
                localField: "notes",
                foreignField: "_id",
                as: "notes_downloads"
            }
        },
        { $unwind: "$notes_downloads" },
        {
            // Group by note and count downloads
            $group: {
                _id: "$notes_downloads._id",
                title: { $first: "$notes_downloads.title" },
                count: { $sum: 1 }
            }
        },
        {
            // Sort by count in descending order
            $sort: { count: -1 }
        },
        {
            // Decide what to return
            $project: {
                _id: 0,
                title: 1,
                count: 1
            }
        }
    ]).exec(function (err, downloads) {
        if (err) return err
        res.json(downloads)
    })

})


// @route GET api/statistics
// @route Group top 50 quizzes with most attempts
// @route Private: accessed by authorization
router.get('/top50quizzes', async (req, res) => {

    Score.aggregate([
        {
            // Join with quiz collection
            $lookup: {
                from: "quizzes",
                localField: "quiz",
                foreignField: "_id",
                as: "quiz_scores"
            }
        },
        { $unwind: "$quiz_scores" },
        {
            $lookup: {
                from: "users",
                localField: "quiz_scores.created_by",
                foreignField: "_id",
                as: "quiz_creator"
            }
        },
        { $unwind: "$quiz_creator" },
        {
            // Group by quiz and count attempts
            $group: {
                _id: "$quiz_scores._id",
                title: { $first: "$quiz_scores.title" },
                created_by: { $first: "$quiz_creator.name" },
                count: { $sum: 1 }
            }
        },
        {
            // Sort by count in descending order
            $sort: { count: -1 }
        },
        {
            // Limit to top 50
            $limit: 50
        },
        {
            // Decide what to return
            $project: {
                _id: 0,
                title: 1,
                count: 1,
                created_by: 1
            }
        }
    ]).exec(function (err, scores) {
        if (err) return err;
        res.json(scores);
    });

})

// @route GET api/statistics
// @route Group all quizzes with most attempts
// @route Private: accessed by authorization
router.get('/allQuizzes', async (req, res) => {

    Score.aggregate([
        {
            // Join with quiz collection
            $lookup: {
                from: "quizzes",
                localField: "quiz",
                foreignField: "_id",
                as: "quiz_scores"
            }
        },
        { $unwind: "$quiz_scores" },
        {
            $lookup: {
                from: "users",
                localField: "quiz_scores.created_by",
                foreignField: "_id",
                as: "quiz_creator"
            }
        },
        { $unwind: "$quiz_creator" },
        {
            // Group by quiz and count attempts
            $group: {
                _id: "$quiz_scores._id",
                title: { $first: "$quiz_scores.title" },
                created_by: { $first: "$quiz_creator.name" },
                count: { $sum: 1 }
            }
        },
        {
            // Sort by count in descending order
            $sort: { count: -1 }
        },
        {
            // Decide what to return
            $project: {
                _id: 0,
                title: 1,
                count: 1,
                created_by: 1
            }
        }
    ]).exec(function (err, scores) {
        if (err) return err;
        res.json(scores);
    });

})


// @route   GET api/statistics
// @desc    Get the each school user statistics
// @access Private: Accessed by ['Admin', 'SuperAdmin']
router.get('/schoolUsers', async (req, res) => {
    User.aggregate([
        // Project the fields you want to keep
        {
            $project: {
                name: 1,
                email: 1,
                role: 1,
                register_date: 1,
                image: { $ifNull: ["$image", null] },
                school: { $ifNull: ["$school", null] },
                level: { $ifNull: ["$level", null] },
                faculty: { $ifNull: ["$faculty", null] },
                year: { $ifNull: ["$year", null] },
                interests: { $ifNull: ["$interests", null] },
                about: { $ifNull: ["$about", null] }
            }
        },
        // Join with the schools collection to get the school name
        {
            $lookup: {
                from: "schools",
                localField: "school",
                foreignField: "_id",
                as: "school_data"
            }
        },
        // Unwind the school_data array
        {
            $unwind: "$school_data"
        },
        // Group by school and create an array of users for each school
        {
            $group: {
                _id: "$school_data.title",
                users: {
                    $push: {
                        name: "$name",
                        email: "$email",
                        role: "$role",
                        register_date: "$register_date",
                        image: "$image",
                        school: "$school_data.title",
                        level: "$level",
                        faculty: "$faculty",
                        year: "$year",
                        interests: "$interests",
                        about: "$about"
                    }
                }
            }
        },
        // Sort by school name in ascending order
        {
            $sort: { _id: 1 }
        }
    ]).exec(function (err, users) {
        if (err) return err;
        res.json(users);
    });
});


// @route   GET api/statistics
// @desc    Get the each school user count
// @access Private: Accessed by ['Admin', 'SuperAdmin']
router.get('/schoolUsersCount', async (req, res) => {
    User.aggregate([
        // Project the fields you want to keep
        {
            $project: {
                name: 1,
                email: 1,
                role: 1,
                register_date: 1,
                image: { $ifNull: ["$image", null] },
                school: { $ifNull: ["$school", null] },
                level: { $ifNull: ["$level", null] },
                faculty: { $ifNull: ["$faculty", null] },
                year: { $ifNull: ["$year", null] },
                interests: { $ifNull: ["$interests", null] },
                about: { $ifNull: ["$about", null] }
            }
        },
        // Join with the schools collection to get the school name
        {
            $lookup: {
                from: "schools",
                localField: "school",
                foreignField: "_id",
                as: "school_data"
            }
        },
        // Unwind the school_data array
        {
            $unwind: "$school_data"
        },
        // Group by school and create an array of users for each school
        {
            $group: {
                _id: "$school_data.title",
                count: { $sum: 1 }
            }
        },
        // Sort by school name in ascending order
        {
            $sort: { _id: 1 }
        }
    ]).exec(function (err, users) {
        if (err) return err;
        res.json(users);
    });
});


module.exports = router