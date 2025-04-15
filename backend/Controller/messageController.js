const { User } = require('../modules/User');
const { Message, validateMessage } = require('../modules/Message');
const { v2 } = require('cloudinary');
const fs = require('fs');
const { getReceiverSocketId, io } = require('../config/socket');

// Get all users except the logged-in one
const getUsersInSideBar = async (req, res) => {
  try {
    const loggedUser = req.user._id;
    const users = await User.find({ _id: { $ne: loggedUser } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages between logged-in user and another user
const getMessages = async (req, res) => {
  try {
    const userToChatId = req.params.id;
    const sender = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender, receiver: userToChatId },
        { sender: userToChatId, receiver: sender }
      ]
    })
      .populate('sender', 'username profilePic _id')
      .populate('receiver', 'username profilePic _id');

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a new message (text and/or image)
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const userToChatId = req.params.id;
    const sender = req.user._id;

    let photos = req.files?.image || [];

    if (!Array.isArray(photos)) {
      photos = [photos];
    }

    if (!text && photos.length === 0) {
      return res.status(400).json({ message: "Message must contain text or image." });
    }

    if (text) {
      const { error } = validateMessage({ text });
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
    }

    const uploadedPhotos = [];

    for (const image of photos) {
      const result = await v2.uploader.upload(image.path, { resource_type: "image" });

      uploadedPhotos.push({
        url: result.secure_url,
        publicId: result.public_id,
      });

      fs.unlinkSync(image.path);
    }

    const messageData = {
      sender,
      receiver: userToChatId,
      ...(text && { text }),
      ...(uploadedPhotos.length > 0 && { Photos: uploadedPhotos })
    };

    const message = new Message(messageData);
    await message.save();

    const receiverSocketId = getReceiverSocketId(userToChatId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.status(201).json({ message: "Message Sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsersInSideBar,
  getMessages,
  sendMessage,
};
