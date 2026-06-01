const mongoose = require("mongoose");

const unreadCounterSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        index: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        index: true
    },
    unreadCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Ensure a user has unique counters per conversation and group
unreadCounterSchema.index({ user: 1, conversation: 1 }, { unique: true, sparse: true });
unreadCounterSchema.index({ user: 1, group: 1 }, { unique: true, sparse: true });

const UnreadCounter = mongoose.model("UnreadCounter", unreadCounterSchema);

module.exports = { UnreadCounter };
