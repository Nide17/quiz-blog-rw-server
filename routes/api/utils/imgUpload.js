const config = require('config')
const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')

const s3Config = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || config.get('AWSAccessKeyId'),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || config.get('AWSSecretKey'),
    Bucket: process.env.S3_BUCKET_IMAGEUPLOADS || config.get('S3ImageUploadsBucket')
})

const fileFilter = (req, file, callback) => {

    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/svg']

    if (allowedFileTypes.includes(file.mimetype)) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}

// Uploading image locally if multer is working.
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './]imageUploads')
    },
    filename: (req, file, callback) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-').replace(/[^a-zA-Z0-9.]/g, '-')
        callback(null, req.params.id + '-' + fileName)
    }
})

// Uploading image to aws
const multerS3Config = multerS3({
    s3: s3Config,
    bucket: process.env.S3_BUCKET_IMAGEUPLOADS || config.get('S3ImageUploadsBucket'),
    metadata: (req, file, callback) => {
        callback(null, { fieldName: file.fieldname })
    },
    key: (req, file, callback) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-').replace(/[^a-zA-Z0-9.]/g, '-')
        callback(null, req.params.id + '-' + fileName)
    }
})

const upload = multer({
    storage: multerS3Config,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2000000 // 1000000 Bytes = 1 MB (2MB)
    }
})

exports.imgUpload = upload