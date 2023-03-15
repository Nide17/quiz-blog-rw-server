const express = require("express")
const router = express.Router()
const { authRole } = require('../../../middleware/auth')
const scheduledReportMessage = require('./scheduledReport')

// BlogPostView Model
const BlogPostView = require('../../../models/blogPosts/BlogPostView')

// SCHEDULED REPORT MESSAGE
scheduledReportMessage()

// @route   GET /api/blogPostsViews
// @desc    Get all blog posts views
// @access  Public
router.get('/', async (req, res) => {

    // Pagination
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    var query = {}

    query.limit = limit
    query.skip = skip

    try {
        const blogPostsViews = await BlogPostView.find({}, {}, query)

            //sort blogPostsViews by date
            .sort({ createdAt: -1 })
            .populate('blogPost user')

        if (!blogPostsViews) throw Error('No blog posts views found')

        res.status(200).json(blogPostsViews)
    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// TODAY'S VIEWS REPORT
// @route   GET /api/blogPostsViews/today
// @desc    Get all blog post views for today
// @access  Public
router.get('/today', async (req, res) => {

    // Pagination
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    var query = {}

    query.limit = limit
    query.skip = skip

    
})


// TODAY'S VIEWS ALL
// @route   GET /api/blogPostsViews/today
// @desc    Get all blog post views for today
// @access  Public
router.get('/todayAll', async (req, res) => {

    // Pagination
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    var query = {}

    query.limit = limit
    query.skip = skip

    try {
        // ADD 2 HOURS TO GET THE CORRECT DATE IN CAT
        const today = new Date(new Date().getTime())

        // Get today's date in ISO format with his time set to 00:00:00
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        const blogPostsViews = await BlogPostView.find({ createdAt: { $gte: todayDate } }, {}, query)
            //sort blogPostsViews by date
            .sort({ createdAt: -1 })
            .populate('blogPost user')

        if (!blogPostsViews) throw Error('No blog posts views found')

        res.status(200).json(blogPostsViews)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})
// GET RECENT TEN VIEWS
// @route   GET /api/blogPostsViews/recentTen
// @desc    Get recent ten blog post views
// @access  Public
router.get('/recentTen', async (req, res) => {

    // Aggregate with user to get user name
    BlogPostView.aggregate([

        // Join with blogPost
        {
            $lookup: {
                from: 'blogposts',
                localField: 'blogPost',
                foreignField: '_id',
                as: 'blogPost'
            }
        },
        {
            // Unwind to get an object instead of an array
            $unwind: "$blogPost"
        },

        {
            // Join with user
            $lookup: {
                from: 'users',
                localField: 'viewer',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            // Unwind to get an object even if no match
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $limit: 10
        },
        // Group back to arrays
        {
            $group: {
                _id: '$_id',
                blogPost: { $first: '$blogPost.title' },
                viewer: { $first: '$user.name' },
                device: { $first: '$device' },
                country: { $first: '$country' },
                createdAt: { $first: '$createdAt' }
            }
        },
        // Decide which fields to include
        {
            $project: {
                _id: 0,
                blogPost: 1,
                viewer: 1,
                device: 1,
                country: 1,
                createdAt: 1,
            }
        }
    ])
        .then(blogPostsViews => {
            res.json(blogPostsViews)
        })
        .catch(err => {
            res.status(400).json({ msg: err.message })
        })
})

// @route   GET /api/blogPostsViews/blogPost/:id
// @desc    Get all blog post views by blog post id
// @access  Public
router.get('/blogPost/:id', async (req, res) => {

    // Pagination
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    var query = {}

    query.limit = limit
    query.skip = skip

    try {
        const blogPostsViews = await BlogPostView.find({ blogPost: req.params.id }, {}, query)

            //sort blogPostsViews by date
            .sort({ createdAt: -1 })
            .populate('blogPost user')

        if (!blogPostsViews) throw Error('No blog posts views found')

        res.status(200).json(blogPostsViews)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET /api/blogPostsViews/user/:id
// @desc    Get all blog post views by user id
// @access  Public
router.get('/user/:id', async (req, res) => {

    // Pagination
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    var query = {}

    query.limit = limit
    query.skip = skip

    try {
        const blogPostsViews = await BlogPostView.find({ user: req.params.id }, {}, query)

            //sort blogPostsViews by date
            .sort({ createdAt: -1 })
            .populate('blogPost user')

        if (!blogPostsViews) throw Error('No blog posts views found')

        res.status(200).json(blogPostsViews)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})


// @route   GET /api/blogPostsViews/blogPostCategory/:id
// @desc    Get all blog post views by blog post category id
// @access  Public
router.get('/blogPostCategory/:id', async (req, res) => {

    // Pagination
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    var query = {}

    query.limit = limit
    query.skip = skip

    try {
        const blogPostsViews = await BlogPostView.find({ blogPost: { blogPostCategory: req.params.id } }, {}, query)
            //sort blogPostsViews by date
            .sort({ createdAt: -1 })
            .populate('blogPost user')
        if (!blogPostsViews) throw Error('No blog posts views found')
        res.status(200).json(blogPostsViews)
    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// GET VIEWS REPORT BY DAYS
// @route   GET /api/blogPostsViews/days
// @desc    Get all blog post views by days
// @access  Public
router.get('/days', async (req, res) => {

    // Pagination
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    var query = {}

    query.limit = limit
    query.skip = skip

    try {
        const blogPostsViews = await BlogPostView.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    _id: -1
                }
            }
        ])

        if (!blogPostsViews) throw Error('No blog posts views found')

        res.status(200).json(blogPostsViews)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// GET VIEWS REPORT BY DAY NAME 
// @route   GET /api/blogPostsViews/dayName
// @desc    Get all blog post views by day name
// @access  Public
router.get('/dayName', async (req, res) => {

    // Pagination
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    var query = {}

    query.limit = limit
    query.skip = skip

    try {

        const blogPostsViews = await BlogPostView.aggregate([
            {
                $group: {
                    _id: {
                        $dayOfWeek: "$createdAt"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    _id: -1
                }
            }
        ])

        if (!blogPostsViews) throw Error('No blog posts views found')

        res.status(200).json(blogPostsViews)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})


// GET VIEWS REPORT BY HOUR OF DAY
// @route   GET /api/blogPostsViews/hourOfDay
// @desc    Get all blog post views by hour of day
// @access  Public
router.get('/hourOfDay', async (req, res) => {

    // Pagination
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    var query = {}

    query.limit = limit
    query.skip = skip

    try {
        const blogPostsViews = await BlogPostView.aggregate([
            {
                $group: {
                    _id: {
                        $hour: "$createdAt"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    _id: -1
                }
            }
        ])

        if (!blogPostsViews) throw Error('No blog posts views found')
        res.status(200).json(blogPostsViews)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// TODAY'S VIEWS REPORT
// @route   GET /api/blogPostsViews/today
// @desc    Get all blog post views for today
// @access  Public
router.get('/today', async (req, res) => {

    // Pagination
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    var query = {}

    query.limit = limit
    query.skip = skip

    try {
        // ADD 2 HOURS TO GET THE CORRECT DATE IN CAT
        const today = new Date(new Date().getTime() + 2 * 60 * 60 * 1000)
        const todayDate = today.toISOString().split('T')[0]

        const blogPostsViews = await BlogPostView.find({ createdAt: { $gte: todayDate } }, {}, query)
            //sort blogPostsViews by date
            .sort({ createdAt: -1 })
            .populate('blogPost user')

        if (!blogPostsViews) throw Error('No blog posts views found')

        res.status(200).json(blogPostsViews)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})


// THIS WEEK'S VIEWS REPORT FROM MONDAY TO SUNDAY
// @route   GET /api/blogPostsViews/week
// @desc    Get all blog post views for the week
// @access  Public
router.get('/thisWeek', async (req, res) => {

    // Pagination
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    var query = {}

    query.limit = limit
    query.skip = skip

    try {
        // ADD 2 HOURS TO GET THE CORRECT DATE IN CAT
        const today = new Date(new Date().getTime() + 2 * 60 * 60 * 1000)
        const todayDate = today.toISOString().split('T')[0]

        const thisMonday = new Date(today.setDate(today.getDate() - today.getDay() + 1)).toISOString().split('T')[0]

        const thisSunday = new Date(today.setDate(today.getDate() - today.getDay() + 7)).toISOString().split('T')[0]

        const blogPostsViews = await BlogPostView.find({ createdAt: { $gte: thisMonday, $lte: thisSunday } }, {}, query)
            //sort blogPostsViews by date
            .sort({ createdAt: -1 })
            .populate('blogPost user')

        if (!blogPostsViews) throw Error('No blog posts views found')
        res.status(200).json(blogPostsViews)
    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// THIS MONTH'S VIEWS REPORT
// @route   GET /api/blogPostsViews/month
// @desc    Get all blog post views for the month
// @access  Public
router.get('/thisMonth', async (req, res) => {

    // Pagination
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    var query = {}

    query.limit = limit
    query.skip = skip

    try {
        // ADD 2 HOURS TO GET THE CORRECT DATE IN CAT
        const today = new Date(new Date().getTime() + 2 * 60 * 60 * 1000)
        const todayDate = today.toISOString().split('T')[0]

        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]

        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split('T')[0]

        const blogPostsViews = await BlogPostView.find({ createdAt: { $gte: thisMonth, $lte: nextMonth } }, {}, query)

            //sort blogPostsViews by date
            .sort({ createdAt: -1 })
            .populate('blogPost user')

        if (!blogPostsViews) throw Error('No blog posts views found')
        res.status(200).json(blogPostsViews)
    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// THIS YEAR'S VIEWS REPORT
// @route   GET /api/blogPostsViews/year
// @desc    Get all blog post views for the year
// @access  Public
router.get('/thisYear', async (req, res) => {

    // Pagination
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    var query = {}

    query.limit = limit
    query.skip = skip

    try {
        // ADD 2 HOURS TO GET THE CORRECT DATE IN CAT
        const today = new Date(new Date().getTime() + 2 * 60 * 60 * 1000)
        const todayDate = today.toISOString().split('T')[0]
        const thisYear = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
        const nextYear = new Date(today.getFullYear() + 1, 0, 1).toISOString().split('T')[0]

        const blogPostsViews = await BlogPostView.find({ createdAt: { $gte: thisYear, $lte: nextYear } }, {}, query)

            //sort blogPostsViews by date
            .sort({ createdAt: -1 })
            .populate('blogPost user')

        if (!blogPostsViews) throw Error('No blog posts views found')
        res.status(200).json(blogPostsViews)
    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   GET /api/blogPostsViews/:id
// @desc    Get one blog post view
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const blogPostView = await BlogPostView.findById(req.params.id)
            .populate('blogPost user')

        if (!blogPostView) throw Error('No blog post view found')

        res.status(200).json(blogPostView)
    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})



// @route   POST /api/blogPostsViews
// @desc    Save a blog post view 
// @access  Public
router.post("/", async (req, res) => {

    const { blogPost, viewer, device, country } = req.body

    // Simple validation
    if (!blogPost) {
        return res.status(400).json({ msg: "Error! blog post can not be empty!" })
    }

    try {
        const newBlogPostView = new BlogPostView({
            blogPost,
            viewer,
            device,
            country
        })

        const savedBlogPostView = await newBlogPostView.save()

        if (!savedBlogPostView) throw Error('Something went wrong during creation! file size should not exceed 1MB')

        res.status(200).json({
            _id: savedBlogPostView._id,
            blogPost: savedBlogPostView.blogPost,
            viewer: savedBlogPostView.viewer,
            device: savedBlogPostView.device,
            country: savedBlogPostView.country,
        })

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route PUT api/blogPostsViews/:id
// @route UPDATE one blog Post view
// @route Private: Accessed by AUTHORIZATION
router.put('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        //Find the blog Post view by id
        const updatedBlogPostView = await BlogPostView
            .findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })

        res.status(200).json(updatedBlogPostView)

    } catch (error) {
        res.status(400).json({
            msg: 'Failed to update! ' + error.message
        })
    }
})

// @route DELETE api/blogPostsViews/:id
// @route delete a blogPost
// @route Private: Accessed by authorization
router.delete('/:id', authRole(['Admin', 'SuperAdmin']), async (req, res) => {
    try {
        const blogPostView = await BlogPostView.findById(req.params.id)
        if (!blogPostView) throw Error('Blog post view is not found!')

        const removedBlogPostView = await blogPostView.deleteOne()

        if (!removedBlogPostView)
            throw Error('Something went wrong while deleting!')

    } catch (err) {
        res.status(400).json({
            success: false,
            msg: err.message
        })
    }
})

module.exports = router