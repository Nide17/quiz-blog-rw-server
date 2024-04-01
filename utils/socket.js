const socketIO = require('socket.io');

let io = null;
let onlineUsers = []

module.exports = {

    initialize: (httpServer) => {

        // initialize socket.io
        io = socketIO(httpServer, { cors: { origin: "*" } });

        // on connection
        io.on('connection', (socket) => {
            console.log('New client connected with id = ', socket.id);

            // Listen for 'newUserConnected' event
            socket.on('newUserConnected', ({ _id, name, email }) => {

                console.log("New user connected: ", name, email, _id);

                // Update the list of users when a new user connects to the server
                onlineUsers.push({ socketID: socket.id, _id, name, email });
                io.emit('newUserOnline', onlineUsers);
            });


            // Catch the emitted message from client
            socket.on('contactMsgClient', (contactMsg) => {
                // Send message back to all except current user
                socket.broadcast.emit("contactMsgServer", contactMsg)
            })

            // Typing - sending to all except current user
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




            // on disconnect
            socket.on('disconnect', (reason) => {
                console.log('A client disconnected with id = ', socket.id, " reason ==> ", reason);

                // Remove user from online list
                onlineUsers = onlineUsers.filter(user => user.socketID !== socket.id);
                io.emit('userOffline', onlineUsers);
            });
        });
    },

    // get the socket.io instance
    getInstance: () => {
        return io;
    }
};
