const mongoose =require("mongoose");
const Joi =require("joi");

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
    },
    text: {
        type: String,
    },
    Photos: {
        type: Array,
        default: [],
    },
    attachments: [{
        url: { type: String, required: true },
        publicId: { type: String },
        fileType: { type: String, enum: ["image", "video", "audio", "voice", "document"], required: true },
        name: { type: String },
        size: { type: Number }
    }],
    isRead: {
        type: Boolean,
        default: false
    },
    deliveredTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    seenBy: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        seenAt: { type: Date, default: Date.now }
    }],
    reactions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String, required: true }
    }],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    starredBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    savedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    scheduledAt: {
        type: Date
    }
}, {
    timestamps: true,
});

const Message = mongoose.model("Message", messageSchema);

const validateMessage = (message) => {
    const schema = Joi.object({
        text: Joi.string().allow('', null),
        replyTo: Joi.string().allow('', null),
        scheduledAt: Joi.date().allow(null)
    });
    return schema.validate(message);
};

module.exports = { Message, validateMessage };