const express = require('express');
const app = express();
const UserRoutes = require('./routers/userRoutes')
const mongoose = require('mongoose')
require('dotenv').config()
const cors = require('cors')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')

// app.use(cors())
// app.options("*", cors()); // allow preflight for all routes
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));



app.use(express.json());

// ✅ Serve both upload folders (Posts + Profiles)
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));
app.use("/Uploads_Profile", express.static(path.join(__dirname, "Uploads_Profile")));


mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("MongoDB Connected to SocialMediaApp__Circle")
    })
    .catch((err) => {
        console.log("MongoDB Error---- ", err.message)
    })


app.use('/user', UserRoutes)


// socket.io connecting to server.

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
})

io.on('connection', (socket) => {
    // console.log(socket.id)
    // socket.on('like' , (data) => {
    //     console.log(data)
    //     socket.broadcast.emit('like_response' , "Mian Muhammad Taha")
    // })
    socket.on("join_room", (userId) => {
        console.log("User joined room:", userId);
        socket.join(userId.toString()); // <-- crucial
    });
})
// global kia hai tak is ko ham controller ma ya jahana bhi socket ki zaroorat hai wahan use kar sakain
app.set("io", io)

const port = process.env.PORT;
server.listen(port, () => {
    console.log(`Your Server is Running on Port ${port} `)
})
module.exports = { io, app }