const express = require('express');
const {app , server} = require('./config/socket.js')
// const app = express()
const connectDB = require('./config/db.js')
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser');
const {errorhandler} = require('./middelwares/errorHandler.js')
// Connect to DB
connectDB()

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(cors
    (
        {
            origin: "https://chat-blue-one.vercel.app",
            credentials: true,
        }
    )
);
app.use(express.json());
app.use(cookieParser())


// Routes
app.get('/', (req, res) => {
    res.send('API is running...')
})

app.use('/api/auth', require('./Routes/UserRoute.js'))
app.use('/api/message', require('./Routes/MessageRoute.js'))
app.use('/api/notify', require('./Routes/NotifyRoute.js'))
app.use(errorhandler)
// Start server

server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))