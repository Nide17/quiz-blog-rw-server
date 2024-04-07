const socketIO = require('socket.io');

let io = null;
let onlineUsers = []

exports.initialize = (httpServer) => {
    io = socketIO(httpServer, { cors: { origin: "*" } });

    io.on('connection', (socket) => {

        // Listen for 'newUserConnected' event
        socket.on('newUserConnected', ({ _id, name, email }) => {
            console.log("New user connected: ", name, email, _id);

            // Update the list of users when a new user connects to the server
            if (onlineUsers.find(user => user.email === email)) {
                onlineUsers = onlineUsers.filter(user => user.email !== email);
            }
            onlineUsers.push({ socketID: socket.id, _id, name, email });
            io.emit('newUserOnline', {onlineUsers, new_user: {name, email}})
        });

        socket.on('newReply', (data) => {
            data.reply_date = new Date()
            io.emit('replyReceived', data)
        })

        // Catch the emitted message from client
        socket.on('contactMsgClient', (contactMsg) => {
            // Send message back to all except current user
            socket.broadcast.emit("contactMsgServer", contactMsg)
        })

        // CHATTING ROOM - Add a user to a room
        socket.on('join_room', ({ username, roomName }) => {
            console.log(`${username} joined room: ${roomName}`);
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

        socket.on('disconnect', (reason) => {
            console.log('A client disconnected with id = ', socket.id, " reason ==> ", reason)
        })
    })
    return io;
}

exports.getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
}

exports.getOnlineUsers = () => {
    return onlineUsers;
}
exports.addOnlineUser = (user) => {
    onlineUsers.push(user);
}
exports.removeOnlineUser = (socketID) => {
    onlineUsers = onlineUsers.filter(user => user.socketID !== socketID);
}
exports.getOnlineUser = (socketID) => {
    return onlineUsers.find(user => user.socketID === socketID);
}
exports.getOnlineUserByEmail = (email) => {
    return onlineUsers.find(user => user.email === email);
}
exports.getOnlineUserById = (id) => {
    return onlineUsers.find(user => user._id === id);
}