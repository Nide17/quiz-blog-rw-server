// Bring in all dependencies
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const config = require('config')
const compression = require('compression')
var expressStaticGzip = require("express-static-gzip")
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')

// Initialize express into the app variable
const app = express()

// compress all responses
app.use(compression())

// Avoid CORS errors
app.use(cors())

// Middlewares 1.Express body parser to access request body and 2. urlencoded to access form data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//DB Config
const dbURI = process.env.MONGO_URI || config.get('mongoURI')

//connect to Mongo
const connectDB = async () => {
    await mongoose.
        connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        .then(() => console.log('MongoDB connected ...'),
            err => {
                console.error(`Connection error: ${err.stack}`)
                process.exit(1)
            }
        )
}

connectDB().catch(err => console.error(err))


// Bring in routes from the api
//Use routes / All requests going to the api/questions goes the questions variable at the top questions.js file
app.use('/api/questions', require('./routes/api/questions'))
app.use('/api/users', require('./routes/api/users'))
app.use('/api/logs', require('./routes/api/logs'))
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
// app.use('/api/challenges', require('./routes/api/challenges'))
app.use('/api/challengeQuestions', require('./routes/api/challenges/challengeQuestions'))
app.use('/api/challengeQuizzes', require('./routes/api/challenges/challengeQuizzes'))
app.use('/api/challengeScores', require('./routes/api/challenges/challengeScores'))
app.use('/api/statistics', require('./routes/api/statistics'))
app.use('/api/adverts', require('./routes/api/adverts'))

// BlogPosts
app.use('/api/blogPosts', require('./routes/api/blogPosts/blogPosts'))
app.use('/api/postCategories', require('./routes/api/blogPosts/postCategories'))
app.use('/api/imageUploads', require('./routes/api/blogPosts/imageUploads'))

// School API
app.use('/schoolsapi/schools', require('./routes/api/schoolsapi/schools'))
app.use('/schoolsapi/levels', require('./routes/api/schoolsapi/levels'))
app.use('/schoolsapi/faculties', require('./routes/api/schoolsapi/faculties'))
// app.use('/', (req, res) => { res.status(200).send('Welcome to Quiz Blog') })

//Edit for deployment || serve static assets if in production
if (process.env.NODE_ENV === 'production') {

    //Set a static folder for frontend build
    app.use(expressStaticGzip('client/build'))

    //anything coming will be redirected here
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
    //Let's create a post build script in package.json
}

//port to run on: env when deployed and 4000 locally/cyclic.app
const port = process.env.PORT || 4000

const server = http.createServer(app);

// Create an io server and allow for CORS from http://localhost:3000 with GET and POST methods
const io = new Server(server, {
    cors: {
        // both http://localhost:3000 and quizblog.rw are allowed
        origin: ['http://localhost:3000', 'http://localhost:4000', 'https://quizblog.rw', 'https://www.quizblog.rw', 'http://quizblog.rw', 'http://www.quizblog.rw'],
        methods: ['GET', 'POST']
    },
});

var onlineUsers = []

// Listen for when the client connects via socket.io - client
io.on('connection', (socket) => {
    console.log(`User connected ${socket.id}`);

    // Receiving message from the client
    socket.on('frontJoinedUser', ({ user_id, email, username, role }) => {

        onlineUsers.push({ socketID: socket.id, user_id, email, username, role });
        console.log("Joined user:")
        console.log(JSON.stringify({ user_id, email, username, role }));
        console.log('Online users:' + onlineUsers.length);
        console.log(JSON.stringify(onlineUsers))

        // Sending message from the server to all the clients except the current client user
        socket.emit('backJoinedUser', onlineUsers[onlineUsers.length - 1]);

        console.log('Joined last:');
        console.log(JSON.stringify(onlineUsers[onlineUsers.length - 1]))

        // Sending a list of online users
        io.emit('onlineUsersList', onlineUsers);
    });

    // Typing
    socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));

    // Logging the reply message
    socket.on('reply', (data) => {
        io.emit('backReply', data);
    });


    // CHATTING ROOM
    // Add a user to a room
    socket.on('join_room', (data) => {
        const { username, roomName } = data; // sent from client when join_room event emitted
        socket.join(roomName); // Join the user to a room

        // Send message to all users currently in the room, apart from the user that just joined
        socket.to(roomName).emit('welcome_room_message', {
            message: `${username} has joined the chat room`,
            username
        });

        // Send welcome msg to user that just joined chat only
        socket.emit('welcome_room_message', {
            message: `Welcome ${username}`,
            username
        });

        // Send Messages inside chat room
        socket.on('room_message', (data) => {
            io.in(roomName).emit('backRoomMessage', data);
        })

    });

    // Sending message when the client disconnects
    socket.on('disconnect', () => {
        console.log('A user disconnected ' + socket.id);

        //Updates the list of users when a user disconnects from the server
        onlineUsers = onlineUsers.filter((user) => user.socketID !== socket.id);

        //Sends the list of users to the client
        io.emit('onlineUsersList', onlineUsers);
    });
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});