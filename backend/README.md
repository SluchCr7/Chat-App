# 🖥️ Chat App Backend Service

This is the real-time server and REST API powering the Chat Application. Built with **Node.js**, **Express**, **Socket.io**, and **MongoDB (Mongoose)**, it provides a secure, robust foundation with support for WebSocket authentication, read receipts, custom statuses, group/channel management, media uploads, and horizontal scaling.

---

## 🛠 Backend Tech Stack
*   **Express.js**: REST API server middleware and route handling.
*   **Socket.io**: Real-time bidirectional communication.
*   **MongoDB & Mongoose**: Object Data Modeling (ODM) for database management.
*   **Cloudinary**: Remote storage for media assets (images, avatars).
*   **JSON Web Tokens (JWT)**: Secure user session validation (Access + Refresh tokens).
*   **Redis** (Optional): Event distribution adapter for scaling socket connections horizontally across multiple server instances.
*   **Swagger-UI-Express**: Automatically compiled OpenAPI 3.0 API docs.

---

## 📂 Folder Layout

```yaml
backend/
├── config/                  # Core Service Configurations
│   ├── db.js                # Mongoose / MongoDB Database connection
│   ├── socket.js            # Secure Socket.io event loop setup
│   └── swagger.js           # Swagger JSDoc/OpenAPI spec compiler
├── Controller/              # REST Controller Request Handlers
│   ├── AdminController.js
│   ├── AuthController.js
│   ├── ContactController.js
│   ├── GroupController.js
│   └── MessageController.js
├── docs/                    # OpenAPI Documentation Schemas
│   ├── components/          # Swagger schemas & response codes
│   ├── examples/            # Payload models for requests
│   └── security/            # Security scheme policies
├── middelwares/             # Express middlewares
│   ├── authMiddleware.js    # JWT authorization validator
│   ├── errorHandler.js      # Global error catcher
│   └── uploadMiddleware.js  # Multer configuration for file uploads
├── modules/                 # Mongoose Database Models
│   ├── User.js              # User auth, settings, and profile schemas
│   ├── Message.js           # Conversation message schemas
│   ├── Group.js             # Team/Workspace properties
│   └── Channel.js           # Group subchannel schemas
├── Routes/                  # REST Endpoint Router Mapping
└── utils/                   # Migration scripts and helper libraries
```

---

## 🔌 Core WebSocket Events (`config/socket.js`)

The Socket.io gateway secures connection handshakes with JWT verification and handles the following main event signals:

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| **`connection`** | Incoming | Handshake Token | Verifies JWT. Connects and broadcasts status updates. |
| **`joinRoom`** | Incoming | `{ roomId }` | Authorizes and joins user to a direct, group, or channel room. |
| **`leaveRoom`** | Incoming | `{ roomId }` | Disconnects the socket from a specific room thread. |
| **`typingStart`** | Incoming | `{ targetId, type, senderName }` | Triggers "User is typing..." for the receiver or room. |
| **`typingStop`** | Incoming | `{ targetId, type }` | Stops the typing feedback indicator. |
| **`markAsSeen`** | Incoming | `{ messageIds, senderId }` | Updates message read status and broadcasts seen receipts. |
| **`updateCustomStatus`**| Incoming | `{ status }` | Updates presence state (online, away, busy, invisible, offline). |
| **`userStatusUpdate`** | Outgoing | `{ userId, status, isOnline }` | Broadcasted to notify other users of status changes. |

---

## 🗄️ Database Migrations

On startup (`index.js`), the application connects to MongoDB and runs automated schema migration tasks located in `utils/migration.js`. This guarantees that collections, system parameters, and index requirements are kept up-to-date programmatically.

---

## 🚀 Setup & Execution

### 1. Configure Environments
Create a `.env` file in the `backend/` directory:
```env
MONGO_URI=mongodb://your-mongo-url
PORT=3001
ACCESS_TOKEN_SECRET=your-access-secret
REFRESH_TOKEN_SECRET=your-refresh-secret
CLOUDINARY_NAME=your-cloudinary-name
API_KEY=your-cloudinary-api-key
API_SECRET_KEY=your-cloudinary-secret
FRONT_URL=http://localhost:3000
# Optional: REDIS_URL=redis://localhost:6379
```

### 2. Install & Run
```bash
# Install packages
npm install

# Start server (with nodemon hot reloading)
npm start
```

---

## 📚 API Testing
Once the server is running, navigate to `http://localhost:3001/api-docs` to access the interactive Swagger interface. There, you can try endpoints directly by supplying your authorization bearer token.
