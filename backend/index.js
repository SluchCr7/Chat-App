const express = require('express');
const {app , server} = require('./config/socket.js')
// const app = express()
const connectDB = require('./config/db.js')
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser');
// Connect to DB
connectDB()

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
    {
        origin: "http://localhost:3000",
        credentials: true,
    }
));
app.use(cookieParser())
// Routes
app.get('/', (req, res) => {
    res.send('API is running...')
})

app.use('/api/auth', require('./Routes/UserRoute.js'))
app.use('/api/message', require('./Routes/MessageRoute.js'))
app.use('/api/notify', require('./Routes/NotifyRoute.js'))
// Start server

server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))