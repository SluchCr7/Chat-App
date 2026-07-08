const asyncHandler = require('express-async-handler');
const { Notification } = require('../modules/notification');

// Add a new notification
const addNewNotify = asyncHandler(async (req, res) => {
    const receiver = req.params.id;
    const sender = req.user._id;
    const { content, type, referenceId, metadata } = req.body;

    const newNotify = new Notification({
        content,
        sender,
        receiver,
        type: type || 'message',
        referenceId,
        metadata
    });

    await newNotify.save();
    res.status(200).json(newNotify);
});

// Get all notifications for the logged-in user
const getAllNotificationsByUser = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ receiver: req.user._id })
        .populate('sender', 'username profilePic profileName status')
        .sort({ createdAt: -1 });
    res.status(200).json(notifications);
});

// Get all notifications (admin use case?)
const getAllNotify = asyncHandler(async (req, res) => {
    const notifications = await Notification.find().populate('sender').populate('receiver');
    res.status(200).json(notifications);
});

// Delete a notification
const deleteNotify = asyncHandler(async (req, res) => {
    const notify = await Notification.findById(req.params.id);

    if (!notify) {
        return res.status(404).json({ message: "Notification not found" });
    }

    if (notify.receiver.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized action" });
    }

    await Notification.deleteOne({ _id: notify._id });
    res.status(200).json({ message: "Notification deleted" });
});

// Mark a specific notification as read
const markAsRead = asyncHandler(async (req, res) => {
    const notify = await Notification.findById(req.params.id);

    if (!notify) {
        return res.status(404).json({ message: "Notification not found" });
    }

    if (notify.receiver.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized action" });
    }

    notify.isRead = true;
    await notify.save();
    
    // Populate sender details for the response
    const populated = await Notification.findById(notify._id).populate('sender', 'username profilePic profileName status');
    res.status(200).json(populated);
});

// Mark all notifications for the user as read
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { receiver: req.user._id, isRead: false },
        { $set: { isRead: true } }
    );
    res.status(200).json({ message: "All notifications marked as read" });
});

// Delete all notifications for the user
const clearAll = asyncHandler(async (req, res) => {
    await Notification.deleteMany({ receiver: req.user._id });
    res.status(200).json({ message: "All notifications cleared" });
});

module.exports = {
    addNewNotify,
    getAllNotify,
    deleteNotify,
    getAllNotificationsByUser,
    markAsRead,
    markAllAsRead,
    clearAll
};
