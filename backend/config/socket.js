const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const server = http.createServer(app);

// Import models for room authorization validation
const { User } = require("../modules/User");
const { Group } = require("../modules/Group");
const { Channel } = require("../modules/Channel");

// Setup socket.io with CORS allowing local dev and configured frontends
const allowedOrigins = [
  process.env.FRONT_URL || 'http://localhost:3000',
  process.env.FRONT_URL_ALT || 'http://localhost:3001',
  'https://chat-blue-one.vercel.app',
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// --- OPTIONAL REDIS ADAPTER HOOK FOR HORIZONTAL SCALING ---
// To use, install packages: npm install redis @socket.io/redis-adapter
if (process.env.REDIS_URL) {
  try {
    const { createClient } = require("redis");
    const { createAdapter } = require("@socket.io/redis-adapter");
    
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();
    
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      console.log("Socket.IO Redis Adapter initialized successfully.");
    }).catch(err => {
      console.error("Socket.IO Redis connection failed:", err);
    });
  } catch (err) {
    console.warn("Redis packages missing. Horizontal scaling adapter not loaded. Run 'npm install redis @socket.io/redis-adapter' to enable.");
  }
}

const userSocketMap = {}; // { userId: socketId }

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// --- JWT AUTHENTICATION MIDDLEWARE ---
// Secures the handshake against user spoofing
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  
  if (!token) {
    console.warn(`Connection rejected: No token provided on socket: ${socket.id}`);
    return next(new Error("Authentication error: Token required"));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    socket.user = decoded; // Contains _id, isAdmin, etc.
    next();
  } catch (err) {
    console.error(`Connection rejected: Invalid JWT on socket: ${socket.id}`, err.message);
    return next(new Error("Authentication error: Invalid or expired token"));
  }
});

io.on("connection", async (socket) => {
  const userId = socket.user?._id;
  if (!userId) {
    return socket.disconnect();
  }

  console.log(`[Socket] Secure connection established. User: ${userId} | Socket: ${socket.id}`);
  userSocketMap[userId] = socket.id;

  try {
    // Update presence in Database
    await User.findByIdAndUpdate(userId, { isOnline: true, status: "online" });
    
    // Broadcast updated online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    
    // Broadcast user status update
    io.emit("userStatusUpdate", { userId, status: "online", isOnline: true });
  } catch (error) {
    console.error("Error setting user online in socket:", error);
  }

  // --- SECURE ROOM-BASED CHAT EVENT HANDLERS ---

  // Join group or channel room securely
  socket.on("joinRoom", async ({ roomId }) => {
    try {
      if (!roomId) return;
      
      const [type, targetId] = roomId.split("_");
      
      if (type === "group") {
        const group = await Group.findById(targetId);
        if (!group) {
          console.warn(`Attempted join of non-existent group: ${targetId}`);
          return;
        }
        
        // Verify user is member of group
        const isMember = group.members.some(m => m.user.toString() === userId.toString());
        if (!isMember) {
          console.warn(`Unauthorized group join attempt by User: ${userId} for Group Room: ${targetId}`);
          return;
        }
      } else if (type === "channel") {
        const channel = await Channel.findById(targetId);
        if (!channel) {
          console.warn(`Attempted join of non-existent channel: ${targetId}`);
          return;
        }
        
        // If channel is private, check direct channel membership
        if (channel.type === "private") {
          const isMember = channel.members.some(m => m.toString() === userId.toString());
          if (!isMember) {
            console.warn(`Unauthorized private channel join attempt by User: ${userId} for Channel: ${targetId}`);
            return;
          }
        } else {
          // Verify membership in parent group
          const group = await Group.findById(channel.group);
          if (!group) {
            console.warn(`Parent group not found for channel: ${targetId}`);
            return;
          }
          const isGroupMember = group.members.some(m => m.user.toString() === userId.toString());
          if (!isGroupMember) {
            console.warn(`Unauthorized public channel join attempt by User: ${userId} for Channel: ${targetId}`);
            return;
          }
        }
      } else {
        console.warn(`Rejected unknown room type: ${roomId}`);
        return;
      }

      socket.join(roomId);
      console.log(`[Socket] Authorized: User ${userId} joined room: ${roomId}`);
    } catch (err) {
      console.error(`Error during joinRoom authorization for ${roomId}:`, err);
    }
  });

  // Leave group or channel room
  socket.on("leaveRoom", ({ roomId }) => {
    socket.leave(roomId);
    console.log(`[Socket] User ${userId} left room: ${roomId}`);
  });

  // --- TYPING INDICATORS ---

  // User starts typing
  socket.on("typingStart", ({ targetId, type, senderName }) => {
    if (type === "group" || type === "channel") {
      const roomId = `${type}_${targetId}`;
      socket.to(roomId).emit("typingStatus", { senderId: userId, senderName, isTyping: true, type, targetId });
    } else {
      const receiverSocketId = getReceiverSocketId(targetId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typingStatus", { senderId: userId, senderName, isTyping: true, type: "direct", targetId: userId });
      }
    }
  });

  // User stops typing
  socket.on("typingStop", ({ targetId, type }) => {
    if (type === "group" || type === "channel") {
      const roomId = `${type}_${targetId}`;
      socket.to(roomId).emit("typingStatus", { senderId: userId, isTyping: false, type, targetId });
    } else {
      const receiverSocketId = getReceiverSocketId(targetId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typingStatus", { senderId: userId, isTyping: false, type: "direct", targetId: userId });
      }
    }
  });

  // --- USER PRESENTATION ACCENTS ---

  // Custom User Status updates (away, busy, invisible, online)
  socket.on("updateCustomStatus", async ({ status }) => {
    try {
      const isOnline = status !== "offline" && status !== "invisible";
      await User.findByIdAndUpdate(userId, { status, isOnline });
      
      io.emit("userStatusUpdate", { userId, status, isOnline });
      console.log(`[Socket] User ${userId} updated status to: ${status}`);
    } catch (err) {
      console.error(err);
    }
  });

  // --- READ & SEEN RECEIPTS ---

  // Mark messages as read/seen
  socket.on("markAsSeen", async ({ messageIds, senderId }) => {
    try {
      const receiverSocketId = getReceiverSocketId(senderId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messagesSeen", { seenBy: userId, messageIds });
      }
    } catch (err) {
      console.error(err);
    }
  });

  // --- DISCONNECT HANDLING ---
  socket.on("disconnect", async () => {
    console.log(`[Socket] User disconnected: ${userId} | Socket: ${socket.id}`);
    delete userSocketMap[userId];

    try {
      // Set to offline in Database
      await User.findByIdAndUpdate(userId, { isOnline: false, status: "offline" });
      
      // Update online counts
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      io.emit("userStatusUpdate", { userId, status: "offline", isOnline: false });
    } catch (err) {
      console.error("Error setting user offline on disconnect:", err);
    }
  });
});

module.exports = { io, app, server, getReceiverSocketId };