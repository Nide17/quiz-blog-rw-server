// Bring in all dependencies
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const config = require('config')
const compression = require('compression')
var expressStaticGzip = require("express-static-gzip")
const cors = require('cors')
const http = require('http')
const { initialize } = require('./utils/socket')

// Initialize express into the app variable
const app = express()

// SOCKET.IO CONNECTION INITIALIZATION
const server = http.createServer(app)
initialize(server)

// compress all responses
app.use(compression())

// Avoid CORS errors
app.use(cors())

// Middlewares 1.Express body parser to access request body and 2. urlencoded to access form data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//DB Config
const dbURI = process.env.MONGO_URI || config.get('mongoURI')
const dbURIscores = process.env.MONGO_URI_SCORES || config.get('mongoURIscores')
const dbURIfeedbacks = process.env.MONGO_URI_FEEDBACKS || config.get('mongoURIfeedbacks')

//connect to databases
function makeNewConnection(uri) {
    const db = mongoose.createConnection(uri)

    db.on('error', function (error) {
        console.log(`MongoDB :: connection ${this.name} ${JSON.stringify(error)}`)
        db.close().catch(() => console.log(`MongoDB :: failed to close connection ${this.name}`))
    })

    db.on('connected', function () {
        mongoose.set('debug', function (col, method, query, doc) {
            // console.log(`MongoDB :: ${this.conn.name} ${col}.${method}(${JSON.stringify(query)},${JSON.stringify(doc)})`)
        })
        console.log(`MongoDB :: connected ${this.name}`)
    })

    db.on('disconnected', function () {
        console.log(`MongoDB :: disconnected ${this.name}`)
    })

    return db
}

//connect to databases
const db = makeNewConnection(dbURI)
const dbScores = makeNewConnection(dbURIscores)
const dbFeedbacks = makeNewConnection(dbURIfeedbacks)

// export the connections
module.exports = { db, dbScores, dbFeedbacks }

// Bring in routes from the api
//Use routes / All requests going to the api/questions goes the questions variable at the top questions.js file
app.use('/api/questions', require('./routes/api/questions'))
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/subscribers', require('./routes/api/subscribers'))
app.use('/api/categories', require('./routes/api/categories'))
app.use('/api/quizes', require('./routes/api/quizes'))
app.use('/api/scores', require('./routes/api/scores'))
app.use('/api/contacts', require('./routes/api/contacts'))
app.use('/api/chatrooms', require('./routes/api/chatrooms'))
app.use('/api/broadcasts', require('./routes/api/broadcasts'))
app.use('/api/downloads', require('./routes/api/downloads'))
app.use('/api/courseCategories', require('./routes/api/courseCategories'))
app.use('/api/courses', require('./routes/api/courses'))
app.use('/api/chapters', require('./routes/api/chapters'))
app.use('/api/notes', require('./routes/api/notes'))
app.use('/api/faqs', require('./routes/api/faqs'))
app.use('/api/quizComments', require('./routes/api/quizComments'))
app.use('/api/questionComments', require('./routes/api/questionComments'))
app.use('/api/statistics', require('./routes/api/statistics'))
app.use('/api/adverts', require('./routes/api/adverts'))

// BlogPosts
app.use('/api/blogPosts', require('./routes/api/blogPosts/blogPosts'))
app.use('/api/postCategories', require('./routes/api/blogPosts/postCategories'))
app.use('/api/imageUploads', require('./routes/api/blogPosts/imageUploads'))
app.use('/api/blogPostsViews', require('./routes/api/blogPosts/blogPostsViews'))

// School API
app.use('/api/schools', require('./routes/api/schools/schools'))
app.use('/api/levels', require('./routes/api/schools/levels'))
app.use('/api/faculties', require('./routes/api/schools/faculties'))

// Feedbacks
app.use('/api/feedbacks', require('./routes/api/feedbacks'))

// Default route
app.use('/', (req, res) => { res.status(200).send('Welcome to Quiz-Blog') })

//Edit for deployment || serve static assets if in production
if (process.env.NODE_ENV === 'production') {

    //Set a static folder for frontend build
    app.use(expressStaticGzip('client/build'))

    //anything coming will be redirected here
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

//port to run on: env when deployed and 4000 locally/cyclic.app
const port = process.env.PORT || 4000

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})