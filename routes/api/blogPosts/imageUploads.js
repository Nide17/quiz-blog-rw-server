const express = require("express")
const router = express.Router()
const config = require('config')
const AWS = require('aws-sdk')
const { authRole } = require('../../../middleware/auth')
const { imgUpload } = require('../utils/imgUpload.js')

const s3Config = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || config.get('AWSAccessKeyId'),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || config.get('AWSSecretKey'),
    Bucket: process.env.S3_BUCKET_IMAGEUPLOADS || config.get('S3ImageUploadsBucket')
})

// ImageUpload Model
const ImageUpload = require('../../../models/blogPosts/ImageUpload')

// @route   GET /api/imageUploads
// @desc    Get all image uploads
// @access  Public
router.get('/', async (req, res) => {

    try {
        const imageUploads = await ImageUpload.find()

            //sort imageUploads by date_created
            .sort({ createdAt: -1 })
            .populate('owner')

        if (!imageUploads) throw Error('No image upload found')
        res.status(200).json(imageUploads)

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route GET api/imageUploads/:id
// @route GET one image upload
// @route Private: accessed by logged in user
router.get('/:id', (req, res) => {

    //Find the imageUpload by id
    ImageUpload.findById(req.params.id)
        .populate('owner')

        //return a promise
        .then(imageUpload => res.json(imageUpload))
        // if id not exist or if error
        .catch(err => res.status(404).json({ success: false }))
})

// @route   GET /api/imageUploads/owner/:id
// @desc    Get imageUploads by owner
// @access  Needs to private
router.get('/owner/:id', async (req, res) => {

    //Find the image uploads by owner
    ImageUpload.find({ owner: req.params.id })
        .populate('owner')

        //return a promise
        .then(imageUploads => res.json(imageUploads))
        // if id not exist or if error
        .catch(err => res.status(400).json({ success: false }))

})

// @route   POST /api/imageUploads
// @desc    Create image upload
// @access  Have to be private
router.post("/", authRole(['Creator', 'Admin']), imgUpload.single("uploadImage"), async (req, res) => {
    const { imageTitle, owner } = req.body

    // Simple validation
    if (!imageTitle || !owner) {
        return res.status(400).json({ msg: imageTitle })
    }

    if (!req.file) {
        //If the file is not uploaded, then throw custom error with message: FILE_MISSING
        throw Error('FILE_MISSING')
    }

    else {
        //If the file is uploaded
        const imgUp_file = req.file

        try {
            const imgUp = await ImageUpload.findOne({ imageTitle })
            if (imgUp) throw Error('Failed! Image with that name already exists!')

            const newImgUp = new ImageUpload({
                imageTitle,
                uploadImage: imgUp_file.location,
                owner
            })

            const savedImgUp = await newImgUp.save()

            if (!savedImgUp) throw Error('Something went wrong during creation! file size should not exceed 1MB')

            res.status(200).json({
                _id: savedImgUp._id,
                imageTitle: savedImgUp.imageTitle,
                uploadImage: savedImgUp.uploadImage,
                owner: savedImgUp.owner,
                createdAt: savedImgUp.createdAt,
            })

        } catch (err) {
            res.status(400).json({ msg: err.message })
        }
    }
})

// @route PUT /api/imageUploads/:id
// @route UPDATE one imageUpload
// @route Private: Accessed by admin only
router.put('/:id', authRole(['Creator', 'Admin']), async (req, res) => {

    try {
        //Find the imageUp by id
        const updatedImgUpload = await ImageUpload.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(updatedImgUpload)

    } catch (error) {
        res.status(400).json({
            msg: 'Failed to update! ' + error.message
        })
    }
})

// @route DELETE /api/imageUploads/:id
// @route delete a image upload
// @route Private: Accessed by admin only
router.delete('/:id', authRole(['Creator', 'Admin']), async (req, res) => {

    try {
        const imageUpload = await ImageUpload.findById(req.params.id)
        if (!imageUpload) throw Error('Image upload is not found!')

        if (imageUpload.uploadImage) {
            const params = {
                Bucket: process.env.S3_BUCKET_IMAGEUPLOADS || config.get('S3ImageUploadsBucket'),
                Key: imageUpload.uploadImage.split('/').pop() //if any sub folder-> path/of/the/folder.ext
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
                res.status(400).json({
                    msg: 'Failed to delete! ' + error.message,
                    success: false
                })
            }
        }

        const removedImageUpload = await ImageUpload.deleteOne()

        if (!removedImageUpload)
            throw Error('Something went wrong while deleting!')

    } catch (err) {
        res.status(400).json({
            success: false,
            msg: err.message
        })
    }

})

module.exports = router