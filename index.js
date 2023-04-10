const { Server, Socket } = require('socket.io');

const io = new Server(8000, {
    cors: true
});

// const io = require("socket.io")(8000, {
//     cors: {
//         origin: "http://192.168.56.1:3000",
//         methods: ["GET", "POST"],
//         credentials: true
//     }
// });

const emailToSocketId = new Map();
const socketidToEmail = new Map();

io.on('connection', (socket) => {

    console.log("Socket Connected ", socket.id);

    socket.on("room:join", (data) => {

        console.log(data);

        const { email, room } = data;

        emailToSocketId.set(email, socket.id);
        socketidToEmail.set(Socket.id, email);

        io.to(room).emit('user:joined', { email, id: socket.id });
        socket.join(room);

        io.to(socket.id).emit('room:join', data);

    })

    // socket.on("room:join", (data) => {

    //     console.log(data);

    //     const { email, room } = data;

    //     // check if any user is already in the room
    //     let usersInRoom = io.sockets.adapter.rooms.get(room);
    //     if (usersInRoom && usersInRoom.size > 0) {
    //         // if users are already in the room, emit their emails to the new user
    //         for (const socketId of usersInRoom) {
    //             io.to(socketId).emit('user:joined', { email: socketidToEmail.get(socketId), id: socketId });
    //             io.to(socket.id).emit('user:joined', { email: socketidToEmail.get(socketId), id: socketId });
    //         }
    //     }

    //     // add the user to the email-to-socketid and socketid-to-email maps
    //     emailToSocketId.set(email, socket.id);
    //     socketidToEmail.set(socket.id, email);

    //     // join the room and emit room:join event
    //     socket.join(room);
    //     io.to(socket.id).emit('room:join', data);
    // });

    socket.on("user:call", ({ to, offer }) => {

        io.to(to).emit("incoming:call", { from: socket.id, offer });

    })

    socket.on("call:accepted", ({ to, ans }) => {

        io.to(to).emit("call:accepted", { from: socket.id, ans });

    })

    socket.on("peer:nego:needed", ({ to, offer }) => {

        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });

    })

    socket.on("peer:nego:done", ({ to, ans }) => {

        io.to(to).emit("peer:nego:final", { from: socket.id, ans });

    })

})