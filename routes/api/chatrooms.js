const express = require("express")
const router = express.Router()

// auth middleware to protect routes
const { auth } = require('../../middleware/authMiddleware')

const ChatRoom = require('../../models/chatRooms/ChatRoom')
const RoomMessage = require('../../models/chatRooms/RoomMessage')

// @route   GET /api/chatrooms
// @desc    Get chatrooms and messages
// @access  Public
router.get('/', async (req, res) => {
    res.status(200).json("This route is for chat rooms and chat rooms messages")
})


// @route   GET /api/chatrooms/rooms
// @desc    Get chatrooms
// @access  Private
router.get('/rooms', auth, async (req, res) => {

    try {
        const chatrooms = await ChatRoom.find()
            //sort chatrooms by createdAt
            .sort({ createdAt: -1 })
            .populate('users')

        if (!chatrooms) throw Error('No chatrooms found')

        res.status(200).json(chatrooms)

    } catch (err) {
        res.status(400).json({ msg: err.answer })
    }
})

// @route   GET /api/chatrooms/messages
// @desc    Get chatroom messages
// @access  Private
router.get('/messages', auth, async (req, res) => {

    try {
        const roomMessages = await RoomMessage.find()
            //sort roomMessages by createdAt
            .sort({ createdAt: -1 })
            .populate('sender receiver', '_id role name email')

        if (!roomMessages) throw Error('No room messages found')

        res.status(200).json(roomMessages)

    } catch (err) {
        res.status(400).json({ msg: err.answer })
    }
})


// @route   GET /api/chatrooms/messages/:id
// @desc    Get message
// @access  Private
router.get('/messages/:id', auth, async (req, res) => {

    //Find the room by id
    RoomMessage.findById(req.params.id)
        //return a promise
        .then(chatMessage => res.json(chatMessage))
        // if id not exist or if error
        .catch(err => res.status(404).json({ success: false }))
})


// @route POST api/chatrooms/rooms
// @route Create a room
// @route Private
router.post("/rooms", auth, async (req, res) => {

    const { name, users } = req.body

    // Simple validation
    if (!name || !users) {
        return res.status(400).json({ msg: 'Empty fields' })
    }

    try {
        const newRoom = new ChatRoom({ name, users })

        const savedRoom = await newRoom.save()
        if (!savedRoom) throw Error('Something went wrong during creation!')

        res.status(200).json({
            _id: savedRoom._id,
            name: savedRoom.name,
            users: savedRoom.users
        })

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route POST api/chatrooms/rooms/
// @route Create and/or enter a room - return it
// @route Private
router.post("/rooms/room/:roomNameToOpen", auth, async (req, res) => {

    const name = req.params.roomNameToOpen

    // Search if the chat room is already existing
    const chatroom = await ChatRoom.findOne({ name }).populate('users')

    // If yes, return the chat room
    if (chatroom) {
        res.status(200).json(chatroom)
    }

    // else create a new chat room
    else {

        // Simple validation
        const { users } = req.body
        if (!users || users.length < 2) {
            return res.status(400).json({ msg: 'No room users provided' })
        }

        try {
            const newRoom = new ChatRoom({ name, users })

            const savedRoom = await newRoom.save()
            if (!savedRoom) throw Error('Something went wrong during creation!')

            const createdChatroom = await ChatRoom.findById({ _id: savedRoom._id }).populate('users')

            res.status(200).json(createdChatroom)

        } catch (err) {
            res.status(400).json({ msg: err.message })
        }
    }
})


// @route   GET /api/chatrooms/messages/:roomID
// @desc    Get chat room messages
// @access  Private
router.get('/messages/room/:roomID', auth, async (req, res) => {

    //Find the room by id
    RoomMessage.find({ room: req.params.roomID })
        //return a promise
        .then(chatMessages => res.json(chatMessages))
        // if id not exist or if error
        .catch(err => res.status(404).json({ success: false }))
})


// @route POST api/chatrooms/messages
// @route Create a message
// @route Private
router.post("/messages", auth, async (req, res) => {

    const { senderID, senderName, receiverID, content, roomID } = req.body

    // Simple validation
    if (!senderID || !receiverID || !content || !roomID) {
        return res.status(400).json({ msg: 'Empty fields' })
    }

    try {
        const newRoomMessage = new RoomMessage({
            sender: senderID,
            receiver: receiverID,
            content,
            room: roomID
        })

        const savedMessage = await newRoomMessage.save()
        if (!savedMessage) throw Error('Something went wrong during creation!')

        res.status(200).json({
            _id: savedMessage._id,
            sender: savedMessage.sender,
            receiver: savedMessage.receiver,
            content: savedMessage.content,
            room: savedMessage.room,
            createdAt: savedMessage.createdAt,
            senderName,
        })

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

module.exports = router