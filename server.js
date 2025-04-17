import express from "express"
import cors from 'cors'
import 'dotenv/config'
import { Server } from "socket.io"
import http from "http"
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"
import bookingRouter from "./routes/bookingRoute.js"

// app config
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*"
  }
})

// Make io instance available to routes
app.set('io', io)

const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/bookings", bookingRouter)

// Real-time updates
io.on('connection', socket => {
  console.log('New socket connection:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("API Working")
});

server.listen(port, () => console.log(`Server started on PORT:${port}`))