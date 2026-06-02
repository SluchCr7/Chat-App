const express = require('express');
const path = require('path');
// const app = express()
const connectDB = require('./config/db.js')
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.js');
const {app , server} = require('./config/socket.js')
const {errorhandler} = require('./middelwares/errorHandler.js')

// Connect to DB
connectDB().then(() => {
    const { runMigration } = require("./utils/migration.js");
    runMigration();
});

// Middlewares
app.use(express.urlencoded({ extended: true }));
// Allow requests from the frontend origins (local dev and optional alternate)
const allowedOrigins = [
    process.env.FRONT_URL || 'http://localhost:3000',
    process.env.FRONT_URL_ALT || 'http://localhost:3001',
];

app.use(cors({
    origin: (origin, callback) => {
        // allow non-browser requests like curl/postman (no origin)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Chat Backend API Docs',
    customCssUrl: '/swagger-custom.css',
    swaggerOptions: {
        persistAuthorization: true,
        defaultModelsExpandDepth: -1,
        docExpansion: 'list',
        operationsSorter: 'alpha',
    },
}))

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.use('/api/auth', require('./Routes/UserRoute.js'))
app.use('/api/message', require('./Routes/MessageRoute.js'))
app.use('/api/messages', require('./Routes/MessagesRoute.js'))
app.use('/api/notify', require('./Routes/NotifyRoute.js'))
app.use('/api/group', require('./Routes/GroupRoute.js'))
app.use('/api/admin', require('./Routes/AdminRoute.js'))
app.use('/api/contacts', require('./Routes/ContactRoute.js'))
app.use('/api/conversations', require('./Routes/ConversationRoute.js'))
app.use(errorhandler)
// Start server

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));