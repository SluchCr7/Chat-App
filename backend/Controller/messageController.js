const { User } = require('../modules/User');
const { Message, validateMessage } = require('../modules/Message');
const { Group } = require('../modules/Group');
const { Channel } = require('../modules/Channel');
const { cloudUpload } = require('../utils/cloudinary');
const fs = require('fs');
const { getReceiverSocketId, io } = require('../config/socket');

// Get all users with presence and details for the sidebar
const getUsersInSideBar = async (req, res) => {
  try {
    const loggedUser = req.user._id;
    const users = await User.find({ _id: { $ne: loggedUser } })
      .select('username profilePic profileName description status isOnline');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages between direct users, group or channel
const getMessages = async (req, res) => {
  try {
    const targetId = req.params.id;
    const sender = req.user._id;
    const { type } = req.query; // "group", "channel" or undefined (direct)

    let query = {};
    if (type === "group") {
      query = { group: targetId };
    } else if (type === "channel") {
      query = { channel: targetId };
    } else {
      // Direct message
      query = {
        $or: [
          { sender, receiver: targetId },
          { sender: targetId, receiver: sender }
        ],
        group: { $exists: false },
        channel: { $exists: false }
      };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username profilePic profileName status')
      .populate('receiver', 'username profilePic profileName status')
      .populate('replyTo')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a new message (text, photos, multiple file attachments, replies)
const sendMessage = async (req, res) => {
  try {
    const { text, replyTo, scheduledAt } = req.body;
    const targetId = req.params.id;
    const sender = req.user._id;
    const { type } = req.query; // "group", "channel" or direct

    const { error } = validateMessage({ text, replyTo, scheduledAt });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Retrieve files from multer fields
    const uploadedPhotos = [];
    const uploadedAttachments = [];

    // Check if we have files in req.files (from photoUpload.fields)
    const files = req.files?.image || [];

    for (const file of files) {
      const result = await cloudUpload(file.path);
      
      // Determine type
      let fileType = "document";
      if (file.mimetype.startsWith("image")) {
        fileType = "image";
        uploadedPhotos.push({
          url: result.secure_url,
          publicId: result.public_id
        });
      } else if (file.mimetype.startsWith("video")) {
        fileType = "video";
      } else if (file.mimetype.startsWith("audio")) {
        // Distinguish voice notes
        fileType = file.originalname.includes("voice-note") ? "voice" : "audio";
      }

      uploadedAttachments.push({
        url: result.secure_url,
        publicId: result.public_id,
        fileType,
        name: file.originalname,
        size: file.size
      });

      // Remove local copy
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    if (!text && uploadedPhotos.length === 0 && uploadedAttachments.length === 0) {
      return res.status(400).json({ message: "Message cannot be empty." });
    }

    const messageData = {
      sender,
      text,
      replyTo: replyTo || undefined,
      scheduledAt: scheduledAt || undefined,
      Photos: uploadedPhotos,
      attachments: uploadedAttachments
    };

    if (type === "group") {
      messageData.group = targetId;
    } else if (type === "channel") {
      messageData.channel = targetId;
    } else {
      messageData.receiver = targetId;
    }

    const message = new Message(messageData);
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username profilePic profileName status')
      .populate('receiver', 'username profilePic profileName status')
      .populate('replyTo');

    // Real-time socket broadcast
    if (type === "group" || type === "channel") {
      // Broadcast to room
      const roomId = `${type}_${targetId}`;
      io.to(roomId).emit("newMessage", populatedMessage);
    } else {
      // Direct message routing
      const receiverSocketId = getReceiverSocketId(targetId);
      const senderSocketId = getReceiverSocketId(sender);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", populatedMessage);
      }
      if (senderSocketId && senderSocketId !== receiverSocketId) {
        io.to(senderSocketId).emit("newMessage", populatedMessage);
      }
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Edit message text
const editMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) return res.status(404).json({ message: "Message not found" });
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized edit action" });
    }

    message.text = text;
    message.isEdited = true;
    await message.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'username profilePic profileName status')
      .populate('receiver', 'username profilePic profileName status');

    // Broadcast update
    const destinationId = message.group || message.channel || message.receiver;
    const type = message.group ? "group" : message.channel ? "channel" : "direct";

    if (type === "direct") {
      const rec = getReceiverSocketId(message.receiver);
      const sen = getReceiverSocketId(message.sender);
      if (rec) io.to(rec).emit("messageUpdated", populated);
      if (sen) io.to(sen).emit("messageUpdated", populated);
    } else {
      io.to(`${type}_${destinationId}`).emit("messageUpdated", populated);
    }

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Validate ownership
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized delete action" });
    }

    const messageId = message._id;
    const destinationId = message.group || message.channel || message.receiver;
    const type = message.group ? "group" : message.channel ? "channel" : "direct";

    await Message.findByIdAndDelete(messageId);

    // Broadcast deletion
    if (type === "direct") {
      const rec = getReceiverSocketId(message.receiver);
      const sen = getReceiverSocketId(message.sender);
      if (rec) io.to(rec).emit("messageDeleted", { messageId });
      if (sen) io.to(sen).emit("messageDeleted", { messageId });
    } else {
      io.to(`${type}_${destinationId}`).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ message: "Message deleted successfully", messageId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add reaction emoji to message
const addReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Remove existing reaction by same user
    message.reactions = message.reactions.filter(r => r.user.toString() !== req.user._id.toString());
    
    // Add new reaction
    message.reactions.push({ user: req.user._id, emoji });
    await message.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'username profilePic profileName status')
      .populate('reactions.user', 'username profilePic');

    const destinationId = message.group || message.channel || message.receiver;
    const type = message.group ? "group" : message.channel ? "channel" : "direct";

    if (type === "direct") {
      const rec = getReceiverSocketId(message.receiver);
      const sen = getReceiverSocketId(message.sender);
      if (rec) io.to(rec).emit("messageUpdated", populated);
      if (sen) io.to(sen).emit("messageUpdated", populated);
    } else {
      io.to(`${type}_${destinationId}`).emit("messageUpdated", populated);
    }

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Pin Message
const togglePinMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.isPinned = !message.isPinned;
    await message.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'username profilePic profileName status');

    const destinationId = message.group || message.channel || message.receiver;
    const type = message.group ? "group" : message.channel ? "channel" : "direct";

    if (type === "direct") {
      const rec = getReceiverSocketId(message.receiver);
      const sen = getReceiverSocketId(message.sender);
      if (rec) io.to(rec).emit("messageUpdated", populated);
      if (sen) io.to(sen).emit("messageUpdated", populated);
    } else {
      io.to(`${type}_${destinationId}`).emit("messageUpdated", populated);
    }

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Star/Unstar Message
const toggleStarMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const isStarred = message.starredBy.includes(req.user._id);
    if (isStarred) {
      message.starredBy = message.starredBy.filter(uid => uid.toString() !== req.user._id.toString());
    } else {
      message.starredBy.push(req.user._id);
    }
    
    await message.save();
    res.status(200).json({ starred: !isStarred, message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all starred messages for user
const getStarredMessages = async (req, res) => {
  try {
    const starred = await Message.find({ starredBy: req.user._id })
      .populate('sender', 'username profilePic profileName status')
      .populate('receiver', 'username profilePic profileName status');
    res.status(200).json(starred);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsersInSideBar,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  togglePinMessage,
  toggleStarMessage,
  getStarredMessages
};
