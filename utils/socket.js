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

            // Listen for 'userConnected' event
            socket.on('userConnected', (userId) => {
                console.log('User connected with id = ', userId);
            });

            // Receiving message from the client
            socket.on('frontJoinedUser', ({ user_id, email, username, role }) => {

                onlineUsers.push({ socketID: socket.id, user_id, email, username, role });
                console.log("Joined user:")

                console.log(JSON.stringify({ user_id, email, username, role }));
                console.log('Online users:' + onlineUsers.length);

                console.log(JSON.stringify(onlineUsers))

                // Sending message from the server to all the clients except the current user
                socket.broadcast.emit('backJoinedUser', onlineUsers[onlineUsers.length - 1]);

                console.log('Joined last:');
                console.log(JSON.stringify(onlineUsers[onlineUsers.length - 1]))

                // Sending a list of online users to all the clients including sender
                io.emit('onlineUsersList', onlineUsers);
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

            // Listen for 'userDisconnected' event
            socket.on('userDisconnected', (userId) => {
                console.log('User disconnected with id = ', userId);
            });

            // on disconnect
            socket.on('disconnect', (reason) => {
                console.log('A client disconnected with id = ', socket.id, " reason ==> ", reason);


                //Updates the list of users when a user disconnects from the server
                onlineUsers = onlineUsers.filter((user) => user.socketID !== socket.id);

                //Sends the list of users to the client
                io.emit('onlineUsersList', onlineUsers);
            });
        });
    },

    // get the socket.io instance
    getInstance: () => {
        return io;
    }
};
