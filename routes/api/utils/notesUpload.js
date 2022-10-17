const config = require('config')
const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')

const s3Config = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || config.get('AWSAccessKeyId'),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || config.get('AWSSecretKey'),
    Bucket: process.env.S3_BUCKET_NOTES || config.get('S3NotesBucket')
})

const fileFilter = (req, file, callback) => {

    const allowedFileTypes = ['application/pdf', 'application/x-pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', '']

    if (allowedFileTypes.includes(file.mimetype)) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}

// Uploading file locally if multer is working.
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './notes')
    },
    filename: (req, file, callback) => {
        const fileName = file.originalname.toUpperCase().split(' ').join('-').replace(/[^a-zA-Z0-9.]/g, '-')
        callback(null, fileName.replace(/\./g, '-[Shared by QuizBlog].'))
    }
})

// Uploading file to aws
const multerS3Config = multerS3({
    s3: s3Config,
    bucket: process.env.S3_BUCKET_NOTES || config.get('S3NotesBucket'),
    metadata: (req, file, callback) => {
        callback(null, { fieldName: file.fieldname })
    },
    key: (req, file, callback) => {
        const fileName = file.originalname.toUpperCase().split(' ').join('-').replace(/[^a-zA-Z0-9.]/g, '-')
        callback(null, fileName.replace(/\./g, '-[Shared by QuizBlog].'))
    }
})

const upload = multer({
    storage: multerS3Config,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50000000 // 1000000 Bytes = 1 MB (50MB)
    }
})

exports.notesUpload = upload