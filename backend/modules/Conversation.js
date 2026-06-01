const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    lastActivity: {
        type: Date,
        default: Date.now,
        index: true
    },
    pinnedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    archivedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    mutedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    favoriteBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    drafts: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        text: {
            type: String,
            default: ""
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = { Conversation };
