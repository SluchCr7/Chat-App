const asynchandler = require('express-async-handler')
const { Notification } = require('../modules/notification')

const addNewNotify = asynchandler(async (req, res) => {
    const { id: userToChatId } = req.params
    const sender = req.user._id
    const { content } = req.body
    const receiver = userToChatId
    const newNotify = new Notification({
        content,
        sender,
        receiver
    })
    await newNotify.save()
    res.status(200).json(newNotify)
})

const getAllNotificationsByUser = asynchandler(async (req, res) => {
    const notifications = await Notification.find({ receiver: req.user._id }).populate('sender')
    res.status(200).json(notifications)
})

const getAllNotify = asynchandler(async (req, res) => {
    const notifications = await Notification.find()
    res.status(200).json(notifications)
})

const deleteNotify = asynchandler(async (req, res) => {
    const notify = await Notification.findById(req.params.id)
    if (!notify) return res.status(404).json({ message: "Notification not found" })
    await Notification.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Notification deleted" })
})

module.exports = { addNewNotify, getAllNotify, deleteNotify , getAllNotificationsByUser }