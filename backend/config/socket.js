const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const { User } = require("../modules/User");

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

const userSocketMap = {}; // { userId: socketId }

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId || userId === "undefined") {
    return socket.disconnect();
  }

  console.log("A user connected:", userId, socket.id);
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

  // --- ROOM-BASED CHAT EVENT HANDLERS ---

  // Join group or channel room
  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  // Leave group or channel room
  socket.on("leaveRoom", ({ roomId }) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room: ${roomId}`);
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
      console.log(`User ${userId} updated status to: ${status}`);
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
    console.log("A user disconnected:", userId, socket.id);
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