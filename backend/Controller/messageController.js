const { User } = require('../modules/User');
const { Message, validateMessage } = require('../modules/Message');
const { Group } = require('../modules/Group');
const { Channel } = require('../modules/Channel');
const { Conversation } = require('../modules/Conversation');
const { UnreadCounter } = require('../modules/UnreadCounter');
const { cloudUpload } = require('../utils/cloudinary');
const fs = require('fs');
const { io } = require('../config/socket');
const asyncHandler = require('express-async-handler');

// Get all users for global contact additions
const getUsersInSideBar = asyncHandler(async (req, res) => {
    const loggedUser = req.user._id;
    // Query users that are not the current user and not blocked by the current user
    const me = await User.findById(loggedUser);
    const blockedByMe = me.blockedUsers || [];

    const users = await User.find({
        _id: { $ne: loggedUser, $nin: blockedByMe }
    })
    .select('username profilePic profileName description status isOnline');

    res.status(200).json(users);
});

// Get messages between direct users, group or channel
const getMessages = asyncHandler(async (req, res) => {
    const targetId = req.params.id; // could be conversationId, recipientId, groupId, or channelId
    const sender = req.user._id;
    const { type } = req.query; // "group", "channel" or "direct"

    let query = {};
    if (type === "group") {
        query = { group: targetId };
    } else if (type === "channel") {
        query = { channel: targetId };
    } else {
        // Direct messages: support fetching by conversationId or recipientId
        const isConversation = await Conversation.exists({ _id: targetId });
        if (isConversation) {
            query = { conversation: targetId };
        } else {
            // Find or create conversation with recipientId
            let conv = await Conversation.findOne({
                participants: { $all: [sender, targetId] }
            });
            if (!conv) {
                conv = new Conversation({
                    participants: [sender, targetId]
                });
                await conv.save();
            }
            query = { conversation: conv._id };
        }
    }

    // Support pagination
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find(query)
        .populate('sender', 'username profilePic profileName status')
        .populate('receiver', 'username profilePic profileName status')
        .populate('replyTo')
        .populate('seenBy.user', 'username profilePic')
        .sort({ createdAt: -1 }) // Sort DESC for pagination
        .skip(skip)
        .limit(Number(limit));

    // Reverse to chronological order for client display
    res.status(200).json(messages.reverse());
});

// Send a new message (text, photos, multiple file attachments, replies)
const sendMessage = asyncHandler(async (req, res) => {
    const { text, replyTo, scheduledAt } = req.body;
    const targetId = req.params.id; // could be recipientId, groupId, or channelId
    const sender = req.user._id;
    const { type } = req.query; // "group", "channel" or direct

    const { error } = validateMessage({ text, replyTo, scheduledAt });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Retrieve files from multer fields
    const uploadedPhotos = [];
    const uploadedAttachments = [];
    const files = req.files?.image || [];

    for (const file of files) {
        const result = await cloudUpload(file.path);
        
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
            fileType = file.originalname.includes("voice-note") ? "voice" : "audio";
        }

        uploadedAttachments.push({
            url: result.secure_url,
            publicId: result.public_id,
            fileType,
            name: file.originalname,
            size: file.size
        });

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

    let conv = null;
    let isNewConv = false;

    if (type === "group") {
        messageData.group = targetId;
        const group = await Group.findById(targetId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        // Update group activity
        group.lastActivity = Date.now();
        await group.save();

        // Increment unread counter for other members
        const otherMembers = group.members
            .map(m => m.user.toString())
            .filter(id => id !== sender.toString());

        await Promise.all(otherMembers.map(async (uid) => {
            await UnreadCounter.findOneAndUpdate(
                { user: uid, group: targetId },
                { $inc: { unreadCount: 1 } },
                { upsert: true }
            );
        }));
    } else if (type === "channel") {
        messageData.channel = targetId;
        const channel = await Channel.findById(targetId);
        if (!channel) return res.status(404).json({ message: "Channel not found" });
    } else {
        // Direct message
        messageData.receiver = targetId;

        // Block verification
        const recipientUser = await User.findById(targetId);
        if (!recipientUser) return res.status(404).json({ message: "Recipient user not found" });

        const isBlocked = recipientUser.blockedUsers?.includes(sender);
        if (isBlocked) {
            return res.status(403).json({ message: "You are blocked by this user." });
        }

        // Find or create conversation
        conv = await Conversation.findOne({
            participants: { $all: [sender, targetId] }
        });

        if (!conv) {
            conv = new Conversation({
                participants: [sender, targetId]
            });
            await conv.save();
            isNewConv = true;
        }

        messageData.conversation = conv._id;

        // Increment recipient unread counter
        await UnreadCounter.findOneAndUpdate(
            { user: targetId, conversation: conv._id },
            { $inc: { unreadCount: 1 } },
            { upsert: true }
        );
    }

    const message = new Message(messageData);
    await message.save();

    // Link last message to Conversation if direct
    if (conv) {
        conv.lastMessage = message._id;
        conv.lastActivity = Date.now();
        await conv.save();
    }

    const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username profilePic profileName status')
        .populate('receiver', 'username profilePic profileName status')
        .populate('replyTo');

    // --- Real-time Socket Broadcasts ---
    if (type === "group" || type === "channel") {
        const roomId = `${type}_${targetId}`;
        io.to(roomId).emit("newMessage", populatedMessage);
        
        // Notify all group members of update
        const group = await Group.findById(targetId);
        group.members.forEach(m => {
            io.to(`user_${m.user}`).emit("conversation:updated", { type: "group", groupId: targetId, lastMessage: populatedMessage });
        });
    } else {
        // Multi-tab direct message routing
        io.to(`user_${targetId}`).emit("newMessage", populatedMessage);
        io.to(`user_${sender}`).emit("newMessage", populatedMessage);

        const senderData = await User.findById(sender).select("username profileName profilePic status");
        const recipientData = await User.findById(targetId).select("username profileName profilePic status");

        // Sync Sidebar real-time conversation updates
        if (isNewConv) {
            io.to(`user_${targetId}`).emit("conversation:created", {
                _id: conv._id,
                type: "direct",
                recipient: senderData,
                lastMessage: populatedMessage,
                lastActivity: conv.lastActivity,
                unreadCount: 1
            });
            io.to(`user_${sender}`).emit("conversation:created", {
                _id: conv._id,
                type: "direct",
                recipient: recipientData,
                lastMessage: populatedMessage,
                lastActivity: conv.lastActivity,
                unreadCount: 0
            });
        } else {
            io.to(`user_${targetId}`).emit("conversation:updated", {
                type: "direct",
                conversationId: conv._id,
                lastMessage: populatedMessage,
                lastActivity: conv.lastActivity
            });
            io.to(`user_${sender}`).emit("conversation:updated", {
                type: "direct",
                conversationId: conv._id,
                lastMessage: populatedMessage,
                lastActivity: conv.lastActivity
            });
        }
    }

    res.status(201).json(populatedMessage);
});

// Edit message text
const editMessage = asyncHandler(async (req, res) => {
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
        .populate('receiver', 'username profilePic profileName status')
        .populate('replyTo');

    // Broadcast update
    if (message.group) {
        io.to(`group_${message.group}`).emit("messageUpdated", populated);
    } else if (message.channel) {
        io.to(`channel_${message.channel}`).emit("messageUpdated", populated);
    } else {
        io.to(`user_${message.receiver}`).emit("messageUpdated", populated);
        io.to(`user_${message.sender}`).emit("messageUpdated", populated);
    }

    res.status(200).json(populated);
});

// Delete message
const deleteMessage = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized delete action" });
    }

    const messageId = message._id;
    await Message.findByIdAndDelete(messageId);

    // Broadcast deletion
    if (message.group) {
        io.to(`group_${message.group}`).emit("messageDeleted", { messageId });
    } else if (message.channel) {
        io.to(`channel_${message.channel}`).emit("messageDeleted", { messageId });
    } else {
        io.to(`user_${message.receiver}`).emit("messageDeleted", { messageId });
        io.to(`user_${message.sender}`).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ message: "Message deleted successfully", messageId });
});

// Add reaction emoji to message
const addReaction = asyncHandler(async (req, res) => {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Remove existing reaction by same user
    message.reactions = message.reactions.filter(r => r.user.toString() !== req.user._id.toString());
    
    // Add new reaction
    if (emoji) {
        message.reactions.push({ user: req.user._id, emoji });
    }
    await message.save();

    const populated = await Message.findById(message._id)
        .populate('sender', 'username profilePic profileName status')
        .populate('replyTo')
        .populate('reactions.user', 'username profilePic');

    if (message.group) {
        io.to(`group_${message.group}`).emit("messageUpdated", populated);
    } else if (message.channel) {
        io.to(`channel_${message.channel}`).emit("messageUpdated", populated);
    } else {
        io.to(`user_${message.receiver}`).emit("messageUpdated", populated);
        io.to(`user_${message.sender}`).emit("messageUpdated", populated);
    }

    res.status(200).json(populated);
});

// Toggle Pin Message
const togglePinMessage = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.isPinned = !message.isPinned;
    await message.save();

    const populated = await Message.findById(message._id)
        .populate('sender', 'username profilePic profileName status')
        .populate('replyTo');

    if (message.group) {
        io.to(`group_${message.group}`).emit("messageUpdated", populated);
    } else if (message.channel) {
        io.to(`channel_${message.channel}`).emit("messageUpdated", populated);
    } else {
        io.to(`user_${message.receiver}`).emit("messageUpdated", populated);
        io.to(`user_${message.sender}`).emit("messageUpdated", populated);
    }

    res.status(200).json(populated);
});

// Star/Unstar Message
const toggleStarMessage = asyncHandler(async (req, res) => {
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
});

// Get all starred messages for user
const getStarredMessages = asyncHandler(async (req, res) => {
    const starred = await Message.find({ starredBy: req.user._id })
        .populate('sender', 'username profilePic profileName status')
        .populate('receiver', 'username profilePic profileName status');
    res.status(200).json(starred);
});

// Forward messages to multiple destinations
const forwardMessage = asyncHandler(async (req, res) => {
    const { messageId, targetIds } = req.body; // targetIds is array of { id, type: "direct"|"group" }
    const sender = req.user._id;

    if (!messageId || !targetIds || !Array.isArray(targetIds)) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const originalMsg = await Message.findById(messageId);
    if (!originalMsg) return res.status(404).json({ message: "Original message not found" });

    const forwardedMessages = [];

    for (const target of targetIds) {
        const messageData = {
            sender,
            text: originalMsg.text,
            Photos: originalMsg.Photos,
            attachments: originalMsg.attachments
        };

        if (target.type === "group") {
            messageData.group = target.id;
            
            // Update group activity
            await Group.findByIdAndUpdate(target.id, { lastActivity: Date.now() });

            // Increment group member counters
            const group = await Group.findById(target.id);
            if (group) {
                const members = group.members.map(m => m.user.toString()).filter(id => id !== sender.toString());
                await Promise.all(members.map(async (uid) => {
                    await UnreadCounter.findOneAndUpdate(
                        { user: uid, group: target.id },
                        { $inc: { unreadCount: 1 } },
                        { upsert: true }
                    );
                }));
            }
        } else {
            messageData.receiver = target.id;

            // Find or create conversation
            let conv = await Conversation.findOne({
                participants: { $all: [sender, target.id] }
            });

            if (!conv) {
                conv = new Conversation({ participants: [sender, target.id] });
                await conv.save();
            }

            messageData.conversation = conv._id;

            await UnreadCounter.findOneAndUpdate(
                { user: target.id, conversation: conv._id },
                { $inc: { unreadCount: 1 } },
                { upsert: true }
            );
        }

        const msg = new Message(messageData);
        await msg.save();

        const populated = await Message.findById(msg._id)
            .populate('sender', 'username profilePic profileName status')
            .populate('receiver', 'username profilePic profileName status');

        // Broadcast to rooms
        if (target.type === "group") {
            io.to(`group_${target.id}`).emit("newMessage", populated);
        } else {
            io.to(`user_${target.id}`).emit("newMessage", populated);
            io.to(`user_${sender}`).emit("newMessage", populated);
        }

        forwardedMessages.push(populated);
    }

    res.status(201).json(forwardedMessages);
});

module.exports = {
    getUsersInSideBar,
    getMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    togglePinMessage,
    toggleStarMessage,
    getStarredMessages,
    forwardMessage
};
