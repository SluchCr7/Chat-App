const asyncHandler = require('express-async-handler');
const { Notification } = require('../modules/notification');

// Add a new notification
const addNewNotify = asyncHandler(async (req, res) => {
    const receiver = req.params.id;
    const sender = req.user._id;
    const { content } = req.body;

    const newNotify = new Notification({
        content,
        sender,
        receiver
    });

    await newNotify.save();
    res.status(200).json(newNotify);
});

// Get all notifications for the logged-in user
const getAllNotificationsByUser = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ receiver: req.user._id })
        .populate('sender');
    res.status(200).json(notifications);
});

// Get all notifications (admin use case?)
const getAllNotify = asyncHandler(async (req, res) => {
    const notifications = await Notification.find();
    res.status(200).json(notifications);
});

// Delete a notification
const deleteNotify = asyncHandler(async (req, res) => {
    const notify = await Notification.findById(req.params.id);

    if (!notify) {
        return res.status(404).json({ message: "Notification not found" });
    }

    await notify.remove();
    res.status(200).json({ message: "Notification deleted" });
});

module.exports = {
    addNewNotify,
    getAllNotify,
    deleteNotify,
    getAllNotificationsByUser
};
