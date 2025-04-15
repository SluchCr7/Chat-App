const { User } = require('../modules/User')
const { Message, validateMessage } = require('../modules/Message')
const {v2} = require('cloudinary')
// const { cloudRemove , cloudUpload } = require('../Config/cloudUpload')
const fs = require('fs')
const path = require('path')
const { getReceiverSocketId } = require('../config/socket')
const { io } = require('../config/socket')
const getUsersInSideBar = async (req, res) => {
    try {
        const loggedUser = req.user._id
        const users = await User.find({ _id: { $ne: loggedUser } }) // get all users except the logged user
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}
const getMessages = async (req, res) => {
    try {
        const userToChatId = req.params.id
        const sender = req.user._id
        const messages = await Message.find({
            $or: [
                { sender, receiver: userToChatId },
                { sender: userToChatId, receiver: sender }
            ]
        }).populate('sender', 'username profilePic _id').populate('receiver', 'username profilePic _id')
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const userToChatId = req.params.id;
    const sender = req.user._id;

    let Photos = req.files?.image || []; // "image" might be single or multiple

    // Normalize to array
    if (!Array.isArray(Photos)) {
      Photos = [Photos];
    }

    // Validate at least one content (text or image)
    if (!text && Photos.length === 0) {
      return res.status(400).json({ message: "Message must contain text or image." });
    }

    // Validate message text (optional)
    if (text) {
      const { error } = validateMessage({ text });
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
    }

    let uploadedPhotos = [];

    // Upload images to Cloudinary if present
    for (const image of Photos) {
      const result = await v2.uploader.upload(image.path, { resource_type: "image" });

      uploadedPhotos.push({
        url: result.secure_url,
        publicId: result.public_id,
      });

      // Clean up local file
      fs.unlinkSync(image.path);
    }

    // Create the message
    const message = new Message({
      sender,
      receiver: userToChatId,
      ...(text && { text }),
      ...(uploadedPhotos.length > 0 && { Photos: uploadedPhotos }), // You might want to rename Photo → photos (plural)
    });

    await message.save();

    // todo: real-time functionality with socket.io
    const receiverSocketId = getReceiverSocketId(userToChatId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.status(201).json({ message: "Message Sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { getUsersInSideBar, getMessages , sendMessage }