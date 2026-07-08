const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    content : {
        type: String,
        required: true
    },
    sender : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['message', 'mention', 'group_invite', 'group_join_request', 'system'],
        default: 'message'
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true,
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };