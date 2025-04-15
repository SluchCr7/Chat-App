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
    }
}, {
    timestamps: true,
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };