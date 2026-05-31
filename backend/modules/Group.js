const mongoose = require("mongoose");
const Joi = require("joi");

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    avatar: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_1280.png",
            publicId: null
        }
    },
    coverImage: {
        type: Object,
        default: {
            url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
            publicId: null
        }
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        role: {
            type: String,
            enum: ["owner", "admin", "moderator", "member"],
            default: "member"
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    inviteLink: {
        type: String,
        unique: true,
        required: true
    },
    joinRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isPrivate: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Group = mongoose.model("Group", groupSchema);

const validateGroup = (group) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        description: Joi.string().max(200).allow('', null),
        isPrivate: Joi.boolean()
    });
    return schema.validate(group);
};

module.exports = { Group, validateGroup };
