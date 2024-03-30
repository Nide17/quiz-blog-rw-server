const express = require("express")
const router = express.Router()

// MODELS
const User = require('../../models/User')
const Download = require('../../models/Download')
const Score = require('../../models/Score')

// MIDDLEWARE
const { authRole } = require('../../middleware/authMiddleware')

// @route   GET api/statistics/users50
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
        // .sort({ register_date: -1 })

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
// @route Group 100 users with most attempts to quizzes i.e. most scores count
// @route Private: accessed by authorization
router.get('/top100Quizzing', async (req, res) => {
    await Score.aggregate([
        {
            // Join with users collection
            $lookup: {
                from: "users",
                localField: "taken_by",
                foreignField: "_id",
                as: "users_scores"
            }
        },
        { $unwind: "$users_scores" },
        {
            // Group by user and count scores
            $group: {
                _id: "$users_scores._id",
                name: { $first: "$users_scores.name" },
                email: { $first: "$users_scores.email" },
                attempts: { $sum: 1 }
            }
        },
        {
            // Sort by attempts descending
            $sort: { attempts: -1 }
        },
        {
            // Limit to 100
            $limit: 100
        },
        {
            // Project only user, email, and attempts
            $project: {
                _id: 0,
                name: 1,
                email: 1,
                attempts: 1
            }
        }
    ])
        .then(scores => {
            res.json(scores)
        })
        .catch(err => {
            res.status(400).json({ msg: err.message })
        })
})

// @route GET api/statistics
// @route Group 100 users with most downloaded files
// @route Private: accessed by authorization
router.get('/top100Downloaders', async (req, res) => {
    await Download.aggregate([
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
                downloads: { $sum: 1 }
            }
        },
        {
            // Sort by downloads in descending order
            $sort: { downloads: -1 }
        },
        {
            // Limit to top 100
            $limit: 100
        },
        {
            // Decide what to return
            $project: {
                _id: 0,
                name: 1,
                email: 1,
                downloads: 1
            }
        }
    ]).exec()
        .then(downloadsCount => {
            res.json(downloadsCount)
        })
        .catch(err => {
            res.status(400).json({ msg: err.message })
        })
})

// @route GET api/statistics
// @route Group top 20 quizzes with most attempts
// @route Private: accessed by authorization
router.get('/top20Quizzes', async (req, res) => {
    await Score.aggregate([
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

        // Join with users collection
        {
            $lookup: {
                from: "users",
                localField: "quiz_scores.created_by",
                foreignField: "_id",
                as: "quiz_creator"
            }
        },
        { $unwind: "$quiz_creator" },

        // Join with categories collection
        {
            $lookup: {
                from: "categories",
                localField: "quiz_scores.category",
                foreignField: "_id",
                as: "quiz_category"
            }
        },
        { $unwind: "$quiz_category" },

        {
            // Group by quiz and count attempts
            $group: {
                _id: "$quiz_scores._id",
                title: { $first: "$quiz_scores.title" },
                category: { $first: "$quiz_category.title" },
                questions: { $first: { $size: "$quiz_scores.questions" } },
                created_by: { $first: "$quiz_creator.name" },
                attempts: { $sum: 1 }
            }
        },
        {
            // Sort by attempts in descending order
            $sort: { attempts: -1 }
        },
        {
            // Limit to top 20
            $limit: 20
        },
        {
            // Decide what to return
            $project: {
                _id: 0,
                title: 1,
                attempts: 1,
                category: 1,
                questions: 1,
                created_by: 1
            }
        }
    ]).exec()
        .then(quizStatistics => {
            res.json(quizStatistics)
        })
        .catch(err => {
            res.status(400).json({ msg: err.message })
        })
})

// @route GET api/statistics
// @route Group all quizzes with most attempts
// @route Private: accessed by authorization
router.get('/allQuizzesAttempts', async (req, res) => {
    await Score.aggregate([
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

        // Join with users collection
        {
            $lookup: {
                from: "users",
                localField: "quiz_scores.created_by",
                foreignField: "_id",
                as: "quiz_creator"
            }
        },
        { $unwind: "$quiz_creator" },

        // Join with categories collection
        {
            $lookup: {
                from: "categories",
                localField: "quiz_scores.category",
                foreignField: "_id",
                as: "quiz_category"
            }
        },
        { $unwind: "$quiz_category" },

        {
            // Group by quiz and count attempts
            $group: {
                _id: "$quiz_scores._id",
                quiz: { $first: "$quiz_scores.title" },
                category: { $first: "$quiz_category.title" },
                questions: { $first: { $size: "$quiz_scores.questions" } },
                created_by: { $first: "$quiz_creator.name" },
                attempts: { $sum: 1 }
            }
        },
        {
            // Sort by attempts in descending order
            $sort: { attempts: -1 }
        },
        {
            // Decide what to return
            $project: {
                _id: 0,
                quiz: 1,
                attempts: 1,
                category: 1,
                questions: 1,
                created_by: 1
            }
        }
    ]).exec()
        .then(quizStatistics => {
            res.json(quizStatistics)
        })
        .catch(err => {
            res.status(400).json({ msg: err.message })
        })
})


// @route GET api/statistics
// @route Group notes with most downloads
// @route Private: accessed by authorization
router.get('/top20Downloads', async (req, res) => {
    await Download.aggregate([
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

        // Join with the course category collection
        {
            $lookup: {
                from: "coursecategories",
                localField: "notes_downloads.courseCategory",
                foreignField: "_id",
                as: "notes_courseCategory"
            }
        },
        { $unwind: "$notes_courseCategory" },

        // Join with the course collection
        {
            $lookup: {
                from: "courses",
                localField: "notes_downloads.course",
                foreignField: "_id",
                as: "notes_course"
            }
        },
        { $unwind: "$notes_course" },

        // Join with the chapter collection
        {
            $lookup: {
                from: "chapters",
                localField: "notes_downloads.chapter",
                foreignField: "_id",
                as: "notes_chapter"
            }
        },
        { $unwind: "$notes_chapter" },

        // Group by note and count downloads
        {
            $group: {
                _id: "$notes_downloads._id",
                notes: { $first: "$notes_downloads.title" },
                courseCategory: { $first: "$notes_courseCategory.title" },
                course: { $first: "$notes_course.title" },
                chapter: { $first: "$notes_chapter.title" },
                downloads: { $sum: 1 }
            }
        },
        {
            // Sort by downloads in descending order
            $sort: { downloads: -1 }
        },
        {
            // Limit to top 20
            $limit: 20
        },
        {
            // Decide what to return
            $project: {
                _id: 0,
                notes: 1,
                courseCategory: 1,
                course: 1,
                chapter: 1,
                downloads: 1
            }
        }
    ]).exec()
        .then(notesStats => {
            res.json(notesStats)
        })
        .catch(err => {
            res.status(400).json({ msg: err.message })
        })
})

// @route GET api/statistics
// @route Group notes with most downloads
// @route Private: accessed by authorization
router.get('/allDownloads', async (req, res) => {
    await Download.aggregate([
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

        // Join with the course category collection
        {
            $lookup: {
                from: "coursecategories",
                localField: "notes_downloads.courseCategory",
                foreignField: "_id",
                as: "notes_courseCategory"
            }
        },
        { $unwind: "$notes_courseCategory" },

        // Join with the course collection
        {
            $lookup: {
                from: "courses",
                localField: "notes_downloads.course",
                foreignField: "_id",
                as: "notes_course"
            }
        },
        { $unwind: "$notes_course" },

        // Join with the chapter collection
        {
            $lookup: {
                from: "chapters",
                localField: "notes_downloads.chapter",
                foreignField: "_id",
                as: "notes_chapter"
            }
        },
        { $unwind: "$notes_chapter" },

        // Group by note and count downloads
        {
            $group: {
                _id: "$notes_downloads._id",
                title: { $first: "$notes_downloads.title" },
                courseCategory: { $first: "$notes_courseCategory.title" },
                course: { $first: "$notes_course.title" },
                chapter: { $first: "$notes_chapter.title" },
                downloads: { $sum: 1 }
            }
        },
        {
            // Sort by downloads in descending order
            $sort: { downloads: -1 }
        },
        {
            // Decide what to return
            $project: {
                _id: 0,
                title: 1,
                courseCategory: 1,
                course: 1,
                chapter: 1,
                downloads: 1
            }
        }
    ]).exec()
        .then(notesStats => {
            res.json(notesStats)
        })
        .catch(err => {
            res.status(400).json({ msg: err.message })
        })
})


// @route   GET api/quizCategoriesAttempts
// @desc    Get each quiz category with number of quiz attempts
// @access Private: Accessed by ['Admin', 'SuperAdmin']
router.get('/quizCategoriesAttempts', async (req, res) => {
    await Score.aggregate([
        {
            // Join with quiz collection
            $lookup: {
                from: "quizzes",
                localField: "quiz",
                foreignField: "_id",
                as: "quiz_score"
            }
        },
        { $unwind: "$quiz_score" },

        // Join with the quiz category collection
        {
            $lookup: {
                from: "categories",
                localField: "quiz_score.category",
                foreignField: "_id",
                as: "quiz_category"
            }
        },
        { $unwind: "$quiz_category" },

        // Group by quiz category and count attempts
        {
            $group: {
                _id: "$quiz_score.category",
                category: { $first: "$quiz_category.title" },
                attempts: { $sum: 1 },
                // add the count of quizzes field from the categories collection
                quizzes: { $first: { $size: "$quiz_category.quizes" } }
            }
        },
        {
            // Sort by attempts in descending order
            $sort: { attempts: -1 }
        },
        {
            // Decide what to return
            $project: {
                _id: 0,
                category: 1,
                attempts: 1,
                quizzes: 1
            }
        }
    ]).exec()
        .then(categoriesStats => {
            res.json(categoriesStats)
        })
        .catch(err => {
            res.status(400).json({ msg: err.message })
        })
})

// @route   GET api/notesCategoriesDownloads
// @desc    Get each notes category with number of notes downloads
// @access Private: Accessed by ['Admin', 'SuperAdmin']
router.get('/notesCategoriesDownloads', async (req, res) => {
    await Download.aggregate([
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

        // Join with the notes category collection
        {
            $lookup: {
                from: "coursecategories",
                localField: "notes_downloads.courseCategory",
                foreignField: "_id",
                as: "notes_courseCategory"
            }
        },
        { $unwind: "$notes_courseCategory" },

        // Group by notes category and count downloads
        {
            $group: {
                _id: "$notes_downloads.courseCategory",
                category: { $first: "$notes_courseCategory.title" },
                downloads: { $sum: 1 },
            }
        },
        {
            // Sort by downloads in descending order
            $sort: { downloads: -1 }
        },
        {
            // Decide what to return
            $project: {
                _id: 0,
                category: 1,
                downloads: 1
            }
        }
    ]).exec()
        .then(categoriesStats => {
            res.json(categoriesStats)
        })
        .catch(err => {
            res.status(400).json({ msg: err.message })
        })
})

// @route   GET api/statistics
// @desc    Get the count of users registered for each day using register_date
// @access Private: Accessed by ['Admin', 'SuperAdmin']
router.get('/dailyUserRegistration', async (req, res) => {
    await User.aggregate([
        {
            // make register_date only date without hours, minutes, seconds
            $project: {
                // register_date: {
                //     $dateToString: {
                //         format: "%Y-%m-%d",
                //         date: "$register_date"
                //     }
                // },

                // use CAT timezone instead of UTC timezone to get the correct date
                register_date_CAT: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        // add 2 hours to get the correct date
                        date: { $add: ["$register_date", 2 * 60 * 60 * 1000] }
                    }
                }
            }
        },
        {
            // Group by register_date and count users
            $group: {
                _id: "$register_date_CAT",
                users: { $sum: 1 }
            }
        },
        {
            // Sort by register_date in ascending order
            $sort: { _id: 1 }
        },
        {
            // Decide what to return
            $project: {
                _id: 0,
                date: "$_id",
                users: 1
            }
        }
    ]).exec()
        .then(usersStats => {
            // make a total of users
            let total = 0
            usersStats.forEach(user => {
                total += user.users
            })
            res.json({ usersStats, total })
        })
        .catch(err => {
            res.status(400).json({ msg: err.message })
        })
})


// @route   GET api/statistics
// @desc    Get the each school user statistics
// @access Private: Accessed by ['Admin', 'SuperAdmin']
router.get('/schoolUsers', async (req, res) => {
    await User.aggregate([
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
    ]).exec()
        .then(users => {
            res.json(users)
        })
        .catch(err => {
            res.status(400).json({ msg: err.message })
        })
});


// @route   GET api/statistics
// @desc    Get the each school user count
// @access Private: Accessed by ['Admin', 'SuperAdmin']
router.get('/schoolUsersCount', async (req, res) => {
    await User.aggregate([
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
    ]).exec()
        .then(users => {
            res.json(users)
        })
        .catch(err => {
            res.status(400).json({ msg: err.message })
        })
});


module.exports = router